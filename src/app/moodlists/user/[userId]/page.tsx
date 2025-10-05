import { MoodlistCardList } from "./_components/moodlist-card-list";
import { getMoodlistsByUserId, getUserFollowedMoodlists } from "../../queries";

const MoodlistsPage = async ({
  params,
}: {
  params: Promise<{ userId: string }>;
}) => {
  const { userId } = await params;

  const moodlists = (await getMoodlistsByUserId({ userId })) ?? null;

  const followedMoodlists = await getUserFollowedMoodlists();

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] place-items-center gap-5">
      <MoodlistCardList
        moodlists={moodlists}
        userId={userId}
        followedMoodlists={followedMoodlists}
      />
    </div>
  );
};

export default MoodlistsPage;
