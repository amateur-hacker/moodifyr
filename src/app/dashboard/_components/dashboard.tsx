"use client";

import Image from "next/image";
import { use, useEffect, useState } from "react";
import { DateRangePicker } from "@/app/dashboard/_components/date-range-picker";
import { DateRangePresetSelect } from "@/app/dashboard/_components/date-range-preset-select";
import { DashboardAnalyticsContext } from "@/app/dashboard/_context/dashboard-analytics-context";
import { getUserDashboardData } from "@/app/dashboard/queries";
import { ComicText } from "@/components/magicui/comic-text";
import { TextAnimate } from "@/components/magicui/text-animate";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TextShimmer } from "@/components/ui/text-shimmer";
import { Typography } from "@/components/ui/typography";

const Dashboard = () => {
  const { startDate, endDate, isPending } = use(DashboardAnalyticsContext);
  const [mood, setMood] = useState<{ mood: string; message: string } | null>(
    null,
  );
  const [topSongs, setTopSongs] = useState<
    {
      title: string | null;
      thumbnail: string | null;
      mood: string | null;
      times: number;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-6 p-4 flex flex-col mt-15 h-[calc(100vh-3.75rem)]">
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
        <CardContent className="grid gap-4">
          {loading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 w-full">
                <Skeleton className="h-12.5 w-12.5 rounded-md" />
                <div className="space-y-2 w-full">
                  <Skeleton className="h-4 w-full max-w-72" />
                  <Skeleton className="h-3 w-13" />
                </div>
              </div>
            ))
          ) : topSongs?.length > 0 ? (
            topSongs.map((s, i) => (
              <div key={i} className="flex items-center gap-4">
                <Image
                  src={s.thumbnail as string}
                  alt={s.title as string}
                  width={50}
                  height={50}
                  className="rounded-sm border"
                />
                <div>
                  <Typography
                    variant="body-small"
                    className="line-clamp-1 max-w-lg"
                  >
                    {s.title}
                  </Typography>
                  <Typography variant="small" className="text-muted-foreground">
                    {s.times} Plays
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
