"use client";

import { VirtualizedSongList } from "@/app/(app)/_components/virtualized-song-list";
import type { MoodlistSongSchema } from "@/app/(app)/_types";
import { MoodlistSongCard } from "@/app/(app)/moodlists/user/[userId]/[moodlistId]/_components/moodlist-song-card";

type MoodlistSongListProps = {
  songs: MoodlistSongSchema[];
};
const MoodlistSongList = ({ songs }: MoodlistSongListProps) => {
  return (
    <VirtualizedSongList
      songs={songs}
      renderItem={(song) => <MoodlistSongCard song={song} />}
    />
  );
};

export { MoodlistSongList };
