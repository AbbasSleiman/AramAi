import InputField from "../atoms/InputField";
import Button from "../atoms/clickeable/Button";
import StyledButton from "../atoms/clickeable/StyledButton";

import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  getAuth,
} from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { signInUser } from "../../lib/store/slices/userSlice";
import { AppDispacth } from "../../lib/store/store";
import { useDispatch } from "react-redux";
import { useFormValidation } from "../../lib/hooks/useFormValidation";
import { useGoogleAuth } from "../../lib/hooks/useGoogleAuth";
import { createOrGetUser, isUserAdmin } from "../../lib/api/user/user";

const LoginContainer = () => {
  const auth = getAuth();

  // custom validation hook
  const { emailStatus, passwordStatus, validateForm } = useFormValidation();
  const {
    signInWithGoogle,
    isLoading: googleLoading,
  } = useGoogleAuth();

  // utility
  const navigate = useNavigate();
  const dispatch: AppDispacth = useDispatch();

  // Credentials States
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  // Validation States
  const [status, setStatus] = useState<string>("initial");

  // Sign Up with Firebase function
  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    setStatus("loading");

    event.preventDefault();

    // Validation logic
    if (!validateForm(email, password)) {
      setStatus("error");
      return;
    }

    // create user in firebase
    try {
      const userCredentials = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // After Firebase auth, ensure a local user row exists, then route by admin flag
      const uid = userCredentials.user?.uid;
      const emailNow = userCredentials.user?.email ?? email;

      if (uid && emailNow) {
        const localUser = await createOrGetUser({
          firebase_uid: uid,
          email: emailNow,
          username: emailNow.split("@")[0],
        });
        const admin = await isUserAdmin(localUser.id);
        navigate(admin ? "/admin" : "/chat");
      } else {
        // Fallback if uid missing
        navigate("/chat");
      }
    } catch (error: any) {
      setStatus("error");
    } finally {
      setStatus("done");
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) return;

      // Handle Redux Actions
      dispatch(
        signInUser({
          name: "",
          username: currentUser.email!.split("@")[0], // split at the @ symbol
          email: currentUser.email,
          uid: currentUser.uid,
        })
      );
    });
    return unsubscribe;
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-2 m-2">
      <h2>Welcome Back</h2>

      {/* Form Container */}
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
            className={`${emailStatus === "invalid" ? "error" : ""}`}
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
        {
          /* Error Text */
          emailStatus === "empty" || passwordStatus === "empty" ? (
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
          ) : null
        }

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
      {/* Bottom Container */}
      <div className="flex flex-row items-center justify-center gap-2 w-full p-2 opacity-55">
        <hr className="w-full" />
        <span>Or</span>
        <hr className="w-full" />
      </div>

      <div className="w-full">
        <StyledButton
          text="Continue With Google"
          src="/Google.svg"
          classname="mt-3"
          onClick={signInWithGoogle}
          disabled={googleLoading || status === "loading"}
        />
      </div>
    </div>
  );
};

export default LoginContainer;
