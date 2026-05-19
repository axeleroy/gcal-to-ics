import { failure, Result, success } from "./types";
import { getSearchParam, safeGetSearchParam } from "./urls-utils";
import ical, {
    ICalAttendeeData,
    ICalCalendarMethod,
    ICalEventBusyStatus,
    ICalEventData,
    ICalEventTransparency,
} from "ical-generator";
import { tzlib_get_ical_block } from "timezones-ical-library";
import { getDates } from "./dates-utils";

export function buildICalendar(searchParams: URLSearchParams): Result<string> {
    const dates = getDates(searchParams);
    if (!dates.ok) {
        return failure();
    }
    const { start, end, allDay } = dates.result;
    const id = self.crypto.randomUUID();
    const timezone = getSearchParam(searchParams, "ctz");
    const event: ICalEventData = {
        id,
        start,
        end,
        allDay,
        summary: safeGetSearchParam(searchParams, "text"),
        description: getSearchParam(searchParams, "details"),
        location: getSearchParam(searchParams, "location"),
        timezone,
        busystatus: getBusyStatus(searchParams),
        transparency: getTransparency(searchParams),
        attendees: getAttendees(searchParams),
        repeating: getSearchParam(searchParams, "recur"),
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
    switch (getSearchParam(searchParams, "crm")) {
        case "BUSY":
            return ICalEventBusyStatus.BUSY;
        case "AVAILABLE":
            return ICalEventBusyStatus.FREE;
        case "BLOCKING":
            return ICalEventBusyStatus.OOF;
        default:
            return null;
    }
}

function getTransparency(searchParams: URLSearchParams): ICalEventTransparency | null {
    switch (getSearchParam(searchParams, "trp")) {
        case "BUSY":
            return ICalEventTransparency.OPAQUE;
        case "AVAILABLE":
            return ICalEventTransparency.TRANSPARENT;
        default:
            return null;
    }
}

export function getAttendees(searchParams: URLSearchParams): ICalAttendeeData[] {
    if (!searchParams.has("add")) {
        return [];
    }
    const attendees = getSearchParam(searchParams, "add")!;
    return attendees.split(",").map((email) => ({ email }));
}
