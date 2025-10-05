"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { isMobile } from "react-device-detect";
import youtubePlayer from "youtube-player";
import { useSongPlayer } from "@/app/_context/song-player-context";
import type { SongWithUniqueIdSchema } from "@/app/_types";
import {
  trackUserSongAnalyticsPlayHistory,
  trackUserSongPlayHistory,
} from "@/app/search/actions";

export function SongPlayerEngine() {
  const {
    youtubeId,
    playerRef,
    setIsLoading,
    duration,
    setDuration,
    setProgress,
    setIsPlaying,
    currentSong,
    setSong,
    isPlaying,
    mode,
    songs,
  } = useSongPlayer();

  const songsRef = useRef<SongWithUniqueIdSchema[]>(songs);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentSongRef = useRef<SongWithUniqueIdSchema | null>(null);
  const modeRef = useRef(mode);
  const isPlayingRef = useRef(isPlaying);
  const lastTimeRef = useRef(0);
  const lastTrackedIdRef = useRef<string | null>(null);
  const lastAnalyticsIdRef = useRef<string | null>(null);

  useEffect(() => {
    songsRef.current = songs;
  }, [songs]);

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
    // biome-ignore lint/suspicious/noExplicitAny: <_>
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
        // setIsPlaying(true);

        if (
          currentSongRef.current &&
          lastTrackedIdRef.current !== currentSongRef.current.id
        ) {
          lastTrackedIdRef.current = currentSongRef.current.id;
          await trackUserSongPlayHistory({
            song: {
              id: currentSongRef.current.id,
              title: currentSongRef.current.title,
              thumbnail: currentSongRef.current.thumbnail,
              duration: currentSongRef.current.duration,
            },
          });
        }
        break;
      }
      case 2:
        setIsPlaying(false);
        break;
      case 0: {
        const currentIndex = songsRef.current.findIndex(
          (s) => s.id === currentSongRef.current?.id,
        );

        if (!currentSongRef.current || songsRef.current.length === 0) {
          setIsPlaying(false);
          return;
        }

        if (modeRef.current === "repeat-one") {
          try {
            await playerRef.current.seekTo(0, true);
            await playerRef.current.playVideo();
          } catch (err) {
            console.warn("Error repeating song:", err);
            setIsPlaying(false);
          }
          return;
        }

        if (modeRef.current === "shuffle") {
          const otherSongs = songsRef.current.filter(
            (s) => s.id !== currentSongRef.current?.id,
          );
          if (otherSongs.length > 0) {
            const randomSong =
              otherSongs[Math.floor(Math.random() * otherSongs.length)];
            setSong(randomSong);
          } else {
            setSong(currentSongRef.current);
          }
          return;
        }

        if (currentIndex !== -1) {
          if (currentIndex < songsRef.current.length - 1) {
            const nextSong = songsRef.current[currentIndex + 1];
            setSong(nextSong);
          } else if (modeRef.current === "repeat-all") {
            const firstSong = songsRef.current[0];
            setSong(firstSong);
          } else {
            setIsPlaying(false);
          }
        } else {
          setIsPlaying(false);
        }
        break;
      }
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <_>
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: <_>
  useEffect(() => {
    clearProgressTimer();

    if (playerRef.current && isPlaying) {
      intervalRef.current = setInterval(async () => {
        try {
          const currentTime = await playerRef.current?.getCurrentTime();
          if (currentTime != null) {
            lastTimeRef.current = currentTime;
            setProgress(currentTime);

            if (
              currentSongRef.current &&
              duration > 0 &&
              currentTime >= duration * 0.6 &&
              lastAnalyticsIdRef.current !== currentSongRef.current.id
            ) {
              lastAnalyticsIdRef.current = currentSongRef.current.id;
              await trackUserSongAnalyticsPlayHistory({
                song: currentSongRef.current,
              });
            }
          }
        } catch (err) {
          console.warn("Error getting current time:", err);
        }
      }, 1000);
    }

    return clearProgressTimer;
  }, [isPlaying, setProgress, duration]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <_>
  useEffect(() => {
    if (!playerRef.current || !youtubeId) return;

    setIsLoading(true);
    setProgress(0);
    playerRef.current.loadVideoById(youtubeId);
  }, [youtubeId, setIsLoading, setProgress]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <_>
  useEffect(() => {
    if (!isMobile || !playerRef.current) return;

    const handleVisibility = async () => {
      if (document.hidden && isPlayingRef.current) {
        const timeout = setTimeout(async () => {
          try {
            await playerRef.current?.seekTo(lastTimeRef.current, true);
            await playerRef.current?.playVideo();
          } catch (err) {
            console.warn("Autoplay blocked or failed resume:", err);
          }
        }, 1000);

        return () => clearTimeout(timeout);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return null;
}
