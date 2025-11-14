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
        description?: string | null;
    }
}

export type JiraBacklogResponse = {
    issues: JiraIssue[];
    maxResults: number;
    startAt: number;
    total: number;
}

export function toSwipeIssue(issue: JiraIssue): SwipeIssue {
    const { id, key, fields } = issue;

    return {
        id,
        key,
        summary: fields.summary,
        status: fields.status?.name ?? 'None',
        priorityName: fields.priority?.name ?? null,
        priorityIconUrl: fields.priority?.iconUrl ?? null,
        assigneeDisplayName: fields.assignee?.displayName ?? null,
        assigneeAvatarUrl: 
            fields.assignee?.avatarUrls?.['24x24'] ?? 
            fields.assignee?.avatarUrls?.['48x48'] ??
            null,
        description: fields.description ?? null,
        swiped: false,
    }
}

