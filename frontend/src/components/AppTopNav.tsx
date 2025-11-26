import React, { useRef, useEffect, useState } from 'react';
import { useAppContext, type View } from '../app/AppContext';
import { 
  TopNavStart,
  TopNavEnd, 
  SideNavToggleButton,
  Help,
  AppLogo,
} from '@atlaskit/navigation-system';
import { TopNavButton } from '@atlaskit/navigation-system/experimental/top-nav-button';
import { Settings } from '@atlaskit/navigation-system/top-nav-items';
import GridIcon from '@atlaskit/icon/core/grid';
import ChangesIcon from '@atlaskit/icon/core/changes';
import { JiraIcon } from '@atlaskit/logo';
import { Box, Stack, Text } from '@atlaskit/primitives';
import Popup from '@atlaskit/popup';

export default React.memo(function AppTopNav() {
    const { view, setView, isSettingsOpen, setIsSettingsOpen, setBanner } = useAppContext();
    const [isHelpOpen, setIsHelpOpen] = useState(false);

    // banner auto dismiss
    const bannerTimeoutRef = useRef<number | null>(null);
    useEffect(() => {
        return () => {
            if (bannerTimeoutRef.current) {
                clearTimeout(bannerTimeoutRef.current);
            }
        };
    }, []);

    const changeView = (target: View) => {
        if (bannerTimeoutRef.current) {
            clearTimeout(bannerTimeoutRef.current);
        }

        if (view === target) {
            setBanner({ message: `You are already in ${target} mode`, type: 'announcement'});
            bannerTimeoutRef.current = window.setTimeout(() => {
                setBanner(null);
            }, 4000);
        } else {
            setView(target);
            setBanner(null);
        }
    };

    return (
        <>
            {/* side nav toggle only shown on swipe mode for now */}
            <TopNavStart>
                <SideNavToggleButton 
                    collapseLabel="Collapse sidebar"
					expandLabel="Expand sidebar"
                    defaultCollapsed
                />

                {/* app name doenst render for some reason */}
                <AppLogo
					href="https://jira.atlassian.com"
					icon={JiraIcon}
					name="Log Juggler"
					label="App name"
				/>
                
                <TopNavButton iconBefore={ChangesIcon} onClick={() => changeView('swipe')}>Swipe</TopNavButton>

                <TopNavButton iconBefore={GridIcon} onClick={() => changeView('matrix')}>Matrix</TopNavButton>
            </TopNavStart>
            
            {/* search is ADS beta feature - doesn't work */}
            {/* <TopNavMiddle>
				<Search label="Search" />
                <TopNavIconButton icon={FilterIcon} label="Filter" />
			</TopNavMiddle> */}

            <TopNavEnd>
                {/* Was to be implemented: chat with AI that already has context of entire project */}
                {/* <TopNavButton iconBefore={AiChatIcon}>Chat with AI</TopNavButton> */}
                
                {/* help icon */}
                <Popup
                    isOpen={isHelpOpen}
                    onClose={() => setIsHelpOpen(false)}
                    placement="bottom-end"
                    trigger={(triggerProps) => (
                        <Help 
                            {...triggerProps}
                            label="Help" 
                            isSelected={isHelpOpen}
                            onClick={() => setIsHelpOpen(!isHelpOpen)}
                        />
                    )}
                    content={() => (
                        <Box padding="space.300">
                            <Stack space="space.200">
                                <Text weight="bold" size="large">How to use</Text>
                                
                                <Stack space="space.050">
                                    <Text weight="semibold">Controls (Swipe or arrow keys)</Text>
                                    <Text><Text weight="bold">Right</Text>: Keep in backlog</Text>
                                    <Text><Text weight="bold">Left</Text>: Delete issue (destructive and irreversible)</Text>
                                    <Text><Text weight="bold">Up</Text>: Move to active sprint</Text>
                                </Stack>

                                <Stack space="space.100">
                                    <Text weight="semibold">Tips</Text>
                                    <Text size="small">• Use the sidebar history to review and undo actions.</Text>
                                    <Text size="small">• Click on the summary, priority or story point estimate to edit.</Text>
                                    <Text size="small">• Issues can be filtered by swiped/unswiped status through the Filters button.</Text>
                                </Stack>
                            </Stack>
                        </Box>
                    )}
                />
                <Settings
                    label="Settings"
                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                    isSelected={isSettingsOpen}
                />
            </TopNavEnd>
        </>
    );
});