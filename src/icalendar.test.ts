// @vitest-environment jsdom

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { buildICalendar, getAttendees, getDates } from "./icalendar";
import dayjs from "dayjs";

describe("buildIcalendar", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2025-12-15T00:00:00.000Z"));
        vi.stubGlobal("crypto", {
            randomUUID: vi.fn(() => "foo"),
        });
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
    });

    it("should return a valid iCalendar event", () => {
        // GIVEN
        const searchParams = new URLSearchParams(
            "?action=TEMPLATE&text=Birthday&dates=20201231T193000Z/20201231T223000Z&details=With%20clowns%20and%20stuff&location=North%20Pole",
        );

        // WHEN
        const result = buildICalendar(searchParams);

        // THEN
        expect(result.ok).toBe(true);
        expect(result.ok && result.result).toBe(`BEGIN:VCALENDAR\r
VERSION:2.0\r
PRODID:-//sebbo.net//ical-generator//EN\r
METHOD:REQUEST\r
BEGIN:VEVENT\r
UID:foo\r
SEQUENCE:0\r
DTSTAMP:20251215T000000Z\r
DTSTART:20201231T193000Z\r
DTEND:20201231T223000Z\r
SUMMARY:Birthday\r
LOCATION:North Pole\r
DESCRIPTION:With clowns and stuff\r
END:VEVENT\r
END:VCALENDAR`);
    });

    it("should return a valid iCalendar event with timezone and recurrence", () => {
        // GIVEN
        const searchParams = new URLSearchParams(
            "?action=TEMPLATE&text=Example+Google+Calendar+Event&details=More+help+see:+https://support.google.com/calendar/thread/81344786&dates=20201231T160000/20201231T170000&recur=RRULE:FREQ%3DWEEKLY;UNTIL%3D20210603&ctz=America/Toronto",
        );

        // WHEN
        const result = buildICalendar(searchParams);

        // THEN
        expect(result.ok).toBe(true);
        expect(result.ok && result.result).toBe(`BEGIN:VCALENDAR\r
VERSION:2.0\r
PRODID:-//sebbo.net//ical-generator//EN\r
METHOD:REQUEST\r
BEGIN:VTIMEZONE\r
TZID:America/Toronto\r
X-LIC-LOCATION:America/Toronto\r
LAST-MODIFIED:20250523T094234Z\r
X-LIC-LOCATION:America/Toronto\r
BEGIN:DAYLIGHT\r
TZNAME:EDT\r
TZOFFSETFROM:-0500\r
TZOFFSETTO:-0400\r
DTSTART:19700308T020000\r
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU\r
END:DAYLIGHT\r
BEGIN:STANDARD\r
TZNAME:EST\r
TZOFFSETFROM:-0400\r
TZOFFSETTO:-0500\r
DTSTART:19701101T020000\r
RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU\r
END:STANDARD\r
END:VTIMEZONE\r
TIMEZONE-ID:America/Toronto\r
X-WR-TIMEZONE:America/Toronto\r
BEGIN:VEVENT\r
UID:foo\r
SEQUENCE:0\r
DTSTAMP:20251215T010000\r
DTSTART;TZID=America/Toronto:20201231T160000\r
DTEND;TZID=America/Toronto:20201231T170000\r
RRULE:FREQ=WEEKLY;UNTIL=20210603\r
SUMMARY:Example Google Calendar Event\r
DESCRIPTION:More help see: https://support.google.com/calendar/thread/8134\r
 4786\r
END:VEVENT\r
END:VCALENDAR`);
    });

    it("should return a valid iCalendar event with all-day event", () => {
        // GIVEN
        const searchParams = new URLSearchParams(
            "?action=TEMPLATE&text=Example%20event&dates=20251216/20251217&details=&location=",
        );

        // WHEN
        const result = buildICalendar(searchParams);

        // THEN
        expect(result.ok).toBe(true);
        expect(result.ok && result.result).toBe(`BEGIN:VCALENDAR\r
VERSION:2.0\r
PRODID:-//sebbo.net//ical-generator//EN\r
METHOD:REQUEST\r
BEGIN:VEVENT\r
UID:foo\r
SEQUENCE:0\r
DTSTAMP:20251215T000000Z\r
DTSTART;VALUE=DATE:20251216\r
DTEND;VALUE=DATE:20251217\r
X-MICROSOFT-CDO-ALLDAYEVENT:TRUE\r
X-MICROSOFT-MSNCALENDAR-ALLDAYEVENT:TRUE\r
SUMMARY:Example event\r
DESCRIPTION:\r
END:VEVENT\r
END:VCALENDAR`);
    });
});

describe("getDates", () => {
    it("should parse full date times in UTC", () => {
        // GIVEN
        const searchParams = new URLSearchParams("dates=20201231T193000Z/20201231T223000Z");

        // WHEN
        const res = getDates(searchParams);

        // THEN
        expect(res.ok).toBe(true);
        expect(res.ok && res.result).toEqual({
            start: dayjs("2020-12-31T19:30:00Z"),
            end: dayjs("2020-12-31T22:30:00Z"),
            allDay: false,
        });
    });
    it("should parse full date times in local timezone", () => {
        // GIVEN
        const searchParams = new URLSearchParams("dates=20201231T193000/20201231T223000");

        // WHEN
        const res = getDates(searchParams);

        // THEN
        expect(res.ok).toBe(true);
        expect(res.ok && res.result).toEqual({
            start: dayjs("2020-12-31T19:30:00"),
            end: dayjs("2020-12-31T22:30:00"),
            allDay: false,
        });
    });
    it("should parse dates only", () => {
        // GIVEN
        const searchParams = new URLSearchParams("dates=20201230Z/20201231Z");

        // WHEN
        const res = getDates(searchParams);

        // THEN
        expect(res.ok).toBe(true);
        expect(res.ok && res.result).toEqual({
            start: dayjs.utc("2020-12-30"),
            end: dayjs.utc("2020-12-31"),
            allDay: true,
        });
    });
    it("should return a failure if dates is missing", () => {
        // GIVEN
        const searchParams = new URLSearchParams();

        // WHEN
        const res = getDates(searchParams);

        // THEN
        expect(res.ok).toBe(false);
    });
    it("should return a failure if one of the dates is missing", () => {
        // GIVEN
        const searchParams = new URLSearchParams("dates=20201231T193000Z");

        // WHEN
        const res = getDates(searchParams);

        // THEN
        expect(res.ok).toBe(false);
    });
});

describe("getAttendees", () => {
    it("should return all attendees' email addresses", () => {
        // GIVEN
        const searchParams = new URLSearchParams("add=foo@bar.com,baz@bar.com");

        // WHEN
        const res = getAttendees(searchParams);

        // THEN
        expect(res).toEqual([{ email: "foo@bar.com" }, { email: "baz@bar.com" }]);
    });
    it("should return an empty array if add is absent", () => {
        // GIVEN
        const searchParams = new URLSearchParams();

        // WHEN
        const res = getAttendees(searchParams);

        // THEN
        expect(res).toEqual([]);
    });
});
