import { Suspense } from "react";
import {
  getSongPlayHistory,
  getSongSearchHistory,
  searchSong,
  getAIRecommendedSongNames,
  getSongPlayHistoryByDateRange,
} from "@/app/search/_actions";
import { SongCardLoader } from "@/app/search/_components/song-card-loader";
import { SongList } from "@/app/search/_components/song-list";
import { SongPlayerBar } from "@/app/search/_components/song-player-bar";
import { SongPlayerEngine } from "@/app/search/_components/song-player-engine";
import { SongPlayerProvider } from "@/app/search/_context/song-player-context";
import { convertToLocalTZ } from "@/utils/date";
import { endOfDay, startOfDay, subMonths } from "date-fns";
import { getUserMoodBySongHistory } from "../_actions";

// export const dynamic = "force-dynamic";
type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
    id?: string;
  }>;
};
const SearchPage = async ({ searchParams }: SearchPageProps) => {
  const { q: searchQuery, id } = await searchParams;

  // if (!searchQuery && !id) return;
  const result = await searchSong({ query: searchQuery, id });
  // console.log(
  //   await getAIRecommendedSongNames({ query: searchQuery as string }),
  // );

  // const [songPlayHistoryResults, songSearchesHistoryResults] =
  //   await Promise.all([
  //     getSongPlayHistory({ page: 1, limit: 20 }),
  //     getSongSearchHistory({ page: 1, limit: 5 }),
  //   ]);
  // console.log("songPlayHistory Results:", songPlayHistoryResults);
  // console.log("songSearchHistory Results:", songSearchesHistoryResults);
  // if (!result?.success) return;

  // console.log(await getSongPlayHistory({ page: 1, limit: 20 }));

  const now = convertToLocalTZ(new Date());

  const startDate = startOfDay(subMonths(now, 1));
  const endDate = endOfDay(now);
  const songHistory = await getSongPlayHistoryByDateRange({
    startDate,
    endDate,
  });
  console.log(songHistory);
  const mood = songHistory?.length
    ? await getUserMoodBySongHistory({ songHistory })
    : null;

  console.log(mood);

  return (
    <SongPlayerProvider>
      <div className="p-4 mt-15">
        <div className="w-full space-y-5 mx-auto max-w-3xl">
          {/* <SearchSongForm /> */}

          {result?.success && (
            <Suspense
              fallback={
                <div className="space-y-3">
                  {Array.from({ length: 10 }, (_, idx) => idx).map((id) => (
                    <SongCardLoader key={`loader-${id}`} />
                  ))}
                </div>
              }
            >
              <SongList songs={result.songs} />
            </Suspense>
          )}
        </div>
      </div>

      {result?.success && (
        <>
          <SongPlayerEngine songs={result.songs} />
          <SongPlayerBar songs={result.songs} />
        </>
      )}
    </SongPlayerProvider>
  );
};

export default SearchPage;
