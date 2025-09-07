"use server";

import { Groq } from "groq-sdk";
import { env } from "@/lib/env";
import { executeFn } from "@/utils/execute-fn";

const groq = new Groq({ apiKey: env.GROQ_API_KEY });

const getUserMoodBySongHistory = async ({
  songHistory,
}: {
  songHistory: string[];
}) => {
  if (!songHistory?.length) return null;

  const songHistoryQuery = songHistory.join("\n");

  return executeFn({
    fn: async () => {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              'You are a mood-describer for a music app dashboard. \nAnalyze the last ≤10 songs the user listened to and respond ONLY in JSON format:\n\n{\n  "mood": "😔 Sad",\n  "message": "Maybe you are missing someone very deeply."\n}\n\n{\n  "mood": "⚡ Energy",\n  "message": "You’re super charged today, maybe something exciting is happening!"\n}\n\nRules:\n- mood = emoji + bold 1–2 word mood tag\n- message = short, friendly, conversational sentence\n- Keep it simple, no extra text outside JSON',
          },
          {
            role: "user",
            content: songHistoryQuery,
          },
        ],
        model: "openai/gpt-oss-20b",
        temperature: 1,
        max_completion_tokens: 8192,
        top_p: 1,
        stream: false,
        reasoning_effort: "high",
        stop: null,
      });

      const response = chatCompletion?.choices?.[0].message?.content;
      const parsedResponse = response?.length ? response : null;
      return parsedResponse;
    },
    isProtected: true,
    serverErrorMessage: "getUserMoodBySongHistory",
  });
};

export { getUserMoodBySongHistory };
