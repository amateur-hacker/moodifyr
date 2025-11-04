"use client";

import { useEffect, useState } from "react";
import type { DashboardSongSchema } from "@/app/(app)/_types";
import { DateRangePicker } from "@/app/(app)/dashboard/_components/date-range-picker";
import { DateRangePresetSelect } from "@/app/(app)/dashboard/_components/date-range-preset-select";
import { useDashboardAnalytics } from "@/app/(app)/dashboard/_context/dashboard-analytics-context";
import { getUserDashboardData } from "@/app/(app)/dashboard/queries";
import { ComicText } from "@/components/magicui/comic-text";
import { TextAnimate } from "@/components/magicui/text-animate";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TextShimmer } from "@/components/ui/text-shimmer";
import { Typography } from "@/components/ui/typography";
import { DashboardSongCard } from "@/app/(app)/dashboard/_components/dashboard-song-card";
import { SongCardLoader } from "@/app/(app)/_components/song-card-loader";

type TopSong = {
  song: DashboardSongSchema;
  times: number;
};
type Mood = {
  type: string;
  message: string;
};
const Dashboard = () => {
  const { startDate, endDate, isPending } = useDashboardAnalytics();
  const [mood, setMood] = useState<Mood | null>(null);
  const [topSongs, setTopSongs] = useState<TopSong[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!startDate || !endDate || isPending) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      const data = await getUserDashboardData({
        startDate,
        endDate,
      });

      if (data) {
        setMood(data.mood);
        setTopSongs(data.topSongs);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate, isPending]);

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
          {isLoading ? (
            <TextShimmer className="font-mono text-sm" duration={1}>
              Tracking mood...
            </TextShimmer>
          ) : mood?.type || mood?.message ? (
            <div className="flex flex-col gap-2">
              <ComicText fontSize={5}>{mood?.type}</ComicText>
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
        <CardContent className="grid gap-5 px-4">
          {isLoading ? (
            Array.from({ length: 5 }, (_, idx) => idx).map((id) => (
              <SongCardLoader key={`loader-${id}`} />
            ))
          ) : topSongs?.length > 0 ? (
            topSongs.map((t, i) => (
              <DashboardSongCard key={i} song={t.song} timesPlayed={t.times} />
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
