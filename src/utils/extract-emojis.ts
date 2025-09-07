export const extractEmojis = (text: string): string[] =>
  text.match(/\p{Extended_Pictographic}/gu) ?? [];
