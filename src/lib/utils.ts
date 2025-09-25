import { BetterAuthError } from "better-auth";
import { type ClassValue, clsx } from "clsx";
import { toZonedTime } from "date-fns-tz";
import { twMerge } from "tailwind-merge";
import { ZodError } from "zod";

const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

const convertToLocalTZ = (utcDate: Date): Date => {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

  return toZonedTime(utcDate, timeZone);
};

const getErrorMessage = (error: unknown): string => {
  let message: string;

  if (error instanceof ZodError) {
    message = error.message;
  } else if (error instanceof BetterAuthError) {
    message = error.message || "Unknown authorization error";
  } else if (error instanceof Error) {
    message = error.message;
  } else if (error && typeof error === "object" && "message" in error) {
    message = String(error.message);
  } else if (typeof error === "string") {
    message = error;
  } else {
    message = "Unknown error";
  }

  return message;
};

const encodeQueryParam = (param: string) =>
  encodeURIComponent(param).replace(/%20/g, "+");

const decodeQueryParam = (param: string) =>
  decodeURIComponent(param.replace("/+/g", " "));

const encodePathParam = (param: string) =>
  encodeURIComponent(
    param.toLowerCase().replace(/&/g, "and").replace(/\s+/g, "-"),
  );

const decodePathParam = (param: string) => {
  const convertToTitleCase = (string: string) => {
    return string.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return convertToTitleCase(
    decodeURIComponent(param.replace(/-/g, " ").replace(/and/g, "&")),
  );
};

const wait = async (duration: number = 1000) => {
  return new Promise((resolve) => setTimeout(resolve, duration));
};

export {
  cn,
  convertToLocalTZ,
  getErrorMessage,
  encodeQueryParam,
  decodeQueryParam,
  encodePathParam,
  decodePathParam,
  wait,
};
