import React, { useEffect, forwardRef } from "react";
import { InitializeApp } from "../../components/InitializeApp";
import App from "../../components/App";
import "../../css/app.scss";
import "../../css/styles.scss";
import { defaultLang } from "../../i18n";
import { DEFAULT_UI_OPTIONS } from "../../constants";
const Excalidraw = (props) => {
    const { onChange, initialData, excalidrawRef, onCollabButtonClick, isCollaborating, onPointerUpdate, renderTopRightUI, renderFooter, langCode = defaultLang.code, viewModeEnabled, zenModeEnabled, gridModeEnabled, libraryReturnUrl, theme, name, renderCustomStats, onPaste, detectScroll = true, handleKeyboardGlobally = false, onLibraryChange, autoFocus = false, generateIdForFile, } = props;
    const canvasActions = props.UIOptions?.canvasActions;
    const UIOptions = {
        canvasActions: {
            ...DEFAULT_UI_OPTIONS.canvasActions,
            ...canvasActions,
        },
    };
    if (canvasActions?.export) {
        UIOptions.canvasActions.export.saveFileToDisk =
            canvasActions.export?.saveFileToDisk ??
                DEFAULT_UI_OPTIONS.canvasActions.export.saveFileToDisk;
    }
    useEffect(() => {
        // Block pinch-zooming on iOS outside of the content area
        const handleTouchMove = (event) => {
            // @ts-ignore
            if (typeof event.scale === "number" && event.scale !== 1) {
                event.preventDefault();
            }
        };
        document.addEventListener("touchmove", handleTouchMove, {
            passive: false,
        });
        return () => {
            document.removeEventListener("touchmove", handleTouchMove);
        };
    }, []);
    return (<InitializeApp langCode={langCode}>
      <App onChange={onChange} initialData={initialData} excalidrawRef={excalidrawRef} onCollabButtonClick={onCollabButtonClick} isCollaborating={isCollaborating} onPointerUpdate={onPointerUpdate} renderTopRightUI={renderTopRightUI} renderFooter={renderFooter} langCode={langCode} viewModeEnabled={viewModeEnabled} zenModeEnabled={zenModeEnabled} gridModeEnabled={gridModeEnabled} libraryReturnUrl={libraryReturnUrl} theme={theme} name={name} renderCustomStats={renderCustomStats} UIOptions={UIOptions} onPaste={onPaste} detectScroll={detectScroll} handleKeyboardGlobally={handleKeyboardGlobally} onLibraryChange={onLibraryChange} autoFocus={autoFocus} generateIdForFile={generateIdForFile}/>
    </InitializeApp>);
};
const areEqual = (prevProps, nextProps) => {
    const { initialData: prevInitialData, UIOptions: prevUIOptions = {}, ...prev } = prevProps;
    const { initialData: nextInitialData, UIOptions: nextUIOptions = {}, ...next } = nextProps;
    // comparing UIOptions
    const prevUIOptionsKeys = Object.keys(prevUIOptions);
    const nextUIOptionsKeys = Object.keys(nextUIOptions);
    if (prevUIOptionsKeys.length !== nextUIOptionsKeys.length) {
        return false;
    }
    const isUIOptionsSame = prevUIOptionsKeys.every((key) => {
        if (key === "canvasActions") {
            const canvasOptionKeys = Object.keys(prevUIOptions.canvasActions);
            canvasOptionKeys.every((key) => {
                if (key === "export" &&
                    prevUIOptions?.canvasActions?.export &&
                    nextUIOptions?.canvasActions?.export) {
                    return (prevUIOptions.canvasActions.export.saveFileToDisk ===
                        nextUIOptions.canvasActions.export.saveFileToDisk);
                }
                return (prevUIOptions?.canvasActions?.[key] ===
                    nextUIOptions?.canvasActions?.[key]);
            });
        }
        return true;
    });
    const prevKeys = Object.keys(prevProps);
    const nextKeys = Object.keys(nextProps);
    return (isUIOptionsSame &&
        prevKeys.length === nextKeys.length &&
        prevKeys.every((key) => prev[key] === next[key]));
};
const forwardedRefComp = forwardRef((props, ref) => <Excalidraw {...props} excalidrawRef={ref}/>);
export default React.memo(forwardedRefComp, areEqual);
export { getSceneVersion, getElementMap, isInvisiblySmallElement, getNonDeletedElements, } from "../../element";
export { defaultLang, languages } from "../../i18n";
export { restore, restoreAppState, restoreElements } from "../../data/restore";
export { exportToCanvas, exportToBlob, exportToSvg, serializeAsJSON, loadLibraryFromBlob, loadFromBlob, getFreeDrawSvgPath, } from "../../packages/utils";
export { isLinearElement } from "../../element/typeChecks";
export { FONT_FAMILY, THEME } from "../../constants";
export { mutateElement, newElementWith, bumpVersion, } from "../../element/mutateElement";
