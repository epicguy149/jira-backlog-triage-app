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
import type { SwipeActionType } from '../swipe-types';
import { useAppContext } from 'frontend/src/app/AppContext';
import { Box, Text } from '@atlaskit/primitives';

function getActionMessage(type: SwipeActionType, key: string, sprintName?: string): string {
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
  issueKey: string;
  type: SwipeActionType;
};


const ActionHistoryFlyout = ({ issueKey, type }: ActionHistoryFlyoutProps) => {
    const { jiraBaseUrl } = useAppContext();
    const issueHref = `${jiraBaseUrl}/browse/${issueKey}`;
        

    return (
        <FlyoutMenuItemContent>
            {/* link to issue */}
            <MenuSection>
                <MenuList>
                    <ToolTip content="Requires right click -> Open in new tab or middle mouse button to open in new tab">
                        <LinkButton iconAfter={LinkExternalIcon} href={issueHref} target="_blank">
                            View {issueKey}
                        </LinkButton >
                    </ToolTip>
                </MenuList>
            </MenuSection>

            {/* actions section  */}
            <MenuSection>
                <MenuSectionHeading>Actions</MenuSectionHeading>
                <MenuList>
                    <ButtonMenuItem 
                        elemBefore={<UndoIcon label="Undo" />}
                        onClick={() => console.log(`undo ${issueKey}`)}
                    >
                        Undo
                    </ButtonMenuItem>

                    {type !== 'move-to-sprint' && (
                        <ButtonMenuItem 
                            elemBefore={<SprintIcon label="Move to sprint" />}
                            onClick={() => console.log(`move ${issueKey} to sprint x`)}
                        >
                            Move to Sprint
                        </ButtonMenuItem>
                    )}

                    {type !== 'delete' && (
                        <ButtonMenuItem 
                            elemBefore={<DeleteIcon label="Delete" />}
                            onClick={() => console.log(`delete ${issueKey}`)}
                        >
                            Delete
                        </ButtonMenuItem>
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
                                    {getActionMessage(item.type, item.key, item.sprintName)}
                                </FlyoutMenuItemTrigger>
                                <ActionHistoryFlyout issueKey={item.key} type={item.type} />
                            </FlyoutMenuItem>
                        ))}
                    </MenuList>
                )}
            </SideNavContent>
        </>
    );
}