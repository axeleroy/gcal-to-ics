import { extractSearchParams, extractSearchParamsFromUrlFragment } from "./urls-utils";
import { buildICalendar } from "./icalendar";
import { Result } from "./types";

const queryParamUrls = [
    "https://calendar.google.com/calendar/render*",
    "https://calendar.google.com/calendar/r/eventedit*",
    "https://calendar.google.com/calendar/event*",
];

const fragmentUrls = ["https://www.google.com/calendar/gp*"];

function createBlockingResponse(
    searchParamResponse: Result<URLSearchParams>,
): browser.webRequest.BlockingResponse | void {
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

function handleQueryParamsUrls(
    requestDetails: browser.webRequest._OnBeforeRequestDetails,
): browser.webRequest.BlockingResponse | void {
    console.log(`Redirecting: ${requestDetails.url}`);
    const searchParamResponse = extractSearchParams(requestDetails.url);
    return createBlockingResponse(searchParamResponse);
}

function handleFragmentUrls(
    requestDetails: browser.webRequest._OnBeforeRequestDetails,
): browser.webRequest.BlockingResponse | void {
    console.log(`Redirecting: ${requestDetails.url}`);
    const searchParamResponse = extractSearchParamsFromUrlFragment(requestDetails.url);
    return createBlockingResponse(searchParamResponse);
}

browser.webRequest.onBeforeRequest.addListener(handleQueryParamsUrls, { urls: queryParamUrls, types: ["main_frame"] }, [
    "blocking",
]);
browser.webRequest.onBeforeRequest.addListener(handleFragmentUrls, { urls: fragmentUrls, types: ["main_frame"] }, [
    "blocking",
]);
