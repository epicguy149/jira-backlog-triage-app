import { Box, Grid, Stack, Text } from '@atlaskit/primitives';
import Heading from '@atlaskit/heading';
import { useAppContext } from '../../app/AppContext';
import { useJiraContext } from '../../hooks/useJiraContext';
import { fetchBacklog } from '../../api/jira-client';
import { SwipeIssueGrid } from '../swipe/components/SwipeIssueGrid';
import { SwipeToolbar } from '../swipe/components/SwipeToolbar';
import { cssMap } from '@atlaskit/css';
import { token } from '@atlaskit/tokens';
import { useEffect } from 'react';
import Lozenge from '@atlaskit/lozenge';
import Spinner from '@atlaskit/spinner';
import EmptyState from '@atlaskit/empty-state';
import noResultsImg from './images/no-results.png';
import emptyBacklogImg from './images/empty-backlog.png';
import errorImg from './images/error.png';
import { Fragment } from 'react';

// maxResults value
const ISSUES_PER_PAGE = 20;

type ErrorStateProps = {
  message?: string;
};

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
});

const NoResultsState = () => (
    <EmptyState
		header="No results found"
		description={
			<Fragment>
				Try using different filters or a different search term.
			</Fragment>
		}
		imageUrl={noResultsImg}
		imageHeight={146.5}
		imageWidth={160}
	/>
);

const EmptyBacklogState = () => (
    <EmptyState
		header="Backlog empty"
		description={
			<Fragment>
				All clear! There are no issues in the backlog.
			</Fragment>
		}
		imageUrl={emptyBacklogImg}
		imageHeight={146.5}
		imageWidth={160}
	/>
);

const ErrorState = ({ message }: ErrorStateProps) => (
    <EmptyState
		header="Error"
		description={
			<Fragment>
				{message || 'An error has occured, please refresh the page and try again.'}
			</Fragment>
		}
		imageUrl={errorImg}
		imageHeight={146.5}
		imageWidth={160}
	/>
);

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
            return <ErrorState message={swipeError} />;
        }

        if (isSwipeLoading && !swipePage) {
            return (
                <Stack xcss={styles.centered}>
                    <Spinner size="large" label='Loading issues...' />
                    <Text size="large">Loading issues...</Text>
                </Stack>
            );
        }

        if (issuesToShow.length === 0) {
            if (searchQuery || swipeFilters.status.swiped || !swipeFilters.status.unswiped) {
                return <NoResultsState />;
            }

            return <EmptyBacklogState />;
        }

         return <SwipeIssueGrid issues={issuesToShow} />;
    };

    return (
        <Stack space="space.150" xcss={styles.container}>
            <SwipeToolbar />
            {renderGrid()}
        </Stack>
    )
}