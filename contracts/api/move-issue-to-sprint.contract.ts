import { z } from 'zod';

// POST /rest/agile/1.0/sprint/${sprintId}/issue`

export const MoveIssueToSprintRequestSchema = z.object({
    boardId: z.union([z.number(), z.string()]),
    issueIdOrKey: z.string()
})

export type MoveIssueToSprintRequest = z.infer<typeof MoveIssueToSprintRequestSchema>

export const MoveIssueToSprintResponseSchema = z.object({
    issueIdOrKey: z.string(),
    sprintName: z.string().optional(),
    error: z.string().optional(),
})

export type MoveIssueToSprintResponse = z.infer<typeof MoveIssueToSprintResponseSchema>
