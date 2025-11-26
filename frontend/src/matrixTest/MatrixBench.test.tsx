import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MatrixBench } from "../views/matrix/components/MatrixBench";
import type { CardLocation } from "../views/matrix/components/types";
import type { SwipeIssue } from "~contracts/api";

jest.mock("../views/matrix/components/MatrixIssueCard", () => ({
  MatrixIssueCard: ({ issue, location }: any) => (
    <div
      data-testid={`issue-${issue.id}`}
      data-location={location.type}
    >
      {issue.key}
    </div>
  ),
}));

const mockIssues = [
  {
    id: "ISS-1",
    key: "ISS-1",
    summary: "Test summary",
    status: "Done",
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
    status: "Done",
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
    id: "ISS-3",
    key: "ISS-3",
    summary: "Test summary",
    status: "Done",
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
    id: "ISS-4",
    key: "ISS-4",
    summary: "Test summary",
    status: "Done",
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


describe("MatrixBench", () => {
  test("shows empty message when no issues", () => {
    render(<MatrixBench issues={[]} />);

    expect(
      screen.getByText("No cards awaiting placement.")
    ).toBeInTheDocument();
  });

  test("renders all issues passed to the bench", () => {

    render(<MatrixBench issues={mockIssues} />);

    expect(screen.getByTestId("issue-ISS-1")).toBeInTheDocument();
    expect(screen.getByTestId("issue-ISS-2")).toBeInTheDocument();
    expect(screen.getByTestId("issue-ISS-3")).toBeInTheDocument();
    expect(screen.getByTestId("issue-ISS-4")).toBeInTheDocument();
  });

  test("each issue rendered has location=bench", () => {
    render(<MatrixBench issues={mockIssues} />);

    expect(screen.getByTestId("issue-ISS-1")).toHaveAttribute(
      "data-location",
      "bench"
    );
    expect(screen.getByTestId("issue-ISS-2")).toHaveAttribute(
      "data-location",
      "bench"
    );
    expect(screen.getByTestId("issue-ISS-3")).toHaveAttribute(
      "data-location",
      "bench"
    );
    expect(screen.getByTestId("issue-ISS-4")).toHaveAttribute(
      "data-location",
      "bench"
    );
  });
});