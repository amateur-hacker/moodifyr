"use client";

import { Pause, Play } from "lucide-react";
import Image from "next/image";
import { use, useEffect, useState } from "react";
import { isMobile, isTablet } from "react-device-detect";
import { useSongPlayer } from "@/app/(app)/_context/song-player-context";
import type { SongSchema } from "@/app/(app)/_types";
import { DateRangePicker } from "@/app/(app)/dashboard/_components/date-range-picker";
import { DateRangePresetSelect } from "@/app/(app)/dashboard/_components/date-range-preset-select";
import { DashboardAnalyticsContext } from "@/app/(app)/dashboard/_context/dashboard-analytics-context";
import { getUserDashboardData } from "@/app/(app)/dashboard/queries";
import { ComicText } from "@/components/magicui/comic-text";
import { TextAnimate } from "@/components/magicui/text-animate";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TextShimmer } from "@/components/ui/text-shimmer";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

type TopSong = {
  song: SongSchema;
  mood: string | null;
  times: number;
};
const Dashboard = () => {
  const { startDate, endDate, isPending } = use(DashboardAnalyticsContext);
  const [mood, setMood] = useState<{ mood: string; message: string } | null>(
    null,
  );
  const [topSongs, setTopSongs] = useState<TopSong[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const {
    isLoading,
    isPlaying,
    setSong,
    currentSong,
    togglePlay,
    setLastAction,
    setIsPlayerFullScreen,
  } = useSongPlayer();

  useEffect(() => {
    if (!startDate || !endDate || isPending) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      const data = await getUserDashboardData({
        startDate,
        endDate,
      });

      if (data) {
        setMood(data.mood);
        setTopSongs(data.topSongs);
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate, isPending]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    song: SongSchema,
  ) => {
    setLastAction("manual");

    if (!isPlaying) {
      setIsPlayerFullScreen(true);

      const state = window.history.state;
      if (!state?.fullscreen) {
        window.history.pushState({ fullscreen: true }, "");
      }
    }

    setSong(song, true);
    togglePlay(e);
  };
  return (
    <div className="space-y-6 flex flex-col min-h-[calc(100dvh-3.8rem)] pb-[var(--player-height,0px)]">
      <div className="flex w-full flex-col justify-between gap-2 px-4 sm:flex-row sm:gap-0">
        <DateRangePicker />
        <DateRangePresetSelect />
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-bold">Your Mood</h3>
        </CardHeader>
        <CardContent>
          {loading ? (
            <TextShimmer className="font-mono text-sm" duration={1}>
              Tracking mood...
            </TextShimmer>
          ) : mood?.mood || mood?.message ? (
            <div className="flex flex-col gap-2">
              <ComicText fontSize={5}>{mood?.mood}</ComicText>
              <TextAnimate
                animation="blurIn"
                className="font-medium text-sm sm:text-base"
              >
                {mood?.message}
              </TextAnimate>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <ComicText fontSize={5}>😞 Oops!</ComicText>
              <TextAnimate
                animation="scaleUp"
                className="text-muted-foreground font-medium text-sm sm:text-base"
              >
                No mood available
              </TextAnimate>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="flex-1">
        <CardHeader>
          <h3 className="text-lg font-bold">Top Played Songs</h3>
        </CardHeader>
        <CardContent className="grid gap-4 px-4">
          {loading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 w-full">
                <Skeleton className="h-15 w-30 rounded-md" />
                <div className="space-y-2 w-full">
                  <Skeleton className="h-4 w-full max-w-72" />
                  <Skeleton className="h-3 w-13" />
                </div>
              </div>
            ))
          ) : topSongs?.length > 0 ? (
            topSongs.map((t, i) => (
              <div
                key={i}
                className="flex items-center gap-4 group p-2 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={(e) => handleClick(e, t.song)}
                  className={cn(
                    "relative w-[120px] h-[60px] aspect-[2/1.2] cursor-pointer rounded-md",
                    currentSong?.id === t.song.id &&
                      "[--shadow-2xl:0px_1px_4px_0px_oklch(0.8109_0_0)] shadow-2xl",
                  )}
                  title={!isPlaying ? "Play" : "Pause"}
                >
                  <Image
                    src={t.song.thumbnail}
                    alt={t.song.title}
                    fill
                    className="rounded-md object-cover transition-all duration-200 ease-out group-hover-always:group-hover:brightness-[0.8]"
                  />
                  <div
                    className={cn(
                      "absolute inset-0 flex items-center justify-center rounded-md transition-all duration-200",
                      currentSong?.id === t.song.id
                        ? "bg-black/40 group-hover-always:group-hover:bg-black/50 opacity-100"
                        : `${
                            isClient && (isMobile || isTablet)
                              ? "opacity-100"
                              : "opacity-0 group-hover-always:group-hover:opacity-100"
                          } bg-black/40`,
                    )}
                  >
                    {currentSong?.id === t.song.id ? (
                      isLoading ? (
                        <div className="h-6 w-6 animate-spin rounded-full border-white border-b-2" />
                      ) : isPlaying ? (
                        <Pause size={32} aria-hidden />
                      ) : (
                        <Play size={32} aria-hidden />
                      )
                    ) : (
                      <Play size={32} aria-hidden />
                    )}
                  </div>
                </button>
                <div className="overflow-hidden">
                  <Typography
                    variant="body-small"
                    className="line-clamp-1 max-w-lg"
                  >
                    {t.song.title.normalize("NFC")}
                  </Typography>
                  <Typography variant="small" className="text-muted-foreground">
                    {t.times} Plays
                  </Typography>
                </div>
              </div>
            ))
          ) : (
            <Typography variant="body-small" className="text-muted-foreground">
              No songs played in this date range
            </Typography>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export { Dashboard };
