import { 
    createContext,
    useContext,
    useState,
    type ReactNode,
    type Dispatch,        
    type SetStateAction 
} from 'react';
import type { SwipeIssuePage, SwipeFilterState } from '~contracts/api';

export type View = 'loading' | 'swipe' | 'matrix';

// appearance types
export type Banner = 
    | { message: string; type: 'warning' | 'error' | 'announcement' } 
    | null;

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
    searchQuery: string;
    setSearchQuery: (query: string) => void;

    swipeFilters: SwipeFilterState;
    setSwipeFilters: Dispatch<SetStateAction<SwipeFilterState>>;
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