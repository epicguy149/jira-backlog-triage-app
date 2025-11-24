import React, { useEffect, useState } from 'react';
import Avatar from '@atlaskit/avatar';
import Tooltip from '@atlaskit/tooltip';
import Badge from '@atlaskit/badge';
import SprintIcon from '@atlaskit/icon/core/sprint';
import DeleteIcon from '@atlaskit/icon/core/delete';
import BacklogIcon from '@atlaskit/icon/core/backlog';
import Link from '@atlaskit/link';
import { Inline, Stack, Pressable, Box } from '@atlaskit/primitives';
import { cssMap, cx } from '@atlaskit/css';
import { token } from '@atlaskit/tokens';
import { motion, useAnimation, type PanInfo } from 'framer-motion';
import type { SwipeDirection } from '../swipe-types';
import type { SwipeIssue } from '~contracts/api';
import { useAppContext } from 'frontend/src/app/AppContext';
import InlineEdit from '@atlaskit/inline-edit';
import Textfield from '@atlaskit/textfield';
import { fetchPriorities, JiraPriority, updateIssue } from 'frontend/src/api/jira-client';
import TextArea from '@atlaskit/textarea';
import DropdownMenu, {
  DropdownItem,
  DropdownItemGroup,
} from '@atlaskit/dropdown-menu';
import { EpicLozenge } from './EpicLozenge';
import { IconButton } from '@atlaskit/button/new';
import Lozenge from '@atlaskit/lozenge';
import Image from '@atlaskit/image'

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
        // paddingBlockStart: token('space.150'),
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
        touchAction: 'none',
        zIndex: 1,
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
    cardEditing: {
        zIndex: 800,
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
    indicatorStack: {
        height:'100%',
    },
    storyPointEditView: {
        width: '60px',
        alignItems: 'center',
        zIndex: 800,
        justifyContent: 'center'
    }
})

const containerStyles = cssMap({
	root: {
		// eslint-disable-next-line @atlaskit/ui-styling-standard/no-unsafe-values
		// width: '70%' as any,
        paddingBlockEnd: token('space.150'),
	},
});

const readViewContainerStyles = cssMap({
	root: {
		font: token('font.body'),
		// eslint-disable-next-line @atlaskit/ui-styling-standard/no-unsafe-values
		// minHeight: '3em' as string,
		// paddingTop: token('space.075'),
		paddingRight: token('space.075'),
		paddingBottom: token('space.075'),
		paddingLeft: token('space.075'),
		wordBreak: 'break-word',
	},
});

const overlayStyles = cssMap({
    summaryOverlay: {
        position: 'relative',
        zIndex: 800,
    },
    storyPointsOverlay: {
        position: 'relative',
        zIndex: 800,
    },
});

type Props = {
    issue: SwipeIssue;
    isSelected?: boolean;
    onClick?: (issue: SwipeIssue) => void;
    onSwipe?: (issue: SwipeIssue, direction: SwipeDirection) => Promise<boolean> | boolean;
    isSwiping?: boolean;
}

// function statusAppearance(
//     status: string,
// ): React.ComponentProps<typeof Lozenge>['appearance'] {
//     // handles to do, done, in progress for now,
//     // if needed will add more
//     if (status.includes('To Do')) {
//         return 'default';
//     }

//     if (status.includes('Done')) {
//         return 'success';
//     }

//     if (status.includes('In Progress')) {
//         return 'inprogress';
//     }
//     return 'default';
// }

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

type PriorityOption = {
    label: string;
    value: string;
    iconUrl?: string;
};

