import { useEffect, useMemo, useState } from 'react';

import Heading from '@atlaskit/heading';
import Lozenge from '@atlaskit/lozenge';
import { cssMap } from '@atlaskit/css';
import { Box, Stack, Text } from '@atlaskit/primitives';
import Spinner from '@atlaskit/spinner';
import { token } from '@atlaskit/tokens';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

import { fetchBacklog } from '../../api/jira-client';
import { useAppContext } from '../../app/AppContext';
import { useJiraContext } from '../../hooks/useJiraContext';
import { MatrixBench } from './components/MatrixBench';
import { MatrixGrid } from './components/MatrixGrid';
import {
	calculateMatrixScore,
	type MatrixScore,
	type PlacementMap,
	isMatrixBenchDropData,
	isMatrixCellDropData,
	isMatrixIssueDragData,
} from './components/types';

const GRID_SIZE = 4;

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
	layout: {
		display: 'flex',
		gap: token('space.300'),
		alignItems: 'flex-start',
		flexWrap: 'nowrap',
	},
	benchColumn: {
		flex: '0 0 320px',
		minWidth: '260px',
		flexShrink: 0,
	},
	gridColumn: {
		flex: '1 1 auto',
		minWidth: '400px',
	},
});

type MessageProps = {
	title: string;
	body?: string;
};

function Message({ title, body }: MessageProps) {
	return (
		<Box xcss={styles.centered}>
			<Stack space="space.100" alignInline="center">
				<Heading size="large">{title}</Heading>
				{body && <Text>{body}</Text>}
			</Stack>
		</Box>
	);
}

