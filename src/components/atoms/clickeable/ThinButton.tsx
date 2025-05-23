const ThinButton = ({
  text,
  classname,
  on_click,
  type,
}: {
  text: string;
  classname?: string;
  on_click?: React.MouseEventHandler<HTMLButtonElement> | undefined;
  type?: "submit" | "reset" | "button" | undefined;
}) => {
  return (
    <button className={`thin-button ${classname} `} onClick={on_click} type={type}>
      {text}
    </button>
  );
};

export default ThinButton;
