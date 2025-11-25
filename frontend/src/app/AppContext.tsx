import { 
    createContext,
    useContext,
    useState,
    type ReactNode,
    type Dispatch,        
    type SetStateAction 
} from 'react';
import type { SwipeIssuePage, SwipeFilterState, SwipeIssue } from '~contracts/api';
import type { ActionHistoryItem } from '../views/swipe/swipe-types';

// maintain last 20 actions
const MAX_HISTORY_COUNT = 20;

export type View = 'loading' | 'swipe' | 'matrix';

// appearance types
export type Banner = 
    | { 
        message: string; 
        type: 'warning' | 'error' | 'announcement';
        undoHistoryId?: string | null;
    } 
    | null;

// actions possible for each item in history
type HistoryOp = 'undo' | 'move-to-sprint' | 'delete';

type HistoryActionRequest = {
  item: ActionHistoryItem;
  op: HistoryOp;
};

export const filtersInitialState: SwipeFilterState = {
    status: {
        unswiped: true,
        swiped: false,
    },
    // future 
    // priorityName: []
};

// rest of context handled by atlaskit/navigation-system
interface IAppContext {
    view: View;
    isSettingsOpen: boolean;
    banner: Banner;
    setView: (view: View) => void;
    setIsSettingsOpen: (isOpen: boolean) => void;
    setBanner: (banner: Banner) => void;

    // swipe state
    swipePage: SwipeIssuePage | null;
    setSwipePage: (page: SwipeIssuePage | null) => void;
    isSwipeLoading: boolean;
    setIsSwipeLoading: (value: boolean) => void;
    swipeError: string | null;
    setSwipeError: (value: string | null) => void;

    // search
    searchQuery: string;
    setSearchQuery: (query: string) => void;

    // filter
    swipeFilters: SwipeFilterState;
    setSwipeFilters: Dispatch<SetStateAction<SwipeFilterState>>;

    // history / undo 
    actionHistory: ActionHistoryItem[];
    addActionHistory: (
        item: Omit<ActionHistoryItem, 'id' | 'timestamp'>,
    ) => ActionHistoryItem;
    disableHistoryItem: (id: string) => void;

    historyActionRequest: HistoryActionRequest | null;
    setHistoryActionRequest: (req: HistoryActionRequest | null) => void;

    jiraBaseUrl: string | null;
    setJiraBaseUrl: (url: string | null) => void;

    updateIssueInPage: (issueKey: string, patch: Partial<SwipeIssue>) => void;
}

const AppContext = createContext<IAppContext | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
    const [view, setView] = useState<View>('loading');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [banner, setBanner] = useState<Banner>(null);

    const [swipePage, setSwipePage] = useState<SwipeIssuePage | null>(null);
    const [isSwipeLoading, setIsSwipeLoading] = useState(false);
    const [swipeError, setSwipeError] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [swipeFilters, setSwipeFilters] = useState<SwipeFilterState>(filtersInitialState);

    // for action history item id
    const [nextHistoryId, setNextHistoryId] = useState(1);
    const [actionHistory, setActionHistory] = useState<ActionHistoryItem[]>([]);

    const [jiraBaseUrl, setJiraBaseUrl] = useState<string | null>(null);

    const [historyActionRequest, setHistoryActionRequest] = useState<HistoryActionRequest | null>(null);

    const addActionHistory = (item: Omit<ActionHistoryItem, 'id' | 'timestamp'>) => {
        const id = `${item.key}-${nextHistoryId}`;
        const full: ActionHistoryItem = {
            ...item,
            id,
            timestamp: Date.now(),
        };

        setActionHistory((prev) => {
            const next = [full, ...prev];
            return next.slice(0, MAX_HISTORY_COUNT);
        });

        setNextHistoryId((n) => n + 1);
        return full;
    };

    const disableHistoryItem = (id: string) => {
        setActionHistory((prev) =>
            prev.map((it) => (it.id === id ? { ...it, disabled: true } : it)),
        );
    };

    const updateIssueInPage = (issueKey: string, patch: Partial<SwipeIssue>) => {
        setSwipePage(prev => {
            if (!prev) {
                return prev;
            }
            const issues = prev.issues.map(issue =>
                issue.key === issueKey ? { ...issue, ...patch } : issue,
            );

            return { ...prev, issues };
        });
    };

    const value = {
        view,
        isSettingsOpen,
        banner,
        setView,
        setIsSettingsOpen,
        setBanner,
        swipePage,
        setSwipePage,
        isSwipeLoading,
        setIsSwipeLoading,
        swipeError,
        setSwipeError,
        searchQuery,
        setSearchQuery,
        swipeFilters,
        setSwipeFilters,
        actionHistory,
        addActionHistory,
        jiraBaseUrl,
        setJiraBaseUrl,
        historyActionRequest,
        setHistoryActionRequest,
        disableHistoryItem,
        updateIssueInPage,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}

export function useAppContext() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext not used within AppProvider');
    }
    return context;
}