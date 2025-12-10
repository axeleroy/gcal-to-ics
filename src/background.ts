import { failure, Result, success } from "./types";
import { extractSearchParams, getDates, safeGetSearchParam } from "./utils";

const urls = ["https://calendar.google.com/calendar/render*", "https://calendar.google.com/calendar/r/eventedit*"];

function redirect(requestDetails: browser.webRequest._OnBeforeRequestDetails): browser.webRequest.BlockingResponse | void {
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

function buildICalendar(searchParams: URLSearchParams): Result<string> {
  const dates = getDates(searchParams);
    if (!dates.ok) {
        return failure();
    }
    const uid = self.crypto.randomUUID();
    return success(`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//ZContent.net//Zap Calendar 1.0//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${uid}
SUMMARY:${safeGetSearchParam(searchParams, "text")}
DTSTAMP:${dates.result.start}
DTSTART:${dates.result.start}
DTEND:${dates.result.end}
DESCRIPTION:${safeGetSearchParam(searchParams, "details")}
LOCATION:${safeGetSearchParam(searchParams, "location")}
END:VEVENT
END:VCALENDAR`);
}

browser.webRequest.onBeforeRequest.addListener(redirect, { urls, types: ["main_frame"] }, ["blocking"]);
