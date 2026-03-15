import { failure, Result, success } from "./types";

export function getDates(searchParams: URLSearchParams): Result<{ start: Date; end: Date; allDay: boolean }> {
    if (!searchParams.has("dates")) {
        console.error('Search params do not contain "dates" entry', searchParams);
        return failure();
    }
    const dates = searchParams.get("dates")!;

    const [startStr, endStr] = dates.split("/");
    if (!startStr || !endStr) {
        console.error(`One of the dates are missing from dates search param: ${dates}`);
        return failure();
    }
    const startResult = getDate(startStr);
    const endResult = getDate(endStr);
    if (!startResult.ok || !endResult.ok) {
        return failure();
    }
    const { value: start, allDay } = startResult.result;
    const { value: end } = endResult.result;
    return success({ start, end, allDay });
}

const utcTimeFormat =
    /(?<year>\d{4})(?<month>\d{2})(?<day>\d{2})(?<time>T(?<hour>\d{2})(?<minutes>\d{2})(?<seconds>\d{2})(?<utc>Z)?)?/;

export function getDate(dateStr: string): Result<{ value: Date; allDay: boolean }> {
    const match = utcTimeFormat.exec(dateStr);
    if (!match || !match.groups) {
        console.error(`Date ${dateStr} is invalid`);
        return failure();
    }
    const { year, month, day, time, hour, minutes, seconds, utc } = match.groups;
    const allDay = !time;
    let format = `${year}-${month}-${day}`;
    if (!allDay) {
        format = `${format}T${hour}:${minutes}:${seconds}${utc || ""}`;
    }
    return success({
        value: new Date(format),
        allDay,
    });
}
