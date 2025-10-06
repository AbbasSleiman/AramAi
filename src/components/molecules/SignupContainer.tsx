import InputField from "../atoms/InputField";
import Button from "../atoms/clickeable/Button";
import StyledButton from "../atoms/clickeable/StyledButton";

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../../lib/firebase/firebaseConfig";
import { useEffect, useState } from "react";
import { signInUser } from "../../lib/store/slices/userSlice";
import { AppDispacth } from "../../lib/store/store";
import { useDispatch } from "react-redux";
import { useFormValidation } from "../../lib/hooks/useFormValidation";
import { getUserByFirebaseUid, isUserAdmin } from "../../lib/api/user/user";
import { useGoogleAuth } from "../../lib/hooks/useGoogleAuth";

const SignupContainer = () => {
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
  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    setStatus("loading");

    event.preventDefault(); 

    // Validation logic
    if (!validateForm(email, password)) {
      setStatus("error");
      return;
    }

    // create user in firebase
    try {
      const userCredentials = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const uid = userCredentials.user?.uid;
      if (uid) {
        const localUser = await getUserByFirebaseUid(uid);
        const admin = await isUserAdmin(localUser.id);

        console.log(localUser, " ", admin);
        navigate(admin ? "/admin" : "/chat");
      } else {
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
      <h2>Create Account</h2>

      {/* Form Container */}
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
            // classname={`${emailStatus === "empty" || "invalid" ? "error" : ""}`}
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
            // classname={`${passwordStatus === "empty" || "invalid" ? "error" : ""}`}
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
          <Button text="Create Account" classname="mt-3" type="submit" />
        )}
      </form>

      <span className="font-notosans text-sm font-normal opacity-75">
        Already have an account?{" "}
        <Link className="text-sm" to="/login">
          Login
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
          onClick={signInWithGoogle}
          text="Continue With Google"
          src="/Google.svg"
          classname="mt-3"
          disabled={googleLoading}
        />
      </div>
    </div>
  );
};

export default SignupContainer;
