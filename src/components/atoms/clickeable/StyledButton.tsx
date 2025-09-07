const StyledButton = ({
  text,
  src,
  classname,
  onClick,
  disabled = false,
}: {
  text: string;
  classname?: string;
  src?: string;
  onClick?: () => void;
  disabled?: boolean;
}) => {
  return (
    <button 
      className={`button-styled flex flex-row items-center justify-evenly ${classname || ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      <img src={src} className="w-6" />
      {text}
    </button>
  );
};

export default StyledButton;