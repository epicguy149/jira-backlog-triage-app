import { getBacklog, buildJqlQuery } from '../application';
import type { GetBacklogRequest } from '../../contracts/api';
import { SwipeIssuePageSchema } from '../../contracts/api';
import { getSwipedSet } from '../persistence/swipe-storage';
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

jest.mock('../persistence/swipe-storage');
jest.mock('../application/jql-builder');
jest.mock('../application/get-jira-fields');

const getSwipedSetMock = getSwipedSet as jest.Mock;
const buildJqlQueryMock = buildJqlQuery as jest.Mock;
const getJiraFieldsMock = getJiraFields as jest.Mock;

describe('getBacklog', () => {
  const accountId = 'user1';

  beforeEach(() => {
      requestJiraMock.mockReset();
      getSwipedSetMock.mockReset();
      buildJqlQueryMock.mockReset();
      getJiraFieldsMock.mockReset();
  });

  it('returns error when backlog fetch fails', async () => {
    getJiraFieldsMock.mockResolvedValueOnce({
      epicLinkFieldId: 'customfield_1',
      storyPointsFieldId: 'customfield_2',
    });

    getSwipedSetMock.mockResolvedValueOnce(new Set<string>(['PROJ-1']));
    buildJqlQueryMock.mockReturnValueOnce('project = PROJ');

    requestJiraMock.mockResolvedValueOnce({
      status: 401,
      statusText: 'Error',
      text: async () => 'Error Text',
    });

    const payload: GetBacklogRequest = {
      boardId: 1,
      startAt: 0,
      maxResults: 50,
    };

    await expect(getBacklog(payload, { accountId })).rejects.toThrow(
      'failed to fetch backlog: 401 Error Error Text',
    );
  });

  it('if only epics in backlog, response is empty', async () => {
    getJiraFieldsMock.mockResolvedValueOnce({
      epicLinkFieldId: 'customfield_1',
      storyPointsFieldId: 'customfield_2',
    });

    getSwipedSetMock.mockResolvedValueOnce(new Set<string>());
    buildJqlQueryMock.mockReturnValueOnce('project = PROJ');

    const res = {
      issues: [
        {
          id: '1',
          key: 'PROJ-1',
          fields: {
            summary: 'An Epic',
            status: {
              name: 'In Progress' 
            },
            priority: null,
            assignee: null,
            description: null,
            issuetype: { 
              name: 'Epic', 
              iconUrl: 'http://test.com' 
            },
            epic: null,
            parent: null
          }
        }
      ],
      total: 1,
      startAt: 0,
      maxResults: 50,
    };

    requestJiraMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => res,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          isLast: true,
          startAt: 0,
          maxResults: 50,
          values: [],
        }),
      });

    const payload: GetBacklogRequest = {
      boardId: 1,
      startAt: 0,
      maxResults: 50,
    };

    const result = await getBacklog(payload, { accountId });
    const parsed = SwipeIssuePageSchema.parse(result);

    expect(parsed.issues).toEqual([]);
    expect(parsed.total).toBe(1);
    expect(parsed.startAt).toBe(0);
    expect(parsed.maxResults).toBe(50);
  });

  it('maps Jira backlog issues to SwipeIssues with epic metadata and swiped flag', async () => {
    getJiraFieldsMock.mockResolvedValueOnce({
      epicLinkFieldId: 'customfield_1',
      storyPointsFieldId: 'customfield_2',
    });
    getSwipedSetMock.mockResolvedValueOnce(new Set<string>(['PROJ-2']));
    buildJqlQueryMock.mockReturnValueOnce('project = PROJ');

    // mock issues 
    const res = {
      issues: [
        {
          id: '1',
          key: 'PROJ-2',
          fields: {
            summary: 'Test story',
            status: {
              name: 'In Progress'
            },
            priority: {
              name: 'Medium',
              iconUrl: 'http://priorityurl.com',
              id: '3'
            },
            assignee: {
              displayName: 'Testing',
              avatarUrls: { 
                '24x24': 'http://avatarurl.com'
              }
            },
            description: null,
            issuetype: {
              name: 'Story',
              iconUrl: 'http://issueicon.com'
            },
            epic: null,
            parent: {
              key: 'PROJ-1',
              fields: {
                issuetype: {
                  name: 'Epic'
                }
              }
            },
            customfield_1: 'PROJ-1',
            customfield_2: 5
          },
        },
      ],
      total: 1,
      startAt: 0,
      maxResults: 50,
    };

    // mock get epics
    const epics = {
      isLast: true,
      startAt: 0,
      maxResults: 50,
      values: [
        {
          key: 'PROJ-1',
          name: 'Epic Name',
          summary: 'Epic Summary',
          color: {
            key: 'purple'
          }
        }
      ]
    };

    requestJiraMock.mockResolvedValueOnce({
      ok: true,
      json: async () => res,
    }).mockResolvedValueOnce({
      ok: true,
      json: async () => epics,
    });

    const payload: GetBacklogRequest = {
      boardId: 1,
      startAt: 0,
      maxResults: 50,
    };

    const result = await getBacklog(payload, { accountId });
    const parsed = SwipeIssuePageSchema.parse(result);

    expect(parsed.total).toBe(1);
    expect(parsed.issues).toHaveLength(1);

    const issue = parsed.issues[0];
    expect(issue.key).toBe('PROJ-2');
    expect(issue.summary).toBe('Test story');
    expect(issue.status).toBe('In Progress');
    expect(issue.priorityName).toBe('Medium');
    expect(issue.assigneeDisplayName).toBe('Testing');
    expect(issue.swiped).toBe(true);
    expect(issue.epicKey).toBe('PROJ-1');
    expect(issue.epicSummary).toBe('Epic Summary');
    expect(issue.epicColor).toBe('purple');
    expect(issue.storyPoints).toBe(5);
  });
});