export function SwipeIssueCard({ 
    issue,
    isSelected,
    onClick,
    onSwipe,
    isSwiping,
}: Props) {
    const [activeDirection, setActiveDirection] = useState<SwipeDirection | null>(null);
    const [summary, setSummary] = useState(issue.summary);
    const [storyPoints, setStoryPoints] = useState<number | null>(
        issue.storyPoints ?? null,
    );
    const [priorityOptions, setPriorityOptions] = useState<PriorityOption[]>([]);
    const { jiraBaseUrl, updateIssueInPage, setBanner } = useAppContext();
    const [isSummaryEditing, setIsSummaryEditing] = useState(false);
    const [isStoryPointsEditing, setIsStoryPointsEditing] = useState(false);

    const controls = useAnimation();
    const showIndicators = activeDirection !== null && !isSwiping;

    const isEditing = isSummaryEditing || isStoryPointsEditing;

    useEffect(() => {
        setSummary(issue.summary);
        setStoryPoints(issue.storyPoints ?? null);
    }, [issue.summary, issue.storyPoints]);

    useEffect(() => {
        let cancelled = false;

        async function loadPriorities() {
            try {
                const data = await fetchPriorities();
                if (cancelled) return;

                setPriorityOptions(
                    data.map((p: JiraPriority) => ({
                        label: p.name,
                        value: p.id,
                        iconUrl: p.iconUrl,
                    })),
                );
            } catch {
                if (!cancelled) {
                    setBanner({
                        message: 'Failed to load priorities',
                        type: 'warning',
                    });
                }
            }
        }

        void loadPriorities();
            return () => {
            cancelled = true;
        };
    }, [setBanner]);

    const currentPriorityOption: PriorityOption | null = issue.priorityId && issue.priorityName ? {
        label: issue.priorityName,
        value: issue.priorityId,
        iconUrl: issue.priorityIconUrl ?? undefined,
    } : null;

    const handlePrioritySelect = async (opt: PriorityOption) => {
        const res = await updateIssue({
            issueIdOrKey: issue.key,
            priorityId: opt.value,
        });

        if (res.error) {
            setBanner({ message: res.error, type: 'error' });
            return;
        }

        updateIssueInPage(issue.key, {
            priorityId: opt.value,
            priorityName: opt.label,
            priorityIconUrl: opt.iconUrl ?? null,
        });

        setBanner({
            message: `Updated ${issue.key} priority`,
            type: 'announcement',
        });
    };

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

        // fly card out 
        await controls.start({
            x: targetX,
            y: targetY,
            rotate: targetRotate,
            opacity: 0,
            transition: { duration: 0.25, ease: 'easeOut' },
        });

        let success = true;
        
        if (onSwipe) {
			try {
				const result = await onSwipe(issue, finalDirection);
				if (result === false) {
					success = false;
				}
			} catch {
				success = false;
			}
		}

        if (!success) {
			await controls.start({
				x: 0,
				y: 0,
				rotate: 0,
				opacity: 1,
				transition: { type: 'spring', stiffness: 400, damping: 30 },
			});
		}

		setActiveDirection(null);
    };
    
    const handleClick = () => {
        if (isSwiping) return;
        onClick?.(issue);
    };

    const issueKey = issue.key;
    const issueHref = `${jiraBaseUrl}/browse/${issueKey}`;

    return (
        <Box xcss={styles.wrapper}>
            {/* indicators under card */}
            {showIndicators && (
                <Box xcss={styles.indicatorContainer} paddingBlockEnd='space.300'>
                    <Stack alignBlock={activeDirection === 'up' ? 'end' : 'center'} grow="fill" xcss={styles.indicatorStack}>
                        <Inline space="space.200" spread="space-between" alignBlock={activeDirection === 'up' ? 'end' : 'center'} grow='fill'>
                            {/* swipe left */}
                            <Stack alignInline="center" space="space.050" alignBlock='center'>
                                {activeDirection === 'right' && (
                                    <>
                                        <BacklogIcon label="retain" />
                                        <Lozenge isBold>Keep</Lozenge>
                                    </>
                                )}
                            </Stack>

                            {/* swipe up*/}
                            <Stack alignInline="center" space="space.050" alignBlock='end'>
                                {activeDirection === 'up' && (
                                    <>
                                        <SprintIcon label="move-to-sprint" />
                                        <Lozenge appearance="inprogress" isBold>Move to sprint</Lozenge>
                                    </>
                                )}
                            </Stack>

                            {/* swipe right */}
                            <Stack alignInline="center" space="space.050" alignBlock='center'>
                                {activeDirection === 'left' && (
                                    <>
                                        <DeleteIcon label="delete" />
                                        <Lozenge appearance="removed" isBold>Delete</Lozenge>
                                    </>
                                )}
                            </Stack>
                        </Inline>
                    </Stack>
                </Box>
            )}

            {/* card */}
            <MotionPressable
                onClick={handleClick}
                xcss={cx(styles.card, isSelected && styles.selected, isEditing && styles.cardEditing)}
                drag={!isEditing}
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                dragElastic={0.3}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
                animate={controls}
                whileTap={{ scale: 1.02 }}
            > 
                <Stack space="space.025" spread="space-between" grow="fill">
                    <Stack space="space.025">
                        <Box 
                            xcss={cx(containerStyles.root, overlayStyles.summaryOverlay)} 
                            onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
                            onMouseDown={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
                        >
                            <InlineEdit
                                isRequired
                                defaultValue={summary}
                                editButtonLabel={summary || 'Add summary'}
                                onEdit={() => setIsSummaryEditing(true)}
                                onCancel={() => setIsSummaryEditing(false)}
                                editView={({ ...fieldProps }, ref) => (
                                    // @ts-expect-error - textarea does not pass through ref as a prop
                                    <TextArea {...fieldProps} ref={ref} appearance="standard" resize="none"/>
                                )}
                                readView={() => (
                                    <Box xcss={readViewContainerStyles.root}>
                                        {summary || 'Add summary'}
                                    </Box>
                                )}
                                onConfirm={async (value: string) => {
                                    const trimmed = value.trim();
                                    if (!trimmed || trimmed === summary) {
                                        setIsSummaryEditing(false);
                                        return;
                                    }

                                    const res = await updateIssue({
                                        issueIdOrKey: issue.key,
                                        summary: trimmed,
                                    });

                                    if (res.error) {
                                        setBanner({ message: res.error, type: 'error' });
                                        setIsSummaryEditing(false);
                                        return;
                                    }

                                    setSummary(trimmed);
                                    updateIssueInPage(issue.key, { summary: trimmed });

                                    setBanner({
                                        message: `${issue.key} summary updated`,
                                        type: 'announcement',
                                    });

                                    setIsSummaryEditing(false);
                                }}
                                keepEditViewOpenOnBlur
                                readViewFitContainerWidth
                            />
                        </Box>
                        <div>
                            {issue.epicKey && issue.epicSummary && (
                                <EpicLozenge 
                                    text={issue.epicSummary || issue.epicKey}
                                    colorKey={issue.epicColor} 
                                />
                            )}
                        </div>
                    </Stack>

                    <Inline alignBlock="center" spread="space-between">
                        <Inline space="space.050" alignBlock='center'>
                            {issue.issueTypeIconUrl && (
                                <Image
                                src={issue.issueTypeIconUrl}
                                alt=""
                                width={16}
                                height={16}
                                />
                            )}

                            <Link href={issueHref} appearance="subtle" onClick={(e: React.MouseEvent<HTMLAnchorElement>) => e.stopPropagation()}>
                                {issue.key}
                            </Link>                            
                        </Inline>

                        <Inline alignBlock="center">
                            {/* <Lozenge appearance={statusAppearance(issue.status)} isBold>
                                {issue.status}
                            </Lozenge> */}

                            {/* for story point */}
                            <Inline 
                                xcss={overlayStyles.storyPointsOverlay}
                                alignBlock='center'
                            >
                                {storyPoints && (
                                    <InlineEdit 
                                        defaultValue={String(storyPoints)}
                                        onEdit={() => setIsStoryPointsEditing(true)}
                                        onCancel={() => setIsStoryPointsEditing(false)}
                                        readView={() => (
                                            <Box paddingBlockEnd='space.050'>
                                                <Badge>
                                                    {storyPoints}
                                                </Badge>
                                            </Box>
                                        )}
                                        editView={({ ...fieldProps }) => (
                                            <Box xcss={styles.storyPointEditView}>
                                                <Textfield 
                                                    {...fieldProps}
                                                    autoFocus
                                                    isCompact
                                                    type="number"
                                                />
                                            </Box>
                                        )}
                                        onConfirm={async (value: string) => {
                                            const trimmed = value.trim();
                                            let parsed: number | null = storyPoints;

                                            if (trimmed === '') {
                                                parsed = null;
                                            } else {
                                                const n = Number(trimmed);
                                                if (Number.isNaN(n)) {
                                                    setIsStoryPointsEditing(false);
                                                    return;
                                                }
                                                parsed = n;
                                            }

                                            const res = await updateIssue({
                                                issueIdOrKey: issue.key,
                                                storyPoints: parsed,
                                            });

                                            if (res.error) {
                                                setBanner({ message: res.error, type: 'error' });
                                                setIsStoryPointsEditing(false);
                                                return;
                                            }

                                            setStoryPoints(parsed);
                                            updateIssueInPage(issue.key, { storyPoints: parsed });

                                            setBanner({
                                                message: `Updated ${issue.key} story points`,
                                                type: 'announcement',
                                            });

                                            setIsStoryPointsEditing(false);
                                        }}
                                    />
                                )}
                            </Inline>

                            {issue.issueTypeName != 'Task' && (<DropdownMenu 
                                zIndex={999}
                                trigger={({ triggerRef, ...triggerProps }) => (
                                    <IconButton
                                        {...triggerProps}
                                        ref={triggerRef as React.Ref<HTMLButtonElement>}
                                        appearance="subtle"
                                        label={currentPriorityOption?.label ?? 'Priority'}
                                        icon={() =>
                                            currentPriorityOption?.iconUrl ? (
                                            <Image
                                                src={currentPriorityOption.iconUrl}
                                                alt=""
                                                width={16}
                                                height={16}
                                            />
                                            ) : null
                                        }
                                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                            e.stopPropagation();
                                            triggerProps.onClick?.(e);
                                        }}
                                        spacing="compact"
                                    />
                                )}
                            >
                                <DropdownItemGroup>
                                    {priorityOptions.map((opt) => (
                                    <DropdownItem
                                        key={opt.value}
                                        elemBefore={
                                            opt.iconUrl ? (
                                                <Image
                                                src={opt.iconUrl}
                                                alt=""
                                                width={16}
                                                height={16}
                                                />
                                            ) : undefined
                                        }
                                        onClick={() => void handlePrioritySelect(opt)}
                                    >
                                        {opt.label}
                                    </DropdownItem>
                                    ))}
                                </DropdownItemGroup>
                            </DropdownMenu>)}
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