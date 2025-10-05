import { Typography } from "@/components/ui/typography";
import { getUserSession } from "../queries";
import { CreateMoodlist } from "./_components/create-moodlist";
import { MoodlistCardList } from "./_components/moodlist-card-list";
import { getUserFollowedMoodlists, getUserMoodlists } from "./queries";

const MoodlistsPage = async () => {
  const session = (await getUserSession()) ?? null;
  const moodlists = (await getUserMoodlists()) ?? null;

  if (!session?.user) {
    return (
      <div className="w-full">
        <Typography variant="lead">
          Please sign in to see moodlists page.
        </Typography>
      </div>
    );
  }
  const followedMoodlists = (await getUserFollowedMoodlists()) ?? null;

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] place-items-center gap-5">
      <CreateMoodlist className="size-32 sm:size-40 rounded-md flex justify-center items-center" />
      <MoodlistCardList
        moodlists={moodlists}
        userId={session.user.id}
        followedMoodlists={followedMoodlists}
      />
    </div>
  );
};

export default MoodlistsPage;
