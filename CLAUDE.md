# First Frets: notes for Claude

<!-- shared-preferences:start -->
## David's preferences (shared across all of David's apps)

This section is the same in every one of David's app repos. If David states a new general preference
(not specific to this app), add it here, in this file, and commit it. David's Mac copies it to the other repos.

**Who David is.** A guitar teacher and gigging guitarist (he/him) who builds personal and teaching apps with Claude.
Comfortable with tech but not a programmer: explain in plain words, skip jargon, keep replies short and
concrete. Likes to see things working: verify before saying "done".

**How the apps are built and hosted**
- Public web apps on GitHub Pages under the **davyrockett** GitHub account (never an Artifact or a hosted
  service). Live at `https://www.davyrockett.com/<repo>/` (since 2026-10-18; old
  `davyrockett.github.io` links redirect there). The website itself is the `davyrockett.github.io` repo.
- Each app: `index.html` (+ `app.js` / `styles.css` when bigger), `sw.js` service worker for offline use
  with an update banner, `manifest.webmanifest`, `icons/` drawn by `tools/make-icons.py`, a
  `Start <App>.command` for local testing on the Mac, and a README written for David.
- **`move.js`** (since 2026-10-17): every app loads `move.js` as its first script and lists it in `sw.js`
  `ASSETS`. It carries the app's settings over when the apps move from davyrockett.github.io to
  davyrockett.com (plan: `Claude Apps/move-to-davyrockett-com.md`; master copy `Claude Apps/tools/move.js`).
  Keep it; a new app gets a copy with `data-keep` set to its own localStorage key prefix.
- **`suite.js`** (since 2026-10-18): every app also loads `<script src="suite.js" defer></script>` (in `ASSETS` too).
  It shows an "All apps" button when the app was opened from David's app suite (www.davyrockett.com/apps, one Home
  Screen icon for everything; master copy `Claude Apps/tools/suite.js`). New apps get it too. If a new app syncs,
  add it to `SYNCED` in the website's `apps/launcher.js` so the suite's one access key reaches it.
- **`share.js`** (since 2026-10-19): Settings in every app has a **Share** section (the app's link, "Copy link",
  and "Share…" where the device can). Load `<script src="share.js" defer></script>` (in `ASSETS` too) and add a
  `data-share` block using the app's own classes (see `Claude Apps/tools/share.js`). First Frets has its own
  share section with a QR code instead.
- **Every change must bump the version** (`tools/bump.sh` where it exists, otherwise `VERSION` in `sw.js`
  and the matching app version). Without it, installed copies on phones never update.
- Settings (gear icon) always has **Appearance: Light / Dark / Auto** and **Check for updates**.
  Apps open in **Light** unless changed in Settings.
- Design follows David's First Frets app: warm off-white / dark-brown palette, bright orange accent (#F57C14; dark mode #FF9433; David tried his logo orange #E27039, too red) and
  davyrockett grey secondary text (#676767; dark mode #A3A3A3),
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
- Nothing should jump around: when a control doesn't apply, grey it out in place rather than hiding it, and
  reserve space for things that appear, so other controls never shift.
- **Pop-ups close with a tap outside** (David, 2026-10-31): any settings sheet or pop-up closes when you tap or
  click outside it, and still keeps its own Close / Done button. Forms with typing ask "Discard your changes?" first.
- **No AI voices, ever:** no text-to-speech or synthesised singing in any app. Use written instructions on
  screen, and instrument or synth sounds for audio.
- Commit messages: a short, plain description of the change.
- When renaming or moving an app, keep the old address working with a redirect repo.

**New apps:** create the repo under davyrockett and turn on GitHub Pages; David's Mac downloads new
davyrockett repos into `~/Dropbox/Local/Claude Apps/` automatically. Give each new app its own CLAUDE.md
with this section (copy it from any other app) plus an "## This app" section.
Also add every new app to David's unlinked app list, **www.davyrockett.com/apps** (`apps/index.html` in the
website repo, `Claude Apps/website`): icon, name and one-line description, in the right group.
<!-- shared-preferences:end -->

## This app
- Tuner (pop-up from the header): the same tuner as Page Fright (McLeod pitch detection, mic filtered to the guitar's
  range, adaptive level gate, steady median readings, Play pitch drone). It listens as soon as it opens, on Auto; no
  Start button. Keep the two apps' tuner code in step; Page Fright's CLAUDE.md has the details. Since v45 the pitch
  reader is a top-level `pitchDetect(x,sr,floor)` (same code, moved out of `Tuner` so `Listener` can share it).

David's interactive guitar method for absolute beginners: an app version of his method book, used by his
students. Live: https://www.davyrockett.com/first-frets/ (`#s3` etc. link to a section). See README.md.

