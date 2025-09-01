import { Skeleton } from "@/components/ui/skeleton";

const SongCardLoader = () => {
  return (
    <div className="flex flex-col gap-2.5 rounded-md border p-2 sm:flex-row sm:items-center sm:gap-5">
      <div className="flex w-full items-center gap-2.5">
        <Skeleton className="w-auto h-[75px] aspect-[2/1.2] rounded-md" />
        <div className="flex w-full flex-col gap-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full sm:w-48" />
        </div>
      </div>

      <div className="flex flex-row-reverse items-center justify-between gap-5 sm:ml-auto sm:flex-col">
        <Skeleton className="heart h-2 w-5" />
        <Skeleton className="h-4 w-12" />
      </div>
    </div>
  );
};

export { SongCardLoader };
