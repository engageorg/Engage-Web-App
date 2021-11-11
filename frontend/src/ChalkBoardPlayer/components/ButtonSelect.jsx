import clsx from "clsx";
export const ButtonSelect = ({ options, value, onChange, group, }) => (<div className="buttonList">
    {options.map((option) => (<label key={option.text} className={clsx({ active: value === option.value })}>
        <input type="radio" name={group} onChange={() => onChange(option.value)} checked={value === option.value}/>
        {option.text}
      </label>))}
  </div>);
