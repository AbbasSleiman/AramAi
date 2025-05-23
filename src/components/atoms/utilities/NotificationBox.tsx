import { useEffect, useState } from "react";

const NotificationBox = ({
  text,
  classname,
}: {
  text?: string;
  classname?: string;
}) => {
  const [visible, setVisible] = useState<boolean>(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setVisible(false);
    }, 5000);

    return () => clearTimeout(timeout); // cleanup
  }, []);

  return (
    <div
      className={` ${classname} ${visible ? "flex" : "hidden"} flex-col items-center justify-center p-2 m-3 w-64 shadow-2xl rounded-2xl absolute bottom-0 right-0 z-10`}
    >
      <span>{text}</span>
    </div>
  );
};

export default NotificationBox;
