import api, { route } from '@forge/api';
import {
    GetBacklogRequest,
    GetBacklogResponse,
    SwipeIssuePageSchema
} from '../../contracts/api'
import { type JiraBacklogResponse, toSwipeIssue }  from './swipe-transformers';

export async function getBacklog(
    payload: GetBacklogRequest,
): Promise<GetBacklogResponse> {
    const { boardId, startAt = 0, maxResults = 20 } = payload;

    if (!boardId) {
        throw new Error('no boardId provided');
    }

    const fields = 'summary,status,priority,assignee,description';

    const res = await api.asUser().requestJira(route`/rest/agile/1.0/board/${boardId}/backlog?startAt=${startAt}&maxResults=${maxResults}&fields=${fields}`);

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`failed to fetch backlog: ${res.status} ${res.statusText} ${text}`);
    }

    const data = (await res.json()) as JiraBacklogResponse;
    const content: unknown = {
        issues: data.issues.map(toSwipeIssue),
        total: data.total,
        startAt: data.startAt,
        maxResults: data.maxResults
    };

    return SwipeIssuePageSchema.parse(content);
}