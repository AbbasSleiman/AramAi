const InputField = ({
  type,
  name,
  placeholder,
}: {
  type: string;
  name: string;
  placeholder: string;
}) => {
  return <input type={type} name={name} id={name} placeholder={placeholder} />;
};

export default InputField;
