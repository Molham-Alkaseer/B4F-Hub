# B4F-Hub
B4F Hub — my B4F Power Up Program graduation project (September 2026), qualifying me to advance to the B4F Bootcamp. A responsive community feed and opportunity board built with React, TypeScript, Vite, and Express.

A responsive community feed and opportunity board built with **React, TypeScript, Vite, and Express** for the B4F Hub take-home assessment.

Members can share updates, explore jobs and learning opportunities, save interesting roles, and track applications in one interface. The project demonstrates React state management, REST API integration, reusable components, and practical uses of stacks, queues, hash tables, and hash sets.

The app uses seeded demo data and a local API. Applying updates the demo record; it does not send an application to an employer.

## Contents

- [Features](#features)
- [Technology stack](#technology-stack)
- [Getting started](#getting-started)
- [Available commands](#available-commands)
- [Project structure](#project-structure)
- [Architecture and state management](#architecture-and-state-management)
- [Data structures](#data-structures)
- [API reference](#api-reference)
- [Data persistence](#data-persistence)
- [Build and hosting](#build-and-hosting)
- [Manual verification](#manual-verification)
- [Troubleshooting](#troubleshooting)
- [Learning notes and future improvements](#learning-notes-and-future-improvements)

## Features

### Community feed

- Publish posts in four categories: **announcement, event, community, and resource**.
- Validate trimmed content between **3 and 2,000 characters**, with a character counter and inline feedback.
- Browse posts newest first, search by author or content, and combine category and **Liked only** filters.
- Like or unlike posts and see the updated count.
- Delete posts through the API.
- Preserve drafts when publishing fails; clear the form and reset feed filters after a successful submission.

### Opportunity board

- Browse **jobs, internships, scholarships, and volunteer opportunities**.
- Search by title, company, or skill, and filter by **remote, hybrid, or on-site** work mode.
- Expand details to read the description, application deadline, experience level, and posting date.
- Save or unsave roles and narrow the list with **Saved only**.
- Return to previously opened details using a history stack. Going back clears opportunity filters so the previous role is visible.
- Apply once per opportunity; the button shows **Applied** and becomes disabled after success.

### Feedback and layout

- Independent loading, error, retry, and empty-result states for each list.
- Pending button labels and disabled action controls while requests are running.
- Success and request-error notifications displayed one at a time in arrival order.
- Separately scrolling panels at desktop widths of 900px and above, with a stacked layout below 900px.
- Labeled controls, toggle states, expandable-detail attributes, and status/error announcements for assistive technology.

## Technology stack

| Technology | Role |
| --- | --- |
| React 18 | Components, hooks, and UI state |
| TypeScript 5.6 | Frontend types and build-time checking |
| Vite 5 | Development server, API proxy, and production bundle |
| Express 4 | Local JSON API with in-memory records |
| CSS | Styling and responsive layout without a UI framework |
| ESLint 9 | JavaScript, TypeScript, and React lint rules |
| Concurrently | Runs the frontend and API together during development |

## Getting started

### Prerequisites

- Node.js and npm. The installed Vite 5 package declares Node.js `^18.0.0 || >=20.0.0` compatibility.
- A browser and a terminal.
- Git if you plan to clone the repository.

No database, API keys, or `.env` file are required.

### Install and run

Clone the repository and enter its directory:

```bash
git clone https://github.com/Molham-Alkaseer/B4F-Hub.git
cd B4F-Hub
```

Install the locked dependencies and start both services:

```bash
npm ci
npm run dev
```

Open the frontend URL printed by Vite, usually **http://localhost:5173**. Express listens on **http://localhost:3001**. Keep the terminal running while using the app; press `Ctrl+C` to stop it.

The frontend sends requests to relative `/api` URLs. During development, [vite.config.ts](vite.config.ts) forwards those requests to Express on port 3001.

## Available commands

Run these commands from the directory containing `package.json`:

| Command | Description |
| --- | --- |
| `npm ci` | Installs dependencies using `package-lock.json` |
| `npm run dev` | Starts Vite and Express together |
| `npm run dev:client` | Starts only the Vite development server |
| `npm run dev:server` | Starts only the Express API on port 3001 |
| `npm run build` | Runs TypeScript checking and generates the frontend in `dist/` |
| `npm run lint` | Runs ESLint across the project |
| `npm run preview` | Serves the built frontend locally; requires a separate running API |

There is currently no automated test script. See [Manual verification](#manual-verification) for the main interaction checks.

## Project structure

```text
.
|-- server/
|   |-- data.js                 # Seed posts and opportunities
|   `-- index.js                # Express routes, validation, and in-memory state
|-- src/
|   |-- components/
|   |   |-- AddPost.tsx         # Composer, validation, and submission feedback
|   |   |-- Footer.tsx          # Page footer
|   |   |-- Header.tsx          # Page header
|   |   |-- Notification.tsx    # Current queued notification and dismiss control
|   |   |-- OpportunityItem.tsx # Opportunity card, details, save, and apply controls
|   |   `-- PostItem.tsx        # Post card, like, and delete controls
|   |-- hooks/
|   |   `-- useLoadData.ts      # Reusable list fetching and retry logic
|   |-- App.tsx                # Shared types, state, filters, and API handlers
|   |-- index.css              # Shared styles and responsive layout
|   |-- main.tsx               # React entry point
|   `-- vite-env.d.ts          # Vite client type declarations
|-- index.html                 # HTML entry point
|-- package.json               # Dependencies and npm commands
|-- package-lock.json          # Locked dependency versions
|-- eslint.config.js           # Lint configuration
|-- tsconfig*.json             # TypeScript configuration
`-- vite.config.ts             # React plugin and local API proxy
```

## Architecture and state management

This is a single-page application with no client-side router or external state management library.

[App.tsx](src/App.tsx) owns the post and opportunity records, filters, selected opportunity, detail history, saved IDs, and notification queue. It passes records and callbacks into the components. Filtered lists and the opportunity lookup are derived from current state.

The composer and cards manage their own pending and error states. Server-backed actions follow this flow:

1. Validate input or check whether the action is already pending.
2. Send a `POST`, `PATCH`, or `DELETE` request.
3. Check the response and preserve the API's error message when available.
4. Update React state only after the request succeeds.
5. Display feedback and re-enable the relevant controls.

Failed requests leave the existing record or draft intact. This avoids showing a successful mutation before the server confirms it.

### Independent Learning Challenge: `useLoadData<T>`

[useLoadData.ts](src/hooks/useLoadData.ts) extracts fetching, loading, error, and retry behavior into a generic custom hook. `App` calls it once for posts and once for opportunities, so each list loads and retries independently.

The hook returns `data`, `setData`, `isLoading`, `hasError`, and `retry`. Exposing the setter lets successful mutations update a list without fetching it again. The response must be an array; individual record fields are not validated at runtime. Effect cleanup marks the request inactive so a stale response cannot update state after cleanup; it does not cancel the network request.

## Data structures

The four assessment behaviors are implemented in [App.tsx](src/App.tsx) using arrays and plain objects:

| Behavior | Structure | Implementation and rationale |
| --- | --- | --- |
| Return to previous opportunity details | Stack | `opportunityHistory` stores IDs. Switching from one open role to another pushes the previous ID; Back pops the latest ID. Last in, first out matches reverse viewing order. |
| Retrieve an opportunity by ID | Hash table | `opportunitiesById` maps IDs to records for details, history, and application handling. Direct property lookup is typically O(1). |
| Save and unsave opportunities | Hash set | `savedOpportunityIds` represents membership with unique ID keys set to `true`. Adding or deleting a key controls the star and Saved only filter. This is an object-based set, not JavaScript's native `Set`. |
| Dismiss notifications in order | Queue | `notifications` appends with `push`, displays index `0`, and removes the oldest item with `shift`. First in, first out preserves arrival order. |

React state is copied before these structures are changed. Copying arrays or objects has a cost proportional to their size, and array `shift` is O(n). The opportunity lookup is rebuilt in O(n) time on each render with O(n) extra space; constant-time lookup does not make the whole render constant-time.

## API reference

The local API is implemented in [server/index.js](server/index.js). Request bodies use JSON with the `Content-Type: application/json` header. Routes operate on the current server process's shared demo data.

| Method | Endpoint | Body | Success response |
| --- | --- | --- | --- |
| `GET` | `/api/posts` | None | `200`: post array, newest first |
| `POST` | `/api/posts` | `{ "content": "Hello community!", "category": "community" }` | `201`: created post |
| `PATCH` | `/api/posts/:id` | `{ "liked": true }` or `{ "liked": false }` | `200`: updated post |
| `DELETE` | `/api/posts/:id` | None | `204`: no response body |
| `GET` | `/api/opportunities` | None | `200`: opportunity array |
| `PATCH` | `/api/opportunities/:id` | `{ "applied": true }` | `200`: updated opportunity |

### Validation and errors

- New posts require string `content` of 3–2,000 characters after trimming and an allowed category: `announcement`, `event`, `community`, or `resource`.
- Created posts receive the demo author **You**, a generated ID, the current timestamp, and zero likes.
- Post updates require boolean `liked`. Repeating the same value does not change the count again.
- Opportunity updates require boolean `applied`. The API also accepts `false`, although the UI only exposes applying.
- Invalid bodies return `400`; missing records on mutation return `404`; applying again to an already applied role returns `409`.
- Route validation errors return an object such as `{ "error": "You have already applied to this opportunity." }`.
- Both list endpoints include a 350 ms delay so loading feedback is visible during development.

## Data persistence

Initial records are loaded from [server/data.js](server/data.js) when the API starts.

| State | Stored in | Browser refresh | API restart |
| --- | --- | --- | --- |
| Posts, deletions, likes, and applications | Express process memory | Retained and fetched again | Reset to seed data; reload the page to see the reset |
| Saved IDs, detail history, notifications, filters, and drafts | React state in the current page | Reset | Unaffected directly, but reset on page reload |

There is no database, browser storage, authentication, or per-user account system. Browser sessions using the same API process share its posts, likes, and application flags. Deletion is available for every post in this demo.

## Build and hosting

Check the code and build the frontend:

```bash
npm run lint
npm run build
```

To inspect the built frontend locally, run the API in one terminal:

```bash
npm run dev:server
```

Then start the preview in another terminal:

```bash
npm run preview
```

Open the URL printed by Vite. The preview uses the configured API proxy, so port 3001 must remain available.

The build produces static frontend files in `dist/`; it does not bundle or deploy Express. A hosted version needs a running Node.js API and a server or reverse proxy that forwards `/api` requests to it. The included Express server does not serve `dist/`, and Vite's local proxy does not become part of the generated static files.

GitHub can host the source repository. GitHub Pages alone serves static files and cannot run this Express API, so the complete app needs additional backend hosting. The current in-memory API is intended for demonstration and resets whenever its process restarts.

## Manual verification

| Check | Expected result |
| --- | --- |
| Submit whitespace or fewer than 3 trimmed characters | Inline validation appears; no post is created |
| Submit more than 2,000 trimmed characters | The draft remains and a length error appears |
| Publish a valid post | The new post appears, the draft clears, and feed filters reset |
| Like, unlike, and delete a post | The card or list changes after a successful API response |
| Combine search, category, and Liked only | All selected conditions apply together |
| Combine opportunity search, type, work mode, and Saved only | Only matching roles remain; no matches produces an empty state |
| Open role A, then B, then C without closing the current details first | Back returns to B, then A |
| Save and unsave a role | Its star and Saved only membership update together |
| Apply to a role | Applied becomes disabled; refreshing retains the application while the API runs |
| Trigger several notifications, then dismiss them | Messages appear in the order they were queued |
| Refresh after saving a role | Saved state clears, while server-backed mutations remain |
| Restart the API and refresh | Posts and opportunities return to seed data |
| Test desktop and phone widths | Desktop panels scroll independently; mobile content follows normal page flow |

For failure cases, use browser DevTools to block `/api/posts` or `/api/opportunities`, then reload. The affected panel should show an error. Remove the block and select **Retry** to recover. Block mutation requests to confirm that failed publishing preserves the draft and failed card actions preserve the current data. Network throttling helps verify pending labels and disabled controls.

## Troubleshooting

| Symptom | What to check |
| --- | --- |
| `npm` reports that `package.json` is missing | Open the terminal in the app directory; in the original layout this is `starter/` |
| The page loads but both lists fail | Check that Express is running on port 3001; `npm run dev` starts both services |
| The API reports `EADDRINUSE` | Another process is using port 3001; stop the conflicting process or coordinate changes to the API port and Vite proxy |
| Vite starts on a different port | Open the URL Vite actually prints instead of assuming port 5173 |
| Preview fails to start or load data | Run `npm run build` first and keep `npm run dev:server` running |
| Saved roles disappear after refresh | Saved IDs are intentionally held only in React state |
| Demo changes disappear after restarting | Server mutations are intentionally held only in process memory |

## Learning notes and future improvements

One layout challenge was keeping desktop panels independently scrollable. The app limits the desktop layout to the viewport height, allows flex children to shrink with `min-height: 0`, and gives panel content `overflow-y: auto`. On mobile, the height constraint is removed so both panels return to normal page flow.

Possible next steps:

- Add automated interaction tests for request failures, history navigation, saved membership, and notification order.
- Add database persistence and authenticated accounts for posts, likes, saved roles, and applications.
- Add server-side pagination and filtering for larger datasets.
- Validate complete API response records at runtime.
- Add a production server configuration that serves the frontend and API together.
