"use client";

import { ChevronLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

const ErrorPage = ({
  error,
  // reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-6">
      <div className="mx-auto max-w-md text-center">
        <Image
          src={
            "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3N29xamdnaTQzcmhraDRwdzM1eXc0MnVuMnc5M29pcGprYW9tejYwbCZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/Uv7jgxwTFaTGWlaQcR/giphy.gif"
          }
          width={300}
          height={300}
          className="mx-auto"
          alt="shinchan father apologizing gif"
        />
        <Typography variant="h2" className="mt-4">
          Oops, something went wrong!
        </Typography>
        <Typography variant="body" className="mt-4 text-muted-foreground">
          We’re really sorry! An unexpected error occurred. Please try again
          later.
        </Typography>
        <div className="mt-6">
          <Link href="/" className={cn(buttonVariants({ variant: "default" }))}>
            <ChevronLeft />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
