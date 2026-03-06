import { failure, Result, success } from "./types";

export function safeGetSearchParam(searchParams: URLSearchParams, key: string): string {
    if (searchParams.has(key)) {
        return searchParams.get(key)!;
    } else {
        console.warn(`Search params do not contain "${key}" entry`, searchParams);
        return "";
    }
}

export function extractSearchParams(pageUrl: string): Result<URLSearchParams> {
    const url = URL.parse(pageUrl);
    if (!url) {
        console.error("Failed to extract search params", pageUrl);
        return failure();
    }
    const { searchParams } = url;
    return success(searchParams);
}
