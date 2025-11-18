import { Inline, Stack, Text, Pressable } from '@atlaskit/primitives';
import { cssMap, cx } from '@atlaskit/css';
import { token } from '@atlaskit/tokens';
import type { SwipeIssue } from '~contracts/api';
import Lozenge from '@atlaskit/lozenge';
import Avatar from '@atlaskit/avatar';
import Tooltip from '@atlaskit/tooltip';
import Badge from '@atlaskit/badge';
import SprintIcon from '@atlaskit/icon/core/sprint';
import DeleteIcon from '@atlaskit/icon/core/delete';
import BacklogIcon from '@atlaskit/icon/core/backlog';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { useDrag } from '@use-gesture/react';
import { useState, useCallback } from 'react';
import type { SwipeDirection } from '../swipe-types';
import Heading from '@atlaskit/heading';

const styles = cssMap({
    card: {
        display: 'flex',
        flexDirection: 'column',
        paddingBlockStart: token('space.150'),
		paddingBlockEnd: token('space.150'),
		paddingInline: token('space.150'),
        color: token('color.text'),
        borderRadius: token('radius.large'),
        borderColor: token('color.border'),
        boxShadow: token('elevation.shadow.raised'),
        backgroundColor: token('elevation.surface.raised'),
        textAlign: 'left',
        position: 'relative',
        height: '100%',
        minHeight: '7rem',
        transition:
			'transform 150ms ease-out, box-shadow 150ms ease-out, background-color 150ms ease-out',
		'&:hover': {
			backgroundColor: token('elevation.surface.raised.hovered'),
			boxShadow: token('elevation.shadow.overlay'),
			transform: 'translateY(-2px)',
		},
        '&:active': {
			transform: 'translateY(0)',
			boxShadow: token('elevation.shadow.raised'),
		}
    },
    selected: {
		backgroundColor: token('elevation.surface.raised.pressed'),
		borderColor: token('color.border.selected'),
		'&:hover': {
			backgroundColor: token('elevation.surface.raised.hovered'),
		},
	},
    indicatorContainer: {
        position: 'absolute',
        pointerEvents: 'none',
        insetBlockStart: token('space.050'),
        insetInlineStart: token('space.050'),
        insetInlineEnd: token('space.050'),
    },
    indicator: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: token('space.100'),
        font: token('font.body.small'),
        fontWeight: token('font.weight.semibold'),

    },
    indicatorDelete: {
        backgroundColor: token('color.background.danger.bold.pressed'),
        color: token('color.text.inverse'),
    },
    indicatorKeep: {
        backgroundColor: token('color.background.success.bold'),
        color: token('color.text.inverse'),
    },
    indicatorSprint: {
        backgroundColor: token('color.background.discovery.bold'),
        color: token('color.text.inverse'),
    },
})

type Props = {
    issue: SwipeIssue;
    isSelected?: boolean;
    onClick?: (issue: SwipeIssue) => void;
    onSwipe?: (issue: SwipeIssue, direction: SwipeDirection) => void;
    isSwiping?: boolean;
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

// for indicator, commit, flyout distance
const PREVIEW_THRESHOLD = 60;
const COMMIT_THRESHOLD = 120;
const FLY_OUT_DISTANCE = 400;

// TODO: add epic + label(s)
export function SwipeIssueCard({ 
    issue, isSelected, onClick, onSwipe, isSwiping,
}: Props) {
    const handleClick = () => {
		onClick?.(issue);
	};

    return (
        <Pressable
            type="button"
            xcss={cx(styles.card, isSelected && styles.selected)}
            onClick={handleClick}
        >
            <Stack space="space.025" spread="space-between" grow="fill">
                <Stack space="space.100">
                    <Text>{issue.summary}</Text>
                    <div>
                        <Lozenge appearance="default" isBold>
                            EPIC
                        </Lozenge>
                    </div>
                </Stack>
                

                <Inline alignBlock="center" spread="space-between">
                    <Inline space="space.050" alignBlock='center'>
                        {issue.issueTypeIconUrl && (
                            <img
                            src={issue.issueTypeIconUrl}
                            alt=""
                            width={16}
                            height={16}
                            />
                        )}
                        <Heading size="xxsmall">{issue.key}</Heading>
                    </Inline>

                    <Inline space="space.050" alignBlock="center">
                        {/* <Lozenge appearance={statusAppearance(issue.status)} isBold>
                            {issue.status}
                        </Lozenge> */}
                        <Badge>0</Badge>
                        {issue.priorityName && issue.priorityIconUrl && issue.issueTypeName != 'Task' && (
                            <img
                            src={issue.priorityIconUrl}
                            alt=""
                            width={16}
                            height={16}
                            />
                        )}
                        <Tooltip content={issue.assigneeDisplayName}>
                            <Avatar
                                size="small"
                                src={issue.assigneeAvatarUrl ?? undefined}
                                name={issue.assigneeDisplayName ?? 'Unassigned'}
                            />
                        </Tooltip>
                    </Inline>
                </Inline>
            </Stack>
        </Pressable>
    )
}