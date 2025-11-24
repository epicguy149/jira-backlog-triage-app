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

const exampleHref = "http://www.bitbucket.com"

type ActionType = 'MOVED' | 'DELETED' | 'RETAINED';

/**
 * 
 * In real app, take props to determine which actions/issues to show
 * 
 * refer: https://community.atlassian.com/forums/Jira-questions/How-can-I-get-an-issue-url-that-can-be-navigated-to-in-the/qaq-p/1500948
 * for getting jira issue link
 * 
 * for each action made by user, add menu item e.g.: PROJ-12 (href = issuelinkfromabove) flyout -> UNDO + other actions
 * also fetch latest sprint, for moved to actions
 */

const ActionHistoryFlyout = ({ issueKey, type }: {issueKey: string, type: 'MOVED' | 'DELETED' | 'RETAINED' }) => (
    <FlyoutMenuItemContent>
        {/* link to issue */}
        <MenuSection>
            <MenuList>
                <ToolTip content="Requires right click -> Open in new tab or middle mouse button to open in new tab">
                    <LinkButton iconAfter={LinkExternalIcon} href={exampleHref} target="_blank">
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

                {type !== 'MOVED' && (
                    <ButtonMenuItem 
                        elemBefore={<SprintIcon label="Move to sprint" />}
                        onClick={() => console.log(`move ${issueKey} to sprint x`)}
                    >
                        Move to Sprint
                    </ButtonMenuItem>
                )}

                {type !== 'DELETED' && (
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

export default function SwipeSideNav() {

    // hardcoded example issues for prototyping
    const actionHistory: {key: string, text: string, type: ActionType }[] =[
        { key: 'PROJ-1', text: 'moved to sprint', type: 'MOVED'},
        { key: 'PROJ-2', text: 'deleted', type: 'DELETED'},
        { key: 'PROJ-3', text: 'retained in backlog', type: 'RETAINED'},
    ]

    return (
        <>
            <SideNavHeader>
                <Heading size="medium">History</Heading>
            </SideNavHeader>

            <SideNavContent>
                <MenuList>
                    {actionHistory.map(item => (
                        <FlyoutMenuItem key={item.key}>
                            <FlyoutMenuItemTrigger>
                                {item.key} {item.text}
                            </FlyoutMenuItemTrigger>
                            <ActionHistoryFlyout issueKey={item.key} type={item.type} />
                        </FlyoutMenuItem>
                    ))}
                </MenuList>
            </SideNavContent>
        </>
    );
}