import { Inline, Stack, Text, Pressable } from '@atlaskit/primitives';
import { cssMap, cx } from '@atlaskit/css';
import { token } from '@atlaskit/tokens';
import type { SwipeIssue } from '~contracts/api';
import Lozenge from '@atlaskit/lozenge';
import Heading from '@atlaskit/heading';
import Avatar from '@atlaskit/avatar';
import Tooltip from '@atlaskit/tooltip';

const styles = cssMap({
    card: {
        display: 'flex',
        flexDirection: 'column',
        paddingBlockStart: token('space.200'),
		paddingBlockEnd: token('space.300'),
		paddingInline: token('space.200'),
        backgroundColor: token('color.background.information'),
        color: token('color.text'),
        borderRadius: token('radius.large'),
        borderColor: token('color.border.accent.blue'),
        boxShadow: token('elevation.shadow.raised'),
        textAlign: 'left',
        transition:
			'transform 150ms ease-out, box-shadow 150ms ease-out, background-color 150ms ease-out',
		'&:hover': {
			backgroundColor: token('color.background.neutral.hovered'),
			boxShadow: token('elevation.shadow.overlay'),
			transform: 'translateY(-2px)',
		},
        '&:active': {
			transform: 'translateY(0)',
			boxShadow: token('elevation.shadow.raised'),
		}
    },
    selected: {
		backgroundColor: token('color.background.selected'),
		borderColor: token('color.border.selected'),
		'&:hover': {
			backgroundColor: token('color.background.selected.hovered'),
		},
	},
})

type Props = {
    issue: SwipeIssue;
    isSelected?: boolean;
    onClick?: (issue: SwipeIssue) => void;
}

function statusAppearance(
    status: string,
): React.ComponentProps<typeof Lozenge>['appearance'] {
    // handles to do, done, in progress for now,
    // if needed will add more
    if (status.includes('To Do')) {
        return 'default';
    }

    if (status.includes('Done')) {
        return 'success';
    }

    if (status.includes('In Progress')) {
        return 'inprogress';
    }
    return 'default';
}

// TODO: add epic + label(s)
export function SwipeIssueCard({ issue, isSelected, onClick }: Props) {
    const handleClick = () => {
		onClick?.(issue);
	};

    return (
        <Pressable
            type="button"
            xcss={cx(styles.card, isSelected && styles.selected)}
            onClick={handleClick}
        >
            <Stack space="space.150">
                <Inline space="space.100" alignBlock="center" spread="space-between">
                    <Inline space="space.100" alignBlock='center'>
                        {issue.priorityIconUrl && (
                            <img
                            src={issue.priorityIconUrl}
                            alt=""
                            width={16}
                            height={16}
                            />
                        )}
                        <Heading size="medium">
                            {issue.summary}
                        </Heading>
                    </Inline>

                    {issue.issueTypeIconUrl && (
                        <img
                        src={issue.issueTypeIconUrl}
                        alt=""
                        width={16}
                        height={16}
                        />
                    )}
                </Inline>

                <Text>
                    {issue.key}
                </Text>

                <Inline space="space.100" alignBlock="center" spread="space-between">
                    <Lozenge appearance={statusAppearance(issue.status)} isBold>
                        {issue.status}
                    </Lozenge>
                    <Tooltip content={issue.assigneeDisplayName}>
                        <Avatar
                            size="small"
                            src={issue.assigneeAvatarUrl ?? undefined}
                            name={issue.assigneeDisplayName ?? 'Unassigned'}
                        />
                    </Tooltip>
                </Inline>
            </Stack>
        </Pressable>
    )
}