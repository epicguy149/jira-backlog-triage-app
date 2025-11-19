import { useEffect, useMemo, useState } from 'react';

import Heading from '@atlaskit/heading';
import Lozenge from '@atlaskit/lozenge';
import { cssMap } from '@atlaskit/css';
import { Box, Inline, Stack, Text } from '@atlaskit/primitives';
import Spinner from '@atlaskit/spinner';
import { token } from '@atlaskit/tokens';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

import { fetchBacklog } from '../../api/jira-client';
import { useAppContext } from '../../app/AppContext';
import { useJiraContext } from '../../hooks/useJiraContext';
import { MatrixBench } from './components/MatrixBench';
import { MatrixGrid } from './components/MatrixGrid';
import {
	type PlacementMap,
	isMatrixBenchDropData,
	isMatrixCellDropData,
	isMatrixIssueDragData,
} from './components/types';

const GRID_SIZE = 4;
const IMPACT_SCALE = ['Low impact', 'Consider', 'High impact', 'Strategic bet'];
const EFFORT_SCALE = ['Low effort', 'Manageable', 'High effort', 'Significant lift'];

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
		flexWrap: 'wrap',
	},
	benchColumn: {
		flex: '0 0 320px',
		minWidth: '260px',
	},
	gridColumn: {
		flex: '1 1 0%',
		minWidth: '320px',
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

	useEffect(() => {
		if (contextError) {
			setSwipeError(contextError);
			return;
		}

		if (!boardId || isContextLoading) {
			return;
		}

		let cancelled = false;

		async function loadMatrixData() {
			try {
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
						err instanceof Error ? err.message : 'Unable to load backlog issues for the matrix.';
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

	useEffect(() => {
		if (issues.length === 0) {
			setPlacements({});
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
	}, [issues]);

	useEffect(() => {
		return monitorForElements({
			onDrop({ source, location }) {
				if (!isMatrixIssueDragData(source.data)) {
					return;
				}

				const destination = location.current.dropTargets[0];
				if (!destination) {
					return;
				}

				const dropData = destination.data;

				if (isMatrixCellDropData(dropData)) {
					setPlacements((prev) => {
						const prevPlacement = prev[source.data.issueId];
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
							[source.data.issueId]: {
								type: 'grid',
								coord: { row: dropData.coord.row, col: dropData.coord.col },
							},
						};
					});
					return;
				}

				if (isMatrixBenchDropData(dropData)) {
					setPlacements((prev) => {
						const prevPlacement = prev[source.data.issueId];
						if (!prevPlacement || prevPlacement.type === 'bench') {
							return prev;
						}

						return {
							...prev,
							[source.data.issueId]: { type: 'bench' },
						};
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
						impactScale={IMPACT_SCALE}
						effortScale={EFFORT_SCALE}
						issues={issues}
						placements={placements}
					/>
				</Box>
			</Box>
		);
	};

	return (
		<Stack space="space.300" xcss={styles.container}>
			<Stack space="space.050">
				<Heading as="h1" size="large">
					Matrix Mode
				</Heading>
				<Text tone="subtle">
					Bench your backlog cards, then drag them across the grid to reason about impact versus effort.
				</Text>
				<Inline space="space.150" alignBlock="center">
					<Text size="small" tone="subtle">
						Impact increases from left to right, effort increases from top to bottom.
					</Text>
				</Inline>
			</Stack>
			{renderMatrixContents()}
		</Stack>
	);
}
