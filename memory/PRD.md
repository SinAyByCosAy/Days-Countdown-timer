# Remaining Days — Product Requirements

## Original problem statement
> A "Remaining Days countdown timer" Chrome extension like "Mortality-death clock" for my new chrome tab background. I should be able to input a date and I should tell me the remaining days and keep tracking and updating the counter daily(based on the day it was set), percentage of time passed and good graphics. It should not require any more inputs. I should be able to change the date easily if required.

## User personas
- **The Deadline-Driven** — has a self-imposed goal (ship day, birthday, exam, wedding) and wants an ever-present reminder.
- **The Memento-Mori Thinker** — wants a Stoic prompt on every new tab to make each day count.

## Core requirements (static)
- Manifest V3 Chrome extension that overrides `chrome://newtab`.
- Single input: a target date. All other data optional.
- Displays: days remaining, live H:M:S ticker, % time elapsed, progress bar, daily rotating quote.
- Persistent across every new tab; no re-entry needed.
- Change the date easily via a gear icon → settings modal.
- No network calls, no accounts, no tracking.

## Architecture
- **Extension** (`/app/extension/`): pure vanilla HTML/CSS/JS. Uses `chrome.storage.local`. Files: `manifest.json`, `newtab.html`, `newtab.css`, `newtab.js`, `quotes.js`, `README.md`.
- **Web preview** (`/app/frontend/`): React mirror of the extension for live preview & QA. Uses `localStorage`. Same UI, same logic, same testids.
- Shared logic captured in `/app/frontend/src/lib/countdown.js` (parseISO, formatDate, computeCountdown, dayOfYear).
- Zip bundle for one-click install: `/app/frontend/public/remaining-days-extension.zip` (served at `${REACT_APP_BACKEND_URL}/remaining-days-extension.zip`).

## What's been implemented (2026-02-16)
- MV3 extension overriding new tab
- First-run screen with target-date input
- Dashboard with hero days number, live H:M:S ticker, % time elapsed, progress bar, from-to meta
- Settings modal: target date, optional custom start date, optional custom label, Save/Reset/Close, backdrop + Escape close
- 40 curated rotating daily quotes (deterministic by day-of-year)
- Ambient background: drifting ember orbs + film grain + vignette (respects `prefers-reduced-motion`)
- Cormorant Garamond + Space Mono typography, ember (#FF6B00) accent on #050505
- Downloadable zip of the extension
- Full data-testid coverage on interactive elements
- 100% (29/29) frontend test checks passed via testing_agent_v3

## Prioritized backlog (P0 → P2)
- **P0** — ship 1st finish ✅
- **P1** — Add PNG icons (16/48/128) to the extension so the toolbar shows a branded mark
- **P1** — "Life expectancy" preset (age + expected years → auto-target) for the classic mortality-clock use case
- **P2** — Multiple parallel countdowns (tabs/switcher inside settings)
- **P2** — Weekly / monthly / yearly progress views alongside days
- **P2** — Export/import settings JSON
- **P2** — Optional milestone markers on the progress bar
- **P2** — Custom accent color picker

## Next tasks
1. Ship packaged `.crx` build (unlisted) via Chrome Web Store or offer signed download
2. Add PNG icon set
3. Life-expectancy preset flow
