import "@testing-library/jest-dom";

jest.mock("@atlaskit/pragmatic-drag-and-drop/element/adapter", () => {
  let lastOnDrop: any = null;
  return {
    dropTargetForElements: ({ onDrop }: any) => {
      lastOnDrop = onDrop;
      return () => {};
    },

    draggable: () => {
      return () => {};
    },
  };
});

jest.mock('@compiled/react', () => ({
  cssMap: (styles: any) => {
    const result: Record<string, string> = {};
    for (const key of Object.keys(styles)) result[key] = key;
    return result;
  },
  cx: (...args: any[]) => args.filter(Boolean).join(" "),
}));

jest.mock('@atlaskit/css', () => ({
  cssMap: (styles: any) => {
    const result: any = {};
    for (const key of Object.keys(styles)) result[key] = key;
    return result;
  },
  cx: (...args: any[]) => args.filter(Boolean).join(" "),
}));

jest.mock('@atlaskit/lozenge', () => {
  const React = require("react");
  return function MockLozenge(props: any) {
    return React.createElement("span", {}, props.children);
  };
});

jest.mock("@atlaskit/tooltip", () => {
  const React = require("react");
  return ({ children }: any) =>
    React.createElement("span", {}, children);
});

jest.mock("@atlaskit/badge", () => {
  const React = require("react");
  return ({ children }: any) =>
    React.createElement("span", {}, children);
});

