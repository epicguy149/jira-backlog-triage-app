import { moveIssueToBacklog } from '../application/move-issue-to-backlog';

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

describe('moveIssueToBacklog', () => {
    const boardId = 1;
    const issueIdOrKey = 'PROJ-1';

    beforeEach(() => {
        requestJiraMock.mockReset();
    });

    it('returns issuekey on success', async () => {
        requestJiraMock.mockResolvedValueOnce({
            ok: true,
            status: 204,
            text: async () => '',
        });

        const result = await moveIssueToBacklog({ boardId, issueIdOrKey });

        expect(requestJiraMock).toHaveBeenCalledTimes(1);
        const [url, options] = requestJiraMock.mock.calls[0];

        expect(String(url)).toContain(`/rest/agile/1.0/backlog/${boardId}/issue`);
        expect((options as any).method).toBe('POST');
        expect((options as any).body).toBe(JSON.stringify({ issues: [issueIdOrKey] }));

        expect(result).toEqual({ issueIdOrKey });
    });

    it('returns error when Jira response is not ok', async () => {
        requestJiraMock.mockResolvedValueOnce({
            status: 400,
            text: async () => 'Error',
        });

        const result = await moveIssueToBacklog({ boardId, issueIdOrKey });

        expect(result.issueIdOrKey).toBe(issueIdOrKey);
        expect(result.error).toContain('Error');
    });

    it('returns error when requestJira throws', async () => {
        requestJiraMock.mockRejectedValueOnce(new Error('Error2'));

        const result = await moveIssueToBacklog({ boardId, issueIdOrKey });

        expect(result.issueIdOrKey).toBe(issueIdOrKey);
        expect(result.error).toBe('Error2');
    });
});
