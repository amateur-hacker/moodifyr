"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AddToMoodlistDialog } from "@/app/_components/add-to-moodlist-dialog";
import { ShareLinkDialog } from "@/app/_components/share-link-dialog";
import { SongCard } from "@/app/_components/song-card";
import type { SearchSongSchema, SongSchema } from "@/app/_types";
import { googleSignInUser, toggleUserFavouriteSong } from "@/app/fn";
import type { getUserMoodlists } from "@/app/moodlists/queries";
import { authClient } from "@/lib/auth-client";

const SearchSongCard = ({
  song,
  isAlreadyFavourite = false,
  moodlists,
}: {
  song: SearchSongSchema;
  isAlreadyFavourite?: boolean;
  moodlists: Awaited<ReturnType<typeof getUserMoodlists>>;
}) => {
  const [isFavourite, setIsFavourite] = useState(isAlreadyFavourite);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isAddToMoodlistDialogOpen, setIsAddToMoodlistDialogOpen] =
    useState(false);
  const [baseUrl, setBaseUrl] = useState("");
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { useSession } = authClient;
  const { data: session } = useSession();

  const handleToggleFavourite = async () => {
    setHasInteracted(true);
    setIsPending(true);

    if (!session?.user) {
      toast("Sign in to save your favourite songs", {
        action: {
          label: "Sign in",
          onClick: async () => {
            const queryString = searchParams?.toString();
            const url = queryString
              ? `${baseUrl}${pathname}?${queryString}`
              : `${baseUrl}${pathname}`;
            const response = await googleSignInUser({
              callbackURL: url,
              newUserCallbackURL: url,
            });
            if (response?.url) {
              router.push(response.url);
            }
          },
        },
        description: "You need an account to favourite songs",
        duration: 5000,
      });
      return;
    }

    const prevState = isFavourite;
    setIsFavourite(!prevState);

    try {
      const result = await toggleUserFavouriteSong({ song });

      if (!result) {
        setIsFavourite(prevState);
        toast.error("Failed to update favourite. Try again.");
      }
    } catch (error) {
      setIsFavourite(prevState);
      console.error("Error toggling favourite:", error);
      toast.error("Failed to update favourite. Try again.");
    } finally {
      setIsPending(true);
    }
  };

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  return (
    <>
      <SongCard
        variant="search"
        song={song}
        onAddToMoodlist={() => setIsAddToMoodlistDialogOpen(true)}
        onShare={() => setIsShareDialogOpen(true)}
        onToggleFavourite={handleToggleFavourite}
        shouldHeartButtonActive={isFavourite}
        shouldHeartButtonAnimate={hasInteracted}
        shouldHeartButtonDisabled={isPending}
      />
      <ShareLinkDialog
        open={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
        link={`${baseUrl}/search?id=${song.id}`}
      />
      <AddToMoodlistDialog
        open={isAddToMoodlistDialogOpen}
        onOpenChange={setIsAddToMoodlistDialogOpen}
        moodlists={moodlists}
        songId={song.id}
        song={song as SongSchema}
      />
    </>
  );
};

export { SearchSongCard };
