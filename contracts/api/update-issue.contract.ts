import { z } from 'zod';

export const UpdateIssueRequestSchema = z.object({
    issueIdOrKey: z.string(),
    summary: z.string().optional(),
    descriptionAdf: z.unknown().optional(),
    priorityId: z.string().optional(),
    storyPoints: z.number().nullable().optional(),
    epicKey: z.string().nullable().optional(),
});

export type UpdateIssueRequest = z.infer<typeof UpdateIssueRequestSchema>;

export const UpdateIssueResponseSchema = z.object({
  issueIdOrKey: z.string(),
  error: z.string().optional(),
});

export type UpdateIssueResponse = z.infer<typeof UpdateIssueResponseSchema>;
