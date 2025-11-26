import { buildJqlQuery } from '../application/jql-builder';

describe('buildJqlQuery', () => {
    it('default filter is unswiped = true, swiped = false, and filters out epics', () => {
        const result = buildJqlQuery({
            swipedSet: new Set(['PROJ-1']),
        });

        // Default: unswiped = true, swiped = false
        expect(result).toContain('issuetype != Epic');
        expect(result).toContain('issuekey NOT IN ("PROJ-1")');
    });

    it('empty result if unswiped and swiped set to false', () => {
        const result = buildJqlQuery({
            swipedSet: new Set(),
            filters: { status: { unswiped: false, swiped: false } },
        });

        expect(result).toBeNull();
    });

    it('correct result when unswiped true swiped false', () => {
        const swipedSet = new Set(['PROJ-1', 'PROJ-2']);

        const result = buildJqlQuery({
            swipedSet,
            filters: { status: { unswiped: true, swiped: false } },
        });

        expect(result).toContain('issuetype != Epic');

        // only contains issue not in swiped
        expect(result).toContain('issuekey NOT IN ("PROJ-1","PROJ-2")');
        expect(result!.split(' AND ').length).toBe(2);
    });

    it('correct result when unswiped false swiped true', () => {
        const swipedSet = new Set(['PROJ-3']);

        const result = buildJqlQuery({
            swipedSet,
            filters: { status: { unswiped: false, swiped: true } },
        });

        expect(result).toContain('issuetype != Epic');

        // expect issue to be in swipedSet
        expect(result).toContain('issuekey IN ("PROJ-3")');
    });


    it('empty result when filtering swiped only but none swiped', () => {
        const swipedSet = new Set<string>();

        const result = buildJqlQuery({
            swipedSet,
            filters: { status: { unswiped: false, swiped: true } },
        });

        expect(result).toBeNull();
    });
});
