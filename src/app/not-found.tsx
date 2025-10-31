"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

const NotFoundPage = () => {
  return (
    <div className="flex min-h-[calc(100dvh-3.8rem)] flex-col items-center justify-center bg-background pb-[var(--player-height,0px)]">
      <div className="mx-auto max-w-md text-center">
        <Image
          src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdnZuY2VpZXA2Zjk4OTRubG5rN21namt5Mmw5NDZvaThianAyMWtmOCZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/ZcthNRpghDfqieTcsm/giphy.gif"
          width={300}
          height={300}
          className="mx-auto"
          alt="shinchan confused gif"
        />
        <Typography variant="h2" className="mt-4">
          Page not found
        </Typography>
        <Typography variant="body" className="mt-4 text-muted-foreground">
          This page doesn’t exist. Try heading back to the home page.
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

export default NotFoundPage;
