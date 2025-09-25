import { Skeleton } from "@/components/ui/skeleton";

const SongCardLoader = () => {
  return (
    <div className="flex flex-row items-center gap-2.5 sm:gap-5">
      <div className="flex w-full items-center gap-2.5">
        <Skeleton className=" w-[120px] h-[60px] sm:w-[150px] sm:h-[75px] aspect-[2/1.2] rounded-md" />
        <div className="flex w-full flex-col gap-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>

      <Skeleton className="heart h-6 w-2 m-4" />
    </div>
  );
};

export { SongCardLoader };
