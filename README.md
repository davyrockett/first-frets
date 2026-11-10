# First Frets

An interactive version of the beginner guitar method book, published as **First Frets**.

**Live app:** https://www.davyrockett.com/first-frets/ It runs as an app on
iPhone and iPad Home Screens and the Mac's Dock, and works with no signal once installed.

## What's in here

| File | What it does |
|---|---|
| `index.html` | The whole app: lessons, diagrams, sounds, photos |
| `reference.js` | The **Reference** pop-up (chord chart, barre chords, scales, strumming, notes on the neck, capo, chords in a key) and the **Metronome** |
| `sw.js` | The "service worker": saves the app on the device so it works offline |
| `manifest.webmanifest` | Tells the device the app's name, icon, and to open full-screen |
| `icons/` | App icons (redraw with `python3 tools/make-icons.py`) |
| `img/neck.webp` | Neck close-up in The Guitar's Map, cut from the same Martin D-28 photo (same credit and license as below) |
| `img/guitar-lines.png` | Guitar line drawing in Parts of the Guitar and Right Hand Basics, supplied by David (white lines on black, used as a mask so the lines follow light/dark mode). |
| `img/lap-player.png` | Drawing of a player with the guitar on their lap (Right Hand Basics), supplied by David. Stored as white lines on black and used as a mask, like the guitar drawing. |
| `Start First Frets.command` | Double-click to run a local test copy on this Mac |

## Links straight to a reference page

Send a student any of these to open the app on that page:
`#chords` · `#barre` · `#scales` · `#strumming` · `#neck` · `#capo` · `#keys` · `#metronome`
(for example https://www.davyrockett.com/first-frets/#scales).

## Installing it

- **iPhone / iPad:** open the live app in Safari → Share → **Add to Home Screen**.
- **Mac:** open the live app in Safari → **File → Add to Dock**.

## Publishing a change

1. Edit the files.
2. **Run `tools/bump.sh`** to bump the version (it updates `sw.js` and the version shown in Settings). Without this, devices keep the old copy.
3. Commit and push (`git add -A && git commit -m "…" && git push`).
4. GitHub Pages updates within a minute or two. Devices update by themselves the next time the app is opened
   (or show an **Update** banner if it's already open). Settings → **Check for updates** forces it.

## Backups

- Every saved version is in git history. The first version is tagged `v1-original`:
  `git checkout v1-original -- index.html` brings it back.
- A plain copy of the first version is also in `../backups/`. It opens in any browser.
