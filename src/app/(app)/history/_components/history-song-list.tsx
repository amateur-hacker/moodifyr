"use client";

import { useInViewport } from "@mantine/hooks";
import { useEffect, useState } from "react";
import type { HistorySongSchema } from "@/app/(app)/_types";
import { HistorySongCard } from "@/app/(app)/history/_components/history-song-card";
import { getUserSongPlayHistory } from "@/app/(app)/history/queries";
import type { getUserMoodlists } from "@/app/(app)/moodlists/queries";
import { Spinner } from "@/components/ui/spinner";
import { Typography } from "@/components/ui/typography";
import { GroupedVirtuoso } from "react-virtuoso";

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
    const total = Object.values(history).reduce(
      (sum, songs) => sum + songs.length,
      0,
    );
    setHasMore(total === 25);
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <_>
  useEffect(() => {
    if (inViewport && hasMore && !loadingMore) {
      setLoadingMore(true);

      getUserSongPlayHistory({ page: page + 1, limit: 25 })
        .then((res) => {
          if (res && Object.keys(res).length > 0) {
            setHistory((prev) => mergeHistory(prev, res));
            setPage((p) => p + 1);

            const totalFetched = Object.values(res).reduce(
              (acc, songs) => acc + songs.length,
              0,
            );
            if (totalFetched < 25) setHasMore(false);
          } else {
            setHasMore(false);
          }
        })
        .finally(() => setLoadingMore(false));
    }
  }, [inViewport, hasMore, loadingMore]);

  const groups = Object.entries(history);
  const groupLabels = groups.map(([date]) => date);
  const groupCounts = groups.map(([_, songs]) => songs.length);
  const flatSongs = groups.flatMap(([_, songs]) => songs);
  const groupEndIndices = groupCounts.reduce((acc, count, idx) => {
    const prevEnd = acc[idx - 1] ?? -1;
    acc.push(prevEnd + count);
    return acc;
  }, [] as number[]);

  return (
    <div className="space-y-5 size-full">
      <GroupedVirtuoso
        useWindowScroll
        overscan={400}
        groupCounts={groupCounts}
        groupContent={(index) => (
          <div className="inline-flex mb-2">
            <Typography variant="large" className="font-semibold">
              {groupLabels[index]}
            </Typography>
          </div>
        )}
        itemContent={(index, groupIndex) => {
          const song = flatSongs[index];
          const isLastInGroup = index === groupEndIndices[groupIndex];
          const isLastGroup = groupIndex === groupCounts.length - 1;

          return (
            <div className="flex flex-col">
              <HistorySongCard
                song={song}
                moodlists={moodlists}
                onRemove={onRemove}
              />
              {!isLastInGroup && <div className="my-5 h-px bg-border" />}
              {isLastInGroup && !isLastGroup && <div className="mb-10" />}
            </div>
          );
        }}
      />

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
