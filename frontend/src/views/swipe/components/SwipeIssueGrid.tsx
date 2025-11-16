import { Grid } from '@atlaskit/primitives';
import type { SwipeIssue } from '~contracts/api';

import { SwipeIssueCard } from './SwipeIssueCard';

type Props = {
	issues: SwipeIssue[];
	selectedIssueId?: string | null;
	onIssueClick?: (issue: SwipeIssue) => void;
};

export function SwipeIssueGrid({
	issues,
	selectedIssueId,
	onIssueClick,
}: Props) {

	return (
		<Grid
			gap="space.200"
			templateColumns="repeat(auto-fill, minmax(260px, 1fr))"
		>
			{issues.map((issue) => (
				<SwipeIssueCard
					key={issue.id}
					issue={issue}
					isSelected={selectedIssueId === issue.id}
					onClick={onIssueClick}
				/>
			))}
		</Grid>
	);
}
