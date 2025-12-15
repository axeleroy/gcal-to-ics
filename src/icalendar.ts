import { failure, Result, success } from "./types";
import { safeGetSearchParam } from "./utils";
import ical, { ICalAttendeeData, ICalEventBusyStatus, ICalEventData, ICalEventTransparency } from "ical-generator";
import { match } from "ts-pattern";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import UTC from "dayjs/plugin/utc";

dayjs.extend(customParseFormat);
dayjs.extend(UTC);

export function buildICalendar(searchParams: URLSearchParams): Result<string> {
  const dates = getDates(searchParams);
  if (!dates.ok) {
    return failure();
  }
  const {start, end, allDay} = dates.result
  const id = self.crypto.randomUUID();
  const event: ICalEventData = {
    id,
    start,
    end,
    allDay,
    summary: safeGetSearchParam(searchParams,"text"),
    description: searchParams.get("details"),
    location: searchParams.get("location"),
    timezone: searchParams.get("ctz"),
    busystatus: getBusyStatus(searchParams),
    transparency: getTransparency(searchParams),
    attendees: getAttendees(searchParams),
    repeating: searchParams.get("recur")
  };
  return success(ical().createEvent(event).toString());
}

const allDayFormat = "YYYYMMDD";
const localTimeFormat = `${allDayFormat}THHmmss`;
const utcTimeFormat = `${localTimeFormat}Z`;

export function getDates(searchParams: URLSearchParams): Result<{ start: dayjs.Dayjs, end: dayjs.Dayjs, allDay: boolean}> {
  if (!searchParams.has("dates")) {
    console.error('Search params do not contain "dates" entry', searchParams);
    return failure();
  }

  const dates = searchParams.get("dates")!;
  const [startStr, endStr] = dates.split("/");
  if (!startStr || !endStr) {
    console.error(`One of the dates are missing from dates search param: ${dates}`)
    return failure();
  }
  const allDay = !dates.includes("T");
  const isUtc = dates.includes("Z");
  let formatToUse: string;
  if (allDay) {
    formatToUse = allDayFormat;
  } else if (isUtc) {
    formatToUse = utcTimeFormat;
  } else {
    formatToUse = localTimeFormat;
  }

  const start = dayjs(startStr, formatToUse);
  const end = dayjs(endStr, formatToUse);
  if (!start.isValid() || !end.isValid()) {
    console.error(`One of the dates is invalid: ${dates}`)
    return failure();
  }
  return success({ start, end, allDay });
}

export function getBusyStatus(searchParams: URLSearchParams): ICalEventBusyStatus | null {
  return match(searchParams.get("crm"))
      .with("BUSY", () => ICalEventBusyStatus.BUSY)
      .with("AVAILABLE", () => ICalEventBusyStatus.FREE)
      .with("BLOCKING", () => ICalEventBusyStatus.OOF)
      .otherwise(() => null)
}

export function getTransparency(searchParams: URLSearchParams): ICalEventTransparency | null {
  return match(searchParams.get("trp"))
      .with("BUSY", () => ICalEventTransparency.OPAQUE)
      .with("AVAILABLE", () => ICalEventTransparency.TRANSPARENT)
      .otherwise(() => null)
}

export function getAttendees(searchParams: URLSearchParams): ICalAttendeeData[]{
  if (!searchParams.has("add")) {
    return [];
  }
  const attendees = searchParams.get("add")!;
  return attendees.split(",").map((email) => ({ email }))
}
