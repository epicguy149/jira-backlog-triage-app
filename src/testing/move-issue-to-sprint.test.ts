import { moveIssueToSprint } from '../application/move-issue-to-sprint';

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

describe('moveIssueToSprint', () => {
    const boardId = 10;
    const issueIdOrKey = 'PROJ-100';

    beforeEach(() => {
        requestJiraMock.mockReset();
    });

    it('returns error when no active sprint', async () => {
        requestJiraMock.mockResolvedValueOnce({
            status: 400,
            text: async () => 'No active sprint',
        });

        const result = await moveIssueToSprint({ boardId, issueIdOrKey });

        expect(requestJiraMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual({
            issueIdOrKey,
            error: 'no active sprint found',
        });
    });

    it('moves issue to the active sprint and returns sprint name', async () => {
        // expect to skip past sprint 1 as state is closed
        requestJiraMock.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                values: [
                    { 
                        id: 1,
                        state: 'closed',
                        name: 'Sprint 1' 
                    },
                    {
                        id: 2,
                        state: 'active',
                        name: 'Sprint 2' 
                    }
                ]
            })
        }).mockResolvedValueOnce({
            ok: true,
            text: async () => '',
        });

        const result = await moveIssueToSprint({ boardId, issueIdOrKey });

        expect(result).toEqual({
            issueIdOrKey,
            sprintName: 'Sprint 2',
        });

        expect(requestJiraMock).toHaveBeenCalledTimes(2);
        const [firstUrl] = requestJiraMock.mock.calls[0];
        const [secondUrl] = requestJiraMock.mock.calls[1];

        expect(String(firstUrl)).toContain(`/rest/agile/1.0/board/${boardId}/sprint`);
        expect(String(secondUrl)).toContain(`/rest/agile/1.0/sprint/2/issue`);
    });

    it('returns error when moving to sprint fails', async () => {
        requestJiraMock.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                values: [{
                    id: 10,
                    state: 'active',
                    name: 'Sprint 10'
                }]
            }),
        }).mockResolvedValueOnce({
            status: 400,
            text: async () => 'Failed',
        });

        const result = await moveIssueToSprint({ boardId, issueIdOrKey });

        expect(result.issueIdOrKey).toBe(issueIdOrKey);
        expect(result.error).toContain('Failed');
    });

    it('returns error when requestJira throws', async () => {
        requestJiraMock.mockRejectedValueOnce(new Error('Error3'));

        const result = await moveIssueToSprint({ boardId, issueIdOrKey });

        expect(result.issueIdOrKey).toBe(issueIdOrKey);
        expect(result.error).toBe('Error3');
    });
});
