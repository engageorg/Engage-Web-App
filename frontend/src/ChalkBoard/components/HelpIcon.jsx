import { questionCircle } from "../components/icons";
export const HelpIcon = (props) => (<button className="help-icon" onClick={props.onClick} type="button" title={`${props.title} — ?`} aria-label={props.title}>
    {questionCircle}
  </button>);