// borrowed from swipe mode
export default function MatrixMode() {
	const {
		swipePage,
		setSwipePage,
		isSwipeLoading,
		setIsSwipeLoading,
		swipeError,
		setSwipeError,
		searchQuery,
		swipeFilters,
	} = useAppContext();
const { boardId, isLoading: isContextLoading, error: contextError } = useJiraContext();

	const [placements, setPlacements] = useState<PlacementMap>({});
	const [scores, setScores] = useState<Record<string, MatrixScore>>({});

	// initial load I stole from Swipe mode,  fetches the first page of backlog issues
	useEffect(() => {
		if (contextError) {
			setSwipeError(contextError);
			return;
		}

		if (!boardId || isContextLoading) {
			return;
		}

		let cancelled = false;


		// this shit was from swipe
		async function loadMatrixData() {

			try {
                if (!boardId) {
                    return;
                }
				setSwipeError(null);
				setIsSwipeLoading(true);
				const page = await fetchBacklog({
					boardId,
					startAt: 0,
					maxResults: 20,
					searchQuery,
					filters: swipeFilters,
				});
				if (!cancelled) {
					setSwipePage(page);
				} 
			} catch (err: unknown) { 
				if (!cancelled) {
					const message =
						err instanceof Error ? err.message : 'Couldnt load backlog issues for the matrix.';   
					setSwipeError(message); 
				}

			} finally {
				if (!cancelled) {
					setIsSwipeLoading(false);
				} 
			}

		}

		void loadMatrixData();

		return () => {
			cancelled = true;
		};
	}, [
		boardId,
		isContextLoading,
		contextError,
		searchQuery,
		swipeFilters,
		setSwipeError,
		setIsSwipeLoading,
		setSwipePage,
	]);

	const issues = swipePage?.issues ?? [];

	// whenever the page of issuess changes ensure each issue has a placement entry
	useEffect(() => {

		if (issues.length === 0) {
			setPlacements({});
			setScores({});
			return;

		}

		setPlacements((prev) => {

			const next: PlacementMap = {}; 
			let changed = false;
			const issueIds = new Set<string>(); 

			for (const issue of issues) {  

				issueIds.add(issue.id);
				if (prev[issue.id]) {
					next[issue.id] = prev[issue.id];


				} else {
					next[issue.id] = { type: 'bench' };
					changed = true;

				}

			} 

			for (const issueId of Object.keys(prev)) {

				if (!issueIds.has(issueId)) {
					changed = true;
				}
			}

			if (!changed) {
				return prev;

			}

			return next; 
		});

		// apply scores at this stage 
		setScores((prev) => {
			const issueIds = new Set(issues.map((issue) => issue.id));
			let changed = false;
			const next: Record<string, MatrixScore> = {};

			for (const [issueId, value] of Object.entries(prev)) {
				if (issueIds.has(issueId)) {
					next[issueId] = value;
				} else {
					changed = true;
				}
			}

			return changed ? next : prev;
		});
	}, [issues]);

	// attach global drop monitoring so cards update placements when moved 
	useEffect(() => {

		return monitorForElements({ 
			onDrop({ source, location }) {
				const dragData = source.data; // 1. Capture data in a variable

				// 2. Check the variable (narrowing its type for the rest of the function)
				if (!isMatrixIssueDragData(dragData)) {
					return;
				} 

				const destination = location.current.dropTargets[0];
				if (!destination) {
					return;
				}

				const dropData = destination.data; 

				if (isMatrixCellDropData(dropData)) {

					setPlacements((prev) => { 
						// 3. Use dragData instead of source.data
						const prevPlacement = prev[dragData.issueId];
						if (
							prevPlacement &&
							prevPlacement.type === 'grid' &&
							prevPlacement.coord.row === dropData.coord.row &&
							prevPlacement.coord.col === dropData.coord.col 
						) {
							return prev;
						}

						if (!prevPlacement) {
							return prev;
						}

						return {
							...prev,
							[dragData.issueId]: {
								type: 'grid',
								coord: { row: dropData.coord.row, col: dropData.coord.col }, 
							},
						};
					});

					setScores((prev) => {
						const nextScore = calculateMatrixScore(dropData.coord, GRID_SIZE);
						const current = prev[dragData.issueId];

						if (
							current &&
							current.impact === nextScore.impact &&
							current.effort === nextScore.effort &&
							current.score === nextScore.score
						) {
							return prev;
						}

						return {
							...prev,
							[dragData.issueId]: nextScore,
						};
					});

					return;
				}

				if (isMatrixBenchDropData(dropData)) {
					setPlacements((prev) => {
						const prevPlacement = prev[dragData.issueId];
						if (!prevPlacement || prevPlacement.type === 'bench') {
							return prev;
						}

						return {
							...prev,
							[dragData.issueId]: { type: 'bench' },

						};
					});

					setScores((prev) => {
						if (!(dragData.issueId in prev)) {
							return prev;
						}

						const { [dragData.issueId]: _removed, ...rest } = prev;
						return rest;
					});
				}
			},
		});
	}, []);

	const benchIssues = useMemo(
		() => issues.filter((issue) => placements[issue.id]?.type !== 'grid'),
		[issues, placements],
	);

	if (isContextLoading) {
		return (
			<Box xcss={styles.centered}>
				<Stack space="space.100" alignInline="center">
					<Spinner size="large" label="Loading context" />
					<Lozenge appearance="new">Loading Context...</Lozenge>
				</Stack>
			</Box>
		);
	}

	// renderMatrixConetnts
	// this handles all states (error/loading/data) for matrix mode
	// 
	const renderMatrixContents = () => { 
		if (swipeError) {
			return <Message title="Could not load backlog issues" body={swipeError} />;
		}
		if (isSwipeLoading && issues.length === 0) {
			return (
				<Box xcss={styles.centered}>
					<Spinner size="large" label="Loading issues..." />

				</Box>
			);
		}

		if (issues.length === 0) {
			return <Message title="No backlog items to rank" body="Switch filters or search to load issues." />;
		}

		return (
			<Box xcss={styles.layout}>
				<Box xcss={styles.benchColumn}>
					<MatrixBench issues={benchIssues} />
				</Box>
				<Box xcss={styles.gridColumn}>
					<MatrixGrid
						gridSize={GRID_SIZE}
						issues={issues}
						placements={placements}
						scores={scores}
					/>
				</Box>
			</Box>
		);
	};

	return (

		// actual render
		<Stack space="space.300" xcss={styles.container}>

			<Stack space="space.050">
				<Heading as="h1" size="large">
					Matrix Mode
				</Heading>
				<Text>
					Drag backlog items onto the impact vs effort grid to assign them a priority score.
				</Text>
			</Stack>

			{renderMatrixContents()}

		</Stack>

	);
}
