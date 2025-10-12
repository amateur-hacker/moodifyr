"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AddToMoodlistDialog } from "@/app/_components/add-to-moodlist-dialog";
import { ShareLinkDialog } from "@/app/_components/share-link-dialog";
import { SongCard } from "@/app/_components/song-card";
import { useFavourites } from "@/app/_context/favourite-context";
import type { SearchSongSchema, SongSchema } from "@/app/_types";
import { toggleUserFavouriteSong } from "@/app/actions";
import { googleSignInUser } from "@/app/fn";
import type { getUserMoodlists } from "@/app/moodlists/queries";
import { useUser } from "@/app/_context/user-context";

const SearchSongCard = ({
  song,
  isAlreadyFavourite = false,
  moodlists,
}: {
  song: SearchSongSchema;
  isAlreadyFavourite?: boolean;
  moodlists: Awaited<ReturnType<typeof getUserMoodlists>>;
}) => {
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isAddToMoodlistDialogOpen, setIsAddToMoodlistDialogOpen] =
    useState(false);
  const [baseUrl, setBaseUrl] = useState("");
  const [hasInteracted, setHasInteracted] = useState(false);
  const {
    favouriteSongs,
    setFavourite,
    isFavouritePending,
    setFavouritePending,
  } = useFavourites();

  const isFavourite = favouriteSongs[song.id] ?? isAlreadyFavourite;
  const isPending = isFavouritePending[song.id] ?? false;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const user = useUser();

  const handleToggleFavourite = async () => {
    if (!user) {
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

    setHasInteracted(true);
    setFavouritePending(song.id, true);
    setFavourite(song.id, !isFavourite);

    try {
      const result = await toggleUserFavouriteSong({ song });

      if (!result) {
        setFavourite(song.id, isFavourite);
        toast.error("Failed to update favourite. Try again.");
      }
    } catch (error) {
      setFavourite(song.id, isFavourite);
      console.error("Error toggling favourite:", error);
      toast.error("Failed to update favourite. Try again.");
    } finally {
      setFavouritePending(song.id, false);
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
