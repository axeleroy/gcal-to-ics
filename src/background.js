const urls = ["https://calendar.google.com/calendar/render*", "https://calendar.google.com/calendar/r/eventedit*"];

function redirect(requestDetails) {
    console.log(`Redirecting: ${requestDetails.url}`);
    const searchParamResponse = extractSearchParams(requestDetails.url);
    if (!searchParamResponse.ok) {
        // Let the request complete
        return;
    }
    const iCalendarResponse = buildICalendar(searchParamResponse.result);
    if (!iCalendarResponse.ok) {
        return;
    }
    return {
        redirectUrl: `data:text/calendar,${encodeURI(iCalendarResponse.result)}`,
    };
}

/**
 * @param {string} pageUrl
 * @return {{ok: boolean, result: URLSearchParams}|{ok: boolean}}
 */
function extractSearchParams(pageUrl) {
    try {
        // I'd prefer to use URL.parse(), but it is still not supported in Firefox ESR2 (115)
        const url = new URL(pageUrl);
        const { searchParams } = url;
        return { ok: true, result: searchParams };
    } catch (e) {
        console.error("Failed to extract search params", e);
        return { ok: false };
    }
}

/**
 * @param {URLSearchParams} searchParams
 * @return {{ok: boolean, result: string}|{ok: boolean}}
 */
function buildICalendar(searchParams) {
    const dates = getDates(searchParams);
    if (!dates.ok) {
        return { ok: false };
    }
    return {
        ok: true,
        result: `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//ZContent.net//Zap Calendar 1.0//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${self.crypto.randomUUID()}
SUMMARY:${safeGetSearchParam(searchParams, "text")}
DTSTAMP:${dates.result.start}
DTSTART:${dates.result.start}
DTEND:${dates.result.end}
DESCRIPTION:${safeGetSearchParam(searchParams, "details")}
LOCATION:${safeGetSearchParam(searchParams, "location")}
END:VEVENT
END:VCALENDAR`,
    };
}

/**
 * @param {URLSearchParams} searchParams
 * @param {string} key
 */
function safeGetSearchParam(searchParams, key) {
    if (searchParams.has(key)) {
        return searchParams.get(key);
    } else {
        console.warn(`Search params do not contain "${key}" entry`, searchParams);
        return "";
    }
}

/**
 * @param {URLSearchParams} searchParams
 * @return {{ok: boolean}|{ok: boolean, result: {start: *, end: *}}}
 */
function getDates(searchParams) {
    if (!searchParams.has("dates")) {
        console.error('Search params do not contain "dates" entry', searchParams);
        return { ok: false };
    }
    const [start, end] = searchParams.get("dates").split("/");
    return { ok: true, result: { start, end } };
}

browser.webRequest.onBeforeRequest.addListener(redirect, { urls, types: ["main_frame"] }, ["blocking"]);
