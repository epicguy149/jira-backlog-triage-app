import type { SwipeIssue } from '~contracts/api';

export type MatrixCoord = {
	row: number;
	col: number;
};

export type CardLocation =
	| { type: 'bench' }
	| { type: 'grid'; coord: MatrixCoord };

export type PlacementMap = Record<string, CardLocation>;

export type MatrixIssueDragData = {
	type: 'matrix-issue';
	issueId: string;
};

export type MatrixCellDropData = {
	type: 'matrix-cell';
	coord: MatrixCoord;
};

export type MatrixBenchDropData = {
	type: 'matrix-bench';
};

export type MatrixDropTargetData = MatrixCellDropData | MatrixBenchDropData;

export function isMatrixIssueDragData(data: unknown): data is MatrixIssueDragData {
	return (
		typeof data === 'object' &&
		data !== null &&
		'issueId' in data &&
		'type' in data &&
		(data as { type?: unknown }).type === 'matrix-issue' &&
		typeof (data as { issueId?: unknown }).issueId === 'string'
	);
}

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

export type CellIssue = {
	issue: SwipeIssue;
	location: CardLocation;
};
