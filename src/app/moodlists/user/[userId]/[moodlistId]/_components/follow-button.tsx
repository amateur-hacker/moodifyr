"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { googleSignInUser } from "@/app/fn";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  followUserMoodlist,
  unfollowUserMoodlist,
} from "@/app/moodlists/actions";
import { UserMinus, UserPlus } from "lucide-react";

const FollowButton = ({
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
  const { useSession } = authClient;
  const { data: session } = useSession();
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
      if (!session?.user) {
        toast("Sign in to follow", {
          action: { label: "Sign In", onClick: handleAuthRedirect },
          duration: 5000,
        });
        return;
      }

      setIsProcessing(true);
      const response = await followUserMoodlist({
        moodlistId,
        pathToRevalidate: "/moodlists",
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
      if (!session?.user) {
        toast("Sign in to unfollow", {
          action: { label: "Sign In", onClick: handleAuthRedirect },
          duration: 5000,
        });
        return;
      }

      setIsProcessing(true);
      const response = await unfollowUserMoodlist({
        moodlistId,
        pathToRevalidate: "/moodlists",
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

export { FollowButton };
