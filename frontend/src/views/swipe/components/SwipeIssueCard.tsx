import { Box, Inline, Stack, Text } from '@atlaskit/primitives';
import { cssMap } from '@atlaskit/css';
import { token } from '@atlaskit/tokens';
import type { SwipeIssue } from '~contracts/api';
import Lozenge from '@atlaskit/lozenge';
import Heading from '@atlaskit/heading';
import Avatar from '@atlaskit/avatar';

// card style
const styles = cssMap({
    card: {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: token('elevation.surface.raised'),
        boxShadow: token('elevation.shadow.raised'),
        borderRadius: token('radius.small'),
        padding: token('space.200'),
        transition: 'transform 150ms ease-out, box-shadow 150ms ease-out',
        cursor: 'grab',
    }
})

type Props = {
    issue: SwipeIssue;
}

function statusAppearance(
    status: string,
): React.ComponentProps<typeof Lozenge>['appearance'] {
    const s = status.toLowerCase().trim();

    // handle these todo, notstarted, done, closed, inprogress for now,
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
export function SwipeIssueCard({ issue }: Props) {
    return (
        <Box xcss={styles.card}>
            <Stack grow="fill">
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
                
                <Text>
                    {issue.key}
                </Text>
                
                <Inline space="space.100" alignBlock="center" spread="space-between">
                    <Lozenge appearance={statusAppearance(issue.status)} isBold>
                        {issue.status}
                    </Lozenge>
                    <Avatar
                        size="small"
                        src={issue.assigneeAvatarUrl ?? undefined}
                        name={issue.assigneeDisplayName ?? 'Unassigned'}
                    />
                </Inline>
            </Stack>
        </Box>
    )
}