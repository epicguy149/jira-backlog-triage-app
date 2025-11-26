import { Box, Stack, Text } from '@atlaskit/primitives';
import { useAppContext } from '../../app/AppContext';
import { useJiraContext } from '../../hooks/useJiraContext';
import {
	fetchBacklog,
	setIssueSwiped,
	deleteIssue,
	moveIssueToSprint,
    moveIssueToBacklog,
} from '../../api/jira-client';
import { SwipeIssueGrid } from '../swipe/components/SwipeIssueGrid';
import { SwipeToolbar } from '../swipe/components/SwipeToolbar';
import { cssMap } from '@atlaskit/css';
import { token } from '@atlaskit/tokens';
import { useEffect, useCallback, Fragment, useState } from 'react';
import Spinner from '@atlaskit/spinner';
import EmptyState from '@atlaskit/empty-state';
import type { SwipeIssue } from '~contracts/api';
import type { SwipeDirection } from '../swipe/swipe-types';

const noResultsImg = new URL('./images/no-results.png', import.meta.url).href;
const emptyBacklogImg = new URL('./images/empty-backlog.png', import.meta.url).href;
const errorImg = new URL('./images/error.png', import.meta.url).href;

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
        addActionHistory,
        disableHistoryItem,
        historyActionRequest,
        setHistoryActionRequest,
    } = useAppContext();

    const {
        boardId,
        isLoading: isContextLoading,
        error: contextError,
    } = useJiraContext();

	const [selectedIssue, setSelectedIssue] = useState<SwipeIssue | null>(null);

	const handleIssueClick = useCallback((issue: SwipeIssue) => {
		setSelectedIssue(issue);
	}, []);

    // initial loading
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
        boardId,
        isContextLoading,
        contextError,
        searchQuery, 
        setSwipeError,
        setIsSwipeLoading,
        setSwipePage,
        setBanner,
        swipeFilters,
    ]);

    const issuesToShow = (swipePage?.issues ?? []).filter((issue) => {
		const { unswiped, swiped } = swipeFilters.status;

		// show all
		if (unswiped && swiped) {
			return true;
		}

		// only unswiped
		if (unswiped && !swiped) {
			return !issue.swiped;
		}

		// only swiped
		if (!unswiped && swiped) {
			return issue.swiped;
		}

		return false;
	});

    const handleIssueSwipe = useCallback(
		async (
            issue: SwipeIssue,
            direction: SwipeDirection,
        ): Promise<boolean> => {
			if (!boardId) {
				setBanner({
					type: 'error',
					message: 'No board in context',
				});
				return false;
			}

            if (!swipePage) {
                return false;
            }

			const issueKey = issue.key;

            const actionType: 'retain' | 'delete' | 'move-to-sprint' =
				direction === 'left' ? 'delete'
				: direction === 'up' ? 'move-to-sprint'
				: 'retain';

            const originalIssues = swipePage.issues;
            
            // optimistically remove from grid immediately after swipe
            setSwipePage({
                ...swipePage,
                issues: originalIssues.filter((i) => i.id !== issue.id),
            });

            try {
                let sprintName: string | undefined;

                if (actionType === 'delete') {
                    const res = await deleteIssue({ issueIdOrKey: issueKey });

                    if (res.error) {
                        throw new Error(res.error);
                    }
                } else if (actionType === 'move-to-sprint') {
                    const res = await moveIssueToSprint({
                        boardId,
                        issueIdOrKey: issueKey,
                    });

                    if (res.error) {
                        throw new Error(res.error);
                    }

                    sprintName = res.sprintName;
                }

                const swipedRes = await setIssueSwiped({
                    boardId,
                    issueKey,
                    swiped: true,
                });

                if (!swipedRes.swiped) {
                    throw new Error('Failed to mark issue as swiped');
                }
                
                // add history and receive item generated
                const historyItem = addActionHistory({
                    key: issueKey,
                    type: actionType,
                    sprintName,
                });

                // set banner message for action taken
                let msg: string;
                if (actionType === 'delete') {
                    msg = `${issueKey} deleted`;
                } else if (actionType === 'retain') {
                    msg = `${issueKey} retained in backlog`;
                } else {
                    const sprint = sprintName || 'active sprint';
                    msg = `${issueKey} moved to ${sprint}`;
                }

                setBanner({
                    type: 'announcement',
                    message: msg,
                    undoHistoryId: historyItem.id,
                });

                return true;
            } catch (err) {
                const msg = err instanceof Error ? err.message : 'unknown error';

                if (swipePage) {
                    setSwipePage({
                        ...swipePage,
                        issues: originalIssues,
                    });
                }

                setBanner({
                    type: 'error',
                    message: `Failed to apply action for ${issue.key}: ${msg}`,
                });

                return false;
            }
		},
		[boardId, setBanner, setSwipePage, addActionHistory, swipePage],
	);

	useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // avoid triggering if typing in an input
            const target = e.target as HTMLElement;
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable) {
                return;
            }

            if (!selectedIssue) return;

            let direction: SwipeDirection | null = null;
            if (e.key === 'ArrowLeft') {
                direction = 'left';
            } else if (e.key === 'ArrowRight') {
                direction = 'right';
            } else if (e.key === 'ArrowUp') {
                direction = 'up';
            }

            if (direction) {
                e.preventDefault();
                
                // select next issue
                const currentIndex = issuesToShow.findIndex(i => i.id === selectedIssue.id);
                if (currentIndex !== -1) {
                    const nextIssue = issuesToShow[currentIndex + 1] || issuesToShow[currentIndex - 1] || null;
                    setSelectedIssue(nextIssue);
                }

                handleIssueSwipe(selectedIssue, direction);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedIssue, issuesToShow, handleIssueSwipe]);

    // handles history action (flyout actions)
    useEffect(() => {
		if (!historyActionRequest) {
			return;
		}

		if (!boardId) {
			setBanner({
				type: 'error',
				message: 'No board in context',
			});
			setHistoryActionRequest(null);
			return;
		}

		const { item, op } = historyActionRequest;
		const issueKey = item.key;

		void (async () => {
			try {
				if (op === 'undo') {

                    // cant undo deleted issues
					if (item.type === 'delete') {
						throw new Error('Cannot undo delete action');
					}

					if (item.type === 'retain') {
						// unswipe
						const res = await setIssueSwiped({
							boardId,
							issueKey,
							swiped: false,
						});

						if (res.swiped !== false) {
							throw new Error('Failed to unswipe issue');
						}
					} else if (item.type === 'move-to-sprint') {
						// move back to backlog and unswipe
						const moveRes = await moveIssueToBacklog({
							boardId,
							issueIdOrKey: issueKey,
						});

						if (moveRes.error) {
							throw new Error(moveRes.error);
						}

						const res = await setIssueSwiped({
							boardId,
							issueKey,
							swiped: false,
						});

						if (res.swiped !== false) {
							throw new Error('Failed to unswipe issue');
						}
					}

					// reload page to reinsert card back into grid
					const page = await fetchBacklog({
						boardId,
						startAt: 0,
						maxResults: ISSUES_PER_PAGE,
						searchQuery,
						filters: swipeFilters,
					});

					setSwipePage(page);

					// disable all buttons in history action flyout
					disableHistoryItem(item.id);
					
					const undoMsg = item.type === 'retain' ? `${issueKey} unswiped`
						: `${issueKey} moved back to backlog`;

					addActionHistory({
						key: issueKey,
						type: item.type,
						sprintName: item.sprintName,
						label: undoMsg,
						disabled: true,
					});

					setBanner({
						type: 'announcement',
						message: undoMsg,
					});
				} else if (op === 'move-to-sprint') {
					const res = await moveIssueToSprint({
						boardId,
						issueIdOrKey: issueKey,
					});

					if (res.error) {
						throw new Error(res.error);
					}

					const swipedRes = await setIssueSwiped({
						boardId,
						issueKey,
						swiped: true,
					});

					if (!swipedRes.swiped) {
						throw new Error('Failed to mark issue as swiped');
					}

					// remove from grid if on grid
					// if (swipePage) {
					// 	setSwipePage({
					// 		...swipePage,
					// 		issues: swipePage.issues.filter((i) => i.key !== issueKey),
					// 	});
					// }

					disableHistoryItem(item.id);

					const newHistory = addActionHistory({
						key: issueKey,
						type: 'move-to-sprint',
						sprintName: res.sprintName,
					});

					const msg = `${issueKey} moved to ${res.sprintName}`;

					setBanner({
						type: 'announcement',
						message: msg,
						undoHistoryId: newHistory.id,
					});
				} else if (op === 'delete') {
					// delete from history
					const res = await deleteIssue({ issueIdOrKey: issueKey });
					if (res.error) {
						throw new Error(res.error);
					}

					const swipedRes = await setIssueSwiped({
						boardId,
						issueKey,
						swiped: true,
					});
					if (!swipedRes.swiped) {
						throw new Error('Failed to mark issue as swiped');
					}

					if (swipePage) {
						setSwipePage({
							...swipePage,
							issues: swipePage.issues.filter((i) => i.key !== issueKey),
						});
					}

					disableHistoryItem(item.id);

					const newHistory = addActionHistory({
						key: issueKey,
						type: 'delete',
					});

					const msg = `${issueKey} deleted`;
					setBanner({
						type: 'announcement',
						message: msg,
						undoHistoryId: newHistory.id,
					});
				}
			} catch (err) {
				const msg =
					err instanceof Error ? err.message : 'Unknown error applying action';

				setBanner({
					type: 'error',
					message: `Failed applying action for ${issueKey}: ${msg}`,
				});
			} finally {
				setHistoryActionRequest(null);
			}
		})();
	}, [
		historyActionRequest,
		boardId,
		searchQuery,
		swipeFilters,
		swipePage,
		setSwipePage,
		setBanner,
		setHistoryActionRequest,
		disableHistoryItem,
		addActionHistory,
	]);

    if (isContextLoading) {
        return (
            <Box xcss={styles.container}>
                <Stack space="space.100" alignInline="center">
                    <Spinner size='large' label="Loading Context" />
                    <Text size="medium">Loading Context...</Text>
                </Stack>
            </Box>
        );
    }

    const renderGrid = () => {
        if (swipeError) {
            return <ErrorState message={swipeError} />;
        }

        if (isSwipeLoading && (!swipePage || issuesToShow.length === 0)) {
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

        return (
			<>
				<SwipeIssueGrid
					issues={issuesToShow}
					selectedIssueId={selectedIssue?.id ?? null}
					onIssueClick={handleIssueClick}
					onIssueSwipe={handleIssueSwipe}
				/>
				{/* for card focus modal, atlaskit modal has bug or i just cant find way to make modal a window, always renders in fullscreen */}
				{/* TODO: find way to make modal open in window */}
{/* 
				<ModalTransition>
					{selectedIssue && (
						<SwipeIssueModal
						issue={selectedIssue}
						onClose={() => setSelectedIssue(null)}
						/>
					)}
				</ModalTransition> */}
			</>
		)
    };

    return (
        <Stack space="space.150" xcss={styles.container}>
            <SwipeToolbar />
            {renderGrid()}
        </Stack>
    )
}