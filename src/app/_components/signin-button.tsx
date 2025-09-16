"use client";

import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { googleSignInUser } from "@/app/fn";
import { ButtonLoader } from "@/components/button-loader";
import { Button } from "@/components/ui/button";

const SignInButton = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async () => {
    setLoading(true);
    try {
      const response = await googleSignInUser();
      if (response?.url) {
        router.push(response?.url);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      className="flex items-center gap-2 cursor-pointer"
      onClick={handleSignIn}
      disabled={loading}
    >
      {loading ? (
        <ButtonLoader loadingText="Signing in..." />
      ) : (
        <>
          <LogIn size={16} />
          <span>Sign In</span>
        </>
      )}
    </Button>
  );
};

export { SignInButton };
