import api, { route } from '@forge/api';
import {
    GetBacklogRequest,
    type GetBacklogResponse,
    SwipeIssuePageSchema
} from '../../contracts/api'
import { type JiraBacklogResponse, toSwipeIssue }  from './swipe-transformers';
import { getSwipedSet } from './swipe-storage';
import { buildJqlQuery } from './jql-builder';

type GetBacklogContext = {
    accountId: string;
}

export async function getBacklog(
    payload: GetBacklogRequest,
    ctx: GetBacklogContext,
): Promise<GetBacklogResponse> {
    const { boardId, startAt = 0, maxResults, searchQuery, filters } = payload;
    const { accountId } = ctx;

    if (!boardId) {
        throw new Error('no boardId provided');
    }

    const swipedSet = await getSwipedSet(boardId, accountId);

    const jql = buildJqlQuery({
        searchQuery,
        filters,
        swipedSet,
    });

    if (jql === null) {
        return SwipeIssuePageSchema.parse({
            issues: [], total: 0, startAt, maxResults
        });
    }

    const fields = 'summary,status,priority,assignee,description,updated,issuetype';

    const params = new URLSearchParams({
        startAt: String(startAt),
        maxResults: String(maxResults),
        fields,
    });

    if (jql) {
        params.set('jql', jql);
    }

    const res = await api.asUser().requestJira(route`/rest/agile/1.0/board/${boardId}/backlog?${params.toString()}`);

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`failed to fetch backlog: ${res.status} ${res.statusText} ${text}`);
    }

    const data = (await res.json()) as JiraBacklogResponse;

    // remove epics
    const issues = data.issues.filter(
      (issue) => issue.fields.issueType?.name?.toLowerCase() !== 'epic'
    ) ?? [];

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