import api, { route } from '@forge/api';
import {
    MoveIssueToBacklogRequest,
    MoveIssueToBacklogResponse,
    MoveIssueToBacklogResponseSchema,
} from '../../contracts/api';

export async function moveIssueToBacklog(
    payload: MoveIssueToBacklogRequest,
): Promise<MoveIssueToBacklogResponse> {
    const { boardId, issueIdOrKey } = payload;

    try {
        const body = JSON.stringify({ issues: [issueIdOrKey] });

        const res = await api.asUser().requestJira(route`/rest/agile/1.0/backlog/${boardId}/issue`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json' 
            },
            body,
        });

        if (res.ok) {
            return MoveIssueToBacklogResponseSchema.parse({ issueIdOrKey });
        }

        const text = await res.text();

        return MoveIssueToBacklogResponseSchema.parse({
            issueIdOrKey,
            error: text,
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : `unknown error moving issue ${issueIdOrKey} to backlog`;

        return MoveIssueToBacklogResponseSchema.parse({
            issueIdOrKey,
            error: message,
        });
    }
}