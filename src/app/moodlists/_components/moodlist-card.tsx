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
import { googleSignInUser } from "@/app/fn";
import {
  followUserMoodlist,
  unfollowUserMoodlist,
} from "@/app/moodlists/actions";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser } from "@/app/_context/user-context";
import { DeleteMoodlistDialog } from "./delete-moodlist-dialog";
import { RenameMoodlistDialog } from "./rename-moodlist-dialog";
import { ShareMoodlistDialog } from "./share-moodlist-dialog";
import { PropagationStopper } from "@/components/propagation-stopper";
import Image from "next/image";

// import { authClient } from "@/lib/auth-client";

const MoodlistCard = ({
  prevMoodlistName,
  moodlistId,
  userId,
  ownerName,
  ownerImage,
  ownerId,
  moodlistType,
  isAlreadyFollowing,
}: {
  prevMoodlistName: string;
  moodlistId: string;
  userId?: string;
  ownerName?: string;
  ownerImage?: string;
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
    <div className="size-32 sm:size-40 bg-gradient-to-b from-primary via-secondary to-accent rounded-md flex justify-center items-center relative overflow-hidden mx-auto">
      <Music className="size-16" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className="shadow-none absolute top-0.5 right-0.5 cursor-pointer"
            aria-label="Open edit menu"
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
      {/* {moodlistType === "followed" && ( */}
      {/*   <div className="absolute left-0 top-0 h-16 w-16"> */}
      {/*     <div className="absolute transform -rotate-45 bg-accent text-center text-white font-semibold py-1 left-[-52px] top-4 w-[170px]"> */}
      {/*       followed */}
      {/*     </div> */}
      {/*   </div> */}
      {/* )} */}
      {/* {moodlistType === "followed" && ( */}
      {/*   <div className="text-center absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col gap-0.5 items-center"> */}
      {/*     <Image */}
      {/*       width="20" */}
      {/*       height="20" */}
      {/*       alt={`Owner ${ownerName} image`} */}
      {/*       className="rounded-full" */}
      {/*       src={ownerImage} */}
      {/*     /> */}
      {/*     <Typography variant="muted"> */}
      {/*       Created by */}
      {/*       <span className="line-clamp-1 max-w-[20ch]">{ownerName}</span> */}
      {/*     </Typography> */}
      {/*   </div> */}
      {/* )} */}
    </div>
  );
};

export { MoodlistCard };
