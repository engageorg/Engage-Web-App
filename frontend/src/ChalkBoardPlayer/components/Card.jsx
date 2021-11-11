import OpenColor from "open-color";
import "./Card.scss";
export const Card = ({ children, color }) => {
    return (<div className="Card" style={{
            ["--card-color"]: OpenColor[color][7],
            ["--card-color-darker"]: OpenColor[color][8],
            ["--card-color-darkest"]: OpenColor[color][9],
        }}>
      {children}
    </div>);
};
