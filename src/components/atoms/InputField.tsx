// InputField
const InputField = ({
  type,
  name,
  placeholder,
  on_change,
  value,
  classname = "",
  disabled = false,
}: {
  type: string;
  name: string;
  placeholder?: string;
  on_change: React.ChangeEventHandler<HTMLInputElement>;
  value?: string | number;
  classname?: string;
  disabled?: boolean;
}) => {
  return (
    <input
      type={type}
      name={name}
      id={name}
      placeholder={placeholder}
      onChange={on_change}
      value={value}
      className={`${classname} ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
      disabled={disabled}
    />
  );
};

export default InputField;
