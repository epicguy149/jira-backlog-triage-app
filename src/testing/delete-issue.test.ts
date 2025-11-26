import { deleteIssue } from '../application/delete-issue';

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

describe('deleteIssue', () => {
    const issueIdOrKey = 'PROJ-1';

    beforeEach(() => {
        requestJiraMock.mockReset();
    });

    it('returns issuekey when delete success', async () => {
        requestJiraMock.mockResolvedValueOnce({
            ok: true,
            status: 204,
            statusText: 'No Content',
            text: async () => '',
        });

        const result = await deleteIssue({ issueIdOrKey });

        expect(requestJiraMock).toHaveBeenCalledTimes(1);

        // check endpoint
        const [url, options] = requestJiraMock.mock.calls[0];

        expect(String(url)).toContain(`/rest/api/3/issue/${issueIdOrKey}`);
        expect((options as any).method).toBe('DELETE');

        expect(result).toEqual({ issueIdOrKey });
    });

    it('returns error when Jira response has error', async () => {
        requestJiraMock.mockResolvedValueOnce({
            ok: false,
            status: 400,
            statusText: 'Bad Request',
            text: async () => 'Test Error',
        });

        const result = await deleteIssue({ issueIdOrKey });

        expect(result.issueIdOrKey).toBe(issueIdOrKey);
        expect(result.error).toContain('Test Error');
    });

    it('returns error when thrown', async () => {
        requestJiraMock.mockRejectedValueOnce(new Error('Test Error'));

        const result = await deleteIssue({ issueIdOrKey });

        expect(result.issueIdOrKey).toBe(issueIdOrKey);
        expect(result.error).toBe('Test Error');
    });
});
