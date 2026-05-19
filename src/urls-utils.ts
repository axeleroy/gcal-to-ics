import { failure, Result, success } from "./types";

/**
 * Returns the search param value or an empty string if it does not exist.
 */
export function safeGetSearchParam(searchParams: URLSearchParams, key: string): string {
    return getSearchParam(searchParams, key) || "";
}

/**
 * Returns the search param value or null if it does not exist.
 */
export function getSearchParam(searchParams: URLSearchParams, key: string): string | null {
    if (searchParams.has(key)) {
        return searchParams.get(key)!;
    } else {
        console.warn(`Search params do not contain "${key}" entry`, searchParams);
        return null;
    }
}

function parseUrl(pageUrl: string): Result<URL> {
    const url = URL.parse(pageUrl);
    if (!url) {
        console.error("Failed to parse URL", pageUrl);
        return failure();
    }
    return success(url);
}

export function extractSearchParams(pageUrl: string): Result<URLSearchParams> {
    const url = parseUrl(pageUrl);
    if (!url.ok) {
        return failure();
    }
    const { searchParams } = url.result;
    return success(searchParams);
}

export function extractSearchParamsFromUrlFragment(pageUrl: string): Result<URLSearchParams> {
    const url = parseUrl(pageUrl);
    if (!url.ok) {
        return failure();
    }
    const { hash } = url.result;
    const cleaned = hash.replace("#", "");
    return success(new URLSearchParams(cleaned));
}
