import { updateIssue } from '../application/update-issue';
import { getJiraFields } from '../application/get-jira-fields';

const requestJiraMock = jest.fn();

jest.mock('@forge/api', () => {
    const route = (strings: ReadonlyArray<string>, ...values: ReadonlyArray<unknown>): string =>strings.reduce(
        (acc, s, idx) => acc + s + (idx < values.length ? String(values[idx]) : ''), ''
    );

    return {
        default: {
            asUser: () => ({
                requestJira: (...args: unknown[]) => requestJiraMock(...args),
            }),
        },
        route,
        __esModule: true,
    };
});

jest.mock('../application/get-jira-fields');

const getJiraFieldsMock = getJiraFields as jest.Mock;

describe('updateIssue', () => {
    const issueIdOrKey = 'PROJ-4';

    beforeEach(() => {
        requestJiraMock.mockReset();
        getJiraFieldsMock.mockReset();
    });

    it('returns if no fields provided', async () => {
        getJiraFieldsMock.mockResolvedValueOnce({
            epicLinkFieldId: 'customfield_1',
            storyPointsFieldId: 'customfield_2',
        });

        const result = await updateIssue({ issueIdOrKey });

        expect(result).toEqual({ issueIdOrKey });
        expect(requestJiraMock).not.toHaveBeenCalled();
        expect(getJiraFieldsMock).toHaveBeenCalledTimes(1);
    });

    it('updates fields correcctly', async () => {
        getJiraFieldsMock.mockResolvedValueOnce({
            epicLinkFieldId: 'customfield_1',
            storyPointsFieldId: 'customfield_2',
        });

        requestJiraMock.mockResolvedValueOnce({
            ok: true,
            status: 204,
            text: async () => '',
        });

        const descriptionAdf = { type: 'doc', content: [] };

        const result = await updateIssue({
            issueIdOrKey,
            summary: 'New summary',
            descriptionAdf,
            priorityId: '2',
            storyPoints: 8,
            epicKey: 'PROJ-2'
        });

        expect(result).toEqual({ issueIdOrKey });

        expect(requestJiraMock).toHaveBeenCalledTimes(1);
        const [url, options] = requestJiraMock.mock.calls[0];

        expect(String(url)).toContain(`/rest/api/3/issue/${issueIdOrKey}`);
        const body = JSON.parse((options as any).body);

        expect(body.fields.summary).toBe('New summary');
        expect(body.fields.description).toEqual(descriptionAdf);
        expect(body.fields.priority.id).toEqual('2');
        expect(body.fields['customfield_2']).toBe(8);
        expect(body.fields['customfield_1']).toBe('PROJ-2');
    });

    it('uses parent if customfield id for epics doesnt exist', async () => {
        getJiraFieldsMock.mockResolvedValueOnce({
            epicLinkFieldId: null,
            storyPointsFieldId: 'customfield_2',
        });

        requestJiraMock.mockResolvedValueOnce({
            ok: true,
            status: 204,
            text: async () => '',
        });

        const result = await updateIssue({
            issueIdOrKey,
            epicKey: 'EPIC-20',
            storyPoints: 3,
        });

        expect(result).toEqual({ issueIdOrKey });

        const [, options] = requestJiraMock.mock.calls[0];
        const body = JSON.parse((options as any).body);

        expect(body.fields.parent).toEqual({ key: 'EPIC-20' });
        expect(body.fields['customfield_2']).toBe(3);
    });

    it('returns error when update fails', async () => {
        getJiraFieldsMock.mockResolvedValueOnce({
            epicLinkFieldId: 'customfield_1',
            storyPointsFieldId: 'customfield_2',
        });

        requestJiraMock.mockResolvedValueOnce({
            status: 400,
            text: async () => 'Error Two',
        });

        const result = await updateIssue({
            issueIdOrKey,
            summary: 'Testing 123',
        });

        expect(result.issueIdOrKey).toBe(issueIdOrKey);
        expect(result.error).toContain('Failed to update issue');
        expect(result.error).toContain('400');
        expect(result.error).toContain('Error Two');
    });
});
