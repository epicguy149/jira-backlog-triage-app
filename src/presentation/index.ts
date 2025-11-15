import Resolver from '@forge/resolver';
import { GetBacklogRequestSchema, type GetBacklogResponse } from '../../contracts/api';
import { getBacklog } from '../application/get-backlog';
const resolver = new Resolver();

resolver.define('getBacklog', async(req): Promise<GetBacklogResponse> => {
  const payload = GetBacklogRequestSchema.parse(req.payload);
  const accountId = req.context?.accountId;
  if (!accountId) {
    throw new Error('accountId missing in request');
  }

  return getBacklog(payload, { accountId });
})

export const handler = resolver.getDefinitions();