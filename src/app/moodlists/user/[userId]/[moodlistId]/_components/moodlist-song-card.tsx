"use client";

import { SongCard } from "@/app/_components/song-card";
import type { MoodlistSongSchema } from "@/app/_types";

const MoodlistSongCard = ({ song }: { song: MoodlistSongSchema }) => {
  return <SongCard variant="moodlist" song={song} moodlistType="followed" />;
};

export { MoodlistSongCard };
