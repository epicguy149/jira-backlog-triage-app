import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { MatrixIssueCard } from "../views/matrix/components/MatrixIssueCard";
import type { PlacementMap } from "../views/matrix/components/types";

const mockIssues = [
  {
    id: "ISS-1",
    key: "ISS-1",
    summary: "Test summary",
    status: "done",
    priorityName: null,
    priorityIconUrl: null,
    assigneeDisplayName: null,
    assigneeAvatarUrl: null,
    issueTypeName: null,
    issueTypeIconUrl: null,
    description: null,
    swiped: false,
  },
  {
    id: "ISS-2",
    key: "ISS-2",
    summary: "Test summary",
    status: "process",
    priorityName: null,
    priorityIconUrl: null,
    assigneeDisplayName: null,
    assigneeAvatarUrl: null,
    issueTypeName: null,
    issueTypeIconUrl: null,
    description: null,
    swiped: false,
  },
];

const mockPlacements: PlacementMap = {
  "ISS-1": { type: "grid", coord: { row: 0, col: 1 } },
  "ISS-2": { type: "grid", coord: { row: 1, col: 0 } },
};

const mockScores = {
  "ISS-1": { score: 10, impact: 8, effort: 3 },
  "ISS-2": { score: 5, impact: 4, effort: 6 },
};

describe("MatrixIssueCard", () => {
  test("Test for issue key and summary", () => {
    render(<MatrixIssueCard issue={mockIssues[0]} location={{ type: "bench" }} />);

    expect(screen.getByText("ISS-1")).toBeInTheDocument();
    expect(screen.getByText("Test summary")).toBeInTheDocument();
  });

  test("Test the correct status for issue 1", () => {
    render(<MatrixIssueCard issue={mockIssues[0]} location={{ type: "bench" }} />);

    expect(screen.getByText("done")).toBeInTheDocument();
  });

  test("Test the correct status for issue 2", () => {
    render(<MatrixIssueCard issue={mockIssues[1]} location={{ type: "bench" }} />);

    expect(screen.getByText("process")).toBeInTheDocument();
  });

  test("Test score is not shows when card in bench", () => {
    render(<MatrixIssueCard issue={mockIssues[0]} location={{ type: "bench" }} />);

    expect(screen.queryByText(/Score/i)).toBeNull();
  });

  test("Test score shows in card 1", () => {
    render(
      <MatrixIssueCard
        issue={mockIssues[0]}
        location={mockPlacements["ISS-1"]}
        score={mockScores["ISS-1"]}
      />
    );
    expect(screen.getByText(/Score\s*10/i)).toBeInTheDocument();
  });

});