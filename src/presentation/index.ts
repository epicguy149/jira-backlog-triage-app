import Resolver from '@forge/resolver';
import { 
  GetBacklogRequestSchema, 
  type GetBacklogResponse,
  SetIssueSwipedRequestSchema,
  type SetIssueSwipedResponse,
} from '../../contracts/api';
import { getBacklog } from '../application/get-backlog';
import { setIssueSwiped } from '../application/set-swiped';

const resolver = new Resolver();

resolver.define('getBacklog', async(req): Promise<GetBacklogResponse> => {
  const payload = GetBacklogRequestSchema.parse(req.payload);
  const accountId = req.context?.accountId;
  if (!accountId) {
    throw new Error('accountId missing in request');
  }

  return getBacklog(payload, { accountId });
})

resolver.define('setIssueSwiped', async(req): Promise<SetIssueSwipedResponse> => {
  const payload = SetIssueSwipedRequestSchema.parse(req.payload);
  const accountId = req.context?.accountId;
  if (!accountId) {
    throw new Error('accountId missing in request');
  }
  
  return setIssueSwiped(payload, { accountId });
})

export const handler = resolver.getDefinitions();