import { SongsSetter } from "@/app/(app)/_components/songs-setter";
import { getMoodlistSongsByUserId } from "@/app/(app)/moodlists/queries";
import { MoodlistSongList } from "@/app/(app)/moodlists/user/[userId]/[moodlistId]/_components/moodlist-song-list";
import { Typography } from "@/components/ui/typography";

const MoodlistSongs = async ({
  userId,
  moodlistId,
}: {
  userId: string;
  moodlistId: string;
}) => {
  // const [moodlistSongs, moodlistSongsStats] = await Promise.all([
  //   getUserMoodlistSongs({ moodlistId }).then((res) => res ?? null),
  //   getUserMoodlistSongsStats({ moodlistId }).then((res) => res ?? null),
  // ]);
  const moodlistSongs =
    (await getMoodlistSongsByUserId({ userId, moodlistId })) ?? null;
  if (!moodlistSongs?.songs.length) {
    return (
      <Typography variant="lead" className="text-center">
        No Moodlist Songs
      </Typography>
    );
  }

  return (
    <>
      <MoodlistSongList songs={moodlistSongs.songs} />
      <SongsSetter songs={moodlistSongs.songs} />
    </>
  );
};

export { MoodlistSongs };
