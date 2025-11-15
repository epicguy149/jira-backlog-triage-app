import React, { useRef, useEffect } from 'react';
import { useAppContext, type View } from '../app/AppContext';
import { 
  TopNavStart,
  TopNavEnd, 
  SideNavToggleButton,
  Help
} from '@atlaskit/navigation-system';
import { TopNavButton } from '@atlaskit/navigation-system/experimental/top-nav-button';
import { Settings} from '@atlaskit/navigation-system/top-nav-items';
import GridIcon from '@atlaskit/icon/core/grid';
import ChangesIcon from '@atlaskit/icon/core/changes';
import AiChatIcon from '@atlaskit/icon/core/ai-chat';
import Heading from '@atlaskit/heading';

export default React.memo(function AppTopNav() {
    const { view, setView, isSettingsOpen, setIsSettingsOpen, setBanner } = useAppContext();

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
                {/* <AppLogo
					href="https://jira.atlassian.com"
					icon={AtlassianIcon}
					name="Log Juggler"
					label="App name"
				/> */}

                <Heading size="medium" color="color.text.inverse">Log Juggler</Heading>
                
                {/* ADS beta feature - doesn't work*/}
                {/* <CustomTitle>Log Juggler</CustomTitle> */}
                
                <TopNavButton iconBefore={ChangesIcon} onClick={() => changeView('swipe')}>Swipe</TopNavButton>

                <TopNavButton iconBefore={GridIcon} onClick={() => changeView('matrix')}>Matrix</TopNavButton>
            </TopNavStart>
            
            {/* search is ADS beta feature - doesn't work */}
            {/* <TopNavMiddle>
				<Search label="Search" />
                <TopNavIconButton icon={FilterIcon} label="Filter" />
			</TopNavMiddle> */}

            <TopNavEnd>
                <TopNavButton iconBefore={AiChatIcon}>Chat with AI</TopNavButton>
                <Help label="Help" />
                <Settings
                    label="Settings"
                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                    isSelected={isSettingsOpen}
                />
            </TopNavEnd>
        </>
    );
});