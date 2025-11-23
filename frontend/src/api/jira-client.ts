import { invoke, requestJira } from '@forge/bridge';
import type { 
    GetBacklogRequest, 
    GetBacklogResponse,
    SetIssueSwipedRequest,
    SetIssueSwipedResponse,
    DeleteIssueRequest,
    DeleteIssueResponse,
    MoveIssueToSprintRequest,
    MoveIssueToSprintResponse,
    MoveIssueToBacklogRequest,
    MoveIssueToBacklogResponse,
    UpdateIssueRequest,
    UpdateIssueResponse,
} from '~contracts/api';

export type JiraPriority = {
  id: string;
  name: string;
  iconUrl?: string;
};

export type ServerInfo = {
  baseUrl: string;
};

export type BoardEpic = {
  key: string;
  name: string;
  colorKey: string | null;
};

export async function fetchBacklog(
    params: GetBacklogRequest
): Promise<GetBacklogResponse> {
    return invoke('getBacklog', params) as Promise<GetBacklogResponse>;
}

export async function setIssueSwiped(
    params: SetIssueSwipedRequest
): Promise<SetIssueSwipedResponse> {
    return invoke('setIssueSwiped', params) as Promise<SetIssueSwipedResponse>;
}

export async function deleteIssue(
  params: DeleteIssueRequest,
): Promise<DeleteIssueResponse> {
  return invoke('deleteIssue', params) as Promise<DeleteIssueResponse>;
}

export async function moveIssueToSprint(
  params: MoveIssueToSprintRequest,
): Promise<MoveIssueToSprintResponse> {
  return invoke('moveIssueToSprint', params) as Promise<MoveIssueToSprintResponse>;
}

export async function moveIssueToBacklog(
  params: MoveIssueToBacklogRequest,
): Promise<MoveIssueToBacklogResponse> {
  return invoke('moveIssueToBacklog', params) as Promise<MoveIssueToBacklogResponse>;
}

export async function updateIssue(
  params: UpdateIssueRequest,
): Promise<UpdateIssueResponse> {
  return invoke('updateIssue', params) as Promise<UpdateIssueResponse>;
}

export async function fetchServerInfo(): Promise<ServerInfo> {
  const res = await requestJira(`/rest/api/3/serverInfo`, {
    headers: {
      'Accept': 'application/json'
    }
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`failed to fetch serverInfo: ${res.status} ${text}`);
  }

  const data = await res.json() as any;

  return {
    baseUrl: data.baseUrl,
  };
}

export async function fetchPriorities(): Promise<JiraPriority[]> {
  const res = await requestJira(`/rest/api/3/priority`, {
    headers: {
      'Accept': 'application/json'
    }
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`failed to fetch priorities: ${res.status} ${text}`);
  }

  return (await res.json()) as JiraPriority[];
}

export async function fetchEpics(projectId: string, boardId: string | number,): Promise<BoardEpic[]> {
  const params = new URLSearchParams({
    jql: `project = ${projectId} AND issuetype = Epic ORDER BY created DESC`,
    fields: 'id,key,summary',
    maxResults: '100',
  });

  const searchRes = await requestJira(`/rest/api/3/search/jql?${params.toString()}`, {
    headers: {
      'Accept': 'application/json'
    }
  });

  if (!searchRes.ok) {
    const text = await searchRes.text();
    throw new Error(`failed to fetch epics via search: ${searchRes.status} ${text}`);
  }

  const searchData = await searchRes.json() as {
    issues: Array<{ 
      id: string;
      key: string;
      fields: {
        summary: string 
      } 
    }>;
  };

  const agileEpicsRes = await requestJira(`/rest/agile/1.0/board/${boardId}/epic`, {
    headers: { 
      'Accept': 'application/json' 
    }
  });

  if (!agileEpicsRes.ok) {
    const text = await agileEpicsRes.text();
    throw new Error(`Failed to fetch epics : ${agileEpicsRes.status} ${text}`);
  }

  // extract color from agile 1.0 endpoint
  const agileData = await agileEpicsRes.json() as {
    values: Array<{
      key: string;
      name: string;
      color?: {
        key?: string 
      }
    }>;
  };

  const keyColour = new Map<string, string | null>();
  for (const epic of agileData.values) {
    keyColour.set(epic.key, epic.color?.key ?? null);
  }

  // combine agile and v3 results
  return searchData.issues.map(issue => ({
    key: issue.key,
    name: issue.fields.summary,
    colorKey: keyColour.get(issue.key) ?? null,
  }));
}