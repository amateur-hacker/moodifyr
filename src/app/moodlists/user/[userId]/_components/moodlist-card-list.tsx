import Link from "next/link";
import type {
  getMoodlistsByUserId,
  getUserFollowedMoodlists,
} from "@/app/moodlists/queries";
import { Typography } from "@/components/ui/typography";
import { MoodlistCard } from "./moodlist-card";

const MoodlistCardList = ({
  moodlists,
  userId,
  followedMoodlists,
}: {
  userId: string;
  moodlists: Awaited<ReturnType<typeof getMoodlistsByUserId>>;
  followedMoodlists: Awaited<ReturnType<typeof getUserFollowedMoodlists>>;
}) => {
  return (
    <>
      {moodlists?.map((m) => (
        <div key={m.id} className="space-y-2">
          <Link href={`/moodlists/user/${userId}/${m.id}`}>
            <MoodlistCard
              userId={userId}
              moodlistId={m.id}
              isAlreadyFollowing={
                followedMoodlists?.some((fm) => fm.id === m.id) ?? false
              }
            />
            <Typography variant="large" className="line-clamp-1 text-center">
              {m.name}
            </Typography>
          </Link>
        </div>
      ))}
    </>
  );
};

export { MoodlistCardList };
