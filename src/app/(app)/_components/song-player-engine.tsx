"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { isMobile } from "react-device-detect";
import { toast } from "sonner";
import youtubePlayer from "youtube-player";
import { useSongPlayer } from "@/app/(app)/_context/song-player-context";
import type { SongWithUniqueIdSchema } from "@/app/(app)/_types";
import { saveUserPreference } from "@/app/(app)/actions";
import {
  trackUserSongAnalyticsPlayHistory,
  trackUserSongPlayHistory,
} from "@/app/(app)/search/actions";
import { generateShuffleQueue } from "@/app/(app)/utils";

const SongPlayerEngine = () => {
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
    addRecentSong,
    setIsPlayerFullScreen,
    shuffleQueue,
    setShuffleQueue,
    shuffleIndex,
    setShuffleIndex,
    recentSongIds,
    lastAction,
  } = useSongPlayer();

  const songsRef = useRef<SongWithUniqueIdSchema[]>(songs);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentSongRef = useRef<SongWithUniqueIdSchema | null>(null);
  const modeRef = useRef(mode);
  const lastActionRef = useRef(lastAction);
  const shuffleQueueRef = useRef(shuffleQueue);
  const shuffleIndexRef = useRef(shuffleIndex);
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

  useEffect(() => {
    lastActionRef.current = lastAction;
  }, [lastAction]);

  useEffect(() => {
    shuffleQueueRef.current = shuffleQueue;
  }, [shuffleQueue]);

  useEffect(() => {
    shuffleIndexRef.current = shuffleIndex;
  }, [shuffleIndex]);

  // // biome-ignore lint/correctness/useExhaustiveDependencies: <_>
  // useEffect(() => {
  //   if (!playerRef.current) return;
  //
  //   if (!playerRef.current.shuffleQueueRef) {
  //     playerRef.current.shuffleQueueRef = { current: [] };
  //   }
  //   if (!playerRef.current.shuffleIndexRef) {
  //     playerRef.current.shuffleIndexRef = { current: -1 };
  //   }
  // }, []);

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
        break;
      }
      case 2:
        setIsPlaying(false);
        break;
      case 0: {
        if (
          !currentSongRef.current ||
          (songsRef.current.length === 0 && modeRef.current !== "repeat-one")
        ) {
          setIsPlaying(false);
          return;
        }

        if (modeRef.current === "repeat-one") {
          try {
            lastTrackedIdRef.current = null;
            lastAnalyticsIdRef.current = null;

            await playerRef.current.seekTo(0, true);
            await playerRef.current.playVideo();
          } catch (err) {
            console.warn("Error repeating song:", err);
            setIsPlaying(false);
          }
          return;
        }

        if (modeRef.current === "shuffle") {
          let queue = shuffleQueueRef.current;
          let index = shuffleIndexRef.current;

          index++;

          if (index >= queue.length) {
            queue = generateShuffleQueue(songsRef.current, null, recentSongIds);
            index = 0;
          }

          addRecentSong(currentSongRef.current.id);
          // setShuffleQueue([...queue]);
          setShuffleQueue(queue);
          setShuffleIndex(index);

          const nextSong = queue[index];
          if (nextSong) setSong(nextSong);
          return;
        }

        const currentIndex = songsRef.current.findIndex(
          (s) => s.id === currentSongRef.current?.id,
        );
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

  const handlePlayerError = (
    // biome-ignore lint/suspicious/noExplicitAny: <_>
    event: CustomEvent<any> & { data: number },
  ) => {
    const code = event.data;
    console.warn("YouTube Player Error:", code);

    const getSlicedSongTitle = (songTitle: string, maxLength = 30): string => {
      const title = songTitle.trim();

      const sliced =
        title.length > maxLength ? `${title.slice(0, maxLength)}…` : title;

      const hasSongWord = /\bsong\b/i.test(sliced);

      return hasSongWord ? sliced : `${sliced} song`;
    };

    const resetPlayer = () => {
      document.documentElement.style.setProperty("--player-height", `0px`);
      setSong(null);
      setIsPlayerFullScreen(false);
      saveUserPreference({
        key: "lastPlayedSong",
        value: JSON.stringify(""),
      }).catch((error) =>
        console.warn("Error saving last played song:", error),
      );
    };

    if (![100, 101, 150].includes(code) || !currentSongRef.current) return;

    setIsLoading(false);
    setIsPlaying(false);

    const currentIndex = songsRef.current.findIndex(
      (s) => s.id === currentSongRef.current?.id,
    );

    toast.error(
      <span>
        <b>{getSlicedSongTitle(currentSongRef.current.title)}</b> is
        unavailable.
      </span>,
    );

    switch (lastActionRef.current) {
      case "prev": {
        if (modeRef.current === "shuffle") {
          const currentShuffleIndex = shuffleQueueRef.current.findIndex(
            (s) => s.id === currentSongRef.current?.id,
          );
          const prevShuffleSong =
            shuffleQueueRef.current[currentShuffleIndex - 1];

          addRecentSong(currentSongRef.current?.id);

          if (prevShuffleSong) {
            console.warn(
              `'${getSlicedSongTitle(currentSongRef.current.title)}' is unavailable, skipping to prev shuffle song: '${getSlicedSongTitle(prevShuffleSong.title)}'`,
            );
            setSong(prevShuffleSong);
            setShuffleIndex(currentShuffleIndex - 1);
            addRecentSong(prevShuffleSong.id);
          } else {
            console.warn(
              `'${getSlicedSongTitle(currentSongRef.current.title)}' is unavailable, no prev shuffle song available`,
            );
            resetPlayer();
          }
        } else {
          if (currentIndex > 0) {
            const prevSong = songsRef.current[currentIndex - 1];
            console.warn(
              `'${getSlicedSongTitle(currentSongRef.current.title)}' is unavailable, skipping to prev song: '${getSlicedSongTitle(prevSong.title)}'`,
            );
            setSong(prevSong);
          } else {
            console.warn(
              `'${getSlicedSongTitle(currentSongRef.current.title)}' is unavailable, no prev song available`,
            );
          }
        }
        return;
      }
      case "manual":
      case "next":
      case "auto": {
        if (modeRef.current === "shuffle") {
          const currentShuffleIndex = shuffleQueueRef.current.findIndex(
            (s) => s.id === currentSongRef.current?.id,
          );
          const nextShuffleSong =
            shuffleQueueRef.current[currentShuffleIndex + 1];

          addRecentSong(currentSongRef.current?.id);

          if (nextShuffleSong) {
            console.warn(
              `'${getSlicedSongTitle(currentSongRef.current.title)}' is unavailable, skipping to next shuffle song: '${getSlicedSongTitle(nextShuffleSong.title)}'`,
            );
            setSong(nextShuffleSong);
            setShuffleIndex(currentShuffleIndex + 1);
            addRecentSong(nextShuffleSong.id);
          } else {
            if (songsRef.current.length) {
              console.warn(
                `'${getSlicedSongTitle(currentSongRef.current.title)}' is unavailable, no next shuffle song available. Generating new shuffle queue...`,
              );
              const queue = generateShuffleQueue(
                songsRef.current,
                null,
                recentSongIds,
              );
              const index = 0;
              setShuffleQueue(queue);
              setShuffleIndex(index);
              const nextSong = queue[index];
              if (nextSong) {
                setSong(nextSong);
              }
            } else {
              console.warn(
                `'${getSlicedSongTitle(currentSongRef.current.title)}' is unavailable, no next shuffle song available.`,
              );
              resetPlayer();
            }
          }
        } else if (
          currentIndex !== -1 &&
          currentIndex < songsRef.current.length - 1
        ) {
          const nextSong = songsRef.current[currentIndex + 1];
          if (nextSong) {
            console.warn(
              `'${getSlicedSongTitle(currentSongRef.current.title)}' is unavailable, skipping to next song: '${getSlicedSongTitle(nextSong.title)}'`,
            );
            setSong(nextSong);
          } else {
            console.warn(
              `'${getSlicedSongTitle(currentSongRef.current.title)}' is unavailable, no next song available`,
            );
            resetPlayer();
          }
        } else {
          if (lastActionRef.current === "manual") {
            document.documentElement.style.setProperty(
              "--player-height",
              `0px`,
            );
            setSong(null);
            setIsPlayerFullScreen(false);
            saveUserPreference({
              key: "lastPlayedSong",
              value: JSON.stringify(""),
            }).catch((error) =>
              console.warn("Error saving last played song:", error),
            );
            resetPlayer();
          }
        }
        return;
      }
      default:
        console.warn("Unhandled player error context:", lastActionRef.current);
        return;
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
            trackUserSongPlayHistory({
              song: {
                id: currentSongRef.current.id,
                title: currentSongRef.current.title,
                thumbnail: currentSongRef.current.thumbnail,
                duration: currentSongRef.current.duration,
              },
            }).catch((err) =>
              console.error(
                `Error tracking song play history for '${currentSongRef?.current?.title}':`,
                err,
              ),
            );
          }

          if (
            currentSongRef.current &&
            duration > 0 &&
            currentTime >= duration * 0.6 &&
            lastAnalyticsIdRef.current !== currentSongRef.current.id
          ) {
            lastAnalyticsIdRef.current = currentSongRef.current.id;
            trackUserSongAnalyticsPlayHistory({
              song: currentSongRef.current,
            }).catch((err) =>
              console.error(
                `Error tracking song analytics for '${currentSongRef?.current?.title}':`,
                err,
              ),
            );
          }
        } catch (err) {
          console.error("Error getting current time from playerRef:", err);
        }
      }, 1000);
    }

    return clearProgressTimer;
  }, [isPlaying, duration]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <_>
  useEffect(() => {
    if (!playerRef.current || !youtubeId) return;

    setIsLoading(true);
    setProgress(0);
    playerRef.current.loadVideoById(youtubeId);
  }, [youtubeId]);

  // // biome-ignore lint/correctness/useExhaustiveDependencies: <_>
  // useEffect(() => {
  //   if (!playerRef.current || !youtubeId) return;
  //
  //   setIsLoading(true);
  //   setProgress(0);
  //   playerRef.current.loadVideoById(youtubeId);
  //
  //   let retryCount = 0;
  //   let stuckTimer: NodeJS.Timeout | null = null;
  //
  //   const handleRetryCheck = async () => {
  //     if (!playerRef.current) return;
  //     const state = await playerRef.current.getPlayerState();
  //     console.log(state);
  //
  //     if (state === 1) {
  //       // Playback started
  //       // setIsLoading(false);
  //       // setIsPlaying(true);
  //       console.log("Playback started!");
  //       if (stuckTimer) clearTimeout(stuckTimer);
  //     } else if (state === 3 || state === -1) {
  //       // Still buffering or unstarted
  //       stuckTimer = setTimeout(() => {
  //         retryCount += 1;
  //         if (retryCount <= 3) {
  //           console.warn(`Retry attempt ${retryCount}...`);
  //           playerRef.current?.loadVideoById(youtubeId);
  //           handleRetryCheck(); // check again after retry
  //         } else {
  //           setIsLoading(false);
  //           toast.error("Slow internet detected. Unable to start playback.", {
  //             action: {
  //               label: "Retry Now",
  //               onClick: () => {
  //                 retryCount = 0;
  //                 setIsLoading(true);
  //                 playerRef.current?.loadVideoById(youtubeId);
  //                 handleRetryCheck();
  //               },
  //             },
  //           });
  //         }
  //       }, 5000);
  //     }
  //   };
  //
  //   // Subscribe to player state changes
  //   playerRef.current.on("stateChange", handleRetryCheck);
  //
  //   // Start initial check
  //   handleRetryCheck();
  //
  //   return () => {
  //     if (stuckTimer) clearTimeout(stuckTimer);
  //     try {
  //       // @ts-expect-error
  //       playerRef.current?.off("stateChange", handleRetryCheck);
  //     } catch {}
  //   };
  // }, [youtubeId]);

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
};

export { SongPlayerEngine };
