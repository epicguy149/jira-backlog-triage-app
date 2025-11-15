import { Box, Grid, Stack, Text } from '@atlaskit/primitives';
import Heading from '@atlaskit/heading';
import { useAppContext } from '../../app/AppContext';
import { useJiraContext } from '../../hooks/useJiraContext';
import { fetchBacklog } from '../../api/jira-client';
import { SwipeIssueCard } from '../swipe/components/SwipeIssueCard';
import { SwipeToolbar } from '../swipe/components/SwipeToolbar';
import { cssMap } from '@compiled/react';
import { token } from '@atlaskit/tokens';
import { useEffect } from 'react';
import Lozenge from '@atlaskit/lozenge';
import Spinner from '@atlaskit/spinner';

// maxResults value
const ISSUES_PER_PAGE = 20;

const styles = cssMap({
    container: {
        padding: token('space.300'),
    },
    centered: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '200px',
    },
    cardGrid: {
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        alignItems: 'stretch',
    },
    skeletonCard: {
        borderRadius: token('radius.small'),
        backgroundColor: token('color.background.neutral.subtle'),
        height: '120px',
    },
});

function Message({ title, body}: { title: string, body?: string }) {
    return (
        <Box xcss={styles.centered}>
            <Stack space="space.100" alignInline='center'>
                <Heading size="large">{title}</Heading>
                {body && <Text>{body}</Text>}
            </Stack>
        </Box>
    )
}

export default function SwipeMode() {
    const {
        swipePage,
        setSwipePage,
        isSwipeLoading,
        setIsSwipeLoading,
        swipeError,
        setSwipeError,
        setBanner,
        searchQuery,
        swipeFilters,
    } = useAppContext();

    const {
        boardId,
        isLoading: isContextLoading,
        error: contextError,
    } = useJiraContext();

    useEffect(() => {
        if (contextError) {
            setSwipeError(contextError);
            return;
        }

        if (!boardId || isContextLoading) {
            return;
        }

        let cancelled = false;

        async function loadSwipe() {
            try {
                setSwipeError(null);
                setIsSwipeLoading(true);

                if (!boardId) {
                    return;
                }

                const page = await fetchBacklog({
                    boardId,
                    startAt: 0,
                    maxResults: ISSUES_PER_PAGE,
                    searchQuery,
                    filters: swipeFilters,
                });

                if (!cancelled) {
                    setSwipePage(page);
                }
            } catch (err: unknown) {
                if (!cancelled) {
                    const message = err instanceof Error ? err.message : 'failed to load backlog issues';
                    setSwipeError(message);
                }
            } finally {
                if (!cancelled) {
                    setIsSwipeLoading(false);
                }
            }
        }

        loadSwipe();
        return () => {
            cancelled = true;
        };
    }, [
        boardId, isContextLoading, contextError, searchQuery, 
        setSwipeError, setIsSwipeLoading, setSwipePage, setBanner,
        swipeFilters
    ]);

    const issuesToShow = swipePage?.issues ?? [];

    if (isContextLoading) {
        return (
            <Box xcss={styles.container}>
                <Stack space="space.100" alignInline="center">
                    <Spinner size='large' label="Loading Context" />
                    <Lozenge appearance="new">Loading Context...</Lozenge>
                </Stack>
            </Box>
        );
    }

    const renderGrid = () => {
        if (swipeError) {
            return <Message title="Could not load backlog issues" body={swipeError} />;
        }

        if (isSwipeLoading && !swipePage) {
            return (
                <Box xcss={styles.centered}>
                    <Spinner size="large" label='Loading issues...' />
                </Box>
            );
        }

        if (issuesToShow.length === 0) {
            if (searchQuery || swipeFilters.status.swiped || !swipeFilters.status.unswiped) {
                return <Message title="No matching issues" body="No issues match your search and filters" />;
            }

            return <Message title="Backlog clear" body="No issues in backlog for this board" />;
        }

        return (
            <Grid xcss={styles.cardGrid} gap="space.200">
                {issuesToShow.map((issue) => (
                    <SwipeIssueCard key={issue.id} issue={issue} />
                ))}
            </Grid>
        );
    };

    return (
        <Stack space="space.300" xcss={styles.container}>
            <SwipeToolbar />
            {renderGrid()}
        </Stack>
    )
}