# gCal to ICS

An add-on that intercepts links to create new Google Calendar events and turns them into iCalendar (ICS) files to import
in your favorite calendar application (Thunderbird, Outlook, Proton Calendar, etc.).

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
2. Compile the Typescript files and bundle them
    ```shell
    pnpm bundle
    ```
3. Build the extension using `web-ext`
    ```shell
   pnpm build
    ```

### Running tests

Run `mise test` (which will also install dependencies) or `pnpm test`.

## FAQ

### Why does it ask permission for `calendar.google.com`?

In order to intercept event creation URLs, the add-on must request access to Google Calendar's domain. Don't worry, it
does not access any other URL nor any content in Google Calendar.

### Importing each ICS file manually in service X is a chore, why doesn't the add-on do it for me?

To be honest, I originally intended for this add-on to automatically import the generated ICS files into Proton Calendar,
but quickly elected not to, for the following reasons:

- It would make the extension significantly more complex.
- Every single change in the import page could break the feature, meaning more maintenance.
- If it ever supported service X, I would certainly be asked to add support for services Y and Z as well.

My advice then, is to use a calendar application (like Thunderbird or Outlook) and set it up to handle ICS files.

### Why doesn't it work with Proton ICS Auto-Importer?

Due to the limitations of add-ons, [Proton ICS Auto-Importer](https://addons.mozilla.org/firefox/addon/proton-ics-auto-importer/)
can only work on direct links to ICS files, and because gCal to ICS does its work after the user has clicked on Google
Calendar links, Proton ICS Auto-Importer cannot detect the generated ICS file.
