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
        id: string;
        name: string;
        ownerId: string;
        followedAt: Date;
      }[]
    | null;
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
