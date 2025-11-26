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
    values?: JiraSprint[]; 
};

export async function moveIssueToSprint(
    payload: MoveIssueToSprintRequest
): Promise<MoveIssueToSprintResponse> {
    const { boardId, issueIdOrKey } = payload;

    try {
        const getSprintsRes = await api.asUser().requestJira(
            route`/rest/agile/1.0/board/${boardId}/sprint?state=active`,
        );

        let sprints: JiraSprint[] = [];

        if (getSprintsRes.ok) {
            const getSprintsData = (await getSprintsRes.json()) as JiraSprintList;
            sprints = getSprintsData.values ?? [];
        }

        if (!getSprintsRes.ok || sprints.length === 0) {
            return MoveIssueToSprintResponseSchema.parse({
                issueIdOrKey,
                error: 'no active sprint found',
            });
        }

        const sprint = sprints.find((s) => s.state === 'active') ?? sprints[0];
        const sprintId = sprint.id;

        const bodyData = JSON.stringify({ issues: [issueIdOrKey] });

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