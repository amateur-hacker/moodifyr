import { SongsSetter } from "@/app/(app)/_components/songs-setter";
import { getUserMoodlists } from "@/app/(app)/moodlists/queries";
import { getUserFavouriteSongs } from "@/app/(app)/queries";
import { SearchSongList } from "@/app/(app)/search/_components/search-song-list";
import { searchSong } from "@/app/(app)/search/api";
import { WordRotate } from "@/components/ui/word-rotate";

const SearchResults = async ({
  searchQuery,
  id,
}: {
  searchQuery?: string;
  id?: string;
}) => {
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

  if (!songs?.length) {
    return (
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
    );
  }

  return (
    <>
      <SearchSongList
        songs={songs}
        favouriteSongs={favouriteSongs}
        moodlists={moodlists}
      />
      <SongsSetter songs={songs} />
    </>
  );
};

export { SearchResults };
