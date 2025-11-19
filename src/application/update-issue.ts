import api, { route } from '@forge/api';
import type { UpdateIssueRequest, UpdateIssueResponse } from '../../contracts/api';
import { getJiraFields } from './get-jira-fields';

export async function updateIssue(req: UpdateIssueRequest): Promise<UpdateIssueResponse> {
    const { epicLinkFieldId, storyPointsFieldId } = await getJiraFields();

    const fields: Record<string, unknown> = {};

    if (req.summary !== undefined) {
        fields.summary = req.summary;
    }

    if (req.descriptionAdf !== undefined) {
        fields.description = req.descriptionAdf;
    }

    if (req.priorityId !== undefined) {
        fields.priority = { id: req.priorityId };
    }

    if (req.storyPoints !== undefined && storyPointsFieldId) {
        fields[storyPointsFieldId] = req.storyPoints;
    }

    if (req.epicKey !== undefined && epicLinkFieldId) {
        fields[epicLinkFieldId] = req.epicKey ?? null;
    }

    if (Object.keys(fields).length === 0) {
        return { issueIdOrKey: req.issueIdOrKey };
    }

    const res = await api.asUser().requestJira(route`/rest/api/3/issue/${req.issueIdOrKey}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fields }),
    });

    if (!res.ok) {
        const text = await res.text();
        return {
            issueIdOrKey: req.issueIdOrKey,
            error: `Failed to update issue ${req.issueIdOrKey}: ${res.status} ${text}`
        }
    }

    return { issueIdOrKey: req.issueIdOrKey };
}


