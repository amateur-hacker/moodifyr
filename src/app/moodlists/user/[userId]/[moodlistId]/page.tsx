import { Smile } from "lucide-react";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { PlayHeader } from "@/app/_components/play-header";
import { SongCardLoader } from "@/app/_components/song-card-loader";
import { SongsSetter } from "@/app/_components/songs-setter";
import {
  getMoodlistSongsByUserId,
  getMoodlistSongsStatsByUserId,
  getUserFollowedMoodlists,
} from "@/app/moodlists/queries";
import { FollowMoodlistButton } from "@/app/moodlists/user/[userId]/[moodlistId]/_components/follow-moodlist-button";
import { MoodlistSongList } from "@/app/moodlists/user/[userId]/[moodlistId]/_components/moodlist-song-list";
import { getUserById, getUserSession } from "@/app/queries";
import { Galaxy } from "@/components/galaxy";
import { Badge } from "@/components/ui/badge";
import { Typography } from "@/components/ui/typography";

const UserMoodlistPage = async ({
  params,
}: {
  params: Promise<{ userId: string; moodlistId: string }>;
}) => {
  const { userId, moodlistId } = await params;

  const session = await getUserSession();

  if (!session?.user) {
    return (
      <div className="w-full">
        <Typography variant="lead">
          Please sign in to see your favourite songs.
        </Typography>
      </div>
    );
  }

  if (session?.user?.id === userId) {
    redirect(`/moodlists/${moodlistId}`);
  }

  const [moodlistSongs, moodlistSongsStats, user, followedMoodlists] =
    await Promise.all([
      getMoodlistSongsByUserId({ userId, moodlistId }).then(
        (res) => res ?? null,
      ),
      getMoodlistSongsStatsByUserId({ userId, moodlistId }).then(
        (res) => res ?? null,
      ),
      getUserById({ userId }).then((res) => res ?? null),
      getUserFollowedMoodlists().then((res) => res ?? null),
    ]);

  return (
    <div className="w-full">
      {user && (
        <div className="w-full h-[200px] border-b-2 mb-4 flex justify-center items-center relative">
          <div className="w-max mx-auto flex gap-5 items-center bg-transparent absolute z-10">
            <Image
              src={user.image}
              alt={user.name}
              width={50}
              height={50}
              className="rounded-full"
            />
            <Typography variant="h4">{user.name}</Typography>
          </div>
          <Galaxy mouseInteraction={false} />
        </div>
      )}
      <div className="w-max mx-auto">
        <Badge variant="outline">
          <Smile
            className="-ms-0.5 text-emerald-500"
            size={12}
            aria-hidden="true"
          />
          Moodlist
        </Badge>
      </div>
      {moodlistSongs && (
        <>
          <div className="mb-4">
            <div className="flex items-center justify-center gap-2.5">
              <Typography variant="h2" className="font-playful text-center">
                {moodlistSongs.name}
              </Typography>
              <FollowMoodlistButton
                isAlreadyFollowing={
                  followedMoodlists?.some((fm) => fm.id === moodlistId) ?? false
                }
                moodlistId={moodlistId}
                userId={userId}
              />
            </div>
            {!!(
              moodlistSongsStats?.totalSongs && moodlistSongsStats.totalTime
            ) && (
              <PlayHeader
                songs={moodlistSongs?.songs}
                totalSongs={moodlistSongsStats.totalSongs}
                totalTime={moodlistSongsStats.totalTime}
                className="text-center"
              />
            )}
          </div>
          <div className="w-full space-y-5 mx-auto max-w-3xl">
            {moodlistSongs.songs.length > 0 ? (
              <Suspense
                fallback={
                  <div className="space-y-[1.3125rem]">
                    {Array.from({ length: 10 }, (_, idx) => idx).map((id) => (
                      <SongCardLoader key={`loader-${id}`} />
                    ))}
                  </div>
                }
              >
                <MoodlistSongList
                  songs={moodlistSongs.songs}
                  moodlistName={moodlistSongs.name}
                  moodlistId={moodlistId}
                />
                <SongsSetter songs={moodlistSongs.songs} />
              </Suspense>
            ) : (
              <Typography variant="lead" className="text-center">
                No Moodlist Songs
              </Typography>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default UserMoodlistPage;
