import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MatrixMode from "../views/matrix/MatrixMode";
import { act } from "@testing-library/react";


let lastOnDrop: any = null;

jest.mock("@atlaskit/pragmatic-drag-and-drop/element/adapter", () => ({
  dropTargetForElements: ({ onDrop }: any) => {
    lastOnDrop = onDrop;
    return () => {}; // cleanup
  },
  draggable: () => () => {},

  monitorForElements: ({ onDrop }: any) => {
    lastOnDrop = onDrop;
    return () => {}; // cleanup
  },

  // test hook
  __test: {
    getLastOnDrop: () => lastOnDrop,
  },
}));


jest.mock("../api/jira-client", () => ({
  fetchBacklog: jest.fn().mockResolvedValue({
     issues: [
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
      }
    ],
  }),
}));

jest.mock("../hooks/useJiraContext", () => ({
  useJiraContext: () => ({
    boardId: "123",
    isLoading: false,
    error: null
  }),
}));

jest.mock("../app/AppContext", () => ({
  useAppContext: () => ({
    swipePage: { issues: [
      { id: "ISS-1", key: "ISS-1", summary: "Issue 1", status: "done" },
      { id: "ISS-2", key: "ISS-2", summary: "Issue 2", status: "progress" },
      { id: "ISS-3", key: "ISS-3", summary: "Issue 3", status: "progress" }
    ]},
    setSwipePage: jest.fn(),
    isSwipeLoading: false,
    setIsSwipeLoading: jest.fn(),
    swipeError: null,
    setSwipeError: jest.fn(),
    searchQuery: "",
    swipeFilters: []
  })
}));

test("bench shows all issues initially", async () => {
  render(<MatrixMode />);

  // Wait for data to load (because MatrixMode fetches backlog)
  await screen.findByText("Issue 1");
  await screen.findByText("Issue 2");
  await screen.findByText("Issue 3");

  // Find layout container
  const layout = screen.getAllByRole("generic").find(div =>
    div.className.includes("layout")
  ) as HTMLElement;

  // Bench and grid are the two children of layout
  const [benchColumn, gridColumn] = Array.from(layout.children) as HTMLElement[];

  const issue1 = within(benchColumn).getByText("Issue 1").closest("div");
  expect(issue1).not.toBeNull();
  expect(within(issue1!).queryByText(/score/i)).toBeNull();

  const issue2 = within(benchColumn).getByText("Issue 2").closest("div");
  expect(issue2).not.toBeNull();
  expect(within(issue2!).queryByText(/score/i)).toBeNull();

  const issue3 = within(benchColumn).getByText("Issue 3").closest("div");
  expect(issue3).not.toBeNull();
  expect(within(issue3!).queryByText(/score/i)).toBeNull();

  expect(within(gridColumn).queryByText("Issue 1")).toBeNull();
  expect(within(gridColumn).queryByText("Issue 2")).toBeNull();
  expect(within(gridColumn).queryByText("Issue 3")).toBeNull();
});

test("moves one card into the grid and get the correct score", async () => {
  render(<MatrixMode />);

  await screen.findByText("Issue 1");
  await screen.findByText("Issue 2");
  await screen.findByText("Issue 3");

  const onDrop = (require("@atlaskit/pragmatic-drag-and-drop/element/adapter").__test as any).getLastOnDrop();
  expect(onDrop).toBeDefined();

 await dropCard(onDrop, "ISS-1", 0, 0);

  // Find the bench & grid containers
  const layout = screen.getAllByRole("generic").find((div: HTMLElement) =>
    div.className.includes("layout")
  ) as HTMLElement;

  const [benchColumn, gridColumn] = Array.from(layout.children) as HTMLElement[];


  //test issue 1 is removed from bench column
  expect(within(benchColumn).queryByText("Issue 1")).toBeNull();

  //test issue 1 is drop on the grid
  expect(within(gridColumn).getByText("Issue 1")).toBeInTheDocument();

  //test issue 2 and issue 3 is on the bench column
  const issue2 = within(benchColumn).getByText("Issue 2").closest("div");
  expect(within(issue2!).queryByText(/score/i)).toBeNull();
  expect(issue2).not.toBeNull();

  const issue3 = within(benchColumn).getByText("Issue 3").closest("div");
  expect(issue3).not.toBeNull();
  expect(within(issue3!).queryByText(/score/i)).toBeNull();

  //test issue 1 is on 0-0
  const cells = getGridCells(gridColumn);
  const cell00 = cells[0];
  const issue1 = within(cell00).getByText("Issue 1").closest("div");
  expect(issue1).not.toBeNull();

  //test the correct status of issue 1
  expect(within(issue1!).getByText(/done/i)).toBeInTheDocument();
  
  //test issue 1 is get the correct score
  const scoreElement = within(issue1 as HTMLElement).getByText(/Score/i);
  expect(scoreElement).toHaveTextContent(/Score\s*2.4(\.0)?/i);
});

