import InputField from "../atoms/InputField";
import Button from "../atoms/clickeable/Button";
import StyledButton from "../atoms/clickeable/StyledButton";

import { signInWithEmailAndPassword, AuthError } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../../lib/firebase/firebaseConfig";
import { useState } from "react";
import { useFormValidation } from "../../lib/hooks/useFormValidation";
import { useGoogleAuth } from "../../lib/hooks/useGoogleAuth";
import LogoText from "../atoms/LogoText";

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
    <>
      {/* Enhanced CSS Override for proper dark mode support */}
      <style>
        {`
          .login-input-override {
            width: 100% !important;
            padding: 0.5rem 0.75rem !important;
            border: 1px solid #d1d5db !important;
            border-radius: 0.375rem !important;
            background-color: #ffffff !important;
            color: #111827 !important;
            font-size: 0.875rem !important;
            line-height: 1.25rem !important;
            outline: none !important;
            transition: all 0.15s ease-in-out !important;
          }
          
          .login-input-override::placeholder {
            color: #6b7280 !important;
          }
          
          .login-input-override:focus {
            outline: none !important;
            ring: 2px !important;
            ring-color: #3b82f6 !important;
            border-color: #3b82f6 !important;
          }
          
          /* Dark mode styles with higher specificity */
          html.dark .login-input-override,
          .dark .login-input-override,
          [data-theme="dark"] .login-input-override {
            border-color: #4b5563 !important;
            background-color: #374151 !important;
            background: #374151 !important;
            color: #f9fafb !important;
          }
          
          html.dark .login-input-override::placeholder,
          .dark .login-input-override::placeholder {
            color: #9ca3af !important;
          }
          
          html.dark .login-input-override:focus,
          .dark .login-input-override:focus {
            ring-color: #3b82f6 !important;
            border-color: #3b82f6 !important;
          }
          
          .login-label {
            display: block !important;
            font-size: 0.875rem !important;
            font-weight: 500 !important;
            color: #374151 !important;
            margin-bottom: 0.25rem !important;
          }
          
          html.dark .login-label,
          .dark .login-label {
            color: #d1d5db !important;
          }
          
          .login-label.error {
            color: #dc2626 !important;
          }
          
          html.dark .login-label.error,
          .dark .login-label.error {
            color: #f87171 !important;
          }
          
          .login-button {
            margin-top: 0.75rem !important;
            background-color: #3b82f6 !important;
            color: #ffffff !important;
            padding: 0.5rem 1.5rem !important;
            border-radius: 0.375rem !important;
            font-weight: 500 !important;
            transition: all 0.15s ease-in-out !important;
            border: none !important;
            cursor: pointer !important;
          }
          
          .login-button:hover {
            background-color: #2563eb !important;
          }
          
          html.dark .login-button,
          .dark .login-button {
            background-color: #2563eb !important;
          }
          
          html.dark .login-button:hover,
          .dark .login-button:hover {
            background-color: #1d4ed8 !important;
          }
        `}
      </style>
      
      <div className="flex flex-col items-center justify-center gap-4 p-2 m-2">
        <LogoText classname="mb-4" />
        <h2 className="text-gray-900 dark:text-white">Welcome Back !</h2>

        <form
          className="flex flex-col items-center justify-center gap-4 w-72"
          onSubmit={handleSignIn}
        >
          <div className="w-full">
            <label
              htmlFor="email"
              className={`login-label ${emailStatus === "invalid" ? "error" : ""}`}
            >
              Email
            </label>
            <InputField
              type="email"
              name="email"
              on_change={(e) => setEmail(e.target.value)}
              value={email}
              placeholder="Input your email"
              classname="login-input-override"
            />
          </div>
          <div className="w-full">
            <label
              htmlFor="password"
              className={`login-label ${passwordStatus === "invalid" ? "error" : ""}`}
            >
              Password
            </label>
            <InputField
              type="password"
              name="password"
              on_change={(e) => setPassword(e.target.value)}
              value={password}
              placeholder="Input your Password"
              classname="login-input-override"
            />
          </div>
          
          {/* Email validation errors */}
          {emailStatus === "empty" || passwordStatus === "empty" ? (
            <span className="error font-roboto text-xs text-red-600 dark:text-red-400">
              Please Make sure fields are not empty
            </span>
          ) : emailStatus === "invalid" ? (
            <span className="error font-roboto text-xs text-red-600 dark:text-red-400">
              Enter a valid email address
            </span>
          ) : passwordStatus === "invalid" ? (
            <span className="error font-roboto text-xs text-red-600 dark:text-red-400">
              Password must be at least 8 characters long, 1 uppercase, and at
              least 1 number
            </span>
          ) : null}

          {/* Google auth error */}
          {googleError && (
            <span className="error font-roboto text-xs text-red-600 dark:text-red-400">
              {googleError}
            </span>
          )}

          {status === "loading" ? (
            <p className="text-gray-700 dark:text-gray-300">loading...</p>
          ) : (
            <Button text="Login" classname="login-button" type="submit" />
          )}
        </form>
        
        <span className="font-notosans text-sm font-normal opacity-75 text-gray-600 dark:text-gray-400">
          New Here?{" "}
          <Link className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300" to="/signup">
            Create an Account
          </Link>
        </span>
        
        <div className="flex flex-row items-center justify-center gap-2 w-full p-2 opacity-55">
          <hr className="w-full border-gray-300 dark:border-gray-600" />
          <span className="text-gray-600 dark:text-gray-400">Or</span>
          <hr className="w-full border-gray-300 dark:border-gray-600" />
        </div>

        <div className="w-full">
          <StyledButton
            text={googleLoading ? "Signing in..." : "Continue With Google"}
            src="/Google.svg"
            classname="mt-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 w-full px-6 py-2 rounded-md font-medium transition-colors"
            onClick={signInWithGoogle}
            disabled={googleLoading}
          />
        </div>
      </div>
    </>
  );
};

export default LoginContainer;