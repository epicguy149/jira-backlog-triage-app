// file for Jira api calls

import { invoke } from '@forge/bridge';
import type { 
    GetBacklogRequest, 
    GetBacklogResponse,
    SetIssueSwipedRequest,
    SetIssueSwipedResponse,
    SwipeFilterState,
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

type FetchBacklogParams = Omit<GetBacklogRequest, 'boardId'> & {
    boardId: string | number;
    filters?: SwipeFilterState;
};