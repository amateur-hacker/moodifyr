import Link from "next/link";
import { Typography } from "@/components/ui/typography";
import type { SelectMoodlistModel } from "@/db/schema/moodlists";
import { MoodlistCard } from "./moodlist-card";

const MoodlistCardList = ({
  userId,
  moodlists,
  followedMoodlists,
}: {
  userId: string;
  moodlists:
    | (
        | {
            type: "owned";
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
          }
        | {
            type: "followed";
            id: string;
            name: string;
            ownerId: string;
            followedAt: Date;
          }
      )[]
    | null;

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
        <Link href={`/moodlists/${m.id}`} key={m.id} className="space-y-2">
          {m.type === "owned" ? (
            <MoodlistCard
              prevMoodlistName={m.name}
              moodlistId={m.id}
              userId={userId}
              moodlistType={m.type}
              isAlreadyFollowing={
                followedMoodlists?.some((fm) => fm.id === m.id) ?? false
              }
            />
          ) : (
            <MoodlistCard
              prevMoodlistName={m.name}
              moodlistId={m.id}
              ownerId={m.ownerId}
              moodlistType={m.type}
              isAlreadyFollowing={
                followedMoodlists?.some((fm) => fm.id === m.id) ?? false
              }
            />
          )}
          <Typography variant="large" className="line-clamp-1 text-center">
            {m.name}
          </Typography>
        </Link>
      ))}
    </>
  );
};

export { MoodlistCardList };
