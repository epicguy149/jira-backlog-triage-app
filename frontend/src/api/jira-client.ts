// file for Jira api calls

import { invoke } from '@forge/bridge';
import type { GetBacklogRequest, GetBacklogResponse } from '~contracts/api';

export async function fetchBacklog(
    params: GetBacklogRequest
): Promise<GetBacklogResponse> {
    return invoke('getBacklog', params) as Promise<GetBacklogResponse>;
}