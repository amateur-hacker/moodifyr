import { PlayHeader } from "@/app/(app)/_components/play-header";
import { SongsSetter } from "@/app/(app)/_components/songs-setter";
import { MoodlistSongList } from "@/app/(app)/moodlists/[id]/_components/moodlist-song-list";
import {
  getUserMoodlistSongs,
  getUserMoodlistSongsStats,
} from "@/app/(app)/moodlists/queries";
import { Typography } from "@/components/ui/typography";

const MoodlistSongs = async ({ moodlistId }: { moodlistId: string }) => {
  const [moodlistSongs, moodlistSongsStats] = await Promise.all([
    getUserMoodlistSongs({ moodlistId }).then((res) => res ?? null),
    getUserMoodlistSongsStats({ moodlistId }).then((res) => res ?? null),
  ]);
  // const moodlistSongs = (await getUserMoodlistSongs({ moodlistId })) ?? null;
  if (!moodlistSongs?.songs.length) {
    return (
      <Typography variant="lead" className="text-center">
        No Moodlist Songs
      </Typography>
    );
  }

  return (
    <>
      {moodlistSongs && (
        <>
          <div className="mb-4">
            <Typography variant="h2" className="font-playful text-center">
              {moodlistSongs.name}
            </Typography>
            {!!(
              moodlistSongsStats?.totalSongs && moodlistSongsStats.totalTime
            ) && (
              <PlayHeader
                songs={moodlistSongs.songs}
                totalSongs={moodlistSongsStats.totalSongs}
                totalTime={moodlistSongsStats.totalTime}
                className="text-center"
              />
            )}
          </div>
          <MoodlistSongList
            songs={moodlistSongs.songs}
            moodlistId={moodlistId}
            moodlistType={moodlistSongs.type}
          />
          <SongsSetter songs={moodlistSongs.songs} />
        </>
      )}
    </>
  );
};

export { MoodlistSongs };
