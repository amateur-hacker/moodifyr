"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AddToMoodlistDialog } from "@/app/(app)/_components/add-to-moodlist-dialog";
import { ShareLinkDialog } from "@/app/(app)/_components/share-link-dialog";
import { SongCard } from "@/app/(app)/_components/song-card";
import { useUser } from "@/app/(app)/_context/user-context";
import type { SearchSongSchema, SongSchema } from "@/app/(app)/_types";
import { toggleUserFavouriteSong } from "@/app/(app)/actions";
import { googleSignInUser } from "@/app/(app)/fn";
import type { getUserMoodlists } from "@/app/(app)/moodlists/queries";

const SearchSongCard = ({
  song,
  isAlreadyFavourite = false,
  moodlists,
}: {
  song: SearchSongSchema;
  isAlreadyFavourite?: boolean;
  moodlists: Awaited<ReturnType<typeof getUserMoodlists>>;
}) => {
  const [isFavourite, setIsFavourite] = useState(isAlreadyFavourite);
  const [isPending, setIsPending] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isAddToMoodlistDialogOpen, setIsAddToMoodlistDialogOpen] =
    useState(false);
  const [baseUrl, setBaseUrl] = useState("");
  const [hasInteracted, setHasInteracted] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const user = useUser();

  const handleToggleFavourite = async () => {
    if (!user) {
      toast("Sign in to save your favourite songs", {
        action: {
          label: "Sign in",
          onClick: async () => {
            const queryString = searchParams?.toString();
            const url = queryString
              ? `${baseUrl}${pathname}?${queryString}`
              : `${baseUrl}${pathname}`;
            const response = await googleSignInUser({
              callbackURL: url,
              newUserCallbackURL: url,
            });
            if (response?.url) {
              router.push(response.url);
            }
          },
        },
        description: "You need an account to favourite songs",
        duration: 5000,
      });
      return;
    }

    if (isPending) return;
    const wasFavourite = isFavourite;
    const shouldBeFavourite = !wasFavourite;

    setHasInteracted(true);
    setIsPending(true);
    setIsFavourite(shouldBeFavourite);

    const message = shouldBeFavourite
      ? "Added to favourites"
      : "Removed from favourites";
    toast.loading(message, { id: song.id });

    try {
      const result = await toggleUserFavouriteSong({ song });

      if (result) {
        toast.success(message, { id: song.id });
      } else {
        setIsFavourite(wasFavourite);
        toast.error("Failed to update favourite. Please try again.", {
          id: song.id,
        });
      }
    } catch (error) {
      setIsFavourite(wasFavourite);
      console.error("Error toggling favourite:", error);
      toast.error("Something went wrong. Please try again.", { id: song.id });
    } finally {
      setIsPending(false);
    }
  };

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  return (
    <>
      <SongCard
        variant="search"
        song={song}
        onAddToMoodlist={() => setIsAddToMoodlistDialogOpen(true)}
        onShare={() => setIsShareDialogOpen(true)}
        onToggleFavourite={handleToggleFavourite}
        shouldHeartButtonActive={isFavourite}
        shouldHeartButtonAnimate={hasInteracted}
        shouldHeartButtonDisabled={isPending}
      />
      <ShareLinkDialog
        open={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
        link={`${baseUrl}/search?id=${song.id}`}
      />
      <AddToMoodlistDialog
        open={isAddToMoodlistDialogOpen}
        onOpenChange={setIsAddToMoodlistDialogOpen}
        moodlists={moodlists}
        songId={song.id}
        song={song as SongSchema}
      />
    </>
  );
};

export { SearchSongCard };
