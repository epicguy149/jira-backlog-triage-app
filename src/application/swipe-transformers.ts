import type { SwipeIssue } from "../../contracts/api";

type JiraIssue = {
    id: string;
    key: string;
    fields: {
        summary: string;
        status?: { name: string };
        priority?: { 
            name: string;
            iconUrl: string;
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

export function toSwipeIssue(
    issue: JiraIssue,
    opts: { swiped?: boolean } = {},
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
        assigneeDisplayName: fields.assignee?.displayName ?? null,
        assigneeAvatarUrl: 
            fields.assignee?.avatarUrls?.['24x24'] ?? 
            fields.assignee?.avatarUrls?.['48x48'] ??
            null,
        description,
        swiped: opts.swiped ?? false,
    };
}

