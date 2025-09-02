"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import youtubePlayer from "youtube-player";
import { useSongPlayer } from "@/app/search/_context/song-player-context";

type Song = {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  duration: { timestamp: string; seconds: number };
};

type SongPlayerEngineProps = {
  songs: Song[];
};

export function SongPlayerEngine({ songs }: SongPlayerEngineProps) {
  const {
    youtubeId,
    playerRef,
    setIsLoading,
    setDuration,
    setProgress,
    setIsPlaying,
    currentSong,
    setSong,
    isPlaying,
    mode,
  } = useSongPlayer();

  // host lives OUTSIDE React tree
  const hostRef = useRef<HTMLDivElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentSongRef = useRef<Song | null>(null);
  const modeRef = useRef(mode);
  const isPlayingRef = useRef(isPlaying);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    currentSongRef.current = currentSong;
  }, [currentSong]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const clearProgressTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handlePlayerStateChange = async (
    // biome-ignore lint/suspicious/noExplicitAny: YouTube event shape
    event: CustomEvent<any> & { data: number },
  ) => {
    if (!playerRef.current) return;

    switch (event.data) {
      case -1:
        setIsLoading(true);
        break;
      case 1: {
        setIsLoading(false);
        const d = await playerRef.current.getDuration();
        setDuration(Number.isFinite(d) ? d : 0);
        setIsPlaying(true);
        break;
      }
      case 2:
        setIsPlaying(false);
        break;
      case 0: {
        const currentIndex = songs.findIndex(
          (s) => s.id === currentSongRef.current?.id,
        );

        if (!currentSongRef.current) {
          setIsPlaying(false);
          return;
        }

        if (modeRef.current === "repeat") {
          try {
            await playerRef.current.seekTo(0, true);
            await playerRef.current.playVideo();
          } catch (err) {
            console.warn("Error repeating song:", err);
          }
          return;
        }

        if (modeRef.current === "shuffle") {
          const otherSongs = songs.filter(
            (s) => s.id !== currentSongRef.current?.id,
          );
          if (otherSongs.length > 0) {
            const randomSong =
              otherSongs[Math.floor(Math.random() * otherSongs.length)];
            setSong(randomSong, randomSong.id);
          } else {
            setIsPlaying(false);
          }
          return;
        }

        if (currentIndex !== -1 && currentIndex < songs.length - 1) {
          const nextSong = songs[currentIndex + 1];
          setSong(nextSong, nextSong.id);
        } else {
          setIsPlaying(false);
        }
        break;
      }
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <don't need extra dependencies>
  useLayoutEffect(() => {
    if (!hostRef.current) {
      const host = document.createElement("div");
      host.id = "yt-audio-host";
      host.style.position = "fixed";
      host.style.inset = "0";
      host.style.width = "0px";
      host.style.height = "0px";
      host.style.overflow = "hidden";
      host.style.opacity = "0";
      host.style.pointerEvents = "none";
      document.body.appendChild(host);
      hostRef.current = host;
    }

    if (!playerRef.current && hostRef.current) {
      const player = youtubePlayer(hostRef.current, {
        width: 0,
        height: 0,
        playerVars: {
          autoplay: 0,
          controls: 0,
          rel: 0,
          playsinline: 1,
          origin: window.location.origin,
        },
      });

      player.on("stateChange", handlePlayerStateChange);
      playerRef.current = player;
    }

    return () => {
      clearProgressTimer();
      try {
        // @ts-expect-error
        playerRef.current?.off("stateChange", handlePlayerStateChange);
      } catch {}
      try {
        playerRef.current?.destroy?.();
      } catch (e) {
        console.warn("YT destroy failed:", e);
      }
      playerRef.current = null;

      if (hostRef.current?.parentNode) {
        hostRef.current.parentNode.removeChild(hostRef.current);
      }
      hostRef.current = null;
    };
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <don't need extra dependencies>
  useEffect(() => {
    clearProgressTimer();

    if (playerRef.current && isPlaying) {
      intervalRef.current = setInterval(async () => {
        try {
          const t = await playerRef.current?.getCurrentTime();
          if (t != null) setProgress(t);
        } catch (err) {
          console.warn("Error getting current time:", err);
        }
      }, 1000);
    }
    return clearProgressTimer;
  }, [isPlaying, setProgress]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <don't need extra dependencies>
  useEffect(() => {
    if (!playerRef.current || !youtubeId) return;

    setIsLoading(true);
    setProgress(0);
    playerRef.current.loadVideoById(youtubeId);
  }, [youtubeId, setIsLoading, setProgress]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <don't need extra dependencies>
  useEffect(() => {
    clearProgressTimer();

    let lastProgressUpdate = 0;
    if (playerRef.current && isPlaying) {
      intervalRef.current = setInterval(async () => {
        try {
          const t = await playerRef.current?.getCurrentTime();
          if (t != null) {
            lastTimeRef.current = t;

            const now = Date.now();
            if (now - lastProgressUpdate > 500) {
              setProgress(t);
              lastProgressUpdate = now;
            }
          }
        } catch (err) {
          console.warn("Error getting current time:", err);
        }
      }, 100);
    }

    return clearProgressTimer;
  }, [isPlaying, setProgress]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <don't need extra dependencies>
  useEffect(() => {
    if (!playerRef.current) return;

    const handleVisibility = async () => {
      if (document.hidden && isPlayingRef.current) {
        try {
          await playerRef.current?.seekTo(lastTimeRef.current, true);
          await playerRef.current?.playVideo();
        } catch (err) {
          console.warn("Autoplay blocked or failed resume:", err);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return null;
}
