import { t } from "../i18n";
import { Dialog } from "./Dialog";
import { ToolButton } from "./ToolButton";
import "./ConfirmDialog.scss";
const ConfirmDialog = (props) => {
    const { onConfirm, onCancel, children, confirmText = t("buttons.confirm"), cancelText = t("buttons.cancel"), className = "", ...rest } = props;
    return (<Dialog onCloseRequest={onCancel} small={true} {...rest} className={`confirm-dialog ${className}`}>
      {children}
      <div className="confirm-dialog-buttons">
        <ToolButton type="button" title={cancelText} aria-label={cancelText} label={cancelText} onClick={onCancel} className="confirm-dialog--cancel"/>
        <ToolButton type="button" title={confirmText} aria-label={confirmText} label={confirmText} onClick={onConfirm} className="confirm-dialog--confirm"/>
      </div>
    </Dialog>);
};
export default ConfirmDialog;
