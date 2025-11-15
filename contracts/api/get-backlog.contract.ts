import { z } from 'zod';

// GET /rest/agile/1.0/board/{boardId}/backlog RESPONSE
export const SwipeIssueSchema = z.object({
    id: z.string(),
    key: z.string(),
    summary: z.string(),
    status: z.string(),
    priorityName: z.string().nullable(),
    priorityIconUrl: z.string().nullable(),
    assigneeDisplayName: z.string().nullable(),
    assigneeAvatarUrl: z.string().nullable(),

    // for future use
    description: z.string().nullable(),
    // to filter swiped/unswiped
    swiped: z.boolean().optional().default(false),
})

export type SwipeIssue = z.infer<typeof SwipeIssueSchema>;

// GET /rest/agile/1.0/board/{boardId}/backlog RESPONSE
export const SwipeIssuePageSchema = z.object({
    issues: z.array(SwipeIssueSchema),
    maxResults: z.number().int(),
    startAt: z.number().int(),
    total: z.number().int(),
})

export type SwipeIssuePage = z.infer<typeof SwipeIssuePageSchema>;

// GET /rest/agile/1.0/board/{boardId}/backlog
export const GetBacklogRequestSchema = z.object({
    // allow number or string
    boardId: z.union([z.number(), z.string()]),

    startAt: z.number().int().min(0).optional(),

    // default 50
    maxResults: z.number().int().min(1).optional(),
    searchQuery: z.string().optional(),
})

export type GetBacklogRequest = z.infer<typeof GetBacklogRequestSchema>;

export type GetBacklogResponse = SwipeIssuePage;


