import { parse } from "twemoji-parser";
import Image from "next/image";

type EmojiPart = string | { url: string; text: string };

function parseWithText(input: string): EmojiPart[] {
  const entities = parse(input);
  const result: EmojiPart[] = [];
  let lastIndex = 0;

  for (const e of entities) {
    if (lastIndex < e.indices[0]) {
      result.push(input.slice(lastIndex, e.indices[0]));
    }
    result.push({ url: e.url, text: e.text });
    lastIndex = e.indices[1];
  }

  if (lastIndex < input.length) {
    result.push(input.slice(lastIndex));
  }

  return result;
}

export function EmojiText({ text }: { text: string }) {
  const parts = parseWithText(text);

  return (
    <span className="inline-flex items-center flex-wrap">
      {parts.map((part, i) =>
        typeof part === "string" ? (
          <span key={i}>{part}</span>
        ) : (
          <Image
            key={i}
            src={part.url}
            alt={part.text}
            className="inline-block h-6 w-6 align-text-bottom"
          />
        ),
      )}
    </span>
  );
}
