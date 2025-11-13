import React, { useRef, useEffect } from 'react';
import { useAppContext, type View } from '../AppContext';
import { 
  TopNav, 
  TopNavStart, 
  TopNavMiddle, 
  TopNavEnd, 
  Root,
  SideNavToggleButton 
} from '@atlaskit/navigation-system';
import { Settings } from '@atlaskit/navigation-system/top-nav-items';
import Button from '@atlaskit/button/new';

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
        <TopNav>

            {/* side nav toggle only shown on swipe mode for now */}
            <TopNavStart>
                {view === 'swipe' ? <SideNavToggleButton 
                    collapseLabel="Collapse sidebar"
					expandLabel="Expand sidebar"
                /> : null}
            </TopNavStart>

            <TopNavMiddle>
                <Button 
                    appearance={view === 'swipe' ? 'primary' : 'subtle'} 
                    aria-pressed={view === 'swipe'}
                    onClick={() => changeView('swipe')}
                >
                    Swipe
                </Button>

                <Button 
                    appearance={view === 'matrix' ? 'primary' : 'subtle'} 
                    aria-pressed={view === 'matrix'}
                    onClick={() => changeView('matrix')}
                >
                    Matrix
                </Button>
            </TopNavMiddle>

            <TopNavEnd>
                <Settings
                    label="Settings"
                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                    isSelected={isSettingsOpen}
                />
            </TopNavEnd>
        </TopNav>
    );
});