import { useEffect, useRef, useState } from 'react';

import Heading from '@atlaskit/heading';
import { cssMap, cx } from '@atlaskit/css';
import { Box, Inline, Stack, Text } from '@atlaskit/primitives';
import { token } from '@atlaskit/tokens';
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import invariant from 'tiny-invariant';

import type { SwipeIssue } from '~contracts/api';

import { MatrixIssueCard } from './MatrixIssueCard';
import { type CardLocation, isMatrixIssueDragData } from './types';

const styles = cssMap({
	container: {
		borderWidth: '1px',
		borderStyle: 'dashed',
		borderColor: token('color.border.discovery'),
		borderRadius: token('radius.large'),
		padding: token('space.200'),
		backgroundColor: token('color.background.discovery'),
		transition: 'border-color 150ms ease, background-color 150ms ease',
	},
	active: {
		borderColor: token('color.border.focused'),
		backgroundColor: token('color.background.discovery.hovered'),
	},
	cardList: {
		rowGap: token('space.200'),
	},
});

const benchLocation: CardLocation = { type: 'bench' };

type MatrixBenchProps = {
	issues: SwipeIssue[];
};

/**
 * MatrixBench acts as a staging area for backlog issues.
 * Cards originate here and can be dragged back at any time to reprioritise.
 */
export function MatrixBench({ issues }: MatrixBenchProps) {
	const ref = useRef<HTMLDivElement | null>(null);
	const [isActive, setIsActive] = useState(false);

	useEffect(() => {
		const element = ref.current;
		invariant(element, 'MatrixBench expects a ref element');

		return dropTargetForElements({
			element,
			getData: () => ({ type: 'matrix-bench' }),
			canDrop: ({ source }) => isMatrixIssueDragData(source.data),
			onDragEnter: ({ source }) => {
				if (isMatrixIssueDragData(source.data)) {
					setIsActive(true);
				}
			},
			onDragLeave: () => setIsActive(false),
			onDrop: () => setIsActive(false),
		});
	}, []);

	return (
		<Stack space="space.200">
			<Heading as="h2" size="medium">
				Bench
			</Heading>
			<Box ref={ref} xcss={cx(styles.container, isActive && styles.active)}>
				<Stack space="space.200">
					<Text size="small" tone="subtle">
						Drag a card from the bench onto the matrix to start ranking.
					</Text>
					<Inline alignBlock="start" shouldWrap xcss={styles.cardList} space="space.200">
						{issues.length === 0 && (
							<Text tone="subtle" size="small">
								All prioritised cards have left the bench.
							</Text>
						)}
						{issues.map((issue) => (
							<MatrixIssueCard key={issue.id} issue={issue} location={benchLocation} />
						))}
					</Inline>
				</Stack>
			</Box>
		</Stack>
	);
}
