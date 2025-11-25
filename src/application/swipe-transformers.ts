import type { SwipeIssue } from "../../contracts/api";

export type JiraIssue = {
    id: string;
    key: string;
    fields: {
        summary: string;
        status?: { name: string };
        priority?: { 
            name: string;
            iconUrl: string;
            id?: string;
        };
        assignee?: { 
            displayName: string;
            avatarUrls?: {
                '24x24'?: string;
                '48x48'?: string;
            };
        };
        // returns as ADF 
        description?: unknown;
        updated?: string;
        issuetype?: {
            name: string;
            iconUrl: string;
        },
        epic?: {
            name: string;
            summary: string;
            color?: {
                key?: string;
            };
        };
        parent?: {
            id: string;
            key: string;
            fields?: {
                summary?: string;
                issuetype?: {
                name: string;
                };
            };
        };
    };
}

// parse from string/ADF (atlassian document format) object into safe string
function parseDescription(raw: unknown): string | null {
    if (typeof raw === 'string') {
        return raw;
    }

    if (raw && typeof raw === 'object') {
        // TODO: if description in resposne is ADF add parsing logic
        return 'requires parsing from ADF to text';
    }

    return null;
}

export type JiraBacklogResponse = {
    issues: JiraIssue[];
    maxResults: number;
    startAt: number;
    total: number;
}

type ToSwipeOpts = {
    swiped?: boolean;
    epicKey?: string | null;
    epicSummary?: string | null;
    epicColor?: string | null;
    storyPoints?: number | null;
}

export function toSwipeIssue(
    issue: JiraIssue,
    opts: ToSwipeOpts = {},
): SwipeIssue {
    const { fields } = issue;
    const description = parseDescription(fields.description);

    return {
        id: issue.id,
        key: issue.key,
        summary: fields.summary,
        status: fields.status?.name ?? 'None',
        priorityName: fields.priority?.name ?? null,
        priorityIconUrl: fields.priority?.iconUrl ?? null,
        priorityId: fields.priority?.id ?? null,
        assigneeDisplayName: fields.assignee?.displayName ?? null,
        assigneeAvatarUrl: 
            fields.assignee?.avatarUrls?.['24x24'] ?? 
            fields.assignee?.avatarUrls?.['48x48'] ??
            null,
        description,
        swiped: opts.swiped ?? false,
        issueTypeName: fields.issuetype?.name ?? null,
        issueTypeIconUrl: fields.issuetype?.iconUrl ?? null,
        epicKey: opts.epicKey ?? null,
        epicSummary: opts.epicSummary ?? null,
        epicColor: opts.epicColor ?? null,
        storyPoints: opts.storyPoints ?? null,
    };
}

