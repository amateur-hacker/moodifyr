"use client";

import { useInViewport } from "@mantine/hooks";
import { useEffect, useState } from "react";
import type { HistorySongSchema } from "@/app/_types";
import { HistorySongCard } from "@/app/history/_components/history-song-card";
import { getUserSongPlayHistory } from "@/app/history/queries";
import type { getUserMoodlists } from "@/app/moodlists/queries";
import { Spinner } from "@/components/ui/spinner";
import { Typography } from "@/components/ui/typography";

type HistorySongListProps = {
  initialHistory: Awaited<ReturnType<typeof getUserSongPlayHistory>>;
  moodlists: Awaited<ReturnType<typeof getUserMoodlists>>;
};
const HistorySongList = ({
  initialHistory,
  moodlists,
}: HistorySongListProps) => {
  const { ref: bottomRef, inViewport } = useInViewport();
  const [history, setHistory] = useState(initialHistory ?? {});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const mergeHistory = (
    prev: Record<string, HistorySongSchema[]>,
    next: Record<string, HistorySongSchema[]>,
  ) => {
    const merged = { ...prev };
    for (const [date, songs] of Object.entries(next)) {
      merged[date] = [...(merged[date] ?? []), ...songs];
    }
    return merged;
  };

  const onRemove = (historyId: string) => {
    setHistory((prev) => {
      const updated = { ...prev };

      for (const date of Object.keys(updated)) {
        updated[date] = updated[date].filter((s) => s.historyId !== historyId);
        if (updated[date].length === 0) delete updated[date];
      }

      return updated;
    });
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <_>
  useEffect(() => {
    if (inViewport && hasMore && !loadingMore) {
      setLoadingMore(true);

      getUserSongPlayHistory({ page: page + 1, limit: 20 })
        .then((res) => {
          if (res && Object.keys(res).length > 0) {
            setHistory((prev) => mergeHistory(prev, res));
            setPage((p) => p + 1);

            const totalFetched = Object.values(res).reduce(
              (acc, songs) => acc + songs.length,
              0,
            );
            if (totalFetched < 20) setHasMore(false);
          } else {
            setHasMore(false);
          }
        })
        .finally(() => setLoadingMore(false));
    }
  }, [inViewport, hasMore, loadingMore]);

  return (
    <div className="pb-[var(--player-height,0px)] space-y-10">
      {Object.entries(history).map(([date, songs]) => (
        <div key={date} className="flex flex-col">
          <Typography variant="large" className="mb-2">
            {date}
          </Typography>
          {songs.map((song, i) => (
            <div key={`${song.id}-${i}`}>
              <HistorySongCard
                song={song}
                moodlists={moodlists}
                onRemove={onRemove}
              />
              {i < songs.length - 1 && <div className="my-5 h-px bg-border" />}
            </div>
          ))}
        </div>
      ))}

      {(hasMore || loadingMore) && (
        <div
          ref={bottomRef}
          className="flex items-center justify-center py-2 mt-3 text-sm text-muted-foreground gap-2"
        >
          <Spinner />
          Loading...
        </div>
      )}
    </div>
  );
};

export { HistorySongList };
