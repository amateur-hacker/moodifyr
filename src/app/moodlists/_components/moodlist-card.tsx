"use client";

import {
  Edit,
  EllipsisIcon,
  Music,
  Share2,
  Trash,
  UserMinus,
  UserPlus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useUser } from "@/app/_context/user-context";
import { googleSignInUser } from "@/app/fn";
import { DeleteMoodlistDialog } from "@/app/moodlists/_components/delete-moodlist-dialog";
import { RenameMoodlistDialog } from "@/app/moodlists/_components/rename-moodlist-dialog";
import { ShareMoodlistDialog } from "@/app/moodlists/_components/share-moodlist-dialog";
import {
  followUserMoodlist,
  unfollowUserMoodlist,
} from "@/app/moodlists/actions";
import { PropagationStopper } from "@/components/propagation-stopper";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const MoodlistCard = ({
  prevMoodlistName,
  moodlistId,
  userId,
  ownerId,
  moodlistType,
  isAlreadyFollowing,
}: {
  prevMoodlistName: string;
  moodlistId: string;
  userId?: string;
  ownerId?: string;
  moodlistType: string;
  isAlreadyFollowing: boolean;
}) => {
  const [isRenameMoodlistDialogOpen, setIsRenameMoodlistDialogOpen] =
    useState(false);
  const [isDeleteMoodlistDialogOpen, setIsDeleteMoodlistDialogOpen] =
    useState(false);
  const [isShareMoodlistDialogOpen, setIsShareMoodlistDialogOpen] =
    useState(false);
  const [origin, setOrigin] = useState("");
  const [isFollowing, setIsFollowing] = useState(isAlreadyFollowing);
  const [isProcessing, setIsProcessing] = useState(false);

  const user = useUser();
  const router = useRouter();

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

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
    <div className="size-32 sm:size-40 bg-gradient-to-b from-primary via-secondary to-accent rounded-md flex justify-center items-center relative overflow-hidden mx-auto">
      <Music className="size-16" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className="shadow-none absolute top-0.5 right-0.5 cursor-pointer"
            title="Open menu"
          >
            <EllipsisIcon size={16} aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {moodlistType === "followed" &&
            (isFollowing ? (
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
            ))}
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setIsShareMoodlistDialogOpen(true);
            }}
          >
            <Share2 /> Share
          </DropdownMenuItem>
          {moodlistType === "owned" && (
            <>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsRenameMoodlistDialogOpen(true);
                }}
              >
                <Edit /> Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDeleteMoodlistDialogOpen(true);
                }}
              >
                <Trash /> Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <PropagationStopper>
        {moodlistType === "owned" && (
          <>
            <RenameMoodlistDialog
              open={isRenameMoodlistDialogOpen}
              onOpenChange={setIsRenameMoodlistDialogOpen}
              prevMoodlistName={prevMoodlistName}
              moodlistId={moodlistId}
            />
            <DeleteMoodlistDialog
              open={isDeleteMoodlistDialogOpen}
              onOpenChange={setIsDeleteMoodlistDialogOpen}
              moodlistName={prevMoodlistName}
              moodlistId={moodlistId}
            />
          </>
        )}
        <ShareMoodlistDialog
          open={isShareMoodlistDialogOpen}
          onOpenChange={setIsShareMoodlistDialogOpen}
          link={`${origin}/moodlists/user/${moodlistType === "owned" ? userId : ownerId}/${moodlistId}`}
        />
      </PropagationStopper>
    </div>
  );
};

export { MoodlistCard };
