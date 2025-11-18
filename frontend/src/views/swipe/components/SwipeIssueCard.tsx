import { Inline, Stack, Text, Pressable, Box } from '@atlaskit/primitives';
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
import { motion, useAnimation, type PanInfo } from 'framer-motion';
import type { SwipeDirection } from '../swipe-types';
import Link from '@atlaskit/link';
import { useAppContext } from 'frontend/src/app/AppContext';
import React from 'react';

const MotionPressable = motion(Pressable);

const styles = cssMap({
    wrapper: {
        width: '100%',
        height: '100%',
        position: 'relative',
    },
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
        width: '100%',
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
        height: '100%',
        width: '100%',
        zIndex: 0,
    },
    indicator: {
        display: 'flex',
        height: '100%',
    }
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
const COMMIT_THRESHOLD = 140;
const FLY_OUT_DISTANCE = 400;

// speed to treat as flick
const FLICK_VELOCITY = 800;

function computeOffsetDirection(mx: number, my: number, threshold: number): SwipeDirection | null {
    const absX = Math.abs(mx);

    const absY = Math.abs(my);
    if (absX > absY && absX > threshold) {
        if (mx > 0) {
            return 'right';
        } else {
            return 'left';
        }
    }

    if (absY >= absX && my < -threshold) {
        return 'up'
    }

    return null;
}

function computeVelocityDirection(vx: number, vy: number): SwipeDirection | null {
    const speed = Math.hypot(vx, vy);
    if (speed < FLICK_VELOCITY) {
        return null;
    }

    const absVX = Math.abs(vx);
    const absVY = Math.abs(vy);

    if (absVX >= absVY) {
        if (vx > 0) {
            return 'right';
        } else {
            return 'left';
        }
    }

    if (vy < 0) {
        return 'up';
    }

    return null;
}

export function SwipeIssueCard({ 
    issue, isSelected, onClick, onSwipe, isSwiping,
}: Props) {
    const controls = useAnimation();
    const [activeDirection, setActiveDirection] = React.useState<SwipeDirection | null>(null);
    const showIndicators = activeDirection !== null && !isSwiping;

    const handleDrag = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (isSwiping) {
            return;
        }
        const { x: mx, y: my } = info.offset;
        const dir = computeOffsetDirection(mx, my, PREVIEW_THRESHOLD);
        setActiveDirection(dir);
    };

    const handleDragEnd = async (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (isSwiping) {
            setActiveDirection(null);
            await controls.start({
                x: 0,
                y: 0,
                rotate: 0,
                opacity: 1,
                transition: { type: 'spring', stiffness: 400, damping: 30 },
            });
            return;
        }

        const { x: mx, y: my } = info.offset;
        const { x: vx, y: vy } = info.velocity;

        const flickDir = computeVelocityDirection(vx, vy);
        const dragDir = computeOffsetDirection(mx, my, COMMIT_THRESHOLD);
        const finalDirection = flickDir || dragDir;

        if (!finalDirection) {
            setActiveDirection(null);
            await controls.start({
                x: 0,
                y: 0,
                rotate: 0,
                opacity: 1,
                transition: { type: 'spring', stiffness: 400, damping: 30 }
            });
            return;
        }

        let targetX = 0;
        let targetY = 0;
        let targetRotate = 0;

        if (finalDirection === 'left') {
                targetX = -FLY_OUT_DISTANCE;
                targetRotate = -15;
            } else if (finalDirection === 'right') {
                targetX = FLY_OUT_DISTANCE;
                targetRotate = 15;
            } else if (finalDirection === 'up') {
                targetY = -FLY_OUT_DISTANCE;
        }

        await controls.start({
            x: targetX,
            y: targetY,
            rotate: targetRotate,
            opacity: 0,
            transition: { duration: 0.25, ease: 'easeOut' },
        });

        onSwipe?.(issue, finalDirection);

        console.log(`${issueKey} swiped ${finalDirection}`);

        // reset
        controls.set({ x: 0, y: 0, rotate: 0, opacity: 1 });
        setActiveDirection(null);
    };
    
    const handleClick = () => {
        onClick?.(issue);
    };


    const { jiraBaseUrl } = useAppContext();
    const issueKey = issue.key;
    const issueHref = `${jiraBaseUrl}/browse/${issueKey}`;

    return (
        <Box xcss={styles.wrapper}>
            {showIndicators && (
                <Box xcss={styles.indicatorContainer}>
                    <Stack alignBlock="center" grow="fill" xcss={{height:'100%'}}>
                        {/* TODO: fix swipe up vertical alignment, should be at bottom */}
                        <Inline space="space.200" spread="space-between" alignBlock='center' grow='fill'>
                            {/* swipe left */}
                            <Stack alignInline="center" space="space.050" alignBlock='center'>
                                {activeDirection === 'right' && (
                                    <>
                                        <BacklogIcon label="retain" />
                                        <Lozenge>Keep</Lozenge>
                                    </>
                                )}
                            </Stack>

                            {/* swipe up*/}
                            <Stack alignInline="center" space="space.050" alignBlock='end'>
                                {activeDirection === 'up' && (
                                    <>
                                        <SprintIcon label="move-to-sprint" />
                                        <Lozenge appearance="inprogress">Move to sprint</Lozenge>
                                    </>
                                )}
                            </Stack>

                            {/* swipe right */}
                            <Stack alignInline="center" space="space.050" alignBlock='center'>
                                {activeDirection === 'left' && (
                                    <>
                                        <DeleteIcon label="delete" />
                                        <Lozenge appearance="removed">Delete</Lozenge>
                                    </>
                                )}
                            </Stack>
                        </Inline>
                    </Stack>
                </Box>
            )}
            <MotionPressable
                onClick={handleClick}
                xcss={cx(styles.card, isSelected && styles.selected)}
                drag
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                dragElastic={0.3}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
                animate={controls}
                whileTap={{ scale: 1.02 }}
                style={{
                    touchAction: 'none',
                    zIndex: 1
                }}
            > 
                {/* card */}
                <Stack space="space.025" spread="space-between" grow="fill">
                    <Stack space="space.100">
                        <Text weight='medium'>{issue.summary}</Text>
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

                            {/* TODO: find way to change colour to subtle, wrapping in text doesn't work */}
                            <Link href={issueHref} appearance="subtle">
                                {issue.key}
                            </Link>
                            
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
            </MotionPressable>
        </Box>
    )
}