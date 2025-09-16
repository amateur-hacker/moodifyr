import { Suspense } from "react";
import { getUserFavouriteSongs, getUserLastPlayedSong } from "@/app/queries";
import { SongCardLoader } from "@/app/search/_components/song-card-loader";
import { SongList } from "@/app/search/_components/song-list";
import { SongPlayerBar } from "@/app/search/_components/song-player-bar";
import { SongPlayerEngine } from "@/app/search/_components/song-player-engine";
import { SongPlayerProvider } from "@/app/search/_context/song-player-context";
import { searchSong } from "@/app/search/api";

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
  const [songResult, favouriteSongs, lastPlayedSong] = await Promise.all([
    searchSong({ query: searchQuery, id }).then((res) => res ?? null),
    getUserFavouriteSongs().then((res) => res ?? null),
    getUserLastPlayedSong().then((res) => res ?? null),
  ]);

  return (
    <div className="p-4 mt-15">
      <div className="w-full space-y-5 mx-auto max-w-3xl">
        {songResult?.success && (
          <Suspense
            fallback={
              <div className="space-y-3">
                {Array.from({ length: 10 }, (_, idx) => idx).map((id) => (
                  <SongCardLoader key={`loader-${id}`} />
                ))}
              </div>
            }
          >
            <SongPlayerProvider
              key={searchQuery ?? id}
              initialSong={lastPlayedSong}
            >
              <SongList
                songs={songResult.songs}
                favouriteSongs={favouriteSongs}
              />
              <SongPlayerEngine songs={songResult.songs} />
              <SongPlayerBar songs={songResult.songs} />
            </SongPlayerProvider>
          </Suspense>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
