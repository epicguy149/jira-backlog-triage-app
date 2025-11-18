import Resolver from '@forge/resolver';
import { 
  GetBacklogRequestSchema, 
  type GetBacklogResponse,
  SetIssueSwipedRequestSchema,
  type SetIssueSwipedResponse,
  DeleteIssueRequestSchema,
  type DeleteIssueResponse,
  MoveIssueToSprintRequestSchema,
  type MoveIssueToSprintResponse,
  MoveIssueToBacklogRequestSchema,
  type MoveIssueToBacklogResponse,
} from '../../contracts/api';
import { 
  getBacklog,
  setIssueSwiped,
  deleteIssue,
  moveIssueToSprint,
  moveIssueToBacklog,
} from '~backend/application';

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

resolver.define('deleteIssue', async (req): Promise<DeleteIssueResponse> => {
  const payload = DeleteIssueRequestSchema.parse(req.payload);
  
  return deleteIssue(payload);
});

resolver.define(
  'moveIssueToSprint',
  async (req): Promise<MoveIssueToSprintResponse> => {
    const payload = MoveIssueToSprintRequestSchema.parse(req.payload);

    return moveIssueToSprint(payload);
  },
);

resolver.define(
  'moveIssueToBacklog',
  async (req): Promise<MoveIssueToBacklogResponse> => {
    const payload = MoveIssueToBacklogRequestSchema.parse(req.payload);
    return moveIssueToBacklog(payload);
  },
);

export const handler = resolver.getDefinitions();