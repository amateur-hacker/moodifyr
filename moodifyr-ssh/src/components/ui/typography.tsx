import type React from "react";

import { cn } from "@/lib/utils";

type Variant =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "body"
  | "body-small"
  | "small"
  | "lead"
  | "large"
  | "muted"
  | "inline-text"
  | "inline-code"
  | "multiline-code"
  | "quote";

interface Props {
  variant: Variant;
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

const tags: Record<Variant, React.ElementType> = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  body: "p",
  "body-small": "p",
  lead: "p",
  small: "small",
  large: "div",
  muted: "span",
  "inline-text": "span",
  "inline-code": "span",
  "multiline-code": "pre",
  quote: "blockquote",
};

const sizes: Record<Variant, string> = {
  h1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
  h2: "scroll-m-20 py-2 text-3xl font-semibold tracking-tight lg:text-4xl",
  h3: "scroll-m-20 text-2xl font-semibold tracking-tight",
  h4: "scroll-m-20 text-xl font-semibold tracking-tight",
  body: "leading-7",
  "body-small": "text-sm",
  lead: "text-xl text-muted-foreground",
  small: "text-sm font-medium leading-none",
  large: "text-lg font-semibold",
  muted: "text-sm text-muted-foreground",
  "inline-text": "text-sm",
  "inline-code":
    "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
  "multiline-code":
    "relative rounded bg-muted p-4 font-mono text-sm font-semibold overflow-x-auto",
  quote: "border-l-2 pl-6 italic text-muted-foreground",
};

const Typography = ({ variant, children, className, as }: Props) => {
  const sizeClasses = sizes[variant];
  const Tag = as || tags[variant];

  return <Tag className={cn(sizeClasses, className)}>{children}</Tag>;
};

export { Typography };
