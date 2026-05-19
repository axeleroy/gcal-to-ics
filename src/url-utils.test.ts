import { describe, expect, it } from "vitest";
import {
    extractSearchParams,
    extractSearchParamsFromUrlFragment,
    getSearchParam,
    safeGetSearchParam,
} from "./urls-utils";

describe("extractSearchParams", () => {
    it("should return search params when URL contains them", () => {
        // GIVEN
        const url = "https://example.com/url?foo=bar&baz=buzz";

        // WHEN
        const result = extractSearchParams(url);

        // THEN
        expect(result.ok).toBe(true);
        expect(result.ok && result.result).toEqual(
            new URLSearchParams({
                foo: "bar",
                baz: "buzz",
            }),
        );
    });

    it("should return empty URLSearchParams if the URL does not contain any params", () => {
        // GIVEN
        const url = "https://example.com/url";

        // WHEN
        const result = extractSearchParams(url);

        // THEN
        expect(result.ok).toBe(true);
        expect(result.ok && result.result).toEqual(new URLSearchParams());
    });

    it("should return a failure if the URL is invalid", () => {
        // GIVEN
        const url = "/foo";

        // WHEN
        const result = extractSearchParams(url);

        // THEN
        expect(result.ok).toBe(false);
    });
});

describe("extractSearchParamsFromUrlFragment", () => {
    it("should return search params when URL contains them", () => {
        // GIVEN
        const url = "https://example.com/url#foo=bar&baz=buzz";

        // WHEN
        const result = extractSearchParamsFromUrlFragment(url);

        // THEN
        expect(result.ok).toBe(true);
        expect(result.ok && result.result).toEqual(
            new URLSearchParams({
                foo: "bar",
                baz: "buzz",
            }),
        );
    });

    it("should return empty URLSearchParams if the URL does not contain any params", () => {
        // GIVEN
        const url = "https://example.com/url";

        // WHEN
        const result = extractSearchParamsFromUrlFragment(url);

        // THEN
        expect(result.ok).toBe(true);
        expect(result.ok && result.result).toEqual(new URLSearchParams());
    });

    it("should return a failure if the URL is invalid", () => {
        // GIVEN
        const url = "/foo";

        // WHEN
        const result = extractSearchParamsFromUrlFragment(url);

        // THEN
        expect(result.ok).toBe(false);
    });
});

describe("safeGetSearchParam", () => {
    it("should return the value if key exists", () => {
        // GIVEN
        const params = new URLSearchParams({
            foo: "bar",
            baz: "buzz",
        });

        // WHEN
        const result = safeGetSearchParam(params, "foo");

        // THEN
        expect(result).toEqual("bar");
    });
    it("should return empty string if key does not exist", () => {
        // GIVEN
        const params = new URLSearchParams({
            foo: "bar",
            baz: "buzz",
        });

        // WHEN
        const result = safeGetSearchParam(params, "bar");

        // THEN
        expect(result).toEqual("");
    });
});

describe("getSearchParam", () => {
    it("should return the value if key exists", () => {
        // GIVEN
        const params = new URLSearchParams({
            foo: "bar",
            baz: "buzz",
        });

        // WHEN
        const result = getSearchParam(params, "foo");

        // THEN
        expect(result).toEqual("bar");
    });
    it("should return null if key does not exist", () => {
        // GIVEN
        const params = new URLSearchParams({
            foo: "bar",
            baz: "buzz",
        });

        // WHEN
        const result = getSearchParam(params, "bar");

        // THEN
        expect(result).toEqual(null);
    });
});
