import { failure, Result, success } from "./types";
import { safeGetSearchParam } from "./urls-utils";
import ical, {
    ICalAttendeeData,
    ICalCalendarMethod,
    ICalEventBusyStatus,
    ICalEventData,
    ICalEventTransparency,
} from "ical-generator";
import { match } from "ts-pattern";
import { tzlib_get_ical_block } from "timezones-ical-library";
import { getDates } from "./dates-utils";

export function buildICalendar(searchParams: URLSearchParams): Result<string> {
    const dates = getDates(searchParams);
    if (!dates.ok) {
        return failure();
    }
    const { start, end, allDay } = dates.result;
    const id = self.crypto.randomUUID();
    const timezone = searchParams.get("ctz");
    const event: ICalEventData = {
        id,
        start,
        end,
        allDay,
        summary: safeGetSearchParam(searchParams, "text"),
        description: searchParams.get("details"),
        location: searchParams.get("location"),
        timezone,
        busystatus: getBusyStatus(searchParams),
        transparency: getTransparency(searchParams),
        attendees: getAttendees(searchParams),
        repeating: searchParams.get("recur"),
    };
    const cal = ical();
    if (timezone) {
        cal.timezone({
            name: timezone,
            generator: (tz) => tzlib_get_ical_block(tz)[0] || null,
        });
    }
    cal.method(ICalCalendarMethod.REQUEST);
    cal.createEvent(event);
    return success(cal.toString());
}

function getBusyStatus(searchParams: URLSearchParams): ICalEventBusyStatus | null {
    return match(searchParams.get("crm"))
        .with("BUSY", () => ICalEventBusyStatus.BUSY)
        .with("AVAILABLE", () => ICalEventBusyStatus.FREE)
        .with("BLOCKING", () => ICalEventBusyStatus.OOF)
        .otherwise(() => null);
}

function getTransparency(searchParams: URLSearchParams): ICalEventTransparency | null {
    return match(searchParams.get("trp"))
        .with("BUSY", () => ICalEventTransparency.OPAQUE)
        .with("AVAILABLE", () => ICalEventTransparency.TRANSPARENT)
        .otherwise(() => null);
}

export function getAttendees(searchParams: URLSearchParams): ICalAttendeeData[] {
    if (!searchParams.has("add")) {
        return [];
    }
    const attendees = searchParams.get("add")!;
    return attendees.split(",").map((email) => ({ email }));
}
