import "@testing-library/jest-dom";

jest.mock("tiny-invariant", () => ({
  __esModule: true,
  default: (cond: any, msg?: string) => {
    if (!cond) throw new Error(msg || "invariant failed");
  },
}));


jest.mock("@atlaskit/pragmatic-drag-and-drop/element/adapter", () => ({

  dropTargetForElements: ({ onDrop }: any) => {
    return () => {};
  },

  draggable: () => () => {},

}));

const mockCssMap = (styles: any) =>
  Object.fromEntries(Object.keys(styles).map(k => [k, k]));

jest.mock("@compiled/react", () => ({
  __esModule: true,
  cssMap: mockCssMap,
  cx: (...args: any[]) => args.filter(Boolean).join(" "),
}));

jest.mock("@atlaskit/css", () => ({
  __esModule: true,
  cssMap: mockCssMap,
  cx: (...args: any[]) => args.filter(Boolean).join(" "),
}));

const cleanProps = (props: any) => {
  const nonDomProps = new Set([
    "alignBlock",
    "alignInline",
    "templateColumns",
    "templateRows",
    "columnGap",
    "rowGap",
    "space",
    "paddingInline",
    "paddingBlock",
    "xcss",
  ]);

  const out: any = {};
  for (const key of Object.keys(props)) {
    if (!nonDomProps.has(key)) out[key] = props[key];
  }
  return out;
};

jest.mock("@atlaskit/primitives", () => {
  const React = require("react");

  const passthrough = (Tag: string) =>
    React.forwardRef((props: any, ref: any) => {
      const cleaned = cleanProps(props);

      const xcssClass =
        props.xcss && typeof props.xcss === "object"
          ? Object.keys(props.xcss).join(" ")
          : props.xcss || "";

      const merged = [props.className, xcssClass]
        .filter(Boolean)
        .join(" ");

      return React.createElement(
        Tag,
        { ...cleaned, ref, className: merged },
        props.children
      );
    });

  return {
    __esModule: true,
    Box: passthrough("div"),
    Stack: passthrough("div"),
    Grid: passthrough("div"),
    Inline: passthrough("div"),
    Text: passthrough("span"),
    xcss: (obj: any) => obj,

    default: new Proxy(
      {},
      { get: () => passthrough("div") }
    ),
  };
});

jest.mock("@atlaskit/heading", () => {
  const React = require("react");
  const H = ({ children }: any) => React.createElement("h3", {}, children);

  return {
    __esModule: true,
    default: H,
    Heading: H,
  };
});

jest.mock("@atlaskit/badge", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: ({ children }: any) => React.createElement("span", {}, children),
  };
});

jest.mock("@atlaskit/lozenge", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: ({ children }: any) => React.createElement("span", {}, children),
  };
});

jest.mock("@atlaskit/tooltip", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: ({ children }: any) =>
      React.createElement("span", {}, children),
  };
});

jest.mock("@atlaskit/tokens", () => ({
  __esModule: true,
  token: () => "",
}));
