// @vitest-environment jsdom

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { buildICalendar, getDates } from "./icalendar";
import dayjs from "dayjs";

describe("buildIcalendar", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  })

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  })

  it('should return a valid iCalendar event', () => {
    // GIVEN
    const searchParams = new URLSearchParams("?action=TEMPLATE&text=Birthday&dates=20201231T193000Z/20201231T223000Z&details=With%20clowns%20and%20stuff&location=North%20Pole");
    vi.setSystemTime(new Date("2025-12-15T00:00:00.000Z"));
    vi.stubGlobal("crypto", {
      randomUUID : vi.fn(() => "foo")
    });

    // WHEN
    const result = buildICalendar(searchParams);

    // THEN
    expect(result.ok).toBe(true);
    expect(result.ok && result.result).toBe(`BEGIN:VEVENT\r
UID:foo\r
SEQUENCE:0\r
DTSTAMP:20251215T000000Z\r
DTSTART:20201231T193000Z\r
DTEND:20201231T223000Z\r
SUMMARY:Birthday\r
LOCATION:North Pole\r
DESCRIPTION:With clowns and stuff\r
END:VEVENT\r
`)
  });
  // TODO: test all other cases
})

describe('getDates', () => {
  it('should parse full date times in UTC', () => {
    // GIVEN
    const searchParams = new URLSearchParams("dates=20201231T193000Z/20201231T223000Z");

    // WHEN
    const res = getDates(searchParams);

    // THEN
    expect(res.ok).toBe(true);
    expect(res.ok && res.result).toEqual({
      start: dayjs("2020-12-31T19:30:00Z"),
      end: dayjs("2020-12-31T22:30:00Z"),
      allDay: false
    })
  });
  it('should parse full date times in local timezone', () => {
    // GIVEN
    const searchParams = new URLSearchParams("dates=20201231T193000/20201231T223000");

    // WHEN
    const res = getDates(searchParams);

    // THEN
    expect(res.ok).toBe(true);
    expect(res.ok && res.result).toEqual({
      start: dayjs("2020-12-31T19:30:00"),
      end: dayjs("2020-12-31T22:30:00"),
      allDay: false
    })
  });
  it('should parse dates only', () => {
    // GIVEN
    const searchParams = new URLSearchParams("dates=20201231Z/20201231Z");

    // WHEN
    const res = getDates(searchParams);

    // THEN
    expect(res.ok).toBe(true);
    expect(res.ok && res.result).toEqual({
      start: dayjs("2020-12-31"),
      end: dayjs("2020-12-31"),
      allDay: true
    })
  });
  it('should return a failure if dates is missing', () => {
    // GIVEN
    const searchParams = new URLSearchParams();

    // WHEN
    const res = getDates(searchParams);

    // THEN
    expect(res.ok).toBe(false);
  });
  it('should return a failure if one of the dates is missing', () => {
    // GIVEN
    const searchParams = new URLSearchParams("dates=20201231T193000Z");

    // WHEN
    const res = getDates(searchParams);

    // THEN
    expect(res.ok).toBe(false);
  });
});
