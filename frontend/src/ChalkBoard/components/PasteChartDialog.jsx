import oc from "open-color";
import React, { useLayoutEffect, useRef, useState } from "react";
import { trackEvent } from "../analytics";
import { renderSpreadsheet } from "../charts";
import { t } from "../i18n";
import { exportToSvg } from "../scene/export";
import { Dialog } from "./Dialog";
import "./PasteChartDialog.scss";
const ChartPreviewBtn = (props) => {
    const previewRef = useRef(null);
    const [chartElements, setChartElements] = useState(null);
    useLayoutEffect(() => {
        if (!props.spreadsheet) {
            return;
        }
        const elements = renderSpreadsheet(props.chartType, props.spreadsheet, 0, 0);
        setChartElements(elements);
        let svg;
        const previewNode = previewRef.current;
        (async () => {
            svg = await exportToSvg(elements, {
                exportBackground: false,
                viewBackgroundColor: oc.white,
            }, null);
            previewNode.appendChild(svg);
            if (props.selected) {
                previewNode.parentNode.focus();
            }
        })();
        return () => {
            previewNode.removeChild(svg);
        };
    }, [props.spreadsheet, props.chartType, props.selected]);
    return (<button className="ChartPreview" onClick={() => {
            if (chartElements) {
                props.onClick(props.chartType, chartElements);
            }
        }}>
      <div ref={previewRef}/>
    </button>);
};
export const PasteChartDialog = ({ setAppState, appState, onClose, onInsertChart, }) => {
    const handleClose = React.useCallback(() => {
        if (onClose) {
            onClose();
        }
    }, [onClose]);
    const handleChartClick = (chartType, elements) => {
        onInsertChart(elements);
        trackEvent("magic", "chart", chartType);
        setAppState({
            currentChartType: chartType,
            pasteDialog: {
                shown: false,
                data: null,
            },
        });
    };
    return (<Dialog small onCloseRequest={handleClose} title={t("labels.pasteCharts")} className={"PasteChartDialog"} autofocus={false}>
      <div className={"container"}>
        <ChartPreviewBtn chartType="bar" spreadsheet={appState.pasteDialog.data} selected={appState.currentChartType === "bar"} onClick={handleChartClick}/>
        <ChartPreviewBtn chartType="line" spreadsheet={appState.pasteDialog.data} selected={appState.currentChartType === "line"} onClick={handleChartClick}/>
      </div>
    </Dialog>);
};
