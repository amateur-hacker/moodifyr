"use client";

import { useEffect, useRef, useState } from "react";
import YoutubePlayer from "youtube-player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Play, Pause } from "lucide-react";

type VideoData = {
  id: string;
  title: string;
  url: string;
  duration: {
    timestamp: string;
    seconds: number;
  };
  views: number;
  author: string;
  thumbnail: string;
};

export default function SongClient({
  videoData,
  youtubeId,
}: {
  videoData: VideoData;
  youtubeId: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<ReturnType<typeof YoutubePlayer> | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  // format seconds -> mm:ss
  const formatTime = (seconds: number) => {
    if (!seconds || Number.isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!youtubeId) return;

    const id = setTimeout(() => {
      if (!containerRef.current) return;

      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }

      const player = YoutubePlayer(containerRef.current, {
        videoId: youtubeId,
        playerVars: { autoplay: 0, controls: 0 },
      });

      player.on("stateChange", (e) => {
        if (e.data === 1) setIsPlaying(true); // PLAYING
        if (e.data === 2) setIsPlaying(false); // PAUSED
      });

      player.getDuration().then((d) => setDuration(d));

      const interval = setInterval(async () => {
        const t = await player.getCurrentTime();
        setProgress(t);
      }, 1000);

      playerRef.current = player;

      return () => {
        if (interval) clearInterval(interval);
        if (playerRef.current) playerRef.current.destroy();
      };
    });

    return () => clearTimeout(id);
  }, [youtubeId]);

  const handlePlayPause = async () => {
    if (!playerRef.current) return;
    isPlaying
      ? await playerRef.current.pauseVideo()
      : await playerRef.current.playVideo();
  };

  const handleSeek = async (val: number[]) => {
    if (!playerRef.current) return;
    await playerRef.current.seekTo(val[0], true);
    setProgress(val[0]);
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{videoData.title || "Loading..."}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 items-center">
          {/* Thumbnail with overlay play/pause */}
          <div className="relative w-full">
            <img
              src={videoData.thumbnail}
              alt={videoData.title}
              className="rounded-lg shadow-md w-full"
            />
            <button
              onClick={handlePlayPause}
              className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 rounded-lg"
            >
              {isPlaying ? (
                <Pause size={48} className="text-white" />
              ) : (
                <Play size={48} className="text-white" />
              )}
            </button>
          </div>

          {/* Slider with timestamps */}
          <div className="w-full">
            <Slider
              value={[progress]}
              max={duration}
              step={1}
              onValueChange={handleSeek}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground mt-1">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Hidden YouTube iframe */}
          <div key={youtubeId} ref={containerRef} className="hidden w-0 h-0" />
        </CardContent>
      </Card>
    </div>
  );
}
