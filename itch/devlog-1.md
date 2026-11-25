# Devlog 1: from a flat crane to three lanes

I wanted to know one thing first: is a crane on a swinging cable fun to drive? So the first version was the smallest thing that could answer that. Flat, 2D, a trolley, a cable, a magnet, a pile of junk, a container.

It worked, and it also felt flat in a literal way. Pieces behind other pieces made no sense, and a magnet that grabs whatever is under it is not much of a skill. So I moved to Three.js with a three-quarter view and added depth.

## Three lanes

Objects live on three lanes (z = -70, 0, 70). The trolley moves between them with Q and E. The magnet only holds a piece if you are aligned in depth. My first tests showed that this reads as a bug unless the game tells you. So there is a blue ring on the ground under the magnet and the piece it would grab lights up.

## Own physics

No engine. Circles and boxes, sub-stepped, the cable as a chain of constraints, and a magnet with a grip limit per object. A heavy block slips where a ball holds. Wind pushes the load and the cable, and the swing is what makes carrying hard.

## A bug I am glad I found

In the first hosted preview, releasing the magnet sometimes broke the game state. The cause was a pointer-up event arriving with no valid position and turning a coordinate into NaN. Fixed by ignoring pointer-up with no position. Keyboard play was never affected, but the preview ran on mouse and touch too.

## How I test

Some checks use fixtures: I place a piece, force the magnet, and measure. Those prove the rules. Others press real keys through a full cycle (align, lower, grab, carry, drop) and read the score. I keep the two kinds apart, because a fixture passing says nothing about how the game feels.

## Where it stands

The core loop works: align, lower, grab, carry, drop. Whether it stays fun over a long session is unproven. Not tested: long play, sound by ear, frame rate on a real GPU. Hints are in Spanish only for now.

## Next

Levels, a reason to carry the heavy block, English hints, and maybe a short trailer.
