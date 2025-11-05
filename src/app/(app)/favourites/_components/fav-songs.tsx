import { PlayHeader } from "@/app/(app)/_components/play-header";
import { SongsSetter } from "@/app/(app)/_components/songs-setter";
import { FavouriteSongList } from "@/app/(app)/favourites/_components/fav-song-list";
import { getUserMoodlists } from "@/app/(app)/moodlists/queries";
import {
  getUserFavouriteSongs,
  getUserFavouriteSongsStats,
} from "@/app/(app)/queries";
import { Typography } from "@/components/ui/typography";

const FavSongs = async () => {
  const [favouriteSongs, favouriteSongsStats, moodlists] = await Promise.all([
    getUserFavouriteSongs().then((res) => res ?? null),
    getUserFavouriteSongsStats().then((res) => res ?? null),
    getUserMoodlists().then((res) => res ?? null),
  ]);

  if (!favouriteSongs?.length) {
    return (
      <Typography variant="lead" className="text-center">
        No Favourite Songs
      </Typography>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {!!(
          favouriteSongsStats?.totalSongs && favouriteSongsStats.totalTime
        ) && (
          <PlayHeader
            songs={favouriteSongs}
            totalSongs={favouriteSongsStats.totalSongs}
            totalTime={favouriteSongsStats.totalTime}
            className="text-center"
          />
        )}
        <FavouriteSongList
          favouriteSongs={favouriteSongs}
          moodlists={moodlists}
        />
      </div>

      <SongsSetter songs={favouriteSongs} />
    </>
  );
};

export { FavSongs };
