import { view } from '@forge/bridge';
import { useState, useEffect } from 'react';

// shape of view.getContext()
type ForgeContext = {
    extension?: {
        board?: { id?: string };
        project?: { id?: string };
    };
} | null;

export function useJiraContext() {
    const [context, setContext] = useState<ForgeContext>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        view.getContext().then(c => {
            if (!cancelled) {
                setContext(c as ForgeContext);
            } 
        }).catch(e => {
            console.error('failed fetching Jira context:', e);
            if (!cancelled) {
                setError('failed getting jira context');
            }
        });

        return () => {
            cancelled = true;
        }
    }, []);

    const boardId = context?.extension?.board?.id ?? null;
    const projectId = context?.extension?.project?.id ?? null;

    return {
        boardId,
        projectId,
        isLoading: !context && !error, // loading flag for loading view
        error
    };
}