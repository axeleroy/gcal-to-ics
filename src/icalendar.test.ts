// @vitest-environment jsdom

import { describe, it, expect } from "vitest";
import { buildICalendar, getDates } from "./icalendar";

describe("buildIcalendar", () => {
  it('should return a valid iCalendar event', () => {
    // GIVEN
    const searchParams = new URLSearchParams("?action=TEMPLATE&text=Birthday&dates=20201231T193000Z/20201231T223000Z&details=With%20clowns%20and%20stuff&location=North%20Pole");

    // WHEN
    const result = buildICalendar(searchParams);

    // THEN
    expect(result).toBe(null)

  });
})

// TODO: parse dates into Date objects using dayjs
describe('getDates', () => {
  it('should parse full date times', () => {
    // GIVEN
    const searchParams = new URLSearchParams("dates=20201231T193000Z/20201231T223000Z");

    // WHEN
    const res = getDates(searchParams);

    // THEN
    expect(res.ok).toBe(true);
    expect(res.ok && res.result).toEqual({
      start: "",
      end: ""
    })
  });
  it('should parse dates only', () => {
    // GIVEN
    const searchParams = new URLSearchParams("dates=20201231T193000Z/20201231T223000Z");

    // WHEN
    const res = getDates(searchParams);

    // THEN
    expect(res.ok).toBe(true);
    expect(res.ok && res.result).toEqual({
      start: "",
      end: ""
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