test("moves multiple card into a same grid", async () => {
  render(<MatrixMode />);

  await screen.findByText("Issue 1");
  await screen.findByText("Issue 2");
  await screen.findByText("Issue 3");

  const onDrop = (require("@atlaskit/pragmatic-drag-and-drop/element/adapter").__test as any).getLastOnDrop();
  expect(onDrop).toBeDefined();

  await dropCard(onDrop, "ISS-1", 0, 0);
  await dropCard(onDrop, "ISS-2", 0, 0);

  // Find the bench & grid containers
  const layout = screen.getAllByRole("generic").find((div: HTMLElement) =>
    div.className.includes("layout")
  ) as HTMLElement;

  const [benchColumn, gridColumn] = Array.from(layout.children) as HTMLElement[];


  //test issue 1 and 2 is removed from bench column
  expect(within(benchColumn).queryByText("Issue 1")).toBeNull();
  expect(within(benchColumn).queryByText("Issue 2")).toBeNull();

  //test issue 1 and 2 is drop on the grid
  expect(within(gridColumn).getByText("Issue 1")).toBeInTheDocument();
  expect(within(gridColumn).getByText("Issue 2")).toBeInTheDocument();

  //test issue 3 is on the bench column
  const issue3 = within(benchColumn).getByText("Issue 3").closest("div");
  expect(issue3).not.toBeNull();
  expect(within(issue3!).queryByText(/score/i)).toBeNull();

  //test issue 1 is on 0-0
  const cells = getGridCells(gridColumn);
  const cell00 = cells[0];
  const issue1 = within(cell00).getByText("Issue 1").closest("div");
  expect(issue1).not.toBeNull();
  expect(within(issue1!).getByText(/done/i)).toBeInTheDocument();

  const issue2 = within(cell00).getByText("Issue 2").closest("div");
  expect(issue2).not.toBeNull();
  expect(within(issue2!).getByText(/progress/i)).toBeInTheDocument();

  const scoreElement1 = within(issue1 as HTMLElement).getByText(/Score/i);
  //test issue 1 is get the correct score
  expect(scoreElement1).toHaveTextContent(/Score\s*2.4(\.0)?/i);

  const scoreElement2 = within(issue2 as HTMLElement).getByText(/Score/i);
  //test issue 1 is get the correct score
  expect(scoreElement2).toHaveTextContent(/Score\s*2.4(\.0)?/i);
});

test("moves multiple card into a same grid", async () => {
  render(<MatrixMode />);

  await screen.findByText("Issue 1");
  await screen.findByText("Issue 2");
  await screen.findByText("Issue 3");

  const onDrop = (require("@atlaskit/pragmatic-drag-and-drop/element/adapter").__test as any).getLastOnDrop();
  expect(onDrop).toBeDefined();

  await dropCard(onDrop, "ISS-1", 0, 0);
  await dropCard(onDrop, "ISS-2", 0, 0);

  // Find the bench & grid containers
  const layout = screen.getAllByRole("generic").find((div: HTMLElement) =>
    div.className.includes("layout")
  ) as HTMLElement;

  const [benchColumn, gridColumn] = Array.from(layout.children) as HTMLElement[];


  //test issue 1 and 2 is removed from bench column
  expect(within(benchColumn).queryByText("Issue 1")).toBeNull();
  expect(within(benchColumn).queryByText("Issue 2")).toBeNull();

  //test issue 1 and 2 is drop on the grid
  expect(within(gridColumn).getByText("Issue 1")).toBeInTheDocument();
  expect(within(gridColumn).getByText("Issue 2")).toBeInTheDocument();

  //test issue 3 is on the bench column
  const issue3 = within(benchColumn).getByText("Issue 3").closest("div");
  expect(issue3).not.toBeNull();
  expect(within(issue3!).queryByText(/score/i)).toBeNull();

  //test issue 1 is on 0-0
  const cells = getGridCells(gridColumn);
  const cell00 = cells[0];
  const issue1 = within(cell00).getByText("Issue 1").closest("div");
  expect(issue1).not.toBeNull();
  expect(within(issue1!).getByText(/done/i)).toBeInTheDocument();

  const issue2 = within(cell00).getByText("Issue 2").closest("div");
  expect(issue2).not.toBeNull();
  expect(within(issue2!).getByText(/progress/i)).toBeInTheDocument();

  const scoreElement1 = within(issue1 as HTMLElement).getByText(/Score/i);
  //test issue 1 is get the correct score
  expect(scoreElement1).toHaveTextContent(/Score\s*2.4(\.0)?/i);

  const scoreElement2 = within(issue2 as HTMLElement).getByText(/Score/i);
  //test issue 1 is get the correct score
  expect(scoreElement2).toHaveTextContent(/Score\s*2.4(\.0)?/i);
});

