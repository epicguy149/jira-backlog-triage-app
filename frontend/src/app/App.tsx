import { useEffect} from 'react';
import '@atlaskit/css-reset';
import { useAppContext } from './AppContext';
import { useJiraContext } from '../hooks/useJiraContext';
import { fetchServerInfo } from '../api/jira-client';
import SwipeMode from '../views/swipe/SwipeMode';
import MatrixMode from '../views/matrix/MatrixMode';
import { Box, Stack } from '@atlaskit/primitives';
import Spinner from '@atlaskit/spinner';
import Lozenge from '@atlaskit/lozenge';
import { 
  Root, 
  Banner, 
  Main, 
  Panel, 
  SideNav,
  TopNav
} from '@atlaskit/navigation-system';
import AppBanner from '../components/AppBanner';
import AppTopNav from '../components/AppTopNav';
import SettingsPanel from '../components/SettingsPanel';
import SwipeSideNav from '../views/swipe/components/SwipeSideNav';

function AppRouter() {
  const { view } = useAppContext();

  switch (view) {
    case 'swipe':  
      return <SwipeMode />;
    case 'matrix': 
      return <MatrixMode />;
    case 'loading':
      
    default:       
      return <SwipeMode />;
  }
}

function App() {
  const { view, setView, isSettingsOpen, setBanner, banner, jiraBaseUrl, setJiraBaseUrl } = useAppContext();
  const { boardId, projectId, isLoading, error } = useJiraContext();

  useEffect(() => {
    if (isLoading) return;

    if (error) {
      setBanner({ message: String(error), type: 'error'});
      if (view === 'loading') {
        setView('swipe');
      }
      return;
    }

    // now only support launching when context has the board/project. 
    // TODO: board selection page
    if (!isLoading && !error) {
      if (boardId || projectId) {
        if (view === 'loading') {
          setView('swipe');
        }
      } else {
        setBanner({ message: 'No board found in context, launch from projectPage', type: 'warning'});
        if (view === 'loading') {
          setView('swipe');
        }
      }
    }
  }, [isLoading, error, boardId, projectId, view, setView, setBanner]);

  useEffect(() => {
    let cancelled = false;

    async function loadServerInfo() {
      try {
        const info = await fetchServerInfo();
        if (!cancelled) {
          setJiraBaseUrl(info.baseUrl || null);
        }
      } catch {
        if (!cancelled) {
          setJiraBaseUrl(null);
        }
      }
    }

    if (!jiraBaseUrl) {
      void loadServerInfo();
    }

    return () => {
      cancelled = true;
    };
  }, [jiraBaseUrl, setJiraBaseUrl]);

  if (isLoading || view === 'loading') {
    return (
      <Box padding="space.400">
        <Stack space= "space.200" alignInline="center">
          <Spinner size='large' label="Loading" />
          <Lozenge appearance="new">Loading...</Lozenge>
        </Stack>
      </Box>
    )
  }

  return (
    <Root defaultSideNavCollapsed>
      {banner && (
        <Banner>
          <AppBanner />
        </Banner>
      )}

      <TopNav 
        UNSAFE_theme={{
          backgroundColor: { r: 0, g: 88, b: 196 },
          highlightColor:   { r: 1,   g: 44,  b: 97 },
        }}
      >
        <AppTopNav />
      </TopNav>
      
      {/* defaultCollapsed is officially stated to be deprecated, but sidenav is not collapsed on launch without it */}
      {view === 'swipe' && (
        <SideNav defaultCollapsed>
          <SwipeSideNav />
        </SideNav>
      )}

      <Main>
        <AppRouter />
      </Main>

      {isSettingsOpen && (
        <Panel>
          <SettingsPanel />
        </Panel>
      )}
    </Root>
  )
}

export default App;