import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';

import { cssMap, cx } from '@atlaskit/css';
import Heading from '@atlaskit/heading';
import { Box, Grid, Stack } from '@atlaskit/primitives';
import { token } from '@atlaskit/tokens';
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import invariant from 'tiny-invariant';

import type { SwipeIssue } from '~contracts/api';

import { MatrixIssueCard } from './MatrixIssueCard';
import { type MatrixCoord, type MatrixScore, type PlacementMap, isMatrixIssueDragData } from './types';

const gridStyles = cssMap({
	layout: {
		display: 'grid',
		gridTemplateColumns: 'auto 1fr auto',
		gridTemplateRows: 'auto 1fr auto',
		gap: token('space.200'),
		alignItems: 'center',
		justifyItems: 'center',
		maxWidth: '1200px',
		marginInline: 'auto',
	},
	container: {
		paddingBlock: token('space.300'),
		paddingInline: token('space.300'),
		backgroundColor: token('color.background.neutral.subtle'),
		borderRadius: token('radius.xlarge'),
		boxShadow: token('elevation.shadow.raised'),
		// borderWidth: '1px',
		borderStyle: 'solid',
		borderColor: token('color.border'),
		maxWidth: '1080px',
		width: '100%',
	},
	grid: {
		width: '100%',
	},

	// these are styles for the lables around teh grid
	topLabel: {
		gridColumn: '2 / 3',
		gridRow: '1 / 2',
	},
	bottomLabel: {
		gridColumn: '2 / 3',
		gridRow: '3 / 4',
	},
	leftLabel: {
		gridColumn: '1 / 2',
		gridRow: '2 / 3',
		writingMode: 'vertical-rl',
		transform: 'rotate(180deg)',
	},
	rightLabel: {
		gridColumn: '3 / 4',
		gridRow: '2 / 3',
		writingMode: 'vertical-rl',
	},

	centerCell: {
		gridColumn: '2 / 3',
		gridRow: '2 / 3',
		width: '100%',
	},
});

const cellStyles = cssMap({

	// I LOVE ATLASSIAN DESIGN SYSTEM 
	cell: {
		padding: token('space.150'),
		backgroundColor: token('color.background.neutral'),
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
		backgroundColor: token('color.background.neutral.hovered'),
	},
	cardList: {
		width: '100%',
		// minWidth: 0,
		flexGrow: 1,
		// minHeight: 0,
		overflowY: 'auto', // adds scrolling when you add enough cards to a cell
		overflowX: 'hidden',
	},
});

type MatrixGridProps = {
	gridSize: number; 
	issues: SwipeIssue[];
	placements: PlacementMap; 
	scores: Record<string, MatrixScore>;
}; 

type MatrixCellProps = {

	coord: MatrixCoord;
	children: ReactNode;
}; // 

// This links each individual square (drop target) in the grid to pragmatic DnD
//
function MatrixCell({ coord, children }: MatrixCellProps) { 

	const ref = useRef<HTMLDivElement | null>(null);
	const [isActive, setIsActive] = useState(false);
	const { row, col } = coord;

	// register the square so we know which coordinate a card was dropped on
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
		//render
		<Box ref={ref} xcss={cx(cellStyles.cell, isActive && cellStyles.active)} > 
			<Stack space="space.100" xcss={cellStyles.cardList}>
				{children} 
			</Stack>

		</Box>
	);
}

 // MatrixGrid is basd off of le chessboard tutorial example for pragmatic drag and drop
 // Each cell is a drop target that captures issue placements,, issues are grouped by coordinates
//
export function MatrixGrid({ gridSize, issues, placements, scores }: MatrixGridProps) {

	const columnTemplate = useMemo(
		() => `repeat(${gridSize}, minmax(160px, 1fr))`,
		[gridSize],
	); 

	// builds a lookup of grid cordinate to issues currently placed there for quick render
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
		//grid render
		// also includees the lables indicating impact/effort around the grid
		<Box xcss={gridStyles.layout}>
			<Box xcss={gridStyles.topLabel}>
				<Heading size="medium">Most Impact</Heading>
			</Box>

			<Box xcss={gridStyles.leftLabel}>
				<Heading size="medium">Most Effort</Heading>
			</Box>
			<Box xcss={cx(gridStyles.container, gridStyles.centerCell)}>
				<Grid gap="space.150" templateColumns={columnTemplate} xcss={gridStyles.grid}>
					{Array.from({ length: gridSize }).map((_, row) => (
					        // Le epic render grid from an array
						Array.from({ length: gridSize }).map((_, col) => {

							const coord: MatrixCoord = { row, col };
							const location = { type: 'grid' as const, coord };
							const key = `${row}-${col}`; 
							const cellIssues = cellIssueMap.get(key) ?? [];

							return ( 
								<MatrixCell key={key} coord={coord}> 
									{cellIssues.map((issue) => (
										<MatrixIssueCard
											key={issue.id}
											issue={issue}
											location={location}
											score={scores[issue.id]} 
										/>

									))} 
								</MatrixCell> 
							); 
						})
					))} 
				</Grid>

			</Box>
			<Box xcss={gridStyles.rightLabel}>
				<Heading size="medium">Least Effort</Heading>
			</Box>
			<Box xcss={gridStyles.bottomLabel}>
				<Heading size="medium">Least Impact</Heading>
			</Box>
		</Box>
	); 
}
