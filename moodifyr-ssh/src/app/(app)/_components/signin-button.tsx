"use client";

import { LogIn } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { googleSignInUser } from "@/app/(app)/fn";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

const SignInButton = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [origin, setOrigin] = useState("");
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      const response = await googleSignInUser({
        callbackURL: `${origin}/${pathname}?${searchParams.toString()}`,
        newUserCallbackURL: `${origin}/${pathname}?${searchParams.toString()}`,
      });
      if (response?.url) {
        router.push(response?.url);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      className="flex justify-center items-center gap-2 cursor-pointer"
      onClick={handleSignIn}
      disabled={loading}
    >
      {loading ? (
        <>
          <Spinner />
          Signing in
        </>
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
