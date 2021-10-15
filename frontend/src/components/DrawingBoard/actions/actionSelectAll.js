import { META_KEY } from "../keys";
export const actionSelectAll = {
    name: "selectAll",
    perform: elements => {
        return {
            elements: elements.map(elem => ({ ...elem, isSelected: true }))
        };
    },
    contextItemLabel: "Select All",
    keyTest: event => event[META_KEY] && event.code === "KeyA"
};
