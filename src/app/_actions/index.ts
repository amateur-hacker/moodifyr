"use server";

import { Groq } from "groq-sdk";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import { executeFn } from "@/utils/execute-fn";

const groq = new Groq({ apiKey: env.GROQ_API_KEY });

const getServerSession = async () => {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    return session;
  } catch (err) {
    console.error("Failed to fetch server session:", err);
    return null;
  }
};

const getUserMoodBySongHistory = async ({
  songHistory,
}: {
  songHistory: string[];
}) => {
  if (!songHistory?.length) return null;

  const songHistoryInput = songHistory.join(", ");

  return executeFn({
    fn: async () => {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are a mood-describer for a music app dashboard.
The user will send you a compressedHistoryString that contains song names.
If a song was played multiple times, the number of plays will be shown in parentheses (e.g., "Shayad (120)").
Use both the song names and their frequencies to infer the user's mood.

Respond ONLY in valid JSON format:

{
  "mood": "😔 Sad",
  "message": "Maybe you are missing someone very deeply."
}

{
  "mood": "⚡ Energy",
  "message": "You’re super charged today, maybe something exciting is happening!"
}


Rules:
- mood = emoji + 1–2 word mood tag (no markdown or bolding)
- message = short, friendly, conversational sentence
- Keep your words simple and easy to understand
- Make the user smile or nod; avoid heavy or poetic language
- Output must be a single JSON object with keys: mood, message
- Do not include any extra text outside JSON`,
          },
          {
            role: "user",
            content: songHistoryInput,
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

      const response = chatCompletion?.choices?.[0]?.message?.content?.trim();
      console.log(response);
      if (!response) return null;

      try {
        return JSON.parse(response);
      } catch (err) {
        console.error("Failed to parse mood JSON:", err);
        return null;
      }
    },
    isProtected: true,
    serverErrorMessage: "getUserMoodBySongHistory",
  });
};

export { getServerSession, getUserMoodBySongHistory };
