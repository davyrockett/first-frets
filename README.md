# First Frets

An interactive version of the beginner guitar method book, published as **First Frets**.

**Live app:** https://davyrockett.github.io/first-frets/ It runs as an app on
iPhone and iPad Home Screens and the Mac's Dock, and works with no signal once installed.

## What's in here

| File | What it does |
|---|---|
| `index.html` | The whole app: lessons, diagrams, sounds, photos |
| `sw.js` | The "service worker": saves the app on the device so it works offline |
| `manifest.webmanifest` | Tells the device the app's name, icon, and to open full-screen |
| `icons/` | App icons (redraw with `python3 tools/make-icons.py`) |
| `img/neck.webp` | Neck close-up in Section 6, cut from the same Martin D-28 photo (same credit and license as below) |
| `img/guitar.webp` | Guitar photo in Sections 1 and 4 (background removed): Martin D-28 by Niranjan Arminius, [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Martin_D-28_Acoustic_Guitar.jpg), [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). The edited photo is shared under the same license. |
| `Start First Frets.command` | Double-click to run a local test copy on this Mac |

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
