import api, { route } from '@forge/api';
import {
    GetBacklogRequest,
    type GetBacklogResponse,
    SwipeIssuePageSchema
} from '../../contracts/api'
import { type JiraBacklogResponse, toSwipeIssue }  from './swipe-transformers';
import { kvs } from '@forge/kvs';

// key for forge kvs storage
const SWIPED_KEY_PREFIX = 'log-juggler.swiped';

// store swiped state per user per board
function swipedStorageKey(boardId: string | number, accountId: string): string {
    return `${SWIPED_KEY_PREFIX}:${String(boardId)}`;
}

type GetBacklogContext = {
    accountId: string;
}

export async function getBacklog(
    payload: GetBacklogRequest,
    ctx: GetBacklogContext,
): Promise<GetBacklogResponse> {
    const { boardId, startAt = 0, maxResults = 20, searchQuery } = payload;
    const { accountId } = ctx;

    if (!boardId) {
        throw new Error('no boardId provided');
    }

    const fields = 'summary,status,priority,assignee,description,updated';

    const params = new URLSearchParams({
        startAt: String(startAt),
        maxResults: String(maxResults),
        fields,
    });

    if (searchQuery && searchQuery.trim() !== '') {
        // escape double quotes
        const query = searchQuery.replace(/"/g, '\\"');
        params.set('jql', `text ~ "${query}"`);
    }

    const reqUrl = `/rest/agile/1.0/board/${boardId}/backlog?${params.toString()}`;

    const res = await api.asUser().requestJira(route`${reqUrl}`);

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`failed to fetch backlog: ${res.status} ${res.statusText} ${text}`);
    }

    const data = (await res.json()) as JiraBacklogResponse;
    const issues = data.issues;

    // handle no issues post filter
    if (issues.length === 0) {
        const empty: unknown = {
            issues: [],
            total: data.total,
            startAt: data.startAt,
            maxResults: data.maxResults,
        };
        return SwipeIssuePageSchema.parse(empty);
    }

    const swipedKey = swipedStorageKey(boardId, accountId);
    const swipedRes = await kvs.get<string[]>(swipedKey);

    // get swiped issue keys from forge kvs
    const swipedArray: string[] = (swipedRes as string[] | undefined) ?? [];
    const swipedSet = new Set(swipedArray);

    const swipeIssues = issues.map((issue) => 
        toSwipeIssue(issue, {
            swiped: swipedSet.has(issue.key),
        }),
    );

    const content: unknown = {
        issues: swipeIssues,
        total: data.total,
        startAt: data.startAt,
        maxResults: data.maxResults
    };

    return SwipeIssuePageSchema.parse(content);
}