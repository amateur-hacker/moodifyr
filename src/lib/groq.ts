import Groq from "groq-sdk";
import { env } from "@/lib/env";

const groq = new Groq({ apiKey: env.GROQ_API_KEY });

export { groq };
