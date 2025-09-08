"use client";

import type { Session } from "better-auth";
import { getCookie, setCookie } from "cookies-next/client";
import Image from "next/image";
import { use, useEffect, useState } from "react";
import { getUserMoodBySongHistory } from "@/app/_actions";
import { DateRangePicker } from "@/app/_components/date-range-picker";
import { DateRangePresetSelect } from "@/app/_components/date-range-preset-select";
import { DashboardAnalyticsContext } from "@/app/_context/dashboard-analytics-context";
import {
  getMostPlayedSongByDateRange,
  getSongPlayHistoryByDateRange,
} from "@/app/search/_actions";
import { ComicText } from "@/components/magicui/comic-text";
import { TextAnimate } from "@/components/magicui/text-animate";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TextShimmer } from "@/components/ui/text-shimmer";

type DashboardProps = {
  session: Session | null;
};
const Dashboard = ({ session }: DashboardProps) => {
  const { startDate, endDate } = use(DashboardAnalyticsContext);
  const [mood, setMood] = useState<{ mood: string; message: string } | null>(
    null,
  );
  const [topSongs, setTopSongs] = useState<
    { title: string; times: number; thumbnail?: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      setLoading(false);
      return;
    }
    if (!startDate || !endDate) return;

    const rangeKey = `${startDate.toISOString().split("T")[0]}_${
      endDate.toISOString().split("T")[0]
    }`;

    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const secondsUntilMidnight = Math.floor(
      (midnight.getTime() - now.getTime()) / 1000,
    );

    // biome-ignore lint/suspicious/noExplicitAny: _>
    let analyticsCache: Record<string, any> = {};
    const rawCache = getCookie("dashboard-analytics");
    if (rawCache) {
      try {
        analyticsCache = JSON.parse(rawCache as string);
      } catch {
        analyticsCache = {};
      }
    }

    if (analyticsCache[rangeKey]) {
      setMood(analyticsCache[rangeKey].mood ?? null);
      setTopSongs(analyticsCache[rangeKey].topSongs ?? []);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);

      const songHistory = await getSongPlayHistoryByDateRange({
        startDate,
        endDate,
      });

      const moodResult = songHistory?.length
        ? await getUserMoodBySongHistory({ songHistory })
        : null;

      setMood(moodResult);

      const top5 = await getMostPlayedSongByDateRange({
        startDate,
        endDate,
        count: 5,
      });

      setTopSongs(top5 ?? []);

      analyticsCache[rangeKey] = {
        mood: moodResult,
        topSongs: top5,
      };

      setCookie("dashboard-analytics", JSON.stringify(analyticsCache), {
        maxAge: secondsUntilMidnight,
      });

      setLoading(false);
    };

    fetchData();
  }, [session, startDate, endDate]);

  if (!session) {
    return (
      <div className="mt-15 p-4">
        <h3 className="text-lg">Please sign in to see your dashboard.</h3>
      </div>
    );
  }

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
                className="font-medium text-sm sm:text-base"
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
                  alt={s.title}
                  width={50}
                  height={50}
                  className="rounded-md"
                />
                <div>
                  <p className="font-medium line-clamp-1">{s.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {s.times} plays
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">
              No songs played in this range
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export { Dashboard };
