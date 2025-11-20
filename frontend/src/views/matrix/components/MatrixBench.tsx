import { useEffect, useRef, useState } from 'react';

import { cssMap, cx } from '@atlaskit/css';
import { Box, Stack, Text } from '@atlaskit/primitives';
import { token } from '@atlaskit/tokens';
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import invariant from 'tiny-invariant';

import type { SwipeIssue } from '~contracts/api';

import { MatrixIssueCard } from './MatrixIssueCard';
import { type CardLocation, isMatrixIssueDragData } from './types';

const styles = cssMap({
	container: {
		borderWidth: '1px',
		borderStyle: 'solid',
		borderColor: token('color.border'),
		borderRadius: token('radius.xlarge'),
		padding: token('space.300'),
		backgroundColor: token('color.background.neutral.subtle'),
		boxShadow: token('elevation.shadow.raised'),
		transition: 'border-color 150ms ease, background-color 150ms ease, box-shadow 150ms ease',
	},
	active: {
		borderColor: token('color.border.focused'),
		backgroundColor: token('color.background.neutral.pressed'),
		boxShadow: token('elevation.shadow.overlay'),
	},
	cardList: {
		rowGap: token('space.200'),
	},
});

const benchLocation: CardLocation = { type: 'bench' };

type MatrixBenchProps = {
	issues: SwipeIssue[];
};

// The bench  is the container where cards first appear in matrix mode
// can be dragged back at any time
// MatrixBench renders the staging area drop target for cards that aren't yet on the grid 
export function MatrixBench({ issues }: MatrixBenchProps) {

	const ref = useRef< HTMLDivElement | null>(null); 
	const [isActive, setIsActive] = useState(false); 

	// register the bench container as a drop target so cards can be dragged back off the grid 
	useEffect(() => {

		const element = ref.current;

		invariant(element, 'MatrixBench expecs ref elemet');

		// dragging to and from bench 
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

		<Box ref={ref} xcss={cx(styles.container, isActive && styles.active)}>
			<Stack space="space.200">
				{/*small helper msg when there arent any cards on the bench*/}
				{issues.length === 0 && ( 
					<Text tone="subtle" size="small">
						No cards awaiting placement.
					</Text> 
				)}
				{issues.map((issue) => (
					<MatrixIssueCard key={issue.id} issue={issue} location={benchLocation} /> 
				))}

			</Stack>   
		</Box>
	);
}
