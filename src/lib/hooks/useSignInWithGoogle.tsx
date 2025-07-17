import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

export default async function useSignInWithGoogle() {

  const auth = getAuth();
  const provider = new GoogleAuthProvider();

  try {
    const result = await signInWithPopup(auth, provider);

    const credential = GoogleAuthProvider.credentialFromResult(result);
    // const token = credential?.accessToken;
    // const user = result.user;
    return "success";
  } catch (error: any) {
    const errorCode = error.code;
    const errorMessage = error.message;
    // The AuthCredential type that was used.
    const credential = GoogleAuthProvider.credentialFromError(
      error as import("firebase/app").FirebaseError

    );
    console.error("Google Sign In Error:", errorCode, errorMessage);
    return "error-google-sign-in";
  }


}
