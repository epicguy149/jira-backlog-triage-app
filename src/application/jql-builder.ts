import type { SwipeFilterState } from '../../contracts/api';

function escapeJQL(str: string): string {
    return str.replace(/"/g, '\\"');
}

type JqlBuilderOptions = {
    searchQuery?: string;
    filters?: SwipeFilterState;
    swipedSet: Set<string>;
};

export function buildJqlQuery(options: JqlBuilderOptions): string | null {
    const { searchQuery, filters, swipedSet } = options;
    
    // initial: filter out epics
    const jqlClauses: string[] = ['issuetype != Epic'];

    if (searchQuery && searchQuery.trim() !== '') {
        jqlClauses.push(`text ~ "${escapeJQL(searchQuery)}"`);
    }

    const statusFilter = filters?.status;
    const showUnswiped = statusFilter?.unswiped ?? true;
    const showSwiped = statusFilter?.swiped ?? false;

    if (!showUnswiped && !showSwiped) {
        return null; 
    }

    const swipedKeys = Array.from(swipedSet);
    
    if (swipedKeys.length > 0) {
        const keyList = swipedKeys.join(',');
        
        if (showUnswiped && !showSwiped) {
            jqlClauses.push(`key NOT IN (${keyList})`);
        } else if (!showUnswiped && showSwiped) {
            jqlClauses.push(`key IN (${keyList})`);
        }
    } else if (!showUnswiped && showSwiped) {
        return null; 
    }
    return jqlClauses.join(' AND ');
}