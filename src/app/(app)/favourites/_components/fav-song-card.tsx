"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AddToMoodlistDialog } from "@/app/(app)/_components/add-to-moodlist-dialog";
import { ShareLinkDialog } from "@/app/(app)/_components/share-link-dialog";
import { SongCard } from "@/app/(app)/_components/song-card";
import type { FavouriteSongSchema, SongSchema } from "@/app/(app)/_types";
import { toggleUserFavouriteSong } from "@/app/(app)/actions";
import type { getUserMoodlists } from "@/app/(app)/moodlists/queries";

const FavouriteSongCard = ({
  song,
  moodlists,
}: {
  song: FavouriteSongSchema;
  moodlists: Awaited<ReturnType<typeof getUserMoodlists>>;
}) => {
  const [isFavourite, setIsFavourite] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isAddToMoodlistDialogOpen, setIsAddToMoodlistDialogOpen] =
    useState(false);
  const [baseUrl, setBaseUrl] = useState("");
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleRemoveFromFavourites = async () => {
    setHasInteracted(true);
    setIsPending(true);
    setIsFavourite(false);

    const message = "Removed from favourites.";
    toast.loading(message, { id: song.id });

    try {
      const result = await toggleUserFavouriteSong({
        song,
      });

      if (result) {
        toast.success(message);
      } else {
        setIsFavourite(true);
        toast.error("Failed to remove from favourites. Please try again.");
      }
    } catch (error) {
      setIsFavourite(true);
      console.error("Error removing favourite:", error);
      toast.error("Something went wrong. Please try again.");
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
