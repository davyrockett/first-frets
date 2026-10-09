# First Frets: notes for Claude

<!-- shared-preferences:start -->
## David's preferences (shared across all of David's apps)

This section is the same in every one of David's app repos. If David states a new general preference
(not specific to this app), add it here, in this file, and commit it. David's Mac copies it to the other repos.

**Who David is.** A guitar teacher and gigging guitarist who builds personal and teaching apps with Claude.
Comfortable with tech but not a programmer: explain in plain words, skip jargon, keep replies short and
concrete. Likes to see things working: verify before saying "done".

**How the apps are built and hosted**
- Public web apps on GitHub Pages under the **davyrockett** GitHub account (never an Artifact or a hosted
  service). Live at `https://davyrockett.github.io/<repo>/`.
- Each app: `index.html` (+ `app.js` / `styles.css` when bigger), `sw.js` service worker for offline use
  with an update banner, `manifest.webmanifest`, `icons/` drawn by `tools/make-icons.py`, a
  `Start <App>.command` for local testing on the Mac, and a README written for David.
- **Every change must bump the version** (`tools/bump.sh` where it exists, otherwise `VERSION` in `sw.js`
  and the matching app version). Without it, installed copies on phones never update.
- Settings (gear icon) always has **Appearance: Light / Dark / Auto** and **Check for updates**.
  Apps open in **Light** unless changed in Settings.
- Design follows David's First Frets app: warm off-white / dark-brown palette, orange accent,
  Big Shoulders Display headings, Atkinson Hyperlegible body text, works well on a phone.
- Data lives on the device (localStorage / IndexedDB). Apps whose data must sync between phone and Mac
  use a separate `davyrockett/<app>-data` repo (`data.json`) and an access key pasted into Settings.
  Never commit keys, tokens or anything in `private/`.
- **Publish when done:** commit, push to `main`, and confirm the live site shows the new version.
  End with a brief summary of what changed. David's Mac pulls GitHub changes into its Dropbox copy
  automatically, so pushing is all that's needed.

**Taste**
- Labels and descriptions plain and descriptive. Jokes belong in names (e.g. "Page Fright"), not taglines.
- Keep screens uncluttered: show extra controls only when they're relevant.
- When renaming or moving an app, keep the old address working with a redirect repo.
<!-- shared-preferences:end -->

## This app

David's interactive guitar method for absolute beginners: an app version of his method book, used by his
students. Live: https://davyrockett.github.io/first-frets/ (`#s3` etc. link to a section). See README.md.

- **Publish:** run `tools/bump.sh` (bumps `sw.js` VERSION and `window.APP_VERSION` in index.html), commit, push,
  confirm the live `sw.js` shows the new version. New files must be added to `ASSETS` in `sw.js`.
- **Test locally:** `python3 -m http.server 8766` here, open http://localhost:8766/ (clear the service worker
  and caches before re-checking).
- `index.html` is the whole app: lessons, fretboard and chord diagrams, Karplus-Strong plucked-string sounds,
  tuner, chord chart pop-up, Settings (appearance, fretboard dot labels, playback speed, volume, text size,
  reset progress, share link + QR code for students, check for updates). localStorage keys start with `bg.`.
- Students are absolute beginners: keep wording simple and friendly.
- The guitar photos are CC BY-SA (credits in README); keep the credits.
- The first version is tagged `v1-original`. The old address davyrockett.github.io/beginner-guitar/ forwards
  here (repo davyrockett/beginner-guitar).
