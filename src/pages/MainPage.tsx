import NotificationBox from "../components/atoms/utilities/NotificationBox";

const MainPage = () => {
  return (
    <div>
      <p>test</p>
      <p>test</p>
      <div className="h-96 w-full">
        {" "}
        <NotificationBox text="An Email has been sent" />
      </div>
    </div>
  );
};

export default MainPage;
