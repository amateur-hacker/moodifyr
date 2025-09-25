import { Suspense } from "react";
import { SongCardLoader } from "@/app/_components/song-card-loader";
import { SongsSetter } from "@/app/_components/songs-setter";
import { FavouriteSongList } from "@/app/favourites/_components/fav-song-list";
import { getUserFavouriteSongs, getUserSession } from "@/app/queries";
import { Typography } from "@/components/ui/typography";

const FavSongsPage = async () => {
  const session = (await getUserSession()) ?? null;

  if (!session) {
    return (
      <div className="w-full">
        <Typography variant="lead">
          Please sign in to see your favourite songs.
        </Typography>
      </div>
    );
  }
  const favSongs = (await getUserFavouriteSongs()) ?? null;

  return (
    <div className="w-full">
      {favSongs?.length ? (
        <div className="w-full space-y-5 mx-auto max-w-3xl">
          <Suspense
            fallback={
              <div className="space-y-3">
                {Array.from({ length: 10 }, (_, idx) => idx).map((id) => (
                  <SongCardLoader key={`loader-${id}`} />
                ))}
              </div>
            }
          >
            <SongsSetter songs={favSongs} />
            <FavouriteSongList
              songs={favSongs}
              favouriteSongs={favSongs}
              revalidate={true}
              path="fav-songs"
            />
          </Suspense>
        </div>
      ) : (
        <Typography variant="lead">No Favourite Songs</Typography>
      )}
    </div>
  );
};

export default FavSongsPage;