test("test drop a card on bench", async () => {
  render(<MatrixMode />);

  await screen.findByText("Issue 1");
  await screen.findByText("Issue 2");
  await screen.findByText("Issue 3");

  const onDrop = (require("@atlaskit/pragmatic-drag-and-drop/element/adapter").__test as any).getLastOnDrop();
  expect(onDrop).toBeDefined();

  await dropCard(onDrop, "ISS-1", 0, 0);
  await dropCard(onDrop, "ISS-2", 0, 0);

  // Find the bench & grid containers
  const layout = screen.getAllByRole("generic").find((div: HTMLElement) =>
    div.className.includes("layout")
  ) as HTMLElement;

  const [benchColumn, gridColumn] = Array.from(layout.children) as HTMLElement[];


  //test issue 1 and 2 is removed from bench column
  expect(within(benchColumn).queryByText("Issue 1")).toBeNull();
  expect(within(benchColumn).queryByText("Issue 2")).toBeNull();

  //test issue 1 and 2 is drop on the grid
  expect(within(gridColumn).getByText("Issue 1")).toBeInTheDocument();
  expect(within(gridColumn).getByText("Issue 2")).toBeInTheDocument();

  //test issue 3 is on the bench column
  const issue3 = within(benchColumn).getByText("Issue 3").closest("div");
  expect(issue3).not.toBeNull();
  expect(within(issue3!).queryByText(/score/i)).toBeNull();

  //test issue 1 and issue 2 is on 0-0
  const cells = getGridCells(gridColumn);
  const cell00 = cells[0];
  const issue1 = within(cell00).getByText("Issue 1").closest("div");
  expect(issue1).not.toBeNull();
  expect(within(issue1!).getByText(/done/i)).toBeInTheDocument();

  const issue2 = within(cell00).getByText("Issue 2").closest("div");
  expect(issue2).not.toBeNull();
  expect(within(issue2!).getByText(/progress/i)).toBeInTheDocument();

  const scoreElement1 = within(issue1 as HTMLElement).getByText(/Score/i);
  //test issue 1 is get the correct score
  expect(scoreElement1).toHaveTextContent(/Score\s*2.4(\.0)?/i);

  const scoreElement2 = within(issue2 as HTMLElement).getByText(/Score/i);
  //test issue 2 is get the correct score
  expect(scoreElement2).toHaveTextContent(/Score\s*2.4(\.0)?/i);


  //test after drop issue1 to bench
  await dropCardToBench(onDrop, "ISS-1");
  //test Issue 1 in on the benchColum
  const issue1Benched = within(benchColumn).getByText("Issue 1").closest("div");
  expect(issue1Benched).not.toBeNull();

  //test Issue 1 in not on the grid
  expect(within(cell00).queryByText("Issue 1")).toBeNull();
  
  //test Issue 1 do not have score
  expect(within(issue1Benched!).queryByText(/score/i)).toBeNull();

});


