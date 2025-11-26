import { setIssueSwiped } from '../application/set-swiped';

const setIssueSwipedInStorageMock = jest.fn();

jest.mock('../persistence/swipe-storage', () => ({
    __esModule: true,
    setIssueSwipedInStorage: (...args: unknown[]) => setIssueSwipedInStorageMock(...args)
}));

describe('setIssueSwiped', () => {
    const accountId = 'user1';
    const boardId = 1;
    const issueKey = 'PROJ-1';

    beforeEach(() => {
        setIssueSwipedInStorageMock.mockReset();
    });

    it('throws if no boardId', async () => {
        await expect(
        setIssueSwiped(
            {
            // @ts-expect-error testing missing boardId
            boardId: undefined,
            issueKey: 'PROJ-1',
            swiped: true,
            },
            { accountId },
        ),
        ).rejects.toThrow('no boardId');
        expect(setIssueSwipedInStorageMock).not.toHaveBeenCalled();
    });

    it('calls persistence layer and sets to swiped', async () => {
        setIssueSwipedInStorageMock.mockResolvedValueOnce(
        new Set<string>(['PROJ-1']),
        );

        const result = await setIssueSwiped(
            {
                boardId: 1,
                issueKey: 'PROJ-1',
                swiped: true,
            },
            {
                accountId 
            }
        );

        expect(setIssueSwipedInStorageMock).toHaveBeenCalledWith(boardId, accountId, issueKey, true);
        expect(result).toEqual({ boardId, issueKey, swiped: true});
    });
});
