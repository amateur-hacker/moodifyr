"use client";

import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { MoodlistCard } from "@/app/moodlists/_components/moodlist-card";
import type {
  getUserFollowedMoodlists,
  getUserMoodlists,
} from "@/app/moodlists/queries";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";

const MoodlistCardList = ({
  userId,
  moodlists,
  followedMoodlists,
}: {
  userId: string;
  moodlists: Awaited<ReturnType<typeof getUserMoodlists>>;
  followedMoodlists: Awaited<ReturnType<typeof getUserFollowedMoodlists>>;
}) => {
  const [showOwnerInfo, setShowOwnerInfo] = useState(false);

  const owned = moodlists?.filter((m) => m.type === "owned") ?? [];
  const followed = moodlists?.filter((m) => m.type === "followed") ?? [];

  const toggleOpen = () => {
    setShowOwnerInfo((prev) => !prev);
  };

  const renderMoodlistCard = (m: NonNullable<typeof moodlists>[number]) => {
    return (
      <div key={m.id} className="space-y-2">
        <div className="flex flex-col">
          <Link
            href={
              m.type === "owned"
                ? `/moodlists/${m.id}`
                : `/moodlists/user/${m.ownerId}/${m.id}`
            }
            className="flex-1 relative"
          >
            <MoodlistCard
              prevMoodlistName={m.name}
              moodlistId={m.id}
              userId={userId}
              moodlistType={m.type}
              ownerId={m.type === "followed" ? m.ownerId : undefined}
              isAlreadyFollowing={
                followedMoodlists?.some((fm) => fm.id === m.id) ?? false
              }
            />
            <Typography
              variant="large"
              className="text-center mt-1 text-wrap break-all line-clamp-2"
            >
              {m.name}
            </Typography>
          </Link>

          {m.type === "followed" && showOwnerInfo && (
            <Link
              href={`/moodlists/user/${m.ownerId}`}
              className="flex flex-col items-center gap-1 text-center mt-1 no-hover:underline has-hover:hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              <Image
                width={20}
                height={20}
                alt={`Owner ${m.ownerName} image`}
                className="rounded-full"
                src={m.ownerImage}
              />
              <Typography variant="muted">
                Created by{" "}
                <span className="line-clamp-1 max-w-[20ch] font-medium">
                  {m.ownerName}
                </span>
              </Typography>
            </Link>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-10">
      {owned.length > 0 && (
        <section>
          <Typography variant="h3" className="mb-4 font-playful">
            Your Moodlists
          </Typography>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] place-items-start gap-5">
            {owned.map(renderMoodlistCard)}
          </div>
        </section>
      )}

      {followed.length > 0 && (
        <section>
          <div className="flex items-center gap-1.5 mb-4">
            <Typography variant="h3" className="font-playful">
              Followed Moodlists
            </Typography>
            <Button
              size="icon"
              variant="ghost"
              className="shadow-none cursor-pointer"
              aria-label={
                showOwnerInfo ? "Hide creator details" : "Show creator details"
              }
              title={
                showOwnerInfo ? "Hide creator details" : "Show creator details"
              }
              onClickCapture={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleOpen();
              }}
            >
              {showOwnerInfo ? (
                <Eye size={16} aria-hidden={true} />
              ) : (
                <EyeOff size={16} aria-hidden={true} />
              )}
            </Button>
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] place-items-start gap-5">
            {followed.map(renderMoodlistCard)}
          </div>
        </section>
      )}
    </div>
  );
};

export { MoodlistCardList };
