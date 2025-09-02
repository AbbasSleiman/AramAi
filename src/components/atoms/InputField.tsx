//InputField
const InputField = ({
  type,
  name,
  placeholder,
  on_change,
  value,
  classname,
}: {
  type: string;
  name: string;
  placeholder: string;
  on_change: React.ChangeEventHandler<HTMLInputElement>;
  value: string | number | readonly string[] | undefined;
  classname?: string;
}) => {
  return (
    <input
      type={type}
      name={name}
      id={name}
      placeholder={placeholder}
      onChange={on_change}
      value={value}
      className={classname}
    />
  );
};

export default InputField;
