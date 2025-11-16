import api, { route } from '@forge/api';
import {
  MoveIssueToSprintRequest,
  MoveIssueToSprintResponse,
  MoveIssueToSprintResponseSchema,
} from '../../contracts/api';

type JiraSprint = {
    id: number;
    name?: string;
    state?: string;
}

type JiraSprintList = {
    sprints?: JiraSprint[];
}

export async function moveIssueToSprint(
    payload: MoveIssueToSprintRequest
): Promise<MoveIssueToSprintResponse> {
    const { boardId, issueIdOrKey } = payload;

    try {
        const getSprintsRes = await api.asUser().requestJira(
            route`/rest/agile/1.0/board/${boardId}/sprint?state=active`,
        );

        const getSprintsData = (await getSprintsRes.json()) as JiraSprintList;

        if (!getSprintsRes.ok || !getSprintsData.sprints?.length) {
            return MoveIssueToSprintResponseSchema.parse({
                issueIdOrKey,
                error: 'no active sprint found',
            });
        }

        // first active sprint
        const sprint = getSprintsData.sprints[0];
        const sprintId = sprint.id;

        var bodyData = JSON.stringify({ issues: [issueIdOrKey] });

        const res = await api.asUser().requestJira(route`/rest/agile/1.0/sprint/${sprintId}/issue`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: bodyData
        })
        
        if (res.ok) {
            return MoveIssueToSprintResponseSchema.parse({
                issueIdOrKey,
                sprintName: sprint.name,
            });
        }

        const text = await res.text();

        return MoveIssueToSprintResponseSchema.parse({
            issueIdOrKey,
            error: text
        })
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : `unknown error moving issue ${issueIdOrKey} to sprint`;
        return MoveIssueToSprintResponseSchema.parse({
            issueIdOrKey,
            error: message
        });
    }
}