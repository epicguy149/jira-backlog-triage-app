import { Grid } from '@atlaskit/primitives';
import type { SwipeIssue } from '~contracts/api';
import { cssMap } from '@atlaskit/css';
import { token } from '@atlaskit/tokens';
import { SwipeIssueCard } from './SwipeIssueCard';
import type { SwipeDirection } from '../swipe-types';

const styles = cssMap({
	grid: {
		backgroundColor: token('color.background.accent.gray.subtlest'),
		paddingBlock: token('space.150'),
		paddingInline: token('space.150'),
	}
})

type Props = {
	issues: SwipeIssue[];
	selectedIssueId?: string | null;
	onIssueClick?: (issue: SwipeIssue) => void;
	onIssueSwipe?: (
		issue: SwipeIssue,
		direction: SwipeDirection,
	) => Promise<boolean> | boolean;
};

export function SwipeIssueGrid({
	issues,
	selectedIssueId,
	onIssueClick,
	onIssueSwipe,
}: Props) {

	return (
		<Grid
			gap="space.150"
			templateColumns="repeat(auto-fill, minmax(260px, 1fr))"
			xcss={styles.grid}
		>
			{issues.map((issue) => (
				<SwipeIssueCard
					key={issue.id}
					issue={issue}
					isSelected={selectedIssueId === issue.id}
					onClick={onIssueClick}
					onSwipe={onIssueSwipe}
				/>
			))}
		</Grid>
	);
}
