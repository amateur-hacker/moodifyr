import { Suspense } from "react";

import { SearchSongForm } from "@/app/search/_components/search-song-form";
import { SongCardLoader } from "@/app/search/_components/song-card-loader";
import { SongList } from "@/app/search/_components/song-list";
import { SongPlayerProvider } from "./_context/song-player-context";
import { SongPlayerEngine } from "./_components/song-player-engine";
import { SongPlayerBar } from "./_components/song-player-bar";
import { searchSong } from "./_actions";

export const dynamic = "force-dynamic";
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

  // if (!result?.success) return;

  return (
    <SongPlayerProvider>
      <div className="p-4">
        <div className="w-full space-y-5 mx-auto max-w-3xl">
          <SearchSongForm />

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
