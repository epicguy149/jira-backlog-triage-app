import { SwipeIssue } from "~contracts/api";

export type SwipeDirection = 'left' | 'right' | 'up';

export type SwipeActionType = 
    | 'retain'
    | 'delete'
    | 'move-to-sprint';

export type ActionHistoryItem = {
    id: string;
    key: string;
    timestamp: number;
    type: SwipeActionType;
    sprintName?: string;
    disabled?: boolean;
    label?: string;
    issue?: SwipeIssue;
}