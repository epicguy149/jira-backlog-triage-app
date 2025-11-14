import Resolver from '@forge/resolver';
import { GetBacklogRequestSchema, type GetBacklogResponse } from '../../contracts/api';
import { getBacklog } from '../application/get-backlog';
const resolver = new Resolver();

resolver.define('getBacklog', async(req): Promise<GetBacklogResponse> => {
  const payload = GetBacklogRequestSchema.parse(req.payload);
  return getBacklog(payload);
})

export const handler = resolver.getDefinitions();