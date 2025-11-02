import { Suspense } from "react";
import { SongCardLoader } from "@/app/(app)/_components/song-card-loader";
import { SongsSetter } from "@/app/(app)/_components/songs-setter";
import { SearchSongForm } from "@/app/(app)/search/_components/search-song-form";
import { SearchSongList } from "@/app/(app)/search/_components/search-song-list";
import { searchSong } from "@/app/(app)/search/api";
import { getUserMoodlists } from "@/app/(app)/moodlists/queries";
import { getUserFavouriteSongs } from "@/app/(app)/queries";
import { WordRotate } from "@/components/ui/word-rotate";

// export const dynamic = "force-dynamic";
type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
    id?: string;
  }>;
};
const SearchPage = async ({ searchParams }: SearchPageProps) => {
  const { q: searchQuery, id } = await searchParams;

  const safeSearchSong = () =>
    !searchQuery && !id
      ? Promise.resolve(null)
      : searchSong({ query: searchQuery, id });
  const [songResult, favouriteSongs, moodlists] = await Promise.all([
    safeSearchSong().then((res) => res ?? null),
    getUserFavouriteSongs().then((res) => res ?? null),
    getUserMoodlists().then((res) => res ?? null),
  ]);

  const songs =
    songResult?.success && ("songs" in songResult || "song" in songResult)
      ? ("songs" in songResult ? songResult.songs : [songResult.song]).map(
          (song) => ({
            ...song,
            searchId: song.id,
          }),
        )
      : null;

  return (
    <div className="size-full">
      <div className="size-full space-y-5 mx-auto max-w-3xl pb-[var(--player-height,0px)]">
        <SearchSongForm />

        {songs?.length ? (
          <Suspense
            fallback={
              <div className="space-y-[1.3125rem]">
                {Array.from({ length: 10 }, (_, idx) => idx).map((id) => (
                  <SongCardLoader key={`loader-${id}`} showHeart={true} />
                ))}
              </div>
            }
          >
            <SearchSongList
              songs={songs}
              favouriteSongs={favouriteSongs}
              moodlists={moodlists}
            />
            <SongsSetter songs={songs} />
          </Suspense>
        ) : (
          <WordRotate
            className="font-playful text-center mb-4 scroll-m-20 py-2 text-3xl font-semibold tracking-tight lg:text-4xl"
            words={[
              "Find Your 🔍",
              "Happy 😄",
              "Sad 😔",
              "Romantic 💖",
              "Energetic ⚡",
              "Calm 😌",
              "Motivational 💪",
              "Emotional 😢",
              "Song 🎵",
            ]}
          />
        )}
      </div>
    </div>
  );
};

export default SearchPage;
