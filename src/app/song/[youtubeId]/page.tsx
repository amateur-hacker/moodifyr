import { Suspense } from "react";
import SongClient from "./SongClient";
import { env } from "@/lib/env";

async function getVideoData(youtubeId: string) {
  const res = await fetch(
    `${env.NEXT_PUBLIC_API_BASE_URL}/search?id=${youtubeId}`,
    {
      cache: "no-store", // always fresh
    },
  );
  const data = await res.json();
  return data;
}

export default async function SongPage({
  params,
}: {
  params: Promise<{ youtubeId: string }>;
}) {
  const { youtubeId } = await params;
  const videoData = await getVideoData(youtubeId);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SongClient videoData={videoData} youtubeId={youtubeId} />
    </Suspense>
  );
}
