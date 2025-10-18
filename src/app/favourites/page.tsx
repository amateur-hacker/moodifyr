import { Suspense } from "react";
import { SongCardLoader } from "@/app/_components/song-card-loader";
import { FavouriteSongList } from "@/app/favourites/_components/fav-song-list";
import { getUserMoodlists } from "@/app/moodlists/queries";
import { getUserFavouriteSongs, getUserSession } from "@/app/queries";
import { Typography } from "@/components/ui/typography";

const FavSongsPage = async () => {
  const session = (await getUserSession()) ?? null;

  if (!session?.user) {
    return (
      <div className="w-full">
        <Typography variant="lead">
          Please sign in to see your favourite songs.
        </Typography>
      </div>
    );
  }
  const [favouriteSongs, moodlists] = await Promise.all([
    getUserFavouriteSongs({ page: 1, limit: 10, pagination: true }).then(
      (res) => res ?? null,
    ),
    getUserMoodlists().then((res) => res ?? null),
  ]);

  return (
    <div className="w-full">
      <Typography variant="h2" className="font-playful text-center mb-4">
        Favourites
      </Typography>
      <div className="w-full space-y-5 mx-auto max-w-3xl">
        {favouriteSongs?.length ? (
          <Suspense
            fallback={
              <div className="space-y-[1.3125rem]">
                {Array.from({ length: 10 }, (_, idx) => idx).map((id) => (
                  <SongCardLoader key={`loader-${id}`} />
                ))}
              </div>
            }
          >
            <FavouriteSongList
              initialSongs={favouriteSongs}
              moodlists={moodlists}
            />
          </Suspense>
        ) : (
          <Typography variant="lead" className="text-center">
            No Favourite Songs
          </Typography>
        )}
      </div>
    </div>
  );
};

export default FavSongsPage;
