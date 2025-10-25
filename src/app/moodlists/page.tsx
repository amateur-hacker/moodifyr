import { CreateMoodlistDialog } from "@/app/moodlists/_components/create-moodlist-dialog";
import { MoodlistCardList } from "@/app/moodlists/_components/moodlist-card-list";
import {
  getUserFollowedMoodlists,
  getUserMoodlists,
} from "@/app/moodlists/queries";
import { getUserSession } from "@/app/queries";
import { Typography } from "@/components/ui/typography";

const MoodlistsPage = async () => {
  const session = (await getUserSession()) ?? null;

  if (!session?.user) {
    return (
      <div className="w-full">
        <Typography variant="lead">
          Please sign in to see moodlists page.
        </Typography>
      </div>
    );
  }
  const moodlists = (await getUserMoodlists()) ?? null;
  const followedMoodlists = (await getUserFollowedMoodlists()) ?? null;

  return (
    <div className="space-y-10 mb-[var(--player-height,80px)]">
      <div>
        <Typography variant="h3" className="mb-4 font-playful">
          Create Moodlist
        </Typography>
        <CreateMoodlistDialog />
      </div>
      <MoodlistCardList
        moodlists={moodlists}
        userId={session.user.id}
        followedMoodlists={followedMoodlists}
      />
    </div>
  );
};

export default MoodlistsPage;
