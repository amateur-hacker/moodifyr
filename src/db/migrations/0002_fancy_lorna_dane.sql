DROP INDEX "title_search_index";--> statement-breakpoint
CREATE INDEX "song_search_history_query_index" ON "song_search_history" USING btree ("query");