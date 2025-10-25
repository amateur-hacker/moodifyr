"use client";

import { UserMinus, UserPlus } from "lucide-react";
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

const FollowMoodlistButton = ({
  isAlreadyFollowing,
  moodlistId,
  userId,
}: {
  isAlreadyFollowing: boolean;
  moodlistId: string;
  userId: string;
}) => {
  const [isFollowing, setIsFollowing] = useState(isAlreadyFollowing);
  const router = useRouter();
  const user = useUser();
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
    <>
      {isFollowing ? (
        <Button
          size="icon"
          variant="outline"
          className="cursor-pointer shadow-none"
          onClick={handleUnfollow}
          disabled={isProcessing}
          title="Unfollow"
        >
          <UserMinus />
        </Button>
      ) : (
        <Button
          size="icon"
          variant="outline"
          className="cursor-pointer shadow-none"
          onClick={handleFollow}
          disabled={isProcessing}
          title="Follow"
        >
          <UserPlus />
        </Button>
      )}
    </>
  );
};

export { FollowMoodlistButton };
