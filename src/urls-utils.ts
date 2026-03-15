import { failure, Result, success } from "./types";

export function safeGetSearchParam(searchParams: URLSearchParams, key: string): string {
    if (searchParams.has(key)) {
        return searchParams.get(key)!;
    } else {
        console.warn(`Search params do not contain "${key}" entry`, searchParams);
        return "";
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
