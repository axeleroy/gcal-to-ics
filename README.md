![Add-on's icon](https://github.com/axeleroy/gcal-to-ics/blob/main/src/icon-64.png?raw=true)

# Google Calendar links to ICS

An add-on that intercepts links that create new Google Calendar events and turns them into iCalendar (ICS) files you can
import in your favorite calendar application (Thunderbird, Outlook, Proton Calendar, etc.)

## Download

Links to come

## Working on the add-on

You need [Node.js](https://nodejs.org/) and [pnpm](https://pnpm.io) to be installed beforehand. Alternatively, you can
use [mise](https://mise.jdx.dev/) to install them both by executing `mise install`.

### Building 

> [!TIP]
> If you have `mise` installed, executing `mise run build` will run every task described bellow.

1. Install dependencies
    ```shell
    pnpm install --frozen-lockfile
    ```
2. Compile the TypeScript files and bundle them
    ```shell
    pnpm bundle
    ```
3. Build the extension using `web-ext`
    ```shell
   pnpm build
    ```
   
### Running in a browser with live-reload

The `dev` script (executed with `pnpm dev`) watches for code changes and automatically re-compiles and reloads the 
add-on. To specify a profile, a specific version of Firefox or to debug on Android, follow the 
[documentation on `web-ext run`](https://extensionworkshop.com/documentation/develop/web-ext-command-reference/#web-ext-run).

### Running tests

Run `mise test` (which will also install dependencies) or `pnpm test`.

## FAQ

### Why does it ask permission for `calendar.google.com`?

In order to intercept event creation URLs, the add-on must request permission to Google Calendar's domain. Because it
only requests permission to intercept requests, it cannot read Google's response nor the content of the page.

### The add-on did not create an ICS file and simply showed me the Google Calendar interface

This is either because the creation URL was invalid or that you stumbled on an edge-case that it does not handle (yet).
In any case, [create an issue](https://github.com/axeleroy/gcal-to-ics/issues/new) with the URL that failed and don't
forget to redact sensitive information from it.

### The ICS the add-on created is invalid / not recognized by my calendar application

Please [create an issue](https://github.com/axeleroy/gcal-to-ics/issues/new) with the original Google Calendar URL 
(Right Click → Copy Link), the generated ICS file and the calendar application you use. You may want to edit the URL and
ICS file to redact sensitive information beforehand.


### Why isn't it available on Chrome and other Chromium-based browsers? (Edge, Brave, Opera, etc.)

Simply put, Google —in their fight against ad-blockers— introduced changes to how extensions can interact with requests:
they removed the method that was previously available and replaced it with a new one that is much more rigid and 
limited, to the point that it prevents implementing this add-on's feature.

<details>
    <summary>The more technical version</summary>

> Google [deprecated Manifest V2](https://developer.chrome.com/docs/extensions/develop/migrate/mv2-deprecation-timeline)
—the "original" API for extensions— in favor of [Manifest V3](https://developer.chrome.com/docs/extensions/develop/migrate/what-is-mv3).
>
> One of the major changes Manifest V3 brought is the removal of the `webRequestBlocking` permission, that allowed
extensions (such as this one) to intercept and then block or rewrite HTTP requests. Its replacement, the 
[`declarativeNetRequest` API](https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest)
only allows creating pre-defined rules, which means it's impossible to create ICS files on the fly.
</details>

### Importing each ICS file manually in service X is a chore, why doesn't the add-on do it for me?

To be honest, I originally intended for this add-on to automatically import the generated ICS files into Proton Calendar,
but quickly elected not to, for the following reasons:

- It would make the extension significantly more complex.
- Every single change in the import page could break the feature, meaning more maintenance.
- If it ever supported service X, I would certainly be asked to add support for services Y and Z as well.

My advice then, is to use a calendar application (like Thunderbird or Outlook) and set it up to handle ICS files.

### Why doesn't it work with Proton ICS Auto-Importer?

Due to the limitations of add-ons, [Proton ICS Auto-Importer](https://addons.mozilla.org/firefox/addon/proton-ics-auto-importer/)
can only work on direct links to ICS files. Because Google Calendar links to ICS does its work after the user has
clicked on a link, Proton ICS Auto-Importer cannot detect the generated ICS file.
