# Driver Scheduler

A live daily driver board for dispatchers, built as a **MyGeotab Add-In**.
Instead of the old spreadsheet-style schedule, this shows one row per
driver with today's activity plotted on a timeline — pulled straight from
the MyGeotab API — plus a running exceptions/alerts feed and status
counts at a glance.

- **Timeline board** — every driver's trips for the day as blocks on a
  24h track, with a live "now" marker, sorted by status (driving first).
- **Status per driver** — Driving / Stopped / Not started / Finished,
  derived from trip and device-status data (see [Status heuristic](#status-heuristic)).
- **Exceptions panel** — today's rule violations (speeding, harsh
  braking, etc.) across all drivers, newest first.
- **Drill-down** — click a driver row to see their individual trips
  (start/end, duration, distance, max speed).
- **Date picker** — review any past day, not just today.
- **Demo mode** — open the page outside of MyGeotab (e.g. the raw GitHub
  Pages URL) and it boots with realistic generated sample data instead
  of trying to reach the API, so you can preview it without installing
  anything.

## How it works

This is a static React app. When MyGeotab loads it inside an Add-In
iframe, it calls a well-known lifecycle hook
(`window.geotab.addin.driverScheduler`) and hands the page an
already-authenticated API client — there's no separate login. From
there the app calls the MyGeotab API directly (`User`, `Device`,
`Trip`, `DeviceStatusInfo`, `ExceptionEvent`, `Rule`) to build the
board for the selected day, and polls every 60 seconds while viewing
today.

If the page is opened standalone (not inside MyGeotab), that hook is
never called, so it falls back to demo mode with generated data after
a short timeout — useful for previewing on GitHub Pages before you've
installed it anywhere.

### Status heuristic

MyGeotab doesn't have a native "driver shift" concept, so status is
inferred per driver from their trips and latest device status:

- **Driving** — has a trip with no end time yet, or the latest device
  status shows actively driving.
- **Stopped** — last activity (trip end or status ping) was within the
  last 30 minutes.
- **Finished** — had activity today, but nothing in the last 30
  minutes.
- **Not started** — no trips and no recent status for the day.

This is a heuristic, not a stored schedule — there's no concept of a
"planned" shift here, only what's actually happened, sourced live from
the API.

## Local development

```bash
npm install
npm run dev
```

Visiting the local dev URL runs it in demo mode automatically (same
fallback as above), so you get a fully interactive board without a
MyGeotab connection.

```bash
npm run build    # type-check + production build to dist/
npm run lint      # oxlint
```

## Deploying to GitHub Pages

A workflow at `.github/workflows/deploy.yml` builds and publishes
`dist/` to GitHub Pages on every push to `main`.

One-time setup in this repo:

1. **Settings → Pages → Source → GitHub Actions.**
2. Merge/push to `main` — the workflow builds and deploys automatically.
3. The app will be live at:
   `https://robertsontr21-star.github.io/Schedule/`

The Vite `base` in `vite.config.ts` is set to `/Schedule/` to match
this repo name. If you ever rename the repo, update that value too.

## Installing as a MyGeotab Add-In

Once the page is live on GitHub Pages:

1. In MyGeotab, go to **Administration → System Settings → Add-Ins**.
2. Click **New Add-In**, choose to add a **Custom Add-In** from
   configuration, and paste:

   ```json
   {
     "name": "Driver Scheduler",
     "supportEmail": "robertson.tr21@gmail.com",
     "version": "1.0.0",
     "items": [
       {
         "url": "https://robertsontr21-star.github.io/Schedule/index.html",
         "path": "ActivityLink/",
         "menuName": {
           "en": "Driver Scheduler"
         },
         "icon": "https://robertsontr21-star.github.io/Schedule/icon.svg"
       }
     ]
   }
   ```

3. Save, then confirm your user/group has access to the Add-In under
   **Security → Clearances** if it doesn't show up in the menu.
4. Open it from the MyGeotab left-hand menu under **Activity** — it
   should load with live data from whichever database you're logged
   into (point this at your demo/sandbox database while testing, not
   production).

Because the Add-In runs with whatever session is currently logged in,
there's nothing else to configure — no API keys to manage in this repo.

## Data model notes

- Only users flagged as drivers (and not the `UnknownDriver`
  placeholder) are shown.
- A trip only counts toward a driver if MyGeotab could attribute it to
  them (e.g. via a Driver ID device or RFID key) — trips with no
  identified driver aren't attributed to anyone yet.
- Distances are read directly from the `Trip.distance` field
  (kilometers, as returned by the API).
