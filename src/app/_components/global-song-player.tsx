import type React from "react";
import { SongPlayerBar } from "@/app/_components/song-player-bar";
import { SongPlayerEngine } from "@/app/_components/song-player-engine";
import { SongPlayerProvider } from "@/app/_context/song-player-context";
import type { SongPlayerMode } from "@/app/_types";
import {
  getUserFavouriteSongs,
  getUserLastPlayedSong,
  getUserPreference,
} from "@/app/queries";
import { getUserMoodlists } from "../moodlists/queries";

type GlobalPlayerProps = { children: React.ReactNode };

const GlobalSongPlayer = async ({ children }: GlobalPlayerProps) => {
  const [lastPlayedSong, initialMode, favouriteSongs, moodlists] =
    await Promise.all([
      getUserLastPlayedSong().then((res) => res ?? null),
      getUserPreference({ key: "songPlayerMode" }).then(
        (res) => (res as SongPlayerMode) ?? "normal",
      ),
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
