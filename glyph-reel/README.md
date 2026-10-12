# Glyph Reel

Turn video into live ASCII art in the browser. Load a few clips, stamp text into the grid in colors that contrast with whatever moves behind it, and export the result as a video.

Everything runs locally in your browser. Videos are never uploaded anywhere.

## Run it

It's one file with no build step.

- **Locally:** open `index.html` in Chrome, Edge or Safari.
- **GitHub Pages:** push this repo, then go to Settings > Pages and serve from the `main` branch root.

## Features

- **Live ASCII conversion** with adjustable columns, character ramps (classic, detailed, blocks, dots, binary or your own), contrast, brightness, invert and edge boost
- **Color modes:** mono, source color, or a tinted gradient
- **Locked frame shape** (16:9, 21:9, 4:3, 1:1, 4:5, 9:16) so resolution stays fixed across clips, with fill or letterbox fit
- **Text overlay** rendered into the grid, colored to contrast with the video underneath (invert, complementary hue or a fixed color), as solid knockout blocks or colored glyphs
- **Reveal modes:** text lights up only over bright areas, dark areas or motion, with an adjustable fade-out trail
- **Clip rotation:** add multiple videos and they play in random order, switching at the end of each clip or on a timer, with optional random start points
- **Export:** mark in and out points and export that section, or record live (rotation cuts included) at 720p, 1080p or 4K, 24/30/60 fps

## Keyboard

| Key | Action |
| --- | --- |
| Space | Play / pause |
| I | Set in point |
| O | Set out point |

## Notes

- Exports record in real time. Keep the tab visible while recording, or the browser throttles rendering.
- Output is MP4 where the browser can record it (recent Chrome, Edge and Safari) and WebM otherwise. Exports are silent.
- Playback depends on what your browser can decode. MP4 (H.264) is the safest input.
