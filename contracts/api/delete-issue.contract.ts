import { z } from 'zod';

// DELETE /rest/api/3/issue/${id}

export const DeleteIssueRequestSchema = z.object({
    // accepts issue key or id
    issueIdOrKey: z.string(),
})

export type DeleteIssueRequest = z.infer<typeof DeleteIssueRequestSchema>;

export const DeleteIssueResponseSchema = z.object({
    issueIdOrKey: z.string(),
    error: z.string().optional(),
})

export type DeleteIssueResponse = z.infer<typeof DeleteIssueResponseSchema>;