- **Publish:** run `tools/bump.sh` (bumps `sw.js` VERSION and `window.APP_VERSION` in index.html), commit, push,
  confirm the live `sw.js` shows the new version. New files must be added to `ASSETS` in `sw.js`.
- **Test locally:** `python3 -m http.server 8766` here, open http://localhost:8766/ (clear the service worker
  and caches before re-checking).
- `index.html` is the whole app: lessons, fretboard and chord diagrams, Karplus-Strong plucked-string sounds,
  tuner, chord chart pop-up, Settings (appearance, fretboard dot labels, playback speed, volume, text size,
  share link + QR code for students, check for updates). localStorage keys start with `bg.`.
- **Tab first, chords later (David, 2026-11-02):** a student found Chord Diagrams came too soon, so v45 added tab-only
  sections before it: Same String, Both Hands (7), Tab Practice (9), One Finger per Fret (11), Melodies (12),
  Riffs (13), Two Notes at Once (14). Chord Diagrams and Em and Am Songs are now 15–16.
- **Lap first (David, 2026-11-10, v48):** students struggled to match tab to the guitar from their own view (looking
  down, the thickest string looks like it's on top; tab has the thinnest on top). So sections 2–6 have the guitar flat
  on the lap, face up, neck left, which looks exactly like tab, pressing with the left pointer finger. Order: Parts of
  the Guitar (Words We Use merged in) · Right Hand Basics · Tuning · **Which String?** (new: open-string tab only,
  `LapView`, `SONGS.open`, Nothing Else Matters intro) · The Guitar's Map · Reading Tab · **Pick It Up** (old Holding
  the Guitar + left-hand shape moved from the Map + `LapView({toggle:true})` flip + "Lost? Lap check") · Same String,
  Both Hands · Tab Practice · then as before. The address is "which string, which fret, then pluck that same string".
  "String 6 is always nearest you" works in both positions. `NoteCheck(targets,{lap:true})` / `judgeNote(…,lap)` say
  "toward you / away from you" instead of "toward your face / the floor". Old saved section names map through
  `RENAMED`. `#sN` links shifted with the new order.
  Which String? shows the strings over the soundhole, never the neck (David, 2026-11-10): `Soundhole()` has
  Fretboard's API, and `hole:true` on Fretboard / Player / TabQuiz / NoteCheck / LapView switches to it. String numbers sit on the right in soundhole pictures. David may film short POV / overhead clips for these sections later.
- **No progress ticks (David, 2026-11-02):** no section checkmarks, progress bar or "Reset progress". The open
  section is saved by name (`bg.sec`); old saved numbers map through `OLD_ORDER`.
- **Plucking the fretted string:** Same String, Both Hands teaches it (FollowString picture, the lift test) and
  `NoteCheck` listens with the mic (`Listener`, `judgeNote`): it names the string it heard and which way to move
  the thumb ("toward the floor/your face"). The same note an octave off counts as right, because the pitch reader
  can slip an octave. Tab Practice's drill has the same "Play on my guitar" mode. The mic ignores the app's own
  sounds (`SOUND_UNTIL`).
- **Note lengths (David, 2026-11-02):** in players, a note lasts as long as it's written (a finger lifting);
  `ring:true` players (arpeggios with fingers held down) let each note ring until its string is played again;
  chords last until the next chord; the last note rings out; Stop silences everything (`hush`). `count` adds
  count-in clicks; `finger:true` names the finger (one finger per fret).
- **Reference + Metronome (David, 2026-11-06, v47):** the header is Tuner · Metronome · Reference · ⚙. Both live in
  `reference.js` (loaded after the main script; uses its helpers). Reference tabs: Chords (the old chord chart plus
  7ths, more minors, sus/add9/maj7), Barre (E/A shapes, major/minor/7/m7/power, same shapes as Raise the Barre),
  Scales (minor/major pentatonic, 5 boxes + whole neck, any key), Strumming (7 patterns, chord, speed, click),
  Neck (every note, find a note), Capo (shape → sounds as, and which capo for a song's key), Keys (I ii iii IV V vi in
  G C D A E + famous progressions). Each tab has a link: `#scales`, `#metronome` etc. (`START_HASH` is read before
  `go()` replaces the hash). `Chord()` takes `base` (top fret, shows "5fr") and `roots` (orange ring).
- Students are absolute beginners: keep wording simple and friendly.
- Parts of the Guitar and Right Hand Basics use a guitar line drawing David supplied (v21, `img/guitar-lines.png`, used as an SVG mask so the
  lines follow light/dark mode; part outlines are in its 784 × 1168 pixel space). The neck close-up photo is
  CC BY-SA (credit in README); keep that credit.
- The first version is tagged `v1-original`. The old address www.davyrockett.com/beginner-guitar/ forwards
  here (repo davyrockett/beginner-guitar).
