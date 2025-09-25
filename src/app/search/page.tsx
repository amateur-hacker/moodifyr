import { Suspense } from "react";
import { SongCardLoader } from "@/app/_components/song-card-loader";
import { SongList } from "@/app/_components/song-list";
import { SongsSetter } from "@/app/_components/songs-setter";
import { getUserFavouriteSongs } from "@/app/queries";
import { searchSong } from "@/app/search/api";
import { Typography } from "@/components/ui/typography";

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
  if (!searchQuery && !id) {
    return (
      <div className="w-full">
        <Typography variant="lead">
          Search for a song and let the vibe begin
        </Typography>
      </div>
    );
  }

  const [songResult, favouriteSongs] = await Promise.all([
    searchSong({ query: searchQuery, id }).then((res) => res ?? null),
    getUserFavouriteSongs().then((res) => res ?? null),
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
            <SongList songs={songs} favouriteSongs={favouriteSongs} />
            <SongsSetter songs={songs} />
          </Suspense>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
