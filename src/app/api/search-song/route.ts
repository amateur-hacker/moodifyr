import { NextResponse } from "next/server";
import ytSearch from "yt-search";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");
  const id = searchParams.get("id");

  if (!query && !id) {
    return NextResponse.json(
      { error: "Provide either 'q' or 'id' parameter" },
      { status: 400 },
    );
  }

  try {
    if (query) {
      // 🔎 Search mode
      const results = await ytSearch(query);
      const videos = results.videos.map((video) => ({
        id: video.videoId,
        title: video.title,
        url: video.url,
        duration: video.timestamp,
        views: video.views,
        author: video.author.name,
        thumbnail: video.thumbnail,
      }));

      return NextResponse.json({ results: videos });
    }

    if (id) {
      // 🎵 Single video mode
      const video = await ytSearch({ videoId: id });

      if (!video) {
        return NextResponse.json({ error: "Video not found" }, { status: 404 });
      }

      const single = {
        id: video.videoId,
        title: video.title,
        url: video.url,
        duration: video.timestamp,
        views: video.views,
        author: video.author.name,
        thumbnail: video.thumbnail,
      };

      return NextResponse.json({ result: single });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch songs" },
      { status: 500 },
    );
  }
}
