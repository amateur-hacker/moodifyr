import { Suspense } from "react";
import { SongCardLoader } from "@/app/(app)/_components/song-card-loader";
import { getUserSession } from "@/app/(app)/queries";
import { Typography } from "@/components/ui/typography";
import { HistoryResults } from "@/app/(app)/history/_components/history-results";

const HistoryPage = async () => {
  const session = (await getUserSession()) ?? null;

  if (!session?.user) {
    return (
      <div className="w-full">
        <Typography variant="lead">
          Please sign in to see your song history.
        </Typography>
      </div>
    );
  }

  return (
    <div className="size-full space-y-4">
      <Typography variant="h2" className="font-playful text-center">
        History
      </Typography>
      <div className="size-full mx-auto max-w-3xl pb-[var(--player-height,0px)]">
        <Suspense
          fallback={
            <div className="space-y-[1.3125rem]">
              {Array.from({ length: 10 }, (_, idx) => idx).map((id) => (
                <SongCardLoader key={`loader-${id}`} />
              ))}
            </div>
          }
        >
          <HistoryResults />
        </Suspense>
      </div>
    </div>
  );
};

export default HistoryPage;
