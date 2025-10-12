"use client";

import { EllipsisIcon, Music, UserMinus, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  followUserMoodlist,
  unfollowUserMoodlist,
} from "@/app/moodlists/actions";
import { useUser } from "@/app/_context/user-context";
import { toast } from "sonner";
import { googleSignInUser } from "@/app/fn";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface MoodlistCardProps {
  userId: string;
  moodlistId: string;
  isAlreadyFollowing: boolean;
}

export const MoodlistCard = ({
  userId,
  moodlistId,
  isAlreadyFollowing,
}: MoodlistCardProps) => {
  const user = useUser();
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(isAlreadyFollowing);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAuthRedirect = async () => {
    const url = `${window.location.origin}/moodlists/user/${userId}/${moodlistId}`;
    const response = await googleSignInUser({
      callbackURL: url,
      newUserCallbackURL: url,
    });
    if (response?.url) router.push(response.url);
  };

  const handleFollow = async () => {
    try {
      if (!user) {
        toast("Sign in to follow", {
          action: { label: "Sign In", onClick: handleAuthRedirect },
          duration: 5000,
        });
        return;
      }

      setIsProcessing(true);
      const response = await followUserMoodlist({
        moodlistId,
        pathToRevalidate: "/moodlists/user/[userId]",
      });

      if (response?.success) {
        setIsFollowing(true);
        toast.success("Followed!");
      } else if (response?.message?.includes("already following")) {
        toast.warning("Already Following!");
      } else {
        toast.error("Follow failed!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Follow failed!");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnfollow = async () => {
    try {
      if (!user) {
        toast("Sign in to unfollow", {
          action: { label: "Sign In", onClick: handleAuthRedirect },
          duration: 5000,
        });
        return;
      }

      setIsProcessing(true);
      const response = await unfollowUserMoodlist({
        moodlistId,
        pathToRevalidate: "/moodlists/user/[userId]",
      });

      if (response?.success) {
        setIsFollowing(false);
        toast.success("Unfollowed!");
      } else {
        toast.error("Unfollow failed!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Unfollow failed!");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="size-32 sm:size-40 bg-gradient-to-b from-primary via-secondary to-accent rounded-md flex justify-center items-center relative">
      <Music className="size-16" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className="shadow-none absolute top-0.5 right-0.5 cursor-pointer"
            aria-label="Open moodlist menu"
          >
            <EllipsisIcon size={16} />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          {isFollowing ? (
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                handleUnfollow();
              }}
              disabled={isProcessing}
            >
              <UserMinus />
              {isProcessing ? "Unfollowing..." : "Unfollow"}
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                handleFollow();
              }}
              disabled={isProcessing}
            >
              <UserPlus />
              {isProcessing ? "Following..." : "Follow"}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
