import clsx from "clsx";
import { ToolButton } from "./ToolButton";
import { t } from "../i18n";
import { useIsMobile } from "../components/App";
import { users } from "./icons";
import "./CollabButton.scss";
const CollabButton = ({ isCollaborating, collaboratorCount, onClick, }) => {
    return (<>
      {/* <ToolButton className={clsx("CollabButton", {
            "is-collaborating": isCollaborating,
        })} onClick={onClick} icon={users} type="button" title={t("labels.liveCollaboration")} aria-label={t("labels.liveCollaboration")} showAriaLabel={useIsMobile()}>
        {collaboratorCount > 0 && (<div className="CollabButton-collaborators">{collaboratorCount}</div>)}
      </ToolButton> */}
    </>);
};
export default CollabButton;
