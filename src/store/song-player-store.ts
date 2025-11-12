import type youtubePlayer from "youtube-player";
import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import type {
  SongPlayerMode,
  SongWithUniqueIdSchema,
} from "@/app/(app)/_types";
import { saveUserPreference } from "@/app/(app)/actions";
import { getUniqueSongId } from "@/app/(app)/utils";

type LastAction = "manual" | "next" | "prev" | "auto" | null;

type SongPlayerState = {
  currentSong: SongWithUniqueIdSchema | null;
  youtubeId: string | null;
  isPlaying: boolean;
  isLoading: boolean;
  progress: number;
  duration: number;
  mode: SongPlayerMode;
  isPlayerFullScreen: boolean;
  songs: SongWithUniqueIdSchema[];
  shuffleQueue: SongWithUniqueIdSchema[];
  shuffleIndex: number;
  lastAction: LastAction;
  recentSongIds: string[];
  playerRef: { current: ReturnType<typeof youtubePlayer> | null };

  setCurrentSong: (s: SongWithUniqueIdSchema | null) => void;
  setSong: (song: SongWithUniqueIdSchema | null, isPlaying?: boolean) => void;
  togglePlay: (event?: React.MouseEvent) => Promise<void>;
  setIsPlaying: (v: boolean) => void;
  setIsLoading: (v: boolean) => void;
  setProgress: (v: number) => void;
  setDuration: (v: number) => void;
  setMode: (m: SongPlayerMode) => Promise<void>;
  setIsPlayerFullScreen: (v: boolean) => void;
  setSongs: (s: SongWithUniqueIdSchema[]) => void;
  setShuffleQueue: (q: SongWithUniqueIdSchema[]) => void;
  setShuffleIndex: (i: number) => void;
  setLastAction: (a: LastAction) => void;
  setRecentSongIds: (ids: string[]) => void;
  addRecentSong: (id: string) => void;
  isCurrentSong: (song: SongWithUniqueIdSchema) => boolean;
};

export const useSongPlayerStore = create<SongPlayerState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      currentSong: null,
      youtubeId: null,
      isPlaying: false,
      isLoading: false,
      progress: 0,
      duration: 0,
      mode: "normal",
      isPlayerFullScreen: false,
      songs: [],
      shuffleQueue: [],
      shuffleIndex: -1,
      lastAction: null,
      recentSongIds: [],
      playerRef: { current: null },

      setCurrentSong: (s) => set({ currentSong: s }, false, "setCurrentSong"),

      setSong: (song, isPlaying = true) => {
        if (!song) {
          set(
            {
              currentSong: null,
              youtubeId: null,
              isPlaying: false,
              progress: 0,
              duration: 0,
            },
            false,
            "setSong(null)",
          );
          return;
        }

        const prev = get().currentSong;
        set(
          { currentSong: song, youtubeId: song.id, isPlaying },
          false,
          "setSong",
        );

        const newId = getUniqueSongId(song);
        const currentId = prev ? getUniqueSongId(prev) : null;
        if (newId !== currentId) {
          set({ progress: 0, duration: 0 }, false, "resetProgressDuration");

          const persistedSong = { ...song };
          if (song.favouriteId) persistedSong.favouriteId = song.favouriteId;
          else if (song.historyId) persistedSong.historyId = song.historyId;
          else if (song.moodlistSongId)
            persistedSong.moodlistSongId = song.moodlistSongId;
          else if (song.dashboardSongId)
            persistedSong.dashboardSongId = song.dashboardSongId;
          else persistedSong.searchId = song.searchId;

          saveUserPreference({
            key: "lastPlayedSong",
            value: JSON.stringify(persistedSong),
          }).catch((err) =>
            console.warn("Error saving last played song:", err),
          );
        }
      },

      togglePlay: async (e?) => {
        e?.stopPropagation?.();
        const pRef = get().playerRef.current;
        if (!pRef) return;
        try {
          if (get().isPlaying) {
            await pRef.pauseVideo();
            set({ isPlaying: false }, false, "pause");
          } else {
            await pRef.playVideo();
            set({ isPlaying: true }, false, "play");
          }
        } catch (error) {
          console.error("Error toggling play:", error);
        }
      },

      setIsPlaying: (v) => set({ isPlaying: v }, false, "setIsPlaying"),
      setIsLoading: (v) => set({ isLoading: v }, false, "setIsLoading"),
      setProgress: (v) => set({ progress: v }, false, "setProgress"),
      setDuration: (v) => set({ duration: v }, false, "setDuration"),

      setMode: async (m) => {
        set({ mode: m }, false, "setMode");
        const song = get().currentSong;
        if (song) {
          try {
            await saveUserPreference({ key: "songPlayerMode", value: m });
          } catch (err) {
            console.warn("Failed to persist mode:", err);
          }
        }
      },

      setIsPlayerFullScreen: (v) =>
        set({ isPlayerFullScreen: v }, false, "setIsPlayerFullScreen"),
      setSongs: (s) => set({ songs: s }, false, "setSongs"),
      setShuffleQueue: (q) =>
        set({ shuffleQueue: q }, false, "setShuffleQueue"),
      setShuffleIndex: (i) =>
        set({ shuffleIndex: i }, false, "setShuffleIndex"),
      setLastAction: (a) => set({ lastAction: a }, false, "setLastAction"),
      setRecentSongIds: (ids) =>
        set({ recentSongIds: ids }, false, "setRecentSongIds"),

      addRecentSong: (id) =>
        set(
          (state) => {
            const filtered = state.recentSongIds.filter((s) => s !== id);
            const totalSongs = state.songs.length;
            const recentLimit =
              totalSongs <= 20
                ? Math.floor(totalSongs / 2)
                : Math.max(10, Math.min(50, Math.floor(totalSongs * 0.2)));
            const next = [id, ...filtered].slice(0, recentLimit);
            return { recentSongIds: next };
          },
          false,
          "addRecentSong",
        ),

      isCurrentSong: (song) => {
        const cur = get().currentSong;
        if (!cur) return false;
        return getUniqueSongId(cur) === getUniqueSongId(song);
      },
    })),
  ),
);
