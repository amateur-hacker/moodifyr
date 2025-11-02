import { Suspense } from "react";
import { PlayHeader } from "@/app/(app)/_components/play-header";
import { SongCardLoader } from "@/app/(app)/_components/song-card-loader";
import { SongsSetter } from "@/app/(app)/_components/songs-setter";
import { FavouriteSongList } from "@/app/(app)/favourites/_components/fav-song-list";
import { getUserMoodlists } from "@/app/(app)/moodlists/queries";
import {
  getUserFavouriteSongs,
  getUserFavouriteSongsStats,
  getUserSession,
} from "@/app/(app)/queries";
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
  const [favouriteSongs, favouriteSongsStats, moodlists] = await Promise.all([
    getUserFavouriteSongs().then((res) => res ?? null),
    getUserFavouriteSongsStats().then((res) => res ?? null),
    getUserMoodlists().then((res) => res ?? null),
  ]);

  return (
    <div className="size-full space-y-4">
      <div className="space-y-2">
        <Typography variant="h2" className="font-playful text-center">
          Favourites
        </Typography>
        {!!(
          favouriteSongs?.length &&
          favouriteSongsStats?.totalSongs &&
          favouriteSongsStats.totalTime
        ) && (
          <PlayHeader
            songs={favouriteSongs}
            totalSongs={favouriteSongsStats.totalSongs}
            totalTime={favouriteSongsStats.totalTime}
            className="text-center"
          />
        )}
      </div>
      <div className="size-full space-y-5 mx-auto max-w-3xl pb-[var(--player-height,0px)]">
        {favouriteSongs?.length ? (
          <Suspense
            fallback={
              <div className="space-y-[1.3125rem]">
                {Array.from({ length: 10 }, (_, idx) => idx).map((id) => (
                  <SongCardLoader key={`loader-${id}`} showHeart={true} />
                ))}
              </div>
            }
          >
            <FavouriteSongList
              favouriteSongs={favouriteSongs}
              moodlists={moodlists}
            />
            <SongsSetter songs={favouriteSongs} />
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
