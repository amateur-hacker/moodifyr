"use server";

import z from "zod";
import { executeFn } from "@/db/utils";
import { groq } from "@/lib/groq";

const classifySongCategory = async ({ title }: { title: string }) => {
  const classifySongCategorySchema = z.object({
    title: z.string().min(1),
  });
  const { title: parsedTitle } = classifySongCategorySchema.parse({ title });

  return executeFn({
    fn: async () => {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `
You are a music category classifier.
Given the song details (title and description), return ONLY one category
from this fixed set: ["Happy", "Sad", "Romantic", "Energetic", "Calm", "Motivational", "Emotional", "Unknown"].

Answer with only the category word, nothing else.
            `,
          },
          { role: "user", content: `Song title: ${parsedTitle}` },
        ],
        model: "openai/gpt-oss-20b",
        temperature: 1,
        max_completion_tokens: 8192,
        top_p: 1,
        stream: false,
        reasoning_effort: "high",
      });

      const response = chatCompletion?.choices?.[0]?.message?.content?.trim();
      return response ?? null;
    },
    isProtected: true,
    serverErrorMessage: "classifySongCategory",
  });
};

export { classifySongCategory };
