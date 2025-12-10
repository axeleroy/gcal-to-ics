import { failure, Result, success } from "./types";

export function safeGetSearchParam(searchParams: URLSearchParams, key: string): string {
  if (searchParams.has(key)) {
    return searchParams.get(key)!;
  } else {
    console.warn(`Search params do not contain "${key}" entry`, searchParams);
    return "";
  }
}

type Dates = { start: string, end: string}

export function getDates(searchParams: URLSearchParams): Result<Dates> {
  if (!searchParams.has("dates")) {
    console.error('Search params do not contain "dates" entry', searchParams);
    return failure();
  }

  const dates = searchParams.get("dates")!;
  const [start, end] = dates.split("/");
  if (!start || !end) {
    console.error(`One of the dates are missing from dates search param: ${dates}`)
    return failure()
  }
  return success({ start, end });
}

export function extractSearchParams(pageUrl: string): Result<URLSearchParams> {
  try {
    // I'd prefer to use URL.parse(), but it is still not supported in Firefox ESR2 (115)
    const url = new URL(pageUrl);
    const {searchParams} = url;
    return success(searchParams);
  } catch (e) {
    console.error("Failed to extract search params", e);
    return failure();
  }
}

