"use client";
import { useEffect, useRef, useState } from "react";
import { useMotionValue, useMotionValueEvent, useSpring } from "framer-motion";
import { useSongPlayer } from "@/app/(app)/_context/song-player-context";

export const useSmoothProgress = () => {
  const { playerRef, isPlaying, duration, progress, isPlayerFullScreen } =
    useSongPlayer();
  const [visualProgress, setVisualProgress] = useState(0);

  // Create motion value for smooth animation
  const motionProgress = useMotionValue(0);

  // Apply spring animation for smooth transitions
  const smoothProgress = useSpring(motionProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const lastUpdateRef = useRef(0);

  // Subscribe to smoothProgress changes
  useMotionValueEvent(smoothProgress, "change", (latest) => {
    setVisualProgress(latest);
  });

  // Update current time from player
  useEffect(() => {
    if (!isPlaying || !playerRef.current) {
      return;
    }

    let rafId: number;

    const update = async () => {
      try {
        const now = performance.now();

        if (now - lastUpdateRef.current > 80) {
          const current = await playerRef.current?.getCurrentTime();
          if (current && duration > 0) {
            motionProgress.set(current);
          }
          lastUpdateRef.current = now;
        }
      } catch (err) {
        console.warn("Error updating progress:", err);
      }

      rafId = requestAnimationFrame(update);
    };

    rafId = requestAnimationFrame(update);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isPlaying, duration, playerRef, motionProgress]);

  // // Sync with external progress changes (seeking)
  // useEffect(() => {
  //   motionProgress.set(progress);
  // }, [progress, motionProgress]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <_>
  useEffect(() => {
    const updateCurrentTime = async () => {
      try {
        const current = await playerRef.current?.getCurrentTime();
        motionProgress.set(current ?? 0);
      } catch (err) {
        console.error("Failed to get current time:", err);
      }
    };

    updateCurrentTime();
  }, [isPlayerFullScreen]);

  return visualProgress;
};
