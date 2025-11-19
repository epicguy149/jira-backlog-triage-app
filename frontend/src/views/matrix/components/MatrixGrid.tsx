import { Fragment, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';

import Heading from '@atlaskit/heading';
import { cssMap, cx } from '@atlaskit/css';
import { Box, Grid, Stack, Text } from '@atlaskit/primitives';
import { token } from '@atlaskit/tokens';
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import invariant from 'tiny-invariant';

import type { SwipeIssue } from '~contracts/api';

import { MatrixIssueCard } from './MatrixIssueCard';
import { type MatrixCoord, type PlacementMap, isMatrixIssueDragData } from './types';

const gridStyles = cssMap({
	container: {
		paddingBlock: token('space.200'),
		paddingInline: token('space.200'),
		backgroundColor: token('color.background.neutral.subtle'),
		borderRadius: token('radius.large'),
		boxShadow: token('elevation.shadow.raised'),
	},
	grid: {
		width: '100%',
	},
	columnLabel: {
		padding: token('space.050'),
		textAlign: 'center',
	},
	rowLabel: {
		writingMode: 'vertical-rl',
		textAlign: 'center',
		whiteSpace: 'nowrap',
	},
});

const cellStyles = cssMap({
	cell: {
		padding: token('space.150'),
		minHeight: '180px',
		backgroundColor: token('color.background.neutral'),
		borderRadius: token('radius.large'),
		borderWidth: '2px',
		borderStyle: 'solid',
		borderColor: token('color.border'),
		transition: 'border-color 150ms ease, background-color 150ms ease',
	},
	active: {
		borderColor: token('color.border.discovery'),
		backgroundColor: token('color.background.discovery'),
	},
	cardList: {
		width: '100%',
	},
});

type MatrixGridProps = {
	gridSize: number;
	impactScale: string[];
	effortScale: string[];
	issues: SwipeIssue[];
	placements: PlacementMap;
};

type MatrixCellProps = {
	coord: MatrixCoord;
	impactLabel: string;
	effortLabel: string;
	children: ReactNode;
};

function MatrixCell({ coord, impactLabel, effortLabel, children }: MatrixCellProps) {
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
			<Stack space="space.150" alignInline="stretch">
				<Text size="small" weight="bold">
					{impactLabel}
				</Text>
				<Text size="small" tone="subtle">
					{effortLabel}
				</Text>
				<Stack space="space.150" xcss={cellStyles.cardList}>
					{children}
				</Stack>
			</Stack>
		</Box>
	);
}

/**
 * MatrixGrid mirrors the pragmatic drag and drop chessboard layout.
 * Each cell is a drop target that captures issue placements.
 */
export function MatrixGrid({ gridSize, impactScale, effortScale, issues, placements }: MatrixGridProps) {
	const columnTemplate = useMemo(
		() => `auto repeat(${gridSize}, minmax(220px, 1fr))`,
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
					<Box />
					{impactScale.map((label, index) => (
						<Box key={`impact-${index}`} xcss={gridStyles.columnLabel}>
							<Text size="small" weight="bold">
								{label}
							</Text>
						</Box>
					))}
					{Array.from({ length: gridSize }).map((_, row) => (
						<Fragment key={`row-${row}`}>
							<Box xcss={gridStyles.rowLabel}>
								<Text weight="bold" tone="subtle">
									{effortScale[row]}
								</Text>
							</Box>
							{Array.from({ length: gridSize }).map((_, col) => {
								const coord: MatrixCoord = { row, col };
								const location = { type: 'grid' as const, coord };
								const key = `${row}-${col}`;
								const cellIssues = cellIssueMap.get(key) ?? [];
								return (
									<MatrixCell
										key={key}
										coord={coord}
										impactLabel={impactScale[col]}
										effortLabel={effortScale[row]}
									>
										{cellIssues.length === 0 && (
											<Text size="small" tone="subtle">
												Drop cards here
											</Text>
										)}
										{cellIssues.map((issue) => (
											<MatrixIssueCard key={issue.id} issue={issue} location={location} />
										))}
									</MatrixCell>
								);
							})}
						</Fragment>
					))}
				</Grid>
			</Box>
			<Text size="small" tone="subtle">
				Tip: drag cards anywhere on the grid to compare relative impact and effort.
			</Text>
		</Stack>
	);
}
