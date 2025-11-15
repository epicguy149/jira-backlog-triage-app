import {
  SetIssueSwipedRequest,
  SetIssueSwipedResponse,
  SetIssueSwipedResponseSchema,
} from '../../contracts/api';
import { setIssueSwipedInStorage } from './swipe-storage';

type SetIssueSwipedContext = {
    accountId: string;
}

export async function setIssueSwiped(
    payload: SetIssueSwipedRequest,
    context: SetIssueSwipedContext
): Promise <SetIssueSwipedResponse> {
    const { boardId, issueKey, swiped } = payload;
    const { accountId } = context;

    if (!boardId) {
        throw new Error('no boardId');
    }

    await setIssueSwipedInStorage(boardId, accountId, issueKey, swiped);

    return SetIssueSwipedResponseSchema.parse({ boardId, issueKey, swiped });
}
