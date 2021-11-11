import clsx from "clsx";
export const ButtonIconCycle = ({ options, value, onChange, group, }) => {
    const current = options.find((op) => op.value === value);
    const cycle = () => {
        const index = options.indexOf(current);
        const next = (index + 1) % options.length;
        onChange(options[next].value);
    };
    return (<label key={group} className={clsx({ active: current.value !== null })}>
      <input type="button" name={group} onClick={cycle}/>
      {current.icon}
    </label>);
};
