import { failure, Result, success } from "./types";
import { safeGetSearchParam } from "./utils";
import ical, { ICalAttendeeData, ICalEventBusyStatus, ICalEventData, ICalEventTransparency } from "ical-generator";
import { match } from "ts-pattern";

export function buildICalendar(searchParams: URLSearchParams): Result<string> {
  const dates = getDates(searchParams);
  if (!dates.ok) {
    return failure();
  }
  const {start, end} = dates.result
  const id = self.crypto.randomUUID();
  const event: ICalEventData = {
    id,
    start,
    end,
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

export function getDates(searchParams: URLSearchParams): Result<{ start: string, end: string}> {
  if (!searchParams.has("dates")) {
    console.error('Search params do not contain "dates" entry', searchParams);
    return failure();
  }

  const dates = searchParams.get("dates")!;
  const [start, end] = dates.split("/");
  if (!start || !end) {
    console.error(`One of the dates are missing from dates search param: ${dates}`)
    return failure()
  }
  return success({ start, end });
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
