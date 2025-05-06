import googleSVG from "./Google.svg";

const StyledButton = ({
  text,
  src,
  classname,
}: {
  text: string;
  classname?: string;
  src?: string;
}) => {
  return (
    <button className="button-styled flex flex-row items-center justify-evenly">
      <img src={src} className=" w-6" />
      {text}
    </button>
  );
};

export default StyledButton;
