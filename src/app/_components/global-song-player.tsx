import type React from "react";
import { SongPlayerBar } from "@/app/_components/song-player-bar";
import { SongPlayerEngine } from "@/app/_components/song-player-engine";
import { SongPlayerProvider } from "@/app/_context/song-player-context";
import { getUserMoodlists } from "@/app/moodlists/queries";
import {
  getUserFavouriteSongs,
  getUserLastPlayedSong,
  getUserSongPlayerMode,
} from "@/app/queries";

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
      <SongPlayerBar favouriteSongs={favouriteSongs} moodlists={moodlists} />
    </SongPlayerProvider>
  );
};

export { GlobalSongPlayer };
