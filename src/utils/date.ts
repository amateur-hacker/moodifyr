import { toZonedTime } from "date-fns-tz";

const convertToLocalTZ = (utcDate: Date): Date => {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

  return toZonedTime(utcDate, timeZone);
};

export { convertToLocalTZ };
