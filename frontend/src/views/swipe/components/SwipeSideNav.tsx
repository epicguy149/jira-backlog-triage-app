import { 
    SideNavHeader, 
    SideNavContent, 
	FlyoutMenuItem,
	FlyoutMenuItemContent,
	FlyoutMenuItemTrigger, 
    MenuList, 
	MenuSection,
	MenuSectionHeading, 
    ButtonMenuItem
} from '@atlaskit/navigation-system';
import Heading from '@atlaskit/heading';
import UndoIcon from '@atlaskit/icon/core/undo';
import SprintIcon from '@atlaskit/icon/core/sprint';
import DeleteIcon from '@atlaskit/icon/core/delete';
import { LinkButton } from '@atlaskit/button/new';
import LinkExternalIcon from '@atlaskit/icon/core/link-external';
import ToolTip from '@atlaskit/tooltip';
import type { ActionHistoryItem, SwipeActionType } from '../swipe-types';
import { useAppContext } from 'frontend/src/app/AppContext';
import { Box, Text } from '@atlaskit/primitives';

function getActionMessage(item: ActionHistoryItem): string {
    // for undo messages
    if (item.label) {
        return item.label;
    }

    const { key, type, sprintName } = item;

    switch(type) {
        case 'delete':
            return `${key} deleted`;
        case 'retain':
            return `${key} retained in backlog`;
        case 'move-to-sprint':
            return `${key} moved to ${sprintName}`;
        default:
            return 'no action - bug';
    }
}

type ActionHistoryFlyoutProps = {
  item: ActionHistoryItem;
};

const ActionHistoryFlyout = ({ item }: ActionHistoryFlyoutProps) => {
    const { jiraBaseUrl, setHistoryActionRequest } = useAppContext();
    const { key, type, disabled } = item;
    const issueHref = `${jiraBaseUrl}/browse/${key}`;

    const isDeleteAction = type === 'delete';
    const allDisabled = disabled || isDeleteAction;

    const undoTooltip = isDeleteAction ? 'Cannot undo delete' : disabled ?
        'The action for this history has already been applied' : 'Undo this action';

    const moveTooltip = isDeleteAction ? 'Issue has already been deleted' : disabled ?
        'The action for this history has already been applied' : 'Move this issue to sprint';

    const deleteTooltip = isDeleteAction ? 'Issue has already been deleted' : disabled ?
        'The action for this history has already been applied' : 'Delete this issue';

    return (
        <FlyoutMenuItemContent>
            {/* link to issue */}
            <MenuSection>
                <MenuList>
                    <ToolTip content="Requires right click -> Open in new tab or middle mouse button to open in new tab">
                        <LinkButton iconAfter={LinkExternalIcon} href={issueHref} target="_blank" isDisabled={allDisabled}>
                            View {key}
                        </LinkButton >
                    </ToolTip>
                </MenuList>
            </MenuSection>

            {/* actions section  */}
            <MenuSection>
                <MenuSectionHeading>Actions</MenuSectionHeading>
                <MenuList>
                    <ToolTip content={undoTooltip}>
                        <ButtonMenuItem 
                            elemBefore={<UndoIcon label="Undo" />}
                            isDisabled={allDisabled}
                            onClick={() => {
                             if (!allDisabled) {
                                setHistoryActionRequest({ item, op: 'undo' });
                            }
                          }}
                        >
                            Undo
                        </ButtonMenuItem>
                    </ToolTip>

                    {type !== 'move-to-sprint' && (
                        <ToolTip content={moveTooltip}>
                            <ButtonMenuItem 
                                elemBefore={<SprintIcon label="Move to sprint" />}
                                isDisabled={allDisabled}
                                onClick={() => {
                                    if (!allDisabled) {
                                        setHistoryActionRequest({ item, op: 'move-to-sprint' });
                                    }
                                }}
                            >
                                Move to Sprint
                            </ButtonMenuItem>
                        </ToolTip>
                    )}

                    {type !== 'delete' && (
                        <ToolTip content={deleteTooltip}>
                            <ButtonMenuItem 
                                elemBefore={<DeleteIcon label="Delete" />}
                                isDisabled={allDisabled}
                                onClick={() => {
                                    if (!allDisabled) {
                                        setHistoryActionRequest({ item, op: 'delete' });
                                    }
                                }}
                            >
                                Delete
                            </ButtonMenuItem>
                        </ToolTip>
                    )}
                </MenuList>
            </MenuSection>
        </FlyoutMenuItemContent>
    )
}

export default function SwipeSideNav() {
    const { actionHistory } = useAppContext();

    return (
        <>
            <SideNavHeader>
                <Heading size="medium">History</Heading>
            </SideNavHeader>

            <SideNavContent>
                {/* TODO: replace with empty state + image */}
                {actionHistory.length === 0 ? (
                    <Box padding="space.200">
                        <Text>No actions taken in this session.</Text>
                    </Box>
                ) : (
                    <MenuList>
                        {actionHistory.map(item => (
                            <FlyoutMenuItem key={item.id}>
                                <FlyoutMenuItemTrigger>
                                    {getActionMessage(item)}
                                </FlyoutMenuItemTrigger>
                                <ActionHistoryFlyout item={item} />
                            </FlyoutMenuItem>
                        ))}
                    </MenuList>
                )}
            </SideNavContent>
        </>
    );
}