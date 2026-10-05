# Beginner Guitar

An interactive version of the beginner guitar method book. It runs as an app on
iPhone and iPad Home Screens and the Mac's Dock, and works with no signal once installed.

## What's in here

| File | What it does |
|---|---|
| `index.html` | The whole app: lessons, diagrams, sounds, photos |
| `sw.js` | The "service worker": saves the app on the device so it works offline |
| `manifest.webmanifest` | Tells the device the app's name, icon, and to open full-screen |
| `icons/` | App icons (redraw with `python3 tools/make-icons.py`) |
| `Start Guitar App.command` | Double-click to run a local test copy on this Mac |

## Installing it

- **iPhone / iPad:** open the live app in Safari → Share → **Add to Home Screen**.
- **Mac:** open the live app in Safari → **File → Add to Dock**.

## Publishing a change

1. Edit the files.
2. **In `sw.js`, bump `VERSION`** (v1 → v2 …). Without this, devices keep the old copy.
3. Commit and push (`git add -A && git commit -m "…" && git push`).
4. GitHub Pages updates within a minute or two. Open the app and an
   **Update** banner appears. Tap it.

## Backups

- Every saved version is in git history. The first version is tagged `v1-original`:
  `git checkout v1-original -- index.html` brings it back.
- A plain copy of the first version is also in `../backups/`. It opens in any browser.
