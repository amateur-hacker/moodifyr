import { Suspense } from "react";
import { SearchSongForm } from "@/app/_components/search-song-form";
import { SongCardLoader } from "@/app/_components/song-card-loader";
import { SongsSetter } from "@/app/_components/songs-setter";
import { getUserFavouriteSongs } from "@/app/queries";
import { searchSong } from "@/app/search/api";
import { getUserMoodlists } from "../moodlists/queries";
import { GlitchText } from "@/components/ui/shadcn-io/glitch-text";
import { WordRotate } from "@/components/ui/word-rotate";
import { SearchSongList } from "./_components/search-song-list";

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

  const songs = songResult?.success
    ? "songs" in songResult
      ? songResult.songs.map((song) => ({
          ...song,
          searchId: song.id,
        }))
      : [
          {
            ...songResult.song,
            searchId: songResult.song.id,
          },
        ]
    : [];

  return (
    <div className="w-full">
      <div className="w-full space-y-5 mx-auto max-w-3xl">
        <SearchSongForm />

        {/* <GlitchText */}
        {/*   speed={1} */}
        {/*   enableShadows={true} */}
        {/*   enableOnHover={false} */}
        {/*   className="mb-4 text-center after:left-0 after:right-0 after:m-auto after:translate-x-[10px] before:left-0 before:right-0 before:m-auto before:-translate-x-[10px] !cursor-default" */}
        {/* > */}
        {/*   {!songResult?.success ? "Search" : "Enjoy"} */}
        {/* </GlitchText> */}

        {songResult?.success ? (
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
