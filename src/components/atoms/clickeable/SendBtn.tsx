import React from "react";

type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

const SendBtn: React.FC<IconButtonProps> = ({
  className = "",
  disabled,
  ...rest
}) => {
  return (
    <button
      type="button"
      {...rest}
      disabled={disabled}
      aria-label={rest["aria-label"] ?? "Send message"}
      className={[
        "inline-flex items-center justify-center rounded-full p-1",
        "transition-transform duration-150",
        disabled
          ? "opacity-50 cursor-not-allowed"
          : "hover:opacity-90 hover:scale-[1.02]",
        "focus:outline-none focus:ring-2 focus:ring-black/25", // monochrome focus
        className,
      ].join(" ")}
    >
      <svg
        width="35"
        height="35"
        viewBox="0 0 35 35"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
      >
        {/* Black circle */}
        <rect width="35" height="35" rx="17.5" fill="#000000" />
        {/* White chevron */}
        <path
          d="M11.793 18.793L13.207 20.207L17.5 15.914L21.793 20.207L23.207 18.793L17.5 13.086L11.793 18.793Z"
          fill="#FFFFFF"
        />
      </svg>
    </button>
  );
};

export default SendBtn;
