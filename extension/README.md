# Remaining Days — Mortality Clock (New Tab Chrome Extension)

A cinematic countdown that lives in every new tab you open. Set a target date once — this extension quietly tracks every day, hour, minute and second remaining, along with the percentage of time that has already passed.

## Install (Load Unpacked)

1. Open **Chrome** and go to `chrome://extensions`
2. Toggle **Developer mode** (top right) **ON**
3. Click **Load unpacked**
4. Select this folder (`/app/extension`)
5. Open a new tab. Set your date. Done.

To update the code, just click the "Reload" icon on the extension card.

## Features

- **Days remaining** in a massive typographic hero number
- **Live H:M:S ticker** to the end of the target day
- **% of time elapsed** with a glowing progress bar
- **Custom start date** (optional) — otherwise measures from the day you set the target
- **Custom label** (optional) — "My 30th", "Ship day", etc.
- **Rotating daily quotes** — one meditative quote per day, drawn from a curated list
- **Ambient background** — drifting ember orbs + film grain vignette
- **Persistent** across every new tab via `chrome.storage.local`
- **Fully offline** — no network requests, no tracking, no external APIs

## Change your dates

Click the gear icon in the top-right corner of any new tab. You can:
- Change the target date
- Add or remove an optional custom start date
- Add a custom label
- Reset everything and start over

## Files

| File | Purpose |
| --- | --- |
| `manifest.json` | Chrome MV3 manifest (overrides `chrome://newtab`) |
| `newtab.html` | Full-screen new-tab UI |
| `newtab.css` | Styles (Cormorant Garamond + Space Mono, ember accents) |
| `newtab.js` | Countdown logic + storage adapter |
| `quotes.js` | 40 curated quotes on time & mortality |
| `icons/` | Extension icons (16 / 48 / 128) |

## Privacy

Zero data leaves your browser. Everything is stored locally.
