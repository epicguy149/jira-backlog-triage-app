// file for Jira api calls

import { invoke } from '@forge/bridge';
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
} from '~contracts/api';

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

type FetchBacklogParams = Omit<GetBacklogRequest, 'boardId'> & {
    boardId: string | number;
    filters?: SwipeFilterState;
};