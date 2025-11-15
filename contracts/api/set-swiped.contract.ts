import { z } from 'zod';

export const SetIssueSwipedRequestSchema = z.object({
    boardId: z.union([z.number(), z.string()]),
    issueKey: z.string(),
    swiped: z.boolean(),
})

export type SetIssueSwipedRequest = z.infer<typeof SetIssueSwipedRequestSchema>;

export const SetIssueSwipedResponseSchema = z.object({
    boardId: z.union([z.number(), z.string()]),
    issueKey: z.string(),
    swiped: z.boolean(),
});

export type SetIssueSwipedResponse = z.infer<typeof SetIssueSwipedResponseSchema>;