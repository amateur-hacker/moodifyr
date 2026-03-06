import type React from "react";
import { SongPlayerBar } from "@/app/(app)/_components/song-player-bar";
import { SongPlayerEngine } from "@/app/(app)/_components/song-player-engine";
import { SongQueueCleaner } from "@/app/(app)/_components/song-queue-cleaner";
import { SongShuffleQueueManager } from "@/app/(app)/_components/song-shuffle-queue-manager";
import { getUserMoodlists } from "@/app/(app)/moodlists/queries";
import {
  getUserFavouriteSongs,
  getUserLastPlayedSong,
  getUserSongPlayerMode,
} from "@/app/(app)/queries";
import { SongPlayerInitializer } from "./song-player-initializer";

type GlobalPlayerProps = { children: React.ReactNode };

const GlobalSongPlayer = async ({ children }: GlobalPlayerProps) => {
  const [lastPlayedSong, lastActiveMode, favouriteSongs, moodlists] =
    await Promise.all([
      getUserLastPlayedSong().then((res) => res ?? null),
      getUserSongPlayerMode().then((res) => res ?? null),
      getUserFavouriteSongs().then((res) => res ?? null),
      getUserMoodlists().then((res) => res ?? null),
    ]);

  return (
    <>
      <SongPlayerInitializer
        lastPlayedSong={lastPlayedSong}
        lastActiveMode={lastActiveMode}
      />
      <SongPlayerEngine />
      <SongShuffleQueueManager />
      <SongQueueCleaner />
      {children}
      <SongPlayerBar favouriteSongs={favouriteSongs} moodlists={moodlists} />
    </>
  );
};

export { GlobalSongPlayer };
