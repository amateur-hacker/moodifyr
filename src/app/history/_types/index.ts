import type { HistorySongSchema, Prettify } from "@/app/_types";

type SongHistorySchema = Prettify<Record<string, HistorySongSchema[]>>;

export type { HistorySongSchema, SongHistorySchema };
