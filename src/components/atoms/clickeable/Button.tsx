const Button = ({ text, classname }: { text: string; classname?: string }) => {
  return <button className={`${classname}`}>{text}</button>;
};

export default Button;
