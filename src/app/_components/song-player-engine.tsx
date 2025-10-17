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
import { toast } from "sonner";

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
    lastActionRef,
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
        setIsPlaying(true);
        const d = await playerRef.current.getDuration();
        setDuration(Number.isFinite(d) ? d : 0);
        // setIsPlaying(true);

        // if (
        //   currentSongRef.current &&
        //   lastTrackedIdRef.current !== currentSongRef.current.id
        // ) {
        //   // lastTrackedIdRef.current = currentSongRef.current.id;
        //   // await trackUserSongPlayHistory({
        //   //   song: {
        //   //     id: currentSongRef.current.id,
        //   //     title: currentSongRef.current.title,
        //   //     thumbnail: currentSongRef.current.thumbnail,
        //   //     duration: currentSongRef.current.duration,
        //   //   },
        //   // });
        // }
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

  // function handlePlayerError(
  //   // biome-ignore lint/suspicious/noExplicitAny: <_>
  //   event: CustomEvent<any> & { data: number },
  // ) {
  //   const code = event.data;
  //   console.warn("YouTube Player Error:", code);
  //
  //   if (![100, 101, 150].includes(code)) return;
  //
  //   setIsLoading(false);
  //   setIsPlaying(false);
  //
  //   const currentIndex = songsRef.current.findIndex(
  //     (s) => s.id === currentSongRef.current?.id,
  //   );
  //
  //   if (currentIndex !== -1 && currentIndex < songsRef.current.length - 1) {
  //     const nextSong = songsRef.current[currentIndex + 1];
  //     console.warn(
  //       `Video unavailable (code ${code}), skipping to next song: ${nextSong.title}`,
  //     );
  //     setSong(nextSong);
  //   } else if (
  //     modeRef.current === "repeat-all" &&
  //     songsRef.current.length > 0
  //   ) {
  //     const firstSong = songsRef.current[0];
  //     console.warn(
  //       `Video unavailable (code ${code}), looping to first song: ${firstSong.title}`,
  //     );
  //     setSong(firstSong);
  //   } else {
  //     console.warn("No next song available to skip to.");
  //   }
  // }

  function handlePlayerError(
    // biome-ignore lint/suspicious/noExplicitAny: <_>
    event: CustomEvent<any> & { data: number },
  ) {
    const code = event.data;
    console.warn("YouTube Player Error:", code);

    if (![100, 101, 150].includes(code)) return;

    setIsLoading(false);
    setIsPlaying(false);

    const currentIndex = songsRef.current.findIndex(
      (s) => s.id === currentSongRef.current?.id,
    );

    switch (lastActionRef.current) {
      case "prev": {
        console.warn(
          `Prev song unavailable (code ${code}), skipping further back`,
        );
        if (currentIndex > 0) {
          const prevSong = songsRef.current[currentIndex - 1];
          setSong(prevSong);
        } else {
          toast.error("Previous song unavailable");
        }
        return;
      }
      case "manual":
      case "next":
      case "auto": {
        // existing skip logic
        if (currentIndex !== -1 && currentIndex < songsRef.current.length - 1) {
          const nextSong = songsRef.current[currentIndex + 1];
          console.warn(
            `Video unavailable (code ${code}), skipping to next song: ${nextSong.title}`,
          );
          setSong(nextSong);
        } else if (
          modeRef.current === "repeat-all" &&
          songsRef.current.length > 0
        ) {
          const firstSong = songsRef.current[0];
          console.warn(
            `Video unavailable (code ${code}), looping to first song: ${firstSong.title}`,
          );
          setSong(firstSong);
        }
        return;
      }
      // case "manual": {
      //   toast.error("This song isn’t available.");
      //   return;
      // }
      default:
        console.warn("Unhandled player error context:", lastActionRef.current);
        return;
    }
  }

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
      // @ts-expect-error
      player.on("error", handlePlayerError);
      playerRef.current = player;
    }

    return () => {
      clearProgressTimer();
      try {
        // @ts-expect-error
        playerRef.current?.off("stateChange", handlePlayerStateChange);
        // @ts-expect-error
        playerRef.current?.off("error", handlePlayerError);
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
          if (currentTime == null) return;

          lastTimeRef.current = currentTime;
          setProgress(currentTime);

          if (
            currentSongRef.current &&
            currentTime >= Math.min(5, duration * 0.1) &&
            lastTrackedIdRef.current !== currentSongRef.current.id
          ) {
            lastTrackedIdRef.current = currentSongRef.current.id;
            try {
              await trackUserSongPlayHistory({
                song: {
                  id: currentSongRef.current.id,
                  title: currentSongRef.current.title,
                  thumbnail: currentSongRef.current.thumbnail,
                  duration: currentSongRef.current.duration,
                },
              });
            } catch (err) {
              console.error(
                `Error tracking song play history for "${currentSongRef.current.title}":`,
                err,
              );
            }
          }

          if (
            currentSongRef.current &&
            duration > 0 &&
            currentTime >= duration * 0.6 &&
            lastAnalyticsIdRef.current !== currentSongRef.current.id
          ) {
            lastAnalyticsIdRef.current = currentSongRef.current.id;
            try {
              await trackUserSongAnalyticsPlayHistory({
                song: currentSongRef.current,
              });
            } catch (err) {
              console.error(
                `Error tracking song analytics for "${currentSongRef.current.title}":`,
                err,
              );
            }
          }
        } catch (err) {
          console.error("Error getting current time from playerRef:", err);
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
        try {
          await playerRef.current?.seekTo(lastTimeRef.current, true);
          await playerRef.current?.playVideo();
        } catch (err) {
          console.warn("Background play blocked or failed to resume:", err);
        }
      }
      if (document.visibilityState === "visible" && playerRef.current) {
        const state = await playerRef.current.getPlayerState();
        setIsPlaying(state === 1);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return null;
}
