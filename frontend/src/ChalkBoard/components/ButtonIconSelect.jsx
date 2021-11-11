import clsx from "clsx";
// TODO: It might be "clever" to add option.icon to the existing component <ButtonSelect />
export const ButtonIconSelect = ({ options, value, onChange, group, }) => (<div className="buttonList buttonListIcon">
    {options.map((option) => (<label key={option.text} className={clsx({ active: value === option.value })} title={option.text}>
        <input type="radio" name={group} onChange={() => onChange(option.value)} checked={value === option.value}/>
        {option.icon}
      </label>))}
  </div>);
