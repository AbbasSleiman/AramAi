import { Link } from "react-router-dom";
import InputField from "../atoms/InputField";
import Button from "../atoms/clickeable/Button";
import StyledButton from "../atoms/clickeable/StyledButton";

const LoginContainer = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-2 m-2">
      <h2>Welcome Back</h2>

      {/* Form Container */}
      <form className="flex flex-col items-center justify-center gap-4 ">
        <div className="w-full">
          <label htmlFor="email">Email</label>
          <InputField
            type="email"
            name="email"
            placeholder="Input your email"
          />
        </div>
        <div className="w-full">
          <label htmlFor="password">Password</label>
          <InputField
            type="password"
            name="password"
            placeholder="Input your Password"
          />
        </div>
        <Button text="Login" classname="mt-3" />
      </form>
      <span className="font-notosans text-sm font-normal opacity-75">
        New Here?{" "}
        <Link className="text-sm" to="/signup">
          Create an Account
        </Link>
      </span>
      {/* Bottom Container */}
      <div className="flex flex-row items-center justify-center gap-2 w-full p-2 opacity-55">
        <hr className="w-full" />
        <span>Or</span>
        <hr className="w-full" />
      </div>

      <div className="w-full">
        <StyledButton text="Continue With Google" src="/Google.svg" classname="mt-3" />
      </div>
    </div>
  );
};

export default LoginContainer;
