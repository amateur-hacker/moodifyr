import { Suspense } from "react";
import { SongCardLoader } from "@/app/(app)/_components/song-card-loader";
import { SearchResults } from "@/app/(app)/search/_components/search-results";
import { SearchSongForm } from "@/app/(app)/search/_components/search-song-form";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
    id?: string;
  }>;
};

const SearchPage = async ({ searchParams }: SearchPageProps) => {
  const { q: searchQuery, id } = await searchParams;

  return (
    <div className="size-full">
      <div className="size-full space-y-5 mx-auto max-w-3xl pb-[var(--player-height,0px)]">
        <SearchSongForm />
        <Suspense
          fallback={
            <div className="space-y-[1.3125rem]">
              {Array.from({ length: 10 }, (_, idx) => (
                <SongCardLoader key={`loader-${idx}`} showHeart={true} />
              ))}
            </div>
          }
        >
          <SearchResults searchQuery={searchQuery} id={id} />
        </Suspense>
      </div>
    </div>
  );
};

export default SearchPage;
