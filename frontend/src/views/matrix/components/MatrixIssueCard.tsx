import { useEffect, useMemo, useRef, useState } from 'react';

import Badge from '@atlaskit/badge';
import Heading from '@atlaskit/heading';
import Lozenge from '@atlaskit/lozenge';
import { cssMap, cx } from '@atlaskit/css';
import { Box, Inline, Stack, Text } from '@atlaskit/primitives';
import { token } from '@atlaskit/tokens';
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import invariant from 'tiny-invariant';
import Tooltip from '@atlaskit/tooltip';

import type { SwipeIssue } from '~contracts/api';

import type { CardLocation, MatrixScore } from './types';

const styles = cssMap({
	card: {
		paddingBlock: token('space.200'),
		paddingInline: token('space.200'),
		backgroundColor: token('color.background.neutral'),
		borderRadius: token('radius.large'),
		boxShadow: token('elevation.shadow.raised'),
		// borderWidth: '1px',
		borderStyle: 'solid',
		borderColor: token('color.border.accent.blue'),
		cursor: 'grab',
		width: '100%',
		// minWidth: 0,
		maxWidth: '100%',
		transition: 'box-shadow 150ms ease, transform 150ms ease',
		'&:hover': {
			boxShadow: token('elevation.shadow.overlay'),
			transform: 'translateY(-2px)',
		},
	},
	dragging: {
		// opacity: 0.55,
		cursor: 'grabbing',
		boxShadow: token('elevation.shadow.overlay'),
		},
	summary: {
		wordBreak: 'break-word',
	},
	scoreRow: {
		marginTop: token('space.050'),
	},
});

type MatrixIssueCardProps = {
	issue: SwipeIssue;
	location: CardLocation;
	score?: MatrixScore;
};

function statusAppearance(status: string): React.ComponentProps<typeof Lozenge>['appearance'] {
	if (status.toLowerCase().includes('done')) {
		return 'success';
	}

	if (status.toLowerCase().includes('progress')) {
		return 'inprogress';
	}

	return 'default';
}

//
// Renders draggable tile using atlaskit drag n drop
// 
export function MatrixIssueCard({ issue, location, score }: MatrixIssueCardProps) {

	const ref = useRef<HTMLDivElement | null>(null);
	const [isDragging, setIsDragging] = useState(false);
	const gridRow = location.type === 'grid' ? location.coord.row : null;
	const gridCol = location.type === 'grid' ? location.coord.col : null;
	const dragLocation = useMemo<CardLocation>(
		() =>
			location.type === 'grid'
				? { type: 'grid', coord: { row: gridRow ?? 0, col: gridCol ?? 0 } }
				: { type: 'bench' },
		[location.type, gridRow, gridCol],
	);

	// connect the card to pragmatic drag-and-drop so layouts get coordinate metadata
	useEffect(() => {
		const element = ref.current;
		invariant(element, 'MatrixIssueCard expects a ref element');

		return draggable({
			element,
			getInitialData: () => ({
				type: 'matrix-issue',
				issueId: issue.id,
				from: dragLocation,
			}),
			onDragStart: () => setIsDragging(true),
			onDrop: () => setIsDragging(false),
		});
	}, [issue.id, dragLocation]);

	// render
	return (
		<Box ref={ref} xcss={cx(styles.card, isDragging && styles.dragging)}>
			<Stack space="space.100">

				<Text size="small" weight="bold">
					{issue.key}
				</Text>
				<Heading as="h3" size="small">

					{issue.summary}
				</Heading>
				<Inline space="space.100" alignBlock="center">
					<Lozenge appearance={statusAppearance(issue.status)} isBold>
						{issue.status}
					</Lozenge>
					{issue.priorityName && (
						// <Text size="small" tone="subtle">
						<Text size="small">
							{issue.priorityName}
						</Text>
					)}
				</Inline>
				{score && (
					<Inline space="space.100" alignBlock="center" xcss={styles.scoreRow}>
						<Tooltip content="Score = (Impact × 1.5) – (Effort × 0.7)">
							<Badge appearance="primary">Score {score.score.toFixed(1)}</Badge>
						</Tooltip>
					</Inline>
				)}
			</Stack>
		</Box>
	);
}
