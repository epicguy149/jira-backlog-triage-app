import api, { route } from '@forge/api';
import {
    GetBacklogRequest,
    type GetBacklogResponse,
    SwipeIssuePageSchema
} from '../../contracts/api'
import { type JiraBacklogResponse, toSwipeIssue, type JiraIssue }  from './swipe-transformers';
import { getSwipedSet } from '../persistence/swipe-storage';
import { buildJqlQuery } from './jql-builder';
import { getJiraFields } from './get-jira-fields';

type GetBacklogContext = {
    accountId: string;
}

type EpicMeta = {
    summary: string | null;
    color: string | null;
};

type EpicsResponse = {
    isLast: boolean;
    startAt: number;
    maxResults: number;
    values: Array<{
        key?: string;
        name?: string;
        summary?: string;
        color?: { 
            key?:string
        };
    }>;
};

type IssueParent = {
    [key: string]: unknown;
    parent?: {
        key?: string;
        fields?: {
            issuetype?: {
                name?: string;
            };
        };
    };
};

async function fetchBoardEpicMetadata(
    boardId: string | number,
): Promise<Map<string, EpicMeta>> {
    const metaByKey = new Map<string, EpicMeta>();

    let startAt = 0;
    const maxResults = 50;
    let isLast = false;

    // handle pagination
    while (!isLast) {
        const params = new URLSearchParams({
            startAt: String(startAt),
            maxResults: String(maxResults),
        });

        const res = await api.asUser().requestJira(route`/rest/agile/1.0/board/${boardId}/epic?${params.toString()}`);

        if (!res.ok) {
            const text = await res.text();
            console.warn(
                `Failed to fetch epics: ${res.status} ${res.statusText} ${text}`,
            );
            break;
        }

        const data = (await res.json()) as EpicsResponse;

        // map colours/summary to each epic
        for (const epic of data.values ?? []) {
            if (!epic.key) {
                continue;
            }

            metaByKey.set(epic.key, {
                summary: epic.summary ?? epic.name ?? null,
                color: epic.color?.key ?? null,
            });
        }

        isLast = data.isLast;
        startAt = data.startAt + data.maxResults;
    }

    return metaByKey;
}

function parseEpicKey(issue: JiraIssue, epicLinkFieldId: string | null): string | null {
    const fields = issue.fields as IssueParent;

    if (epicLinkFieldId && typeof fields[epicLinkFieldId] === 'string') {
        return fields[epicLinkFieldId] as string;
    }

    if (fields.parent?.fields?.issuetype?.name === 'Epic') {
        return fields.parent.key as string;
    }

    return null;
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

    const { epicLinkFieldId, storyPointsFieldId } = await getJiraFields();

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

    let fields = 'summary,status,priority,assignee,description,updated,issuetype,epic,parent';

    if (epicLinkFieldId) {
        fields += `,${epicLinkFieldId}`;
    }

    if (storyPointsFieldId) {
        fields = fields + `,${storyPointsFieldId}`;
    }

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

    // local filter, JQL filter for epic doenst seem to work (will fix)
    const issues = data.issues.filter(
        (issue) => issue.fields.issuetype?.name?.toLowerCase() !== 'epic'
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

    const epicKeySet = new Set<string>();

    for (const issue of issues) {
        const epicKey = parseEpicKey(issue, epicLinkFieldId);
        if (epicKey) {
            epicKeySet.add(epicKey);
        }
    }

    const epicMetaByKey = await fetchBoardEpicMetadata(boardId);

    const swipeIssues = issues.map((issue) => {
        const fields = issue.fields as IssueParent;

        const epicKey = parseEpicKey(issue, epicLinkFieldId);
        const epicMeta = epicKey ? epicMetaByKey.get(epicKey) : undefined;

        let storyPoints: number | null = null;
        
        if (storyPointsFieldId && typeof fields[storyPointsFieldId] === 'number') {
            storyPoints = fields[storyPointsFieldId] as number;
        }

        return toSwipeIssue(issue, {
            swiped: swipedSet.has(issue.key),
            epicKey,
            epicSummary: epicMeta?.summary ?? null,
            epicColor: epicMeta?.color ?? null,
            storyPoints,
        })
    });

    const content: unknown = {
        issues: swipeIssues,
        total: data.total,
        startAt: data.startAt,
        maxResults: data.maxResults
    };

    return SwipeIssuePageSchema.parse(content);
}