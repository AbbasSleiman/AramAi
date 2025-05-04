import { useEffect, useState } from "react";
import { toggleTheme } from "../../../lib/helpers/themeFunctions";

const ChangeThemeBtn = () => {
  const [theme, setTheme] = useState<string | null>(null);

  // get theme from localStorage
  useEffect(() => {
    const currentTheme = localStorage.getItem("theme");
    setTheme(currentTheme);
  }, []);

  // handle Theme toggle
  const handleToggleTheme = () => {
    const newTheme = toggleTheme();
    setTheme(newTheme);
  };

  return (
    <div onClick={handleToggleTheme} className="clickeable">
      {theme === "light" ? (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12.0002 11.807C10.742 10.5483 9.88513 8.94484 9.53787 7.1993C9.19061 5.45375 9.36856 3.64444 10.0492 2C8.1085 2.38205 6.32584 3.33431 4.92924 4.735C1.02424 8.64 1.02424 14.972 4.92924 18.877C8.83524 22.783 15.1662 22.782 19.0722 18.877C20.4726 17.4805 21.4248 15.6983 21.8072 13.758C20.1628 14.4385 18.3535 14.6164 16.608 14.2692C14.8625 13.9219 13.259 13.0651 12.0002 11.807Z"
            fill="black"
          />
        </svg>
      ) : (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6.995 12C6.995 14.761 9.241 17.007 12.002 17.007C14.763 17.007 17.009 14.761 17.009 12C17.009 9.239 14.763 6.993 12.002 6.993C9.241 6.993 6.995 9.239 6.995 12ZM11 19H13V22H11V19ZM11 2H13V5H11V2ZM2 11H5V13H2V11ZM19 11H22V13H19V11ZM5.637 19.778L4.223 18.364L6.344 16.243L7.758 17.657L5.637 19.778ZM16.242 6.344L18.364 4.222L19.778 5.636L17.656 7.758L16.242 6.344ZM6.344 7.759L4.223 5.637L5.638 4.223L7.758 6.345L6.344 7.759ZM19.778 18.364L18.364 19.778L16.242 17.656L17.656 16.242L19.778 18.364Z"
            fill="white"
          />
        </svg>
      )}
    </div>
  );
};

export default ChangeThemeBtn;
