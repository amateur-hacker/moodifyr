"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AddToMoodlistDialog } from "@/app/_components/add-to-moodlist-dialog";
import { ShareLinkDialog } from "@/app/_components/share-link-dialog";
import { SongCard } from "@/app/_components/song-card";
import type { HistorySongSchema, SongSchema } from "@/app/_types";
import { removeUserSongPlayHistory } from "@/app/history/actions";
import type { getUserMoodlists } from "@/app/moodlists/queries";

const HistorySongCard = ({
  song,
  moodlists,
}: {
  song: HistorySongSchema;
  isAlreadyFavourite?: boolean;
  moodlists: Awaited<ReturnType<typeof getUserMoodlists>>;
}) => {
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isAddToMoodlistDialogOpen, setIsAddToMoodlistDialogOpen] =
    useState(false);
  const [baseUrl, setBaseUrl] = useState("");
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const handleRemoveFromHistory = async () => {
    setIsPending(true);
    try {
      await removeUserSongPlayHistory({
        id: song.historyId,
      });
    } catch (error) {
      console.error("Error removing from history", error);
      toast.error("Failed to remove from history. Try again.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <SongCard
        variant="history"
        song={song}
        onAddToMoodlist={() => setIsAddToMoodlistDialogOpen(true)}
        onShare={() => setIsShareDialogOpen(true)}
        onRemoveFromHistory={handleRemoveFromHistory}
        shouldRemoveFromHistoryItemDisabled={isPending}
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

export { HistorySongCard };
