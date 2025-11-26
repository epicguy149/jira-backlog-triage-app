import { swipedStorageKey, getSwipedSet, setIssueSwipedInStorage } from '../persistence/swipe-storage';

const getMock = jest.fn();
const setMock = jest.fn();

jest.mock('@forge/kvs', () => ({
    kvs: {
        get: (...args: unknown[]) => getMock(...args),
        set: (...args: unknown[]) => setMock(...args),
    },
}));

describe('swipe-storage', () => {
    const boardId = '1';
    const accountId = 'user1';

    beforeEach(() => {
        getMock.mockReset();
        setMock.mockReset();
    });

    it('builds key correctly', () => {
        const key = swipedStorageKey(boardId, accountId);
        expect(key).toBe('log-juggler.swiped:1:user1');
    });

    it('getSwipedSet - empty result when kvs response is undefined', async () => {
        getMock.mockResolvedValueOnce(undefined);

        const result = await getSwipedSet(boardId, accountId);

        expect(getMock).toHaveBeenCalledWith('log-juggler.swiped:1:user1');
        expect(result).toBeInstanceOf(Set);
        expect(result.size).toBe(0);
    });

    it('getSwipedSet - returns stored keys', async () => {
        getMock.mockResolvedValueOnce(['PROJ-1', 'PROJ-2']);

        const result = await getSwipedSet(boardId, accountId);

        expect(result).toBeInstanceOf(Set);
        expect(result.has('PROJ-1')).toBe(true);
        expect(result.has('PROJ-2')).toBe(true);
        expect(result.size).toBe(2);
    });

    it('setIssueSwipedInStorage - adds issue to store if swiped is true', async () => {
        getMock.mockResolvedValueOnce(['PROJ-1']);
        setMock.mockResolvedValueOnce(undefined);

        const issueKey = 'PROJ-2'
        const swiped = true;
        const result = await setIssueSwipedInStorage(boardId, accountId, issueKey, swiped);

        expect(result.has('PROJ-1')).toBe(true);
        expect(result.has('PROJ-2')).toBe(true);
        expect(setMock).toHaveBeenCalledWith('log-juggler.swiped:1:user1', ['PROJ-1', 'PROJ-2']);
    });

    it('setIssueSwipedInStorage - issue removed if swiped is false', async () => {
        getMock.mockResolvedValueOnce(['PROJ-1', 'PROJ-2']);
        setMock.mockResolvedValueOnce(undefined);

        const issueKey = 'PROJ-2'
        const swiped = false;

        const result = await setIssueSwipedInStorage(boardId, accountId, issueKey, swiped);

        expect(result.has('PROJ-1')).toBe(true);
        expect(result.has('PROJ-2')).toBe(false);
        expect(setMock).toHaveBeenCalledWith('log-juggler.swiped:1:user1', ['PROJ-1']);
    });
});