test("test with place issue into each grid", async () => {
  render(<MatrixMode />);

  await screen.findByText("Issue 1");
  await screen.findByText("Issue 2");
  await screen.findByText("Issue 3");

  const onDrop = (require("@atlaskit/pragmatic-drag-and-drop/element/adapter").__test as any).getLastOnDrop();
  expect(onDrop).toBeDefined();

  await dropCard(onDrop, "ISS-1", 0, 0);

  // Find the bench & grid containers
  const layout = screen.getAllByRole("generic").find((div: HTMLElement) =>
    div.className.includes("layout")
  ) as HTMLElement;

  const [benchColumn, gridColumn] = Array.from(layout.children) as HTMLElement[];

  //test issue 1 is removed from bench column
  expect(within(benchColumn).queryByText("Issue 1")).toBeNull();

  //test issue 1 is drop on the grid
  expect(within(gridColumn).getByText("Issue 1")).toBeInTheDocument();

  //test issue 2 and 3 is on the bench column
  const issue2 = within(benchColumn).getByText("Issue 2").closest("div");
  expect(issue2).not.toBeNull();
  expect(within(issue2!).queryByText(/score/i)).toBeNull();

  const issue3 = within(benchColumn).getByText("Issue 3").closest("div");
  expect(issue3).not.toBeNull();
  expect(within(issue3!).queryByText(/score/i)).toBeNull();

  //test issue 1 is on 0-0
  const cells = getGridCells(gridColumn);
  const cell00 = cells[0];
  const issue1 = within(cell00).getByText("Issue 1").closest("div");
  expect(issue1).not.toBeNull();
  expect(within(issue1!).getByText(/done/i)).toBeInTheDocument();

  //test issue 1 is get the correct score
  const scoreElement = within(issue1 as HTMLElement).getByText(/Score/i);
  expect(scoreElement).toHaveTextContent(/Score\s*2.4(\.0)?/i);

  //test issue 1 is on 0-1
  await dropCard(onDrop, "ISS-1", 0, 1);
  const cells1 = getGridCells(gridColumn);
  const cell01 = cells1[1];
  const issue1_1 = within(cell01).getByText("Issue 1").closest("div");
  expect(issue1_1).not.toBeNull();
  expect(within(issue1_1!).getByText(/done/i)).toBeInTheDocument();

  const scoreElement1 = within(issue1_1 as HTMLElement).getByText(/Score/i);
  expect(scoreElement1).toHaveTextContent(/Score\s*5.4(\.0)?/i);

  //test issue 1 is on 0-2
  await dropCard(onDrop, "ISS-1", 0, 2);
  const cells2 = getGridCells(gridColumn);
  const cell02 = cells2[2];
  const issue1_2 = within(cell02).getByText("Issue 1").closest("div");
  expect(issue1_2).not.toBeNull();
  expect(within(issue1_2!).getByText(/done/i)).toBeInTheDocument();

  const scoreElement2 = within(issue1_2 as HTMLElement).getByText(/Score/i);
  expect(scoreElement2).toHaveTextContent(/Score\s*9.9(\.0)?/i);

  //test issue 1 is on 0-3
  await dropCard(onDrop, "ISS-1", 0, 3);
  const cells3 = getGridCells(gridColumn);
  const cell03 = cells3[3];
  const issue1_3 = within(cell03).getByText("Issue 1").closest("div");
  expect(issue1_3).not.toBeNull();
  expect(within(issue1_3!).getByText(/done/i)).toBeInTheDocument();

  const scoreElement3 = within(issue1_3 as HTMLElement).getByText(/Score/i);
  expect(scoreElement3).toHaveTextContent(/Score\s*12.9(\.0)?/i);
  
  //test issue 1 is on 1-0
  await dropCard(onDrop, "ISS-1", 1, 0);
  const cells4 = getGridCells(gridColumn);
  const cell04 = cells4[4];
  const issue1_4 = within(cell04).getByText("Issue 1").closest("div");
  expect(issue1_4).not.toBeNull();
  expect(within(issue1_4!).getByText(/done/i)).toBeInTheDocument();

  const scoreElement4 = within(issue1_4 as HTMLElement).getByText(/Score/i);
  expect(scoreElement4).toHaveTextContent(/Score\s*1.0(\.0)?/i);

  //test issue 1 is on 1-1
  await dropCard(onDrop, "ISS-1", 1, 1);
  const cells5 = getGridCells(gridColumn);
  const cell05 = cells5[5];
  const issue1_5 = within(cell05).getByText("Issue 1").closest("div");
  expect(issue1_5).not.toBeNull();
  expect(within(issue1_5!).getByText(/done/i)).toBeInTheDocument();

  const scoreElement5 = within(issue1_5 as HTMLElement).getByText(/Score/i);
  expect(scoreElement5).toHaveTextContent(/Score\s*4.0(\.0)?/i);

  //test issue 1 is on 1-2
  await dropCard(onDrop, "ISS-1", 1, 2);
  const cells6 = getGridCells(gridColumn);
  const cell06 = cells6[6];
  const issue1_6 = within(cell06).getByText("Issue 1").closest("div");
  expect(issue1_6).not.toBeNull();
  expect(within(issue1_6!).getByText(/done/i)).toBeInTheDocument();

  const scoreElement6 = within(issue1_6 as HTMLElement).getByText(/Score/i);
  expect(scoreElement6).toHaveTextContent(/Score\s*8.5(\.0)?/i);

  //test issue 1 is on 1-3
  await dropCard(onDrop, "ISS-1", 1, 3);
  const cells7 = getGridCells(gridColumn);
  const cell07 = cells7[7];
  const issue1_7 = within(cell07).getByText("Issue 1").closest("div");
  expect(issue1_7).not.toBeNull();
  expect(within(issue1_7!).getByText(/done/i)).toBeInTheDocument();

  const scoreElement7 = within(issue1_7 as HTMLElement).getByText(/Score/i);
  expect(scoreElement7).toHaveTextContent(/Score\s*11.5(\.0)?/i);

  //test issue 1 is on 2-0
  await dropCard(onDrop, "ISS-1", 2, 0);
  const cells8 = getGridCells(gridColumn);
  const cell08 = cells8[8];
  const issue1_8 = within(cell08).getByText("Issue 1").closest("div");
  expect(issue1_8).not.toBeNull();
  expect(within(issue1_8!).getByText(/done/i)).toBeInTheDocument();

  const scoreElement8 = within(issue1_8 as HTMLElement).getByText(/Score/i);
  expect(scoreElement8).toHaveTextContent(/Score\s*-1.1(\.0)?/i);

  //test issue 1 is on 2-1
  await dropCard(onDrop, "ISS-1", 2, 1);
  const cells9 = getGridCells(gridColumn);
  const cell09 = cells9[9];
  const issue1_9 = within(cell09).getByText("Issue 1").closest("div");
  expect(issue1_9).not.toBeNull();
  expect(within(issue1_9!).getByText(/done/i)).toBeInTheDocument();

  const scoreElement9 = within(issue1_9 as HTMLElement).getByText(/Score/i);
  expect(scoreElement9).toHaveTextContent(/Score\s*1.9(\.0)?/i);

  //test issue 1 is on 2-2
  await dropCard(onDrop, "ISS-1", 2, 2);
  const cells10 = getGridCells(gridColumn);
  const cell010 = cells10[10];
  const issue1_10 = within(cell010).getByText("Issue 1").closest("div");
  expect(issue1_10).not.toBeNull();
  expect(within(issue1_10!).getByText(/done/i)).toBeInTheDocument();

  const scoreElement10 = within(issue1_10 as HTMLElement).getByText(/Score/i);
  expect(scoreElement10).toHaveTextContent(/Score\s*6.4(\.0)?/i);

  //test issue 1 is on 2-3
  await dropCard(onDrop, "ISS-1", 2, 3);
  const cells11 = getGridCells(gridColumn);
  const cell011 = cells11[11];
  const issue1_11 = within(cell011).getByText("Issue 1").closest("div");
  expect(issue1_11).not.toBeNull();
  expect(within(issue1_11!).getByText(/done/i)).toBeInTheDocument();

  const scoreElement11 = within(issue1_11 as HTMLElement).getByText(/Score/i);
  expect(scoreElement11).toHaveTextContent(/Score\s*9.4(\.0)?/i);

  //test issue 1 is on 3-0
  await dropCard(onDrop, "ISS-1", 3, 0);
  const cells12 = getGridCells(gridColumn);
  const cell012 = cells12[12];
  const issue1_12 = within(cell012).getByText("Issue 1").closest("div");
  expect(issue1_12).not.toBeNull();
  expect(within(issue1_12!).getByText(/done/i)).toBeInTheDocument();

  const scoreElement12 = within(issue1_12 as HTMLElement).getByText(/Score/i);
  expect(scoreElement12).toHaveTextContent(/Score\s*-2.5(\.0)?/i);

  //test issue 1 is on 3-1
  await dropCard(onDrop, "ISS-1", 3, 1);
  const cells13 = getGridCells(gridColumn);
  const cell013 = cells13[13];
  const issue1_13 = within(cell013).getByText("Issue 1").closest("div");
  expect(issue1_13).not.toBeNull();
  expect(within(issue1_13!).getByText(/done/i)).toBeInTheDocument();

  const scoreElement13 = within(issue1_13 as HTMLElement).getByText(/Score/i);
  expect(scoreElement13).toHaveTextContent(/Score\s*0.5(\.0)?/i);

  //test issue 1 is on 3-2
  await dropCard(onDrop, "ISS-1", 3, 2);
  const cells14 = getGridCells(gridColumn);
  const cell014 = cells14[14];
  const issue1_14 = within(cell014).getByText("Issue 1").closest("div");
  expect(issue1_14).not.toBeNull();
  expect(within(issue1_14!).getByText(/done/i)).toBeInTheDocument();

  const scoreElement14 = within(issue1_14 as HTMLElement).getByText(/Score/i);
  expect(scoreElement14).toHaveTextContent(/Score\s*5.0(\.0)?/i);

  //test issue 1 is on 3-3
  await dropCard(onDrop, "ISS-1", 3, 3);
  const cells15 = getGridCells(gridColumn);
  const cell015 = cells15[15];
  const issue1_15 = within(cell015).getByText("Issue 1").closest("div");
  expect(issue1_15).not.toBeNull();
  expect(within(issue1_15!).getByText(/done/i)).toBeInTheDocument();

  const scoreElement15= within(issue1_15 as HTMLElement).getByText(/Score/i);
  expect(scoreElement15).toHaveTextContent(/Score\s*8.0(\.0)?/i);
});

