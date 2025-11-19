import type { SwipeIssue } from '~contracts/api';

// Coordinate of a grid cell, zero indexed
export type MatrixCoord = {
	row: number;
	col: number;
};

// A card can either live on the bench or in a grid cell,
// adapted from the chess drag drop example
export type CardLocation =
	| { type: 'bench' } 
	| { type: 'grid'; coord: MatrixCoord };

// lookup map for placements by issue id
export type PlacementMap = Record<string, CardLocation>;


// tagged on draggable cards
export type MatrixIssueDragData = {
	type: 'matrix-issue';   
	issueId: string;
};

// Metadata tagged on g rid squares
export type MatrixCellDropData = {

	type: 'matrix-cell'; 
	coord: MatrixCoord;
};

// Metadata used for bench drop target
export type MatrixBenchDropData = {

	type: 'matrix-bench';
};

export type MatrixDropTargetData = MatrixCellDropData | MatrixBenchDropData;

export function isMatrixIssueDragData(data: unknown): data is MatrixIssueDragData {
	return (

		typeof data === 'object' &&
		data !== null && 
		'type' in data &&
		(data as { type?: unknown }).type === 'matrix-issue' &&
		typeof (data as { issueId?: unknown }).issueId === 'string' 

	);
}

// guards that make sure the drop metadata we inspect looks like a cell payload.
export function isMatrixCellDropData(data: unknown): data is MatrixCellDropData {
	if (

		typeof data !== 'object' ||
		data === null ||
		!('type' in data) ||
		(data as { type?: unknown }).type !== 'matrix-cell' 
	) {

		return false;  
	}


	const coord = (data as { coord?: unknown }).coord;   

	return (

		typeof coord === 'object' &&
		coord !== null &&
		typeof (coord as { row?: unknown }).row === 'number' &&
		typeof (coord as { col?: unknown }).col === 'number'
	);
}  

export function isMatrixBenchDropData(data: unknown): data is MatrixBenchDropData {  
	return (

		typeof data === 'object' &&
		data !== null && 
		'type' in data &&
		(data as { type?: unknown }).type === 'matrix-bench'
	); 
}

// asdf
export type CellIssue = {
	issue: SwipeIssue;
	location: CardLocation;
};
