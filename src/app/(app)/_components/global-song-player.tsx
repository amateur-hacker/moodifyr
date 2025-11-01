import type React from "react";
import { SongPlayerBar } from "@/app/(app)/_components/song-player-bar";
import { SongPlayerEngine } from "@/app/(app)/_components/song-player-engine";
import { SongQueueCleaner } from "@/app/(app)/_components/song-queue-cleaner";
import { SongShuffleQueueManager } from "@/app/(app)/_components/song-shuffle-queue-manager";
import { SongPlayerProvider } from "@/app/(app)/_context/song-player-context";
import { getUserMoodlists } from "@/app/(app)/moodlists/queries";
import {
  getUserFavouriteSongs,
  getUserLastPlayedSong,
  getUserSongPlayerMode,
} from "@/app/(app)/queries";

type GlobalPlayerProps = { children: React.ReactNode };

const GlobalSongPlayer = async ({ children }: GlobalPlayerProps) => {
  const [lastPlayedSong, initialMode, favouriteSongs, moodlists] =
    await Promise.all([
      getUserLastPlayedSong().then((res) => res ?? null),
      getUserSongPlayerMode().then((res) => res ?? null),
      getUserFavouriteSongs().then((res) => res ?? null),
      getUserMoodlists().then((res) => res ?? null),
    ]);

  return (
    <SongPlayerProvider initialSong={lastPlayedSong} initialMode={initialMode}>
      {children}
      <SongPlayerEngine />
      <SongShuffleQueueManager />
      <SongQueueCleaner />
      <SongPlayerBar favouriteSongs={favouriteSongs} moodlists={moodlists} />
    </SongPlayerProvider>
  );
};

export { GlobalSongPlayer };
