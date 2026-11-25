# Status: Crane in the Storm

Last updated: 2026-11-25. Prototype, not a finished game. No release change in this update.

## What exists
- Playable 3D crane prototype (three.js), 2D version in `2d/`.
- Public: itch.io page, GitHub Pages build, this repo. Code is MIT, cover and screenshots are CC BY-NC-SA 4.0.

## Open defect: canvas goes black on page scroll (not fixed)
- Seen earlier in the game hosted as a File inside an auto-sized cross-origin iframe, in a remote browser. Page scrolling blacked out the lower part of the canvas, and it recovered on scrolling back up.
- Checked: the WebGL drawing buffer was correct (ground colour, not black), so the game rendered fine and the black was in compositing or capture.
- Did NOT reproduce, in that same remote browser: a plain WebGL canvas with spacers; the same canvas in a rounded `overflow:hidden` wrapper; it inside an iframe; the real game inside a 968x1309 cross-origin iframe served from GitHub Pages (scroll 0, 300, 576); the itch.io embed (several scroll passes). GitHub Pages standalone has no scroll.
- Not established: a cause. The remaining difference is the old hosting page and the device where it was seen. Absence of reproduction is not proof the defect cannot happen elsewhere.
- Retake signal: a report of where (itch, Pages, hosted File), device, browser and window size where the black appears. Nothing else is planned until then.

## Input testing (real browser input, not synthetic events)
- Verified: pointer drag moves trolley and cable, a short tap toggles the magnet, a full grab, carry and release into the container gives HUD "Contenedor: 1", R restarts to 0 (on Pages and in the itch embed).
- Space: a real Space key press changed the magnet field state (on to off) on Pages. One observation.
- Not verified: Q and E. They are held keys (input applies while held); the test tool can only tap, which moves the trolley too little to see. Arrow keys sent through the test tool reached the page, not the game frame, so they are not evidence either.
- Fun, audio and performance have not been tested by a human.

## Notes for whoever resumes
- Pointer drag is hold-style: moving more than 25 px from the press point holds a direction until release, so the distance dragged does not map to trolley distance. That made the embedded cycle imprecise.
- The commit history is noisy (many small web commits). The final state is correct; history was not rewritten.

## Beta: proportional pointer control (experiment, not released)
- Path: `beta/index.html` (Pages: /beta/). The only code change is in `src/main_stage2.js`: pointer drag is analog (12 px dead zone, full speed near 82 px) instead of a 25 px hold-direction.
- Real-input QA (2026-11-25): a full cycle worked on the beta: lower cable, tap to grab, lift, carry, tap to release, HUD "Contenedor: 1".
- Limits: needed several drags to line up with a specific piece (wind and pendulum add drift); short fast drags barely move because movement depends on how long the drag is held; the magnet picked the nearest piece, not the one aimed at. Q/E, touch devices, fun and performance not tested.
- Decision: NOT promoted. No clear advantage over the hold-style control was shown. The release (root index.html, Pages root, itch zip) is unchanged. The beta stays as an experiment. No further control work planned without a new reason.
- The scroll-black defect above stays open and is unrelated to this beta.
