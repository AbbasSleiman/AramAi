// Updated SignupContainer with fixed dark mode support
import InputField from "../atoms/InputField";
import Button from "../atoms/clickeable/Button";
import StyledButton from "../atoms/clickeable/StyledButton";
import LogoText from "../atoms/LogoText";

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
    <>
      {/* Enhanced CSS Override for proper dark mode support */}
      <style>
        {`
          .signup-input-override {
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
          
          .signup-input-override::placeholder {
            color: #6b7280 !important;
          }
          
          .signup-input-override:focus {
            outline: none !important;
            ring: 2px !important;
            ring-color: #3b82f6 !important;
            border-color: #3b82f6 !important;
          }
          
          /* Dark mode styles with higher specificity */
          html.dark .signup-input-override,
          .dark .signup-input-override,
          [data-theme="dark"] .signup-input-override {
            border-color: #4b5563 !important;
            background-color: #374151 !important;
            background: #374151 !important;
            color: #f9fafb !important;
          }
          
          html.dark .signup-input-override::placeholder,
          .dark .signup-input-override::placeholder {
            color: #9ca3af !important;
          }
          
          html.dark .signup-input-override:focus,
          .dark .signup-input-override:focus {
            ring-color: #3b82f6 !important;
            border-color: #3b82f6 !important;
          }
          
          .signup-label {
            display: block !important;
            font-size: 0.875rem !important;
            font-weight: 500 !important;
            color: #374151 !important;
            margin-bottom: 0.25rem !important;
          }
          
          html.dark .signup-label,
          .dark .signup-label {
            color: #d1d5db !important;
          }
          
          .signup-label.error {
            color: #dc2626 !important;
          }
          
          html.dark .signup-label.error,
          .dark .signup-label.error {
            color: #f87171 !important;
          }
          
          .signup-button {
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
          
          .signup-button:hover {
            background-color: #2563eb !important;
          }
          
          html.dark .signup-button,
          .dark .signup-button {
            background-color: #2563eb !important;
          }
          
          html.dark .signup-button:hover,
          .dark .signup-button:hover {
            background-color: #1d4ed8 !important;
          }
        `}
      </style>
      
      <div className="flex flex-col items-center justify-center gap-4 p-2 m-2">
        <LogoText classname="mb-4" />
        <h2 className="text-gray-900 dark:text-white">Create Account</h2>

        <form
          onSubmit={handleSignUp}
          className="flex flex-col items-center justify-center gap-4 w-72"
        >
          <div className="w-full">
            <label
              htmlFor="email"
              className={`signup-label ${emailStatus === "invalid" ? "error" : ""}`}
            >
              Email
            </label>
            <InputField
              type="email"
              name="email"
              placeholder="Input your email"
              on_change={(e) => setEmail(e.target.value)}
              value={email}
              classname="signup-input-override"
            />
          </div>
          <div className="w-full">
            <label
              htmlFor="password"
              className={`signup-label ${passwordStatus === "invalid" ? "error" : ""}`}
            >
              Password
            </label>
            <InputField
              type="password"
              name="password"
              placeholder="Input your Password"
              on_change={(e) => setPassword(e.target.value)}
              value={password}
              classname="signup-input-override"
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
            <Button 
              text="Create Account" 
              classname="signup-button" 
              type="submit" 
            />
          )}
        </form>

        <span className="font-notosans text-sm font-normal opacity-75 text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <Link className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300" to="/login">
            Login
          </Link>
        </span>

        <div className="flex flex-row items-center justify-center gap-2 w-full p-2 opacity-55">
          <hr className="w-full border-gray-300 dark:border-gray-600" />
          <span className="text-gray-600 dark:text-gray-400">Or</span>
          <hr className="w-full border-gray-300 dark:border-gray-600" />
        </div>

        <div className="w-full">
          <StyledButton
            text={googleLoading ? "Signing up..." : "Continue With Google"}
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

export default SignupContainer;