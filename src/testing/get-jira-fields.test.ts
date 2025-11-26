import { getJiraFields } from '../application/get-jira-fields';

const requestJiraMock = jest.fn();
const kvsGetMock = jest.fn();
const kvsSetMock = jest.fn();

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

jest.mock('@forge/kvs', () => ({
    kvs: {
        get: (...args: unknown[]) => kvsGetMock(...args),
        set: (...args: unknown[]) => kvsSetMock(...args),
    },
}));

describe('getJiraFields', () => {
    beforeEach(() => {
        requestJiraMock.mockReset();
        kvsGetMock.mockReset();
        kvsSetMock.mockReset();
    });

    it('returns stored field ids from kvs if exists', async () => {
        kvsGetMock.mockResolvedValueOnce({
            epicLinkFieldId: 'customfield_1',
            storyPointsFieldId: 'customfield_2',
        });

        const result = await getJiraFields();

        expect(result).toEqual({
            epicLinkFieldId: 'customfield_1',
            storyPointsFieldId: 'customfield_2',
        });

        expect(requestJiraMock).not.toHaveBeenCalled();
    });

    it('fetches from Jira if kvs store is empty', async () => {
        kvsGetMock.mockResolvedValueOnce(undefined);

        const fields = [
            {
                id: 'customfield_1',
                name: 'Epic Link',
                schema: { 
                    type: 'any' 
                }
            },
            {
                id: 'customfield_2',
                name: 'Story points',
                schema: {
                    type: 'number' 
                }
            }
        ];

        requestJiraMock.mockResolvedValueOnce({
            ok: true,
            json: async () => fields,
        });

        const result = await getJiraFields();

        expect(requestJiraMock).toHaveBeenCalledTimes(1);
        const [url] = requestJiraMock.mock.calls[0];
        expect(String(url)).toContain('/rest/api/3/field');

        expect(result.epicLinkFieldId).toBe('customfield_1');
        expect(result.storyPointsFieldId).toBe('customfield_2');

        // check key 
        expect(kvsSetMock).toHaveBeenCalledWith('field-ids', result);
    });

    it('throws when requestJira fails', async () => {
        kvsGetMock.mockResolvedValueOnce(undefined);

        requestJiraMock.mockResolvedValueOnce({
            status: 401,
            text: async () => 'Test'
        });

        await expect(getJiraFields()).rejects.toThrow('Failed retrieving fields');
    });
});
