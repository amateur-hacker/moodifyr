"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AddToMoodlistDialog } from "@/app/_components/add-to-moodlist-dialog";
import { ShareLinkDialog } from "@/app/_components/share-link-dialog";
import { SongCard } from "@/app/_components/song-card";
import type { FavouriteSongSchema, SongSchema } from "@/app/_types";
import { toggleUserFavouriteSong } from "@/app/fn";
import type { getUserMoodlists } from "@/app/moodlists/queries";

const FavouriteSongCard = ({
  song,
  moodlists,
}: {
  song: FavouriteSongSchema;
  isAlreadyFavourite?: boolean;
  moodlists: Awaited<ReturnType<typeof getUserMoodlists>>;
}) => {
  const [isFavourite, setIsFavourite] = useState(true);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isAddToMoodlistDialogOpen, setIsAddToMoodlistDialogOpen] =
    useState(false);
  const [baseUrl, setBaseUrl] = useState("");
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleRemoveFromFavourites = async () => {
    setHasInteracted(true);
    setIsPending(true);
    setIsFavourite(false);

    try {
      const result = await toggleUserFavouriteSong({
        song,
        revalidate: true,
        path: "/favourites",
      });

      if (!result) {
        setIsFavourite(true);
        toast.error("Failed to remove from favourites. Try again.");
      }
    } catch (error) {
      setIsFavourite(true);
      console.error("Error removing favourite:", error);
      toast.error("Failed to remove from favourites. Try again.");
    } finally {
      setIsPending(true);
    }
  };

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  return (
    <>
      <SongCard
        variant="favourite"
        song={song}
        onAddToMoodlist={() => setIsAddToMoodlistDialogOpen(true)}
        onShare={() => setIsShareDialogOpen(true)}
        onRemoveFromFavourites={handleRemoveFromFavourites}
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

export { FavouriteSongCard };
