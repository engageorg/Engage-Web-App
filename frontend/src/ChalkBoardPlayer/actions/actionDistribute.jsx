import { DistributeHorizontallyIcon, DistributeVerticallyIcon, } from "../components/icons";
import { ToolButton } from "../components/ToolButton";
import { distributeElements } from "../disitrubte";
import { getElementMap, getNonDeletedElements } from "../element";
import { t } from "../i18n";
import { CODES } from "../keys";
import { getSelectedElements, isSomeElementSelected } from "../scene";
import { getShortcutKey } from "../utils";
import { register } from "./register";
const enableActionGroup = (elements, appState) => getSelectedElements(getNonDeletedElements(elements), appState).length > 1;
const distributeSelectedElements = (elements, appState, distribution) => {
    const selectedElements = getSelectedElements(getNonDeletedElements(elements), appState);
    const updatedElements = distributeElements(selectedElements, distribution);
    const updatedElementsMap = getElementMap(updatedElements);
    return elements.map((element) => updatedElementsMap[element.id] || element);
};
export const distributeHorizontally = register({
    name: "distributeHorizontally",
    perform: (elements, appState) => {
        return {
            appState,
            elements: distributeSelectedElements(elements, appState, {
                space: "between",
                axis: "x",
            }),
            commitToHistory: true,
        };
    },
    keyTest: (event) => event.altKey && event.code === CODES.H,
    PanelComponent: ({ elements, appState, updateData }) => (<ToolButton hidden={!enableActionGroup(elements, appState)} type="button" icon={<DistributeHorizontallyIcon theme={appState.theme}/>} onClick={() => updateData(null)} title={`${t("labels.distributeHorizontally")} — ${getShortcutKey("Alt+H")}`} aria-label={t("labels.distributeHorizontally")} visible={isSomeElementSelected(getNonDeletedElements(elements), appState)}/>),
});
export const distributeVertically = register({
    name: "distributeVertically",
    perform: (elements, appState) => {
        return {
            appState,
            elements: distributeSelectedElements(elements, appState, {
                space: "between",
                axis: "y",
            }),
            commitToHistory: true,
        };
    },
    keyTest: (event) => event.altKey && event.code === CODES.V,
    PanelComponent: ({ elements, appState, updateData }) => (<ToolButton hidden={!enableActionGroup(elements, appState)} type="button" icon={<DistributeVerticallyIcon theme={appState.theme}/>} onClick={() => updateData(null)} title={`${t("labels.distributeVertically")} — ${getShortcutKey("Alt+V")}`} aria-label={t("labels.distributeVertically")} visible={isSomeElementSelected(getNonDeletedElements(elements), appState)}/>),
});
