const StyledButton = ({
  onClick,
  text,
  src,
  classname,
}: {
  text: string;
  classname?: string;
  src?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) => {
  return (
    <button
      className="button-styled flex flex-row items-center justify-evenly"
      onClick={onClick}
    >
      <img src={src} className=" w-6" />
      {text}
    </button>
  );
};

export default StyledButton;
