import { z } from 'zod';

export const MoveIssueToBacklogRequestSchema = z.object({
  boardId: z.union([z.string(), z.number()]),
  issueIdOrKey: z.string(),
});
export type MoveIssueToBacklogRequest = z.infer<
  typeof MoveIssueToBacklogRequestSchema
>;

export const MoveIssueToBacklogResponseSchema = z.object({
  issueIdOrKey: z.string(),
  error: z.string().optional(),
});
export type MoveIssueToBacklogResponse = z.infer<
  typeof MoveIssueToBacklogResponseSchema
>;
