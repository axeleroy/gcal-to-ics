import { extractSearchParams } from "./utils";
import { buildICalendar } from "./icalendar";

const urls = [
    "https://calendar.google.com/calendar/render*",
    "https://calendar.google.com/calendar/r/eventedit*",
    "https://calendar.google.com/calendar/event*",
];

function redirect(
    requestDetails: browser.webRequest._OnBeforeRequestDetails,
): browser.webRequest.BlockingResponse | void {
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

browser.webRequest.onBeforeRequest.addListener(redirect, { urls, types: ["main_frame"] }, ["blocking"]);
