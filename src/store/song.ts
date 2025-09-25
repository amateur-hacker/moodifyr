import type youtubePlayer from "youtube-player";
import { create } from "zustand";
import type {
  FavouriteSong,
  HistorySong,
  Song,
  SongPlayerMode,
} from "@/app/_types";
import { saveUserPreference } from "@/app/actions";

type SongPlayerState = {
  currentSong: Song | FavouriteSong | HistorySong | null;
  youtubeId: string | null;
  isPlaying: boolean;
  isLoading: boolean;
  progress: number;
  duration: number;
  playerRef: React.RefObject<ReturnType<typeof youtubePlayer> | null>;
  mode: SongPlayerMode;
  isPlayerFullScreen: boolean;
  songs: Song[];

  setCurrentSong: (song: Song | FavouriteSong | HistorySong | null) => void;
  setYoutubeId: (id: string | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
  setMode: (mode: SongPlayerMode) => Promise<void>;
  setIsPlayerFullScreen: (fullscreen: boolean) => void;
  setSongs: (songs: Song[]) => void;
  togglePlay: (e?: React.MouseEvent) => Promise<void>;
  setSong: (song: Song | FavouriteSong | HistorySong | null) => void;
  isCurrentSong: (song: Song | FavouriteSong | HistorySong) => boolean;
};

export const useSongPlayer = create<SongPlayerState>((set, get) => ({
  currentSong: null,
  youtubeId: null,
  isPlaying: false,
  isLoading: false,
  progress: 0,
  duration: 0,
  playerRef: { current: null },
  mode: "normal",
  isPlayerFullScreen: false,
  songs: [],

  setCurrentSong: (song) => set({ currentSong: song }),
  setYoutubeId: (id) => set({ youtubeId: id }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setProgress: (progress) => set({ progress }),
  setDuration: (duration) => set({ duration }),
  setIsPlayerFullScreen: (fullscreen) =>
    set({ isPlayerFullScreen: fullscreen }),
  setSongs: (songs) => set({ songs }),

  setMode: async (mode) => {
    set({ mode });
    const song = get().currentSong;
    if (song) {
      await saveUserPreference({ key: "songPlayerMode", value: mode });
    }
  },

  togglePlay: async (e) => {
    e?.stopPropagation();
    const { isPlaying, playerRef } = get();
    if (!playerRef.current) return;

    try {
      if (isPlaying) {
        await playerRef.current.pauseVideo();
        set({ isPlaying: false });
      } else {
        await playerRef.current.playVideo();
        set({ isPlaying: true });
      }
    } catch (error) {
      console.error("Error toggling play:", error);
    }
  },

  setSong: (song) => {
    set({
      currentSong: song,
      youtubeId: song?.id,
      isPlaying: true,
    });
  },

  isCurrentSong: (song) => {
    const currentSong = get().currentSong;
    if (!currentSong) return false;

    if ("historyId" in song && "historyId" in currentSong) {
      return song.historyId === currentSong.historyId;
    }
    if ("favouriteId" in song && "favouriteId" in currentSong) {
      return song.favouriteId === currentSong.favouriteId;
    }

    console.log("songId");

    return currentSong.id === song.id;
  },
}));
