import Link from "next/link";
import { Typography } from "@/components/ui/typography";
import type { SelectMoodlistModel } from "@/db/schema/moodlists";
import { MoodlistCard } from "./moodlist-card";

const MoodlistCardList = ({
  moodlists,
  userId,
  followedMoodlists,
}: {
  moodlists: SelectMoodlistModel[] | null;
  userId: string;
  followedMoodlists:
    | {
        id: string | null;
        name: string | null;
        ownerId: string | null;
        followedAt: Date;
      }[]
    | null;
}) => {
  return (
    <>
      {moodlists?.map((m) => (
        <Link
          href={`/moodlists/user/${userId}/${m.id}`}
          key={m.id}
          className="space-y-2"
        >
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
      ))}
    </>
  );
};

export { MoodlistCardList };
