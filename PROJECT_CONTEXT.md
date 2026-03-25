# Project Context: IPL XI Builder

## Overview
The IPL XI Builder is a standalone, client-side web application built with Vanilla HTML, CSS, and JS. It originally began as an API-reliant prototype but was completely re-engineered into an offline application to ensure pure reliability, zero quota exhaustion, and lightning-fast state interactions.

## Architecture

**1. `index.html`**
- Uses a unified Flex/Grid architecture to structure the `navbar` and `workspace`.
- Features an `available-players` squad viewer (left) and `playing-xi` pitch (right).
- Accommodates dynamically generated Split Screen panels specifically designed for the Compare Feature.

**2. `style.css`**
- Heavy usage of CSS variables for theming (ex: `--team-theme`).
- Responsive Grid mapping changes from a generic `350px 1fr` setup to `280px 1fr 1fr` when Compare Mode is toggled to gracefully fit both pitches.

**3. `data.js`**
- The entire engine driving the app.
- Contains a massive array of 10 heavily structured JSON objects, one for each IPL franchise.
- Each franchise contains an array of `players` mapping exactly `id`, `name`, `role`, `isOverseas`, and `isCaptain`.

**4. `app.js`**
- **State Management**: `currentTeam` holds the active franchise. `squad` holds unfiltered pool. `playingXI` holds the active pitch players.
- **Role Grouping**: `renderSquad()` filters out selected players and parses the remainder into 'Batters', 'All-Rounders', 'Wicketkeepers', and 'Bowlers' DOM trees dynamically.
- **Drag & Drop API**: Built organically using `dragStart`, `allowDrop`, and `drop`. Maps uniquely generated `dataset.id` values directly to specific items in the `playingXI` array.
- **Compare Mode Lifecycle**: On click, clones the active `playingXI` and maps it via `renderCompareXI()` into newly painted, isolated DOM elements completely cut off from draggable listeners, freezing them permanently in state.
- **Local Storage API**: Saves raw array indexes formatting via `JSON.stringify(playerIds)` uniquely mapped to keys like `savedXI_csk` so that users never override multiple franchises accidentally.
