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
        expect(result.ok && result.result).toMatch(/BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-\/\/sebbo.net\/\/ical-generator\/\/EN\r\nMETHOD:REQUEST\r\nBEGIN:VTIMEZONE\r\nTZID:America\/Toronto\r\nX-LIC-LOCATION:America\/Toronto\r\nLAST-MODIFIED:\d{8}T\d{6}Z\r\nBEGIN:DAYLIGHT\r\nTZNAME:EDT\r\nTZOFFSETFROM:-0500\r\nTZOFFSETTO:-0400\r\nDTSTART:19700308T020000\r\nRRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU\r\nEND:DAYLIGHT\r\nBEGIN:STANDARD\r\nTZNAME:EST\r\nTZOFFSETFROM:-0400\r\nTZOFFSETTO:-0500\r\nDTSTART:19701101T020000\r\nRRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU\r\nEND:STANDARD\r\nEND:VTIMEZONE\r\nTIMEZONE-ID:America\/Toronto\r\nX-WR-TIMEZONE:America\/Toronto\r\nBEGIN:VEVENT\r\nUID:foo\r\nSEQUENCE:0\r\nDTSTAMP:20251215T000000\r\nDTSTART;TZID=America\/Toronto:20201231T160000\r\nDTEND;TZID=America\/Toronto:20201231T170000\r\nRRULE:FREQ=WEEKLY;UNTIL=20210603\r\nSUMMARY:Example Google Calendar Event\r\nDESCRIPTION:More help see: https:\/\/support.google.com\/calendar\/thread\/8134\r\n 4786\r\nEND:VEVENT\r\nEND:VCALENDAR/);
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
