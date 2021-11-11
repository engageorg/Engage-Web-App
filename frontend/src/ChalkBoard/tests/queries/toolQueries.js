import { queries, buildQueries } from "@testing-library/react";
const toolMap = {
    selection: "selection",
    rectangle: "rectangle",
    diamond: "diamond",
    ellipse: "ellipse",
    arrow: "arrow",
    line: "line",
    freedraw: "freedraw",
    text: "text",
};
const _getAllByToolName = (container, tool) => {
    const toolTitle = toolMap[tool];
    return queries.getAllByTestId(container, toolTitle);
};
const getMultipleError = (_container, tool) => `Found multiple elements with tool name: ${tool}`;
const getMissingError = (_container, tool) => `Unable to find an element with tool name: ${tool}`;
export const [queryByToolName, getAllByToolName, getByToolName, findAllByToolName, findByToolName,] = buildQueries(_getAllByToolName, getMultipleError, getMissingError);
