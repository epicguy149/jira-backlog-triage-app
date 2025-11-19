import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';

import Heading from '@atlaskit/heading';
import { cssMap, cx } from '@atlaskit/css';
import { Box, Grid, Stack } from '@atlaskit/primitives';
import { token } from '@atlaskit/tokens';
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import invariant from 'tiny-invariant';

import type { SwipeIssue } from '~contracts/api';

import { MatrixIssueCard } from './MatrixIssueCard';
import { type MatrixCoord, type PlacementMap, isMatrixIssueDragData } from './types';

const gridStyles = cssMap({
	container: {
		paddingBlock: token('space.300'),
		paddingInline: token('space.300'),
		backgroundColor: token('color.background.neutral.subtle'),
		borderRadius: token('radius.xlarge'),
		boxShadow: token('elevation.shadow.raised'),
		borderWidth: '1px',
		borderStyle: 'solid',
		borderColor: token('color.border'),
		maxWidth: '1080px',
		marginInline: 'auto',
	},
	grid: {
		width: '100%',
	},
});

const cellStyles = cssMap({
	cell: {
		padding: token('space.150'),
		backgroundColor: token('color.background.accent.gray.subtler.hovered'),
		borderRadius: token('radius.large'),
		// borderWidth: '2px',
		// borderStyle: 'solid',
		borderColor: token('color.border.discovery'),
		transition: 'border-color 150ms ease, background-color 150ms ease',
		aspectRatio: '1 / 1',
		display: 'flex',
		flexDirection: 'column',
		overflow: 'hidden',
	},
	active: {
		borderColor: token('color.border.discovery'),
		backgroundColor: token('color.background.accent.gray.subtler.pressed'),
	},
	cardList: {
		width: '100%',
		flexGrow: 1,
		minHeight: 0,
		overflowY: 'auto', // adds scrolling when you add enough cards to a cell
	},
});

type MatrixGridProps = {
	gridSize: number;
	issues: SwipeIssue[];
	placements: PlacementMap;
};

type MatrixCellProps = {
	coord: MatrixCoord;
	children: ReactNode;
};

function MatrixCell({ coord, children }: MatrixCellProps) {
	const ref = useRef<HTMLDivElement | null>(null);
	const [isActive, setIsActive] = useState(false);
	const { row, col } = coord;

	useEffect(() => {
		const element = ref.current;
		invariant(element, 'MatrixCell expects a ref element');

		return dropTargetForElements({
			element,
			getData: () => ({ type: 'matrix-cell', coord: { row, col } }),
			canDrop: ({ source }) => isMatrixIssueDragData(source.data),
			onDragEnter: ({ source }) => {
				if (isMatrixIssueDragData(source.data)) {
					setIsActive(true);
				}
			},
			onDragLeave: () => setIsActive(false),
			onDrop: () => setIsActive(false),
		});
	}, [row, col]);

	return (
		<Box ref={ref} xcss={cx(cellStyles.cell, isActive && cellStyles.active)}>
			<Stack space="space.100" xcss={cellStyles.cardList}>
				{children}
			</Stack>
		</Box>
	);
}

/**
 * MatrixGrid is basd off of the chessboard tutorial example for pragmatic drag and drop
 * Each cell is a drop target that captures issue placements
 */
export function MatrixGrid({ gridSize, issues, placements }: MatrixGridProps) {
	const columnTemplate = useMemo(
		() => `repeat(${gridSize}, minmax(160px, 1fr))`,
		[gridSize],
	);

	const cellIssueMap = useMemo(() => {
		const map = new Map<string, SwipeIssue[]>();
		issues.forEach((issue) => {
			const location = placements[issue.id];
			if (location && location.type === 'grid') {
				const key = `${location.coord.row}-${location.coord.col}`;
				const entry = map.get(key);
				if (entry) {
					entry.push(issue);
				} else {
					map.set(key, [issue]);
				}
			}
		});
		return map;
	}, [issues, placements]);

	return (
			<Stack space="space.200">
				<Heading as="h2" size="medium">
					Impact vs Effort Matrix
				</Heading>
				<Box xcss={gridStyles.container}>
					<Grid gap="space.150" templateColumns={columnTemplate} xcss={gridStyles.grid}>
						{Array.from({ length: gridSize }).map((_, row) =>
							Array.from({ length: gridSize }).map((_, col) => {
								const coord: MatrixCoord = { row, col };
								const location = { type: 'grid' as const, coord };
								const key = `${row}-${col}`;
								const cellIssues = cellIssueMap.get(key) ?? [];
								return (
									<MatrixCell key={key} coord={coord}>
										{cellIssues.map((issue) => (
											<MatrixIssueCard key={issue.id} issue={issue} location={location} />
										))}
									</MatrixCell>
								);
							}),
						)}
					</Grid>
				</Box>
			</Stack>
		);
	}
