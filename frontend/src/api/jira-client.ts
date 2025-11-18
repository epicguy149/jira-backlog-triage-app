// file for Jira api calls

import { invoke, requestJira } from '@forge/bridge';
import type { 
    GetBacklogRequest, 
    GetBacklogResponse,
    SetIssueSwipedRequest,
    SetIssueSwipedResponse,
    SwipeFilterState,
    DeleteIssueRequest,
    DeleteIssueResponse,
    MoveIssueToSprintRequest,
    MoveIssueToSprintResponse,
    MoveIssueToBacklogRequest,
    MoveIssueToBacklogResponse
} from '~contracts/api';

type FetchBacklogParams = Omit<GetBacklogRequest, 'boardId'> & {
    boardId: string | number;
    filters?: SwipeFilterState;
};

export type ServerInfo = {
  baseUrl: string;
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