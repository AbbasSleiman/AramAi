import LoginContainer from "../components/molecules/LoginContainer";
import LogoText from "../components/atoms/LogoText";

const LogInPage = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-4">
      <LogoText classname="md:self-start"/>
      <LoginContainer />
    </div>
  );
};

export default LogInPage;
