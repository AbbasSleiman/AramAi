import InputField from "../atoms/InputField";
import Button from "../atoms/clickeable/Button";
import StyledButton from "../atoms/clickeable/StyledButton";

import { signInWithEmailAndPassword, AuthError } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../../lib/firebase/firebaseConfig";
import { useState } from "react";
import { useFormValidation } from "../../lib/hooks/useFormValidation";
import { useGoogleAuth } from "../../lib/hooks/useGoogleAuth";

const LoginContainer = () => {
  const { emailStatus, passwordStatus, validateForm } = useFormValidation();
  const { signInWithGoogle, isLoading: googleLoading, error: googleError } = useGoogleAuth();
  const navigate = useNavigate();

  // Credentials States
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [status, setStatus] = useState<string>("initial");

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    setStatus("loading");
    event.preventDefault();

    if (!validateForm(email, password)) {
      setStatus("error");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setStatus("done");
      navigate("/chat");
    } catch (error) {
      setStatus("error");
      const firebaseError = error as AuthError;
      console.error('Login error:', firebaseError.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-2 m-2">
      <h2>Welcome Back</h2>

      <form
        className="flex flex-col items-center justify-center gap-4 "
        onSubmit={handleSignIn}
      >
        <div className="w-full">
          <label
            htmlFor="email"
            className={`${emailStatus === "invalid" ? "error" : ""}`}
          >
            Email
          </label>
          <InputField
            type="email"
            name="email"
            on_change={(e) => setEmail(e.target.value)}
            value={email}
            placeholder="Input your email"
          />
        </div>
        <div className="w-full">
          <label
            htmlFor="password"
            className={`${passwordStatus === "invalid" ? "error" : ""}`}
          >
            Password
          </label>
          <InputField
            type="password"
            name="password"
            on_change={(e) => setPassword(e.target.value)}
            value={password}
            placeholder="Input your Password"
          />
        </div>
        
        {/* Email validation errors */}
        {emailStatus === "empty" || passwordStatus === "empty" ? (
          <span className="error font-roboto text-xs">
            Please Make sure fields are not empty
          </span>
        ) : emailStatus === "invalid" ? (
          <span className="error font-roboto text-xs">
            Enter a valid email address
          </span>
        ) : passwordStatus === "invalid" ? (
          <span className="error font-roboto text-xs">
            Password must be at least 8 characters long, 1 uppercase, and at
            least 1 number
          </span>
        ) : null}

        {/* Google auth error */}
        {googleError && (
          <span className="error font-roboto text-xs">
            {googleError}
          </span>
        )}

        {status === "loading" ? (
          <p>loading...</p>
        ) : (
          <Button text="Login" classname="mt-3" type="submit" />
        )}
      </form>
      
      <span className="font-notosans text-sm font-normal opacity-75">
        New Here?{" "}
        <Link className="text-sm" to="/signup">
          Create an Account
        </Link>
      </span>
      
      <div className="flex flex-row items-center justify-center gap-2 w-full p-2 opacity-55">
        <hr className="w-full" />
        <span>Or</span>
        <hr className="w-full" />
      </div>

      <div className="w-full">
        <StyledButton
          text={googleLoading ? "Signing in..." : "Continue With Google"}
          src="/Google.svg"
          classname="mt-3"
          onClick={signInWithGoogle}
          disabled={googleLoading}
        />
      </div>
    </div>
  );
};

export default LoginContainer;