import { authClient } from "@/lib/auth-client";

const googleSignInUser = async () => {
  await authClient.signIn.social({
    provider: "google",
    callbackURL: "/",
    newUserCallbackURL: "/",
  });
};

const signOutUser = async () => {
  await authClient.signOut({ fetchOptions: {} });
};

export { googleSignInUser, signOutUser };
