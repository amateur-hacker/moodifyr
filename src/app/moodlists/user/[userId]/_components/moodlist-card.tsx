"use client";

import { EllipsisIcon, Music, UserMinus, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useUser } from "@/app/_context/user-context";
import { googleSignInUser } from "@/app/fn";
import {
  followUserMoodlist,
  unfollowUserMoodlist,
} from "@/app/moodlists/actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
      const response = await followUserMoodlist({ moodlistId });

      if (response?.success) {
        setIsFollowing(true);
        toast.success("You are now following this moodlist.");
      } else if (response?.message?.includes("already following")) {
        toast.warning("You are already following this moodlist.");
      } else {
        toast.error("Couldn't follow this moodlist. Please try again.");
      }
    } catch (error) {
      console.error("Error following moodlist:", error);
      toast.error("Something went wrong. Please try again.");
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
      const response = await unfollowUserMoodlist({ moodlistId });

      if (response?.success) {
        setIsFollowing(false);
        toast.success("You have unfollowed this moodlist.");
      } else {
        toast.error("Couldn't unfollow this moodlist. Please try again.");
      }
    } catch (error) {
      console.error("Error unfollowing moodlist:", error);
      toast.error("Something went wrong. Please try again.");
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
