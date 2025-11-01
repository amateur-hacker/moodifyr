"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AddToMoodlistDialog } from "@/app/(app)/_components/add-to-moodlist-dialog";
import { ShareLinkDialog } from "@/app/(app)/_components/share-link-dialog";
import { SongCard } from "@/app/(app)/_components/song-card";
import { useFavourites } from "@/app/(app)/_context/favourite-context";
import type { FavouriteSongSchema, SongSchema } from "@/app/(app)/_types";
import { toggleUserFavouriteSong } from "@/app/(app)/actions";
import type { getUserMoodlists } from "@/app/(app)/moodlists/queries";

const FavouriteSongCard = ({
  song,
  moodlists,
  onRemove,
}: {
  song: FavouriteSongSchema;
  moodlists: Awaited<ReturnType<typeof getUserMoodlists>>;
  onRemove: (favouriteId: string) => void;
}) => {
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isAddToMoodlistDialogOpen, setIsAddToMoodlistDialogOpen] =
    useState(false);
  const [baseUrl, setBaseUrl] = useState("");
  const [hasInteracted, setHasInteracted] = useState(false);
  const {
    favouriteSongs,
    setFavourite,
    isFavouritePending,
    setFavouritePending,
  } = useFavourites();

  const isFavourite = favouriteSongs[song.id] ?? true;
  const isPending = isFavouritePending[song.id] ?? false;

  const handleRemoveFromFavourites = async () => {
    setHasInteracted(true);
    setFavouritePending(song.id, true);

    setFavourite(song.id, !isFavourite);

    try {
      const result = await toggleUserFavouriteSong({
        song,
      });

      if (result) {
        onRemove?.(song.favouriteId);
        toast.success("Removed from favourites.");
      } else {
        setFavourite(song.id, isFavourite);
        toast.error("Failed to remove from favourites. Please try again.");
      }
    } catch (error) {
      setFavourite(song.id, isFavourite);
      console.error("Error removing favourite:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setFavouritePending(song.id, false);
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
