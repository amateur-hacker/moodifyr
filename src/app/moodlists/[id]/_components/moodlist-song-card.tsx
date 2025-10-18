"use client";

import { useState } from "react";
import { toast } from "sonner";
import { SongCard } from "@/app/_components/song-card";
import type { MoodlistSongSchema } from "@/app/_types";
import { removeUserSongFromMoodlist } from "@/app/moodlists/actions";

const MoodlistSongCard = ({
  moodlistId,
  song,
  moodlistType,
}: {
  moodlistId: string;
  song: MoodlistSongSchema;
  moodlistType: "owned" | "followed";
}) => {
  const [isPending, setIsPending] = useState(false);

  const handleRemoveSongFromMoodlist = async () => {
    setIsPending(true);
    try {
      const response = await removeUserSongFromMoodlist({
        songId: song.moodlistSongId,
        moodlistId,
      });
      if (response.success) {
        toast.success(response?.message);
      } else {
        toast.error(response?.message);
      }
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Failed to remove song from moodlist");
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <SongCard
      variant="moodlist"
      song={song}
      {...(moodlistType === "owned"
        ? {
            moodlistType: "owned" as const,
            onRemoveSongFromMoodlist: handleRemoveSongFromMoodlist,
            shouldRemoveSongFromMoodlistDisabled: isPending,
          }
        : { moodlistType: "followed" as const })}
    />
  );
};

export { MoodlistSongCard };
