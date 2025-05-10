import SignupContainer from "../components/molecules/SignupContainer";
import LogoText from "../components/atoms/LogoText";

const SignUpPage = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-4">
      <LogoText classname="md:self-start" />
      <SignupContainer />
    </div>
  );
};

export default SignUpPage;