test("test with multiple card in each grid", async () => {
  render(<MatrixMode />);

  await screen.findByText("Issue 1");
  await screen.findByText("Issue 2");
  await screen.findByText("Issue 3");

  const onDrop = (require("@atlaskit/pragmatic-drag-and-drop/element/adapter").__test as any).getLastOnDrop();
  expect(onDrop).toBeDefined();

  await dropCard(onDrop, "ISS-1", 0, 0);
  await dropCard(onDrop, "ISS-2", 0, 0);

  // Find the bench & grid containers
  const layout = screen.getAllByRole("generic").find((div: HTMLElement) =>
    div.className.includes("layout")
  ) as HTMLElement;

  const [benchColumn, gridColumn] = Array.from(layout.children) as HTMLElement[];

  //test issue 1 and 2 is removed from bench column
  expect(within(benchColumn).queryByText("Issue 1")).toBeNull();
  expect(within(benchColumn).queryByText("Issue 2")).toBeNull();

  //test issue 1 and 2 is drop on the grid
  expect(within(gridColumn).getByText("Issue 1")).toBeInTheDocument();
  expect(within(gridColumn).getByText("Issue 2")).toBeInTheDocument();

  //test issue 3 is on the bench column
  const issue3 = within(benchColumn).getByText("Issue 3").closest("div");
  expect(issue3).not.toBeNull();
  expect(within(issue3!).queryByText(/score/i)).toBeNull();

  //test issue 1 and issue 2 is on 0-0
  const cells = getGridCells(gridColumn);
  const cell00 = cells[0];
  const issue1 = within(cell00).getByText("Issue 1").closest("div");
  const issue2 = within(cell00).getByText("Issue 2").closest("div");
  expect(issue1).not.toBeNull();
  expect(issue2).not.toBeNull();
  expect(within(issue1!).getByText(/done/i)).toBeInTheDocument();
  expect(within(issue2!).getByText(/progress/i)).toBeInTheDocument();

  //test issue 1 adn 2 is get the correct score
  const scoreElementIssue1 = within(issue1 as HTMLElement).getByText(/Score/i);
  expect(scoreElementIssue1).toHaveTextContent(/Score\s*2.4(\.0)?/i);

  const scoreElementIssue2 = within(issue1 as HTMLElement).getByText(/Score/i);
  expect(scoreElementIssue2).toHaveTextContent(/Score\s*2.4(\.0)?/i);

  //test issue 1 and issue 2 is on 0-1
  await dropCard(onDrop, "ISS-1", 0, 1);
  await dropCard(onDrop, "ISS-2", 0, 1);
  const cells1 = getGridCells(gridColumn);
  const cell01 = cells1[1];
  const issue1_1 = within(cell01).getByText("Issue 1").closest("div");
  const issue2_1 = within(cell01).getByText("Issue 2").closest("div");
  expect(issue1_1).not.toBeNull();
  expect(issue2_1).not.toBeNull();
  expect(within(issue1_1!).getByText(/done/i)).toBeInTheDocument();
  expect(within(issue2_1!).getByText(/progress/i)).toBeInTheDocument();

  const scoreElementIssue1_1 = within(issue1_1 as HTMLElement).getByText(/Score/i);
  expect(scoreElementIssue1_1).toHaveTextContent(/Score\s*5.4(\.0)?/i);

  const scoreElementIssue2_1 = within(issue2_1 as HTMLElement).getByText(/Score/i);
  expect(scoreElementIssue2_1).toHaveTextContent(/Score\s*5.4(\.0)?/i);

  //test issue 1 is on 0-2
  await dropCard(onDrop, "ISS-1", 0, 2);
  await dropCard(onDrop, "ISS-2", 0, 2);
  const cells2 = getGridCells(gridColumn);
  const cell02 = cells2[2];
  const issue1_2 = within(cell02).getByText("Issue 1").closest("div");
  const issue2_2 = within(cell02).getByText("Issue 2").closest("div");
  expect(issue1_2).not.toBeNull();
  expect(issue2_2).not.toBeNull();
  expect(within(issue1_2!).getByText(/done/i)).toBeInTheDocument();
  expect(within(issue2_2!).getByText(/progress/i)).toBeInTheDocument();

  const scoreElementIssue1_2 = within(issue1_2 as HTMLElement).getByText(/Score/i);
  expect(scoreElementIssue1_2).toHaveTextContent(/Score\s*9.9(\.0)?/i);

  const scoreElementIssue2_2 = within(issue2_2 as HTMLElement).getByText(/Score/i);
  expect(scoreElementIssue2_2).toHaveTextContent(/Score\s*9.9(\.0)?/i);


  //test issue 1 is on 0-3
  await dropCard(onDrop, "ISS-1", 0, 3);
  await dropCard(onDrop, "ISS-2", 0, 3);
  const cells3 = getGridCells(gridColumn);
  const cell03 = cells3[3];
  const issue1_3 = within(cell03).getByText("Issue 1").closest("div");
  const issue2_3 = within(cell03).getByText("Issue 2").closest("div");
  expect(issue1_3).not.toBeNull();
  expect(issue2_3).not.toBeNull();
  expect(within(issue1_3!).getByText(/done/i)).toBeInTheDocument();
  expect(within(issue2_3!).getByText(/progress/i)).toBeInTheDocument();

  const scoreElementIssue1_3 = within(issue1_3 as HTMLElement).getByText(/Score/i);
  expect(scoreElementIssue1_3).toHaveTextContent(/Score\s*12.9(\.0)?/i);

  const scoreElementIssue2_3 = within(issue2_3 as HTMLElement).getByText(/Score/i);
  expect(scoreElementIssue2_3).toHaveTextContent(/Score\s*12.9(\.0)?/i);
  
  //test issue 1 is on 1-0
  await dropCard(onDrop, "ISS-1", 1, 0);
  await dropCard(onDrop, "ISS-2", 1, 0);
  const cells4 = getGridCells(gridColumn);
  const cell04 = cells4[4];
  const issue1_4 = within(cell04).getByText("Issue 1").closest("div");
  const issue2_4 = within(cell04).getByText("Issue 2").closest("div");
  expect(issue1_4).not.toBeNull();
  expect(issue2_4).not.toBeNull();
  expect(within(issue1_4!).getByText(/done/i)).toBeInTheDocument();
  expect(within(issue2_4!).getByText(/progress/i)).toBeInTheDocument();

  const scoreElementIssue1_4 = within(issue1_4 as HTMLElement).getByText(/Score/i);
  expect(scoreElementIssue1_4).toHaveTextContent(/Score\s*1.0(\.0)?/i);

  const scoreElementIssue2_4 = within(issue2_4 as HTMLElement).getByText(/Score/i);
  expect(scoreElementIssue2_4).toHaveTextContent(/Score\s*1.0(\.0)?/i);

  //test issue 1 is on 1-1
  await dropCard(onDrop, "ISS-1", 1, 1);
  await dropCard(onDrop, "ISS-2", 1, 1);
  const cells5 = getGridCells(gridColumn);
  const cell05 = cells5[5];
  const issue1_5 = within(cell05).getByText("Issue 1").closest("div");
  const issue2_5 = within(cell05).getByText("Issue 2").closest("div");
  expect(issue1_5).not.toBeNull();
  expect(issue2_5).not.toBeNull();
  expect(within(issue1_5!).getByText(/done/i)).toBeInTheDocument();
  expect(within(issue2_5!).getByText(/progress/i)).toBeInTheDocument();

  const scoreElementIssue1_5 = within(issue1_5 as HTMLElement).getByText(/Score/i);
  expect(scoreElementIssue1_5).toHaveTextContent(/Score\s*4.0(\.0)?/i);

  const scoreElementIssue2_5 = within(issue2_5 as HTMLElement).getByText(/Score/i);
  expect(scoreElementIssue2_5).toHaveTextContent(/Score\s*4.0(\.0)?/i);

  //test issue 1 is on 1-2
  await dropCard(onDrop, "ISS-1", 1, 2);
  await dropCard(onDrop, "ISS-2", 1, 2);
  const cells6 = getGridCells(gridColumn);
  const cell06 = cells6[6];
  const issue1_6 = within(cell06).getByText("Issue 1").closest("div");
  const issue2_6 = within(cell06).getByText("Issue 2").closest("div");
  expect(issue1_6).not.toBeNull();
  expect(issue2_6).not.toBeNull();
  expect(within(issue1_6!).getByText(/done/i)).toBeInTheDocument();
  expect(within(issue2_6!).getByText(/progress/i)).toBeInTheDocument();

  const scoreElementIssue1_6 = within(issue1_6 as HTMLElement).getByText(/Score/i);
  expect(scoreElementIssue1_6).toHaveTextContent(/Score\s*8.5(\.0)?/i);

  const scoreElementIssue2_6 = within(issue2_6 as HTMLElement).getByText(/Score/i);
  expect(scoreElementIssue2_6).toHaveTextContent(/Score\s*8.5(\.0)?/i);

  //test issue 1 is on 1-3
  await dropCard(onDrop, "ISS-1", 1, 3);
  await dropCard(onDrop, "ISS-2", 1, 3);
  const cells7 = getGridCells(gridColumn);
  const cell07 = cells7[7];
  const issue1_7 = within(cell07).getByText("Issue 1").closest("div");
  const issue2_7 = within(cell07).getByText("Issue 2").closest("div");
  expect(issue1_7).not.toBeNull();
  expect(issue2_7).not.toBeNull();
  expect(within(issue1_7!).getByText(/done/i)).toBeInTheDocument();
  expect(within(issue2_7!).getByText(/progress/i)).toBeInTheDocument();

  const scoreElementIssue1_7 = within(issue1_7 as HTMLElement).getByText(/Score/i);
  expect(scoreElementIssue1_7).toHaveTextContent(/Score\s*11.5(\.0)?/i);

  const scoreElementIssue2_7 = within(issue2_7 as HTMLElement).getByText(/Score/i);
  expect(scoreElementIssue2_7).toHaveTextContent(/Score\s*11.5(\.0)?/i);

  //test issue 1 is on 2-0
  await dropCard(onDrop, "ISS-1", 2, 0);
  await dropCard(onDrop, "ISS-2", 2, 0);
  const cells8 = getGridCells(gridColumn);
  const cell08 = cells8[8];
  const issue1_8 = within(cell08).getByText("Issue 1").closest("div");
  const issue2_8 = within(cell08).getByText("Issue 2").closest("div");
  expect(issue1_8).not.toBeNull();
  expect(issue2_8).not.toBeNull();
  expect(within(issue1_8!).getByText(/done/i)).toBeInTheDocument();
  expect(within(issue2_8!).getByText(/progress/i)).toBeInTheDocument();

  const scoreElementIssue1_8 = within(issue1_8 as HTMLElement).getByText(/Score/i);
  expect(scoreElementIssue1_8).toHaveTextContent(/Score\s*-1.1(\.0)?/i);

  const scoreElementIssue2_8 = within(issue2_8 as HTMLElement).getByText(/Score/i);
  expect(scoreElementIssue2_8).toHaveTextContent(/Score\s*-1.1(\.0)?/i);

  //test issue 1 is on 2-1
  await dropCard(onDrop, "ISS-1", 2, 1);
  await dropCard(onDrop, "ISS-2", 2, 1);
  const cells9 = getGridCells(gridColumn);
  const cell09 = cells9[9];
  const issue1_9 = within(cell09).getByText("Issue 1").closest("div");
  const issue2_9 = within(cell09).getByText("Issue 2").closest("div");
  expect(issue1_9).not.toBeNull();
  expect(issue2_9).not.toBeNull();
  expect(within(issue1_9!).getByText(/done/i)).toBeInTheDocument();
  expect(within(issue2_9!).getByText(/progress/i)).toBeInTheDocument();

  const scoreElementIssue1_9 = within(issue1_9 as HTMLElement).getByText(/Score/i);
  expect(scoreElementIssue1_9).toHaveTextContent(/Score\s*1.9(\.0)?/i);

  const scoreElementIssue2_9 = within(issue2_9 as HTMLElement).getByText(/Score/i);
  expect(scoreElementIssue2_9).toHaveTextContent(/Score\s*1.9(\.0)?/i);

  //test issue 1 is on 2-2
  await dropCard(onDrop, "ISS-1", 2, 2);
  await dropCard(onDrop, "ISS-2", 2, 2);
  const cells10 = getGridCells(gridColumn);
  const cell10 = cells10[10];
  const issue1_10 = within(cell10).getByText("Issue 1").closest("div");
  const issue2_10 = within(cell10).getByText("Issue 2").closest("div");
  expect(issue1_10).not.toBeNull();
  expect(issue2_10).not.toBeNull();
  expect(within(issue1_10!).getByText(/done/i)).toBeInTheDocument();
  expect(within(issue2_10!).getByText(/progress/i)).toBeInTheDocument();

  const scoreElementIssue1_10 = within(issue1_10 as HTMLElement).getByText(/Score/i);
  expect(scoreElementIssue1_10).toHaveTextContent(/Score\s*6.4(\.0)?/i);

  const scoreElementIssue2_10 = within(issue2_10 as HTMLElement).getByText(/Score/i);
  expect(scoreElementIssue2_10).toHaveTextContent(/Score\s*6.4(\.0)?/i);

  //test issue 1 is on 2-3
  await dropCard(onDrop, "ISS-1", 2, 3);
  await dropCard(onDrop, "ISS-2", 2, 3);
  const cells11 = getGridCells(gridColumn);
  const cell11 = cells11[11];
  const issue1_11 = within(cell11).getByText("Issue 1").closest("div");
  const issue2_11 = within(cell11).getByText("Issue 2").closest("div");
  expect(issue1_11).not.toBeNull();
  expect(issue2_11).not.toBeNull();
  expect(within(issue1_11!).getByText(/done/i)).toBeInTheDocument();
  expect(within(issue2_11!).getByText(/progress/i)).toBeInTheDocument();

  const scoreElementIssue1_11 = within(issue1_11 as HTMLElement).getByText(/Score/i);
  expect(scoreElementIssue1_11).toHaveTextContent(/Score\s*9.4(\.0)?/i);

  const scoreElementIssue2_11 = within(issue2_11 as HTMLElement).getByText(/Score/i);
  expect(scoreElementIssue2_11).toHaveTextContent(/Score\s*9.4(\.0)?/i);

  //test issue 1 is on 3-0

  await dropCard(onDrop, "ISS-1", 3, 0);
  await dropCard(onDrop, "ISS-2", 3, 0);
  const cells12 = getGridCells(gridColumn);
  const cell12 = cells12[12];
  const issue1_12 = within(cell12).getByText("Issue 1").closest("div");
  const issue2_12 = within(cell12).getByText("Issue 2").closest("div");
  expect(issue1_12).not.toBeNull();
  expect(issue2_12).not.toBeNull();
  expect(within(issue1_12!).getByText(/done/i)).toBeInTheDocument();
  expect(within(issue2_12!).getByText(/progress/i)).toBeInTheDocument();

  const scoreElementIssue1_12 = within(issue1_12 as HTMLElement).getByText(/Score/i);
  expect(scoreElementIssue1_12).toHaveTextContent(/Score\s*-2.5(\.0)?/i);

  const scoreElementIssue2_12 = within(issue2_12 as HTMLElement).getByText(/Score/i);
  expect(scoreElementIssue2_12).toHaveTextContent(/Score\s*-2.5(\.0)?/i);

  //test issue 1 is on 3-1
  await dropCard(onDrop, "ISS-1", 3, 1);
  await dropCard(onDrop, "ISS-2", 3, 1);
  const cells13 = getGridCells(gridColumn);
  const cell13 = cells13[13];
  const issue1_13 = within(cell13).getByText("Issue 1").closest("div");
  const issue2_13 = within(cell13).getByText("Issue 2").closest("div");
  expect(issue1_13).not.toBeNull();
  expect(issue2_13).not.toBeNull();
  expect(within(issue1_13!).getByText(/done/i)).toBeInTheDocument();
  expect(within(issue2_13!).getByText(/progress/i)).toBeInTheDocument();

  const scoreElementIssue1_13 = within(issue1_13 as HTMLElement).getByText(/Score/i);
  expect(scoreElementIssue1_13).toHaveTextContent(/Score\s*0.5(\.0)?/i);

  const scoreElementIssue2_13 = within(issue2_13 as HTMLElement).getByText(/Score/i);
  expect(scoreElementIssue1_13).toHaveTextContent(/Score\s*0.5(\.0)?/i);

  //test issue 1 is on 3-2
  await dropCard(onDrop, "ISS-1", 3, 2);
  await dropCard(onDrop, "ISS-2", 3, 2);
  const cells14 = getGridCells(gridColumn);
  const cell14 = cells14[14];
  const issue1_14 = within(cell14).getByText("Issue 1").closest("div");
  const issue2_14 = within(cell14).getByText("Issue 2").closest("div");
  expect(issue1_14).not.toBeNull();
  expect(issue2_14).not.toBeNull();
  expect(within(issue1_14!).getByText(/done/i)).toBeInTheDocument();
  expect(within(issue2_14!).getByText(/progress/i)).toBeInTheDocument();

  const scoreElementIssue1_14 = within(issue1_14 as HTMLElement).getByText(/Score/i);
  expect(scoreElementIssue1_14).toHaveTextContent(/Score\s*5.0(\.0)?/i);

  const scoreElementIssue2_14 = within(issue2_14 as HTMLElement).getByText(/Score/i);
  expect(scoreElementIssue2_14).toHaveTextContent(/Score\s*5.0(\.0)?/i);

  //test issue 1 is on 3-3
  await dropCard(onDrop, "ISS-1", 3, 3);
  await dropCard(onDrop, "ISS-2", 3, 3);
  const cells15 = getGridCells(gridColumn);
  const cell15 = cells15[15];
  const issue1_15 = within(cell15).getByText("Issue 1").closest("div");
  const issue2_15 = within(cell15).getByText("Issue 2").closest("div");
  expect(issue1_15).not.toBeNull();
  expect(issue2_15).not.toBeNull();
  expect(within(issue1_15!).getByText(/done/i)).toBeInTheDocument();
  expect(within(issue2_15!).getByText(/progress/i)).toBeInTheDocument();

  const scoreElementIssue1_15 = within(issue1_15 as HTMLElement).getByText(/Score/i);
  expect(scoreElementIssue1_15).toHaveTextContent(/Score\s*8.0(\.0)?/i);

  const scoreElementIssue2_15 = within(issue2_15 as HTMLElement).getByText(/Score/i);
  expect(scoreElementIssue2_15).toHaveTextContent(/Score\s*8.0(\.0)?/i);
});



//helper functions
async function dropCard(onDrop: any, issueId: string, row: number, col: number ) {
  await act(async () => {
    await onDrop({
      source: {
        data: {
          type: "matrix-issue",
          issueId,
        },
      },
      location: {
        current: {
          dropTargets: [
            {
              data: {
                type: "matrix-cell",
                coord: { row: row, col: col },
              },
            },
          ],
        },
      },
    });
  });
}

async function dropCardToBench(onDrop: any, issueId: string) {
  await act(async () => {
    await onDrop({
      source: {
        data: {
          type: "matrix-issue",
          issueId,
        },
      },
      location: {
        current: {
          dropTargets: [
            {
              data: {
                type: "matrix-bench", // this triggers return to bench
              },
            },
          ],
        },
      },
    });
  });
}

function getGridCells(gridColumn: HTMLElement) {
  return Array.from(
    gridColumn.querySelectorAll("div[class*='cell']")
  ) as HTMLElement[];
}