import InputField from "../atoms/InputField";
import Button from "../atoms/clickeable/Button";
import StyledButton from "../atoms/clickeable/StyledButton";

import { createUserWithEmailAndPassword, AuthError } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../../lib/firebase/firebaseConfig";
import { useState } from "react";
import { useFormValidation } from "../../lib/hooks/useFormValidation";
import { useGoogleAuth } from "../../lib/hooks/useGoogleAuth";

const SignupContainer = () => {
  const { emailStatus, passwordStatus, validateForm } = useFormValidation();
  const { signInWithGoogle, isLoading: googleLoading, error: googleError } = useGoogleAuth();
  const navigate = useNavigate();

  // Credentials States
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [status, setStatus] = useState<string>("initial");

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    setStatus("loading");
    event.preventDefault();

    if (!validateForm(email, password)) {
      setStatus("error");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setStatus("done");
      navigate("/chat");
    } catch (error) {
      setStatus("error");
      const firebaseError = error as AuthError;
      console.error('Signup error:', firebaseError.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-2 m-2">
      <h2>Create Account</h2>

      <form
        onSubmit={handleSignUp}
        className="flex flex-col items-center justify-center gap-4 w-72"
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
            placeholder="Input your email"
            on_change={(e) => setEmail(e.target.value)}
            value={email}
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
            placeholder="Input your Password"
            on_change={(e) => setPassword(e.target.value)}
            value={password}
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
          <Button text="Create Account" classname="mt-3" type="submit" />
        )}
      </form>

      <span className="font-notosans text-sm font-normal opacity-75">
        Already have an account?{" "}
        <Link className="text-sm" to="/login">
          Login
        </Link>
      </span>

      <div className="flex flex-row items-center justify-center gap-2 w-full p-2 opacity-55">
        <hr className="w-full" />
        <span>Or</span>
        <hr className="w-full" />
      </div>

      <div className="w-full">
        <StyledButton
          text={googleLoading ? "Signing up..." : "Continue With Google"}
          src="/Google.svg"
          classname="mt-3"
          onClick={signInWithGoogle}
          disabled={googleLoading}
        />
      </div>
    </div>
  );
};

export default SignupContainer;