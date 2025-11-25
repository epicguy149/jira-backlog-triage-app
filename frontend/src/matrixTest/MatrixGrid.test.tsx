import { render, screen } from "@testing-library/react";
import { MatrixGrid } from "../views/matrix/components/MatrixGrid";
import "@testing-library/jest-dom";
import type { PlacementMap } from "../views/matrix/components/types";
import type { SwipeIssue } from "~contracts/api";
import type { MatrixCoord } from "../views/matrix/components/types";

jest.mock("../views/matrix/components/MatrixIssueCard", () => {
  const React = require("react");

  return {
    MatrixIssueCard: ({
      issue,
      location,
    }: {
      issue: SwipeIssue;
      location: { type: "grid"; coord: MatrixCoord };
    }) =>
      React.createElement(
        "div",
        {
          "data-testid": `issue-${issue.id}`,
          "data-cell": `${location.coord.row}-${location.coord.col}`,
        },
        issue.key
      ),
  };
});

const mockIssues = [
  {
    id: "ISS-1",
    key: "ISS-1",
    summary: "Test summary",
    status: "done",
    priorityName: null,
    priorityIconUrl: null,
    priorityId: null,         // NEW
    assigneeDisplayName: null,
    assigneeAvatarUrl: null,
    issueTypeName: null,
    issueTypeIconUrl: null,
    epicKey: null,            // NEW
    epicSummary: null,        // NEW
    epicColor: null,          // NEW
    description: null,
    storyPoints: null,        // NEW
    swiped: false,
  },
  {
    id: "ISS-2",
    key: "ISS-2",
    summary: "Test summary",
    status: "done",
    priorityName: null,
    priorityIconUrl: null,
    priorityId: null,         // NEW
    assigneeDisplayName: null,
    assigneeAvatarUrl: null,
    issueTypeName: null,
    issueTypeIconUrl: null,
    epicKey: null,            // NEW
    epicSummary: null,        // NEW
    epicColor: null,          // NEW
    description: null,
    storyPoints: null,        // NEW
    swiped: false,
  },
  {
    id: "ISS-3",
    key: "ISS-3",
    summary: "Test summary",
    status: "done",
    priorityName: null,
    priorityIconUrl: null,
    priorityId: null,         // NEW
    assigneeDisplayName: null,
    assigneeAvatarUrl: null,
    issueTypeName: null,
    issueTypeIconUrl: null,
    epicKey: null,            // NEW
    epicSummary: null,        // NEW
    epicColor: null,          // NEW
    description: null,
    storyPoints: null,        // NEW
    swiped: false,
  },
  {
    id: "ISS-4",
    key: "ISS-4",
    summary: "Test summary",
    status: "done",
    priorityName: null,
    priorityIconUrl: null,
    priorityId: null,         // NEW
    assigneeDisplayName: null,
    assigneeAvatarUrl: null,
    issueTypeName: null,
    issueTypeIconUrl: null,
    epicKey: null,            // NEW
    epicSummary: null,        // NEW
    epicColor: null,          // NEW
    description: null,
    storyPoints: null,        // NEW
    swiped: false,
  },
];

const mockPlacements: PlacementMap = {
  "ISS-1": { type: "grid", coord: { row: 0, col: 1 } },
  "ISS-2": { type: "grid", coord: { row: 1, col: 0 } },
};

const mockPlacementsIntheSameGrid: PlacementMap = {
  "ISS-1": { type: "grid", coord: { row: 0, col: 1 } },
  "ISS-2": { type: "grid", coord: { row: 0, col: 1 } },
}

const mockPlacementsInEverySingleGrid: PlacementMap = {
  "ISS-1": { type: "grid", coord: { row: 0, col: 0 } },
  "ISS-2": { type: "grid", coord: { row: 0, col: 1 } },
  "ISS-3": { type: "grid", coord: { row: 1, col: 0 } },
  "ISS-4": { type: "grid", coord: { row: 1, col: 1 } },
}



const mockScores = {
  "ISS-1": { score: 10, impact: 8, effort: 3 },
  "ISS-2": { score: 5, impact: 4, effort: 6 },
  "ISS-3": { score: 10, impact: 8, effort: 3 },
  "ISS-4": { score: 5, impact: 4, effort: 6 },
};

describe("MatrixGrid", () => {
  test("Create labels correctly", () => {
    render(
      <MatrixGrid
        gridSize={4}
        issues={mockIssues}
        placements={mockPlacements}
        scores={mockScores}
      />
    );

    expect(screen.getByText("Most Impact")).toBeInTheDocument();
    expect(screen.getByText("Least Impact")).toBeInTheDocument();
    expect(screen.getByText("Most Effort")).toBeInTheDocument();
    expect(screen.getByText("Least Effort")).toBeInTheDocument();
  });

  test("places issues into correct grid cells based on placements", () => {
    render(
      <MatrixGrid
        gridSize={4}
        issues={mockIssues}
        placements={mockPlacements}
        scores={mockScores}
      />
    );

    // Check cell location for issue ISS-1
    const card1 = screen.getByTestId("issue-ISS-1");
    expect(card1).toBeInTheDocument();
    expect(card1.getAttribute("data-cell")).toBe("0-1");

    // Check cell location for issue ISS-2
    const card2 = screen.getByTestId("issue-ISS-2");
    expect(card2).toBeInTheDocument();
    expect(card2.getAttribute("data-cell")).toBe("1-0");
  });

  test("test mutiple cards in the same grid", () => {
    render(
      <MatrixGrid
        gridSize={4}
        issues={mockIssues}
        placements={mockPlacementsIntheSameGrid}
        scores={mockScores}
      />
    );

    const card1 = screen.getByTestId("issue-ISS-1");
    const card2 = screen.getByTestId("issue-ISS-2");

    expect(card1.parentElement).toBe(card2.parentElement);
  });

  test("test with no card in the grid", () => {
    render(
      <MatrixGrid
        gridSize={2}
        issues={mockIssues}
        placements={mockPlacementsInEverySingleGrid}
        scores={mockScores}
      />
    );

    const card1 = screen.getByTestId("issue-ISS-1");
    expect(card1).toBeInTheDocument();
    expect(card1.getAttribute("data-cell")).toBe("0-0");

    // Check cell location for issue ISS-2
    const card2 = screen.getByTestId("issue-ISS-2");
    expect(card2).toBeInTheDocument();
    expect(card2.getAttribute("data-cell")).toBe("0-1");

    const card3 = screen.getByTestId("issue-ISS-3");
    expect(card3).toBeInTheDocument();
    expect(card3.getAttribute("data-cell")).toBe("1-0");

    const card4 = screen.getByTestId("issue-ISS-4");
    expect(card4).toBeInTheDocument();
    expect(card4.getAttribute("data-cell")).toBe("1-1");
  });
});
