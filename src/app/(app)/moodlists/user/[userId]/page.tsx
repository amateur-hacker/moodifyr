import Image from "next/image";
import { redirect } from "next/navigation";
import {
  getMoodlistsByUserId,
  getUserFollowedMoodlists,
} from "@/app/(app)/moodlists/queries";
import { MoodlistCardList } from "@/app/(app)/moodlists/user/[userId]/_components/moodlist-card-list";
import { getUserById, getUserSession } from "@/app/(app)/queries";
import { Galaxy } from "@/components/galaxy";
import { Typography } from "@/components/ui/typography";

const MoodlistsPage = async ({
  params,
}: {
  params: Promise<{ userId: string }>;
}) => {
  const { userId } = await params;

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
    redirect("/moodlists");
  }

  const [moodlists, followedMoodlists, user] = await Promise.all([
    getMoodlistsByUserId({ userId }).then((res) => res ?? null),
    getUserFollowedMoodlists().then((res) => res ?? null),
    getUserById({ userId }).then((res) => res ?? null),
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
      <div className="grid grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] place-items-center gap-5">
        <MoodlistCardList
          moodlists={moodlists}
          userId={userId}
          followedMoodlists={followedMoodlists}
        />
      </div>
    </div>
  );
};

export default MoodlistsPage;
