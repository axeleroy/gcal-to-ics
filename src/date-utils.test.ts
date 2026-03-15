import { describe, it, expect } from "vitest";
import { getDate, getDates } from "./dates-utils";

describe("getDate", () => {
    it("should parse full date time in UTC", () => {
        // GIVEN
        const dateStr = "20201231T193000Z";

        // WHEN
        const result = getDate(dateStr);

        // THEN
        expect(result.ok).toBe(true);
        expect(result.ok && result.result).toEqual({
            value: new Date("2020-12-31T19:30:00Z"),
            allDay: false,
        });
    });
    it("should parse full date time in local timezone", () => {
        // GIVEN
        const dateStr = "20201231T193000";

        // WHEN
        const result = getDate(dateStr);

        // THEN
        expect(result.ok).toBe(true);
        expect(result.ok && result.result).toEqual({
            value: new Date("2020-12-31T19:30:00"),
            allDay: false,
        });
    });
    it("should parse date only", () => {
        // GIVEN
        const dateStr = "20201231";

        // WHEN
        const result = getDate(dateStr);

        // THEN
        expect(result.ok && result.result).toEqual({
            value: new Date("2020-12-31"),
            allDay: true,
        });
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
            start: new Date("2020-12-31T19:30:00Z"),
            end: new Date("2020-12-31T22:30:00Z"),
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
            start: new Date("2020-12-31T19:30:00"),
            end: new Date("2020-12-31T22:30:00"),
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
            start: new Date("2020-12-30"),
            end: new Date("2020-12-31"),
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
