import api, { route } from '@forge/api';
import {
  DeleteIssueRequest,
  DeleteIssueResponse,
  DeleteIssueResponseSchema,
} from '../../contracts/api';

export async function deleteIssue(
    payload: DeleteIssueRequest,
): Promise<DeleteIssueResponse> {
    const { issueIdOrKey } = payload;

    try {
        const res = await api.asUser().requestJira(route`/rest/api/3/issue/${issueIdOrKey}`, {
            method: 'DELETE'
        });

        // status 204
        if (res.ok) {
            return DeleteIssueResponseSchema.parse({
                issueIdOrKey
            });
        }

        const text = await res.text();
        return DeleteIssueResponseSchema.parse({
            issueIdOrKey,
            error: text,
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : `unknown error deleting issue ${issueIdOrKey}`;
        return DeleteIssueResponseSchema.parse({
            issueIdOrKey,
            error: message
        });
    }
}

    
