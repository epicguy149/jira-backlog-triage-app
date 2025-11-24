import { kvs } from "@forge/kvs";

// key prefix for all swiped issues
const SWIPED_PREFIX= 'log-juggler.swiped';

export function swipedStorageKey(
    boardId: string | number, accountId: string
): string {
    // key will be per board per user
    return `${SWIPED_PREFIX}:${String(boardId)}:${accountId}`;
}

// read swiped issue keys for board:user from forge kvs
export async function getSwipedSet(
    boardId: string | number,
    accountId: string
): Promise<Set<string>> {
    const key = swipedStorageKey(boardId, accountId);
    const res = await kvs.get<string[]>(key);

    const array = (res as string[] | undefined) ?? [];
    return new Set(array);
}

// toggles swiped state of issue, persists to kvs
export async function setIssueSwipedInStorage(
    boardId: string | number,
    accountId: string,
    issueKey: string,
    swiped: boolean,
): Promise<Set<string>> {
    const current = await getSwipedSet(boardId, accountId);

    if (swiped) {
        current.add(issueKey);
    } else {
        current.delete(issueKey);
    }

    const key = swipedStorageKey(boardId, accountId);
    await kvs.set(key, Array.from(current));
    return current;
}