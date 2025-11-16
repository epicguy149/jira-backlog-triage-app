import { z } from 'zod';

// DELETE /rest/api/3/issue/${id}

export const DeleteIssueRequestSchema = z.object({
    // accepts issue key or id
    issueIdOrKey: z.string(),
})

export type DelteIssueRequest = z.infer<typeof DeleteIssueRequestSchema>;

export const DeleteIssueResponseSchema = z.object({
    
})

export type DeleteIssueResponse = z.infer<typeof DeleteIssueResponseSchema>;