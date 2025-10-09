import { MoodlistCardList } from "./_components/moodlist-card-list";
import { getMoodlistsByUserId, getUserFollowedMoodlists } from "../../queries";
import { getUserById, getUserSession } from "@/app/queries";
import { redirect } from "next/navigation";
import Image from "next/image";
import { Typography } from "@/components/ui/typography";
import { Galaxy } from "@/components/galaxy";

const MoodlistsPage = async ({
  params,
}: {
  params: Promise<{ userId: string }>;
}) => {
  const { userId } = await params;

  const session = await getUserSession();

  if (session?.user?.id === userId) {
    redirect("/moodlists");
  }

  const [moodlists, followedMoodlists, user] = await Promise.all([
    getMoodlistsByUserId({ userId }).then((res) => res ?? null),
    getUserFollowedMoodlists().then((res) => res ?? null),
    getUserById({ userId }).then((res) => res ?? null),
  ]);

  return (
    <div className="w-full [--main-padding-x:0]">
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
      <div className="grid grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] place-items-center gap-5 px-6">
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
