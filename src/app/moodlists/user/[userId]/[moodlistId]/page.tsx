import { SongsSetter } from "@/app/_components/songs-setter";
import { getMoodlistById, getMoodlistSongsByUserId } from "../../../queries";
import { MoodlistSongList } from "./_components/moodlist-song-list";
import { SongCardLoader } from "@/app/_components/song-card-loader";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Typography } from "@/components/ui/typography";
import { Music, Smile } from "lucide-react";
import { getUserById, getUserSession } from "@/app/queries";
import { redirect } from "next/navigation";
import { Galaxy } from "@/components/galaxy";

const UserMoodlistPage = async ({
  params,
}: {
  params: Promise<{ userId: string; moodlistId: string }>;
}) => {
  const { userId, moodlistId } = await params;

  const session = await getUserSession();

  if (session?.user?.id === userId) {
    redirect(`/moodlists/${moodlistId}`);
  }

  const [moodlistSongs, user] = await Promise.all([
    getMoodlistSongsByUserId({ userId, moodlistId }).then((res) => res ?? null),
    getUserById({ userId }).then((res) => res ?? null),
  ]);
  console.log(user);

  if (!moodlistSongs) return null;

  const songs = moodlistSongs.songs.map((item) => ({
    id: item.id,
    moodlistSongId: item.moodlistSongId,
    title: item.title,
    thumbnail: item.thumbnail,
    duration: item.duration,
  }));

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
      <Typography variant="h2" className="font-playful text-center mb-4">
        {moodlistSongs.name}
      </Typography>
      <div className="w-full space-y-5 mx-auto max-w-3xl">
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
          <SongsSetter songs={songs} />
        </Suspense>
      </div>
    </div>
  );
};

export default UserMoodlistPage;
