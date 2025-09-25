import type React from "react";
import { SongPlayerBar } from "@/app/_components/song-player-bar";
import { SongPlayerEngine } from "@/app/_components/song-player-engine";
import { SongPlayerProvider } from "@/app/_context/song-player-context";
import type { SongPlayerMode } from "@/app/_types";
import { getUserLastPlayedSong, getUserPreference } from "@/app/queries";

type GlobalPlayerProps = { children: React.ReactNode };

const GlobalSongPlayer = async ({ children }: GlobalPlayerProps) => {
  const [lastPlayedSong, initialMode] = await Promise.all([
    getUserLastPlayedSong().then((res) => res ?? null),
    getUserPreference({ key: "songPlayerMode" }).then(
      (res) => (res as SongPlayerMode) ?? "normal",
    ),
  ]);

  return (
    <SongPlayerProvider initialSong={lastPlayedSong} initialMode={initialMode}>
      {children}
      <SongPlayerEngine />
      <SongPlayerBar />
    </SongPlayerProvider>
  );
};

export { GlobalSongPlayer };
