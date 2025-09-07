"use client";

import { getCookie, setCookie } from "cookies-next/client";
import { endOfDay, startOfDay, subDays } from "date-fns";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getUserMoodBySongHistory } from "@/app/_actions";
import {
  getMostPlayedSongByDateRange,
  getSongPlayHistoryByDateRange,
} from "@/app/search/_actions";
import { ComicText } from "@/components/magicui/comic-text";
import { TextAnimate } from "@/components/magicui/text-animate";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TextShimmer } from "@/components/ui/text-shimmer";
import { convertToLocalTZ } from "@/utils/date";

export default function HomePage() {
  const [dateRange] = useState<{ start: Date; end: Date }>({
    start: startOfDay(subDays(convertToLocalTZ(new Date()), 7)),
    end: endOfDay(convertToLocalTZ(new Date())),
  });
  const [mood, setMood] = useState<{ mood: string; message: string } | null>(
    null,
  );

  const [topSongs, setTopSongs] = useState<
    { title: string; times: number; thumbnail?: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cookieMood = getCookie("user-mood") as string | undefined;
    const cookieSongs = getCookie("user-top-songs") as string | undefined;

    if (cookieMood && cookieSongs) {
      try {
        setMood(JSON.parse(cookieMood));
        setTopSongs(JSON.parse(cookieSongs));
        setLoading(false);
      } catch {
        // ignore invalid cookie JSON
      }
    }

    const fetchData = async () => {
      setLoading(true);

      const songHistory = await getSongPlayHistoryByDateRange({
        startDate: dateRange.start,
        endDate: dateRange.end,
      });

      const moodResult = songHistory?.length
        ? await getUserMoodBySongHistory({ songHistory })
        : null;

      setMood(moodResult);
      setCookie("user-mood", JSON.stringify(moodResult ?? {}), {
        maxAge: 60 * 60 * 24, // 1 day
      });

      const top5 = await getMostPlayedSongByDateRange({
        startDate: dateRange.start,
        endDate: dateRange.end,
        count: 5,
      });

      setTopSongs(top5 ?? []);
      setCookie("user-top-songs", JSON.stringify(top5 ?? []), {
        maxAge: 60 * 60 * 24,
      });

      setLoading(false);
    };

    if (!cookieMood || !cookieSongs) {
      fetchData();
    }
  }, [dateRange]);

  return (
    <div className="space-y-6 p-4 flex flex-col mt-15 h-[calc(100vh-3.75rem)]">
      {/* Mood Card */}
      <Card className="min-h-[250px] items-center justify-center">
        <CardContent>
          {loading ? (
            <TextShimmer className="font-mono text-sm" duration={1}>
              Loading mood...
            </TextShimmer>
          ) : mood?.mood || mood?.message ? (
            <div className="flex flex-col gap-2 text-center">
              <ComicText fontSize={5}>{mood?.mood}</ComicText>
              <TextAnimate
                animation="blurIn"
                className="font-medium text-sm sm:text-base"
              >
                {mood?.message}
              </TextAnimate>
            </div>
          ) : (
            <div className="text-center space-y-2">
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

      {/* Top Songs Card */}
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
            topSongs.map((s, idx) => (
              <div key={idx} className="flex items-center gap-4">
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
}
