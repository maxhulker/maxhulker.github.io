# Max Hulker: personal site

A static site with no build step. The banner is drawn live in the browser by the same ASCII renderer as Glyph Reel.

## Files

| Path | What it is |
| --- | --- |
| `index.html` | The page: banner, intro, work, tools, contact |
| `banner.config.js` | Banner look, banner videos and mobile settings |
| `assets/glyph-banner.js` | The live ASCII renderer used by the banner |
| `assets/site.css` | Site styles (light and dark) |
| `glyph-reel/` | Glyph Reel itself, served at `/glyph-reel/` |

## Preview locally

Run a local server from this folder, then open http://localhost:8000:

```
python -m http.server 8000
```

Opening `index.html` directly works for the built-in scene, but browsers block reading pixels from local video files over `file://`, so banner videos only show up through a server (or once the site is online).

## Change the banner

Each banner clip has its own look, tuned in Glyph Reel.

1. Copy your clips into `assets/banner/`. Keep them small (720p H.264 MP4, a few MB each); the banner only needs about 140 columns of detail.
2. With the local server running, open http://localhost:8000/glyph-reel/. It loads the banner's current settings automatically.
3. Add the same clips from `assets/banner/`. Tick **Stay on this clip** so the rotation doesn't move on while you work.
4. Click a clip and tune it. Settings labelled in blue (contrast, brightness, character ramp, color, invert, edge boost, fit, text color, text position, sensitivity) are saved per clip. Everything else, including your name text, is shared by all clips.
5. Press **Copy settings for site** and paste over everything between the START and END lines in `banner.config.js`.

Clips saved in the config that you didn't load in Glyph Reel stay in the banner. To remove a clip from the banner, delete its line in `BANNER_VIDEOS`. If you rename a file, re-tune it or update its `src`.

The banner pauses when scrolled out of view, has a Pause button, and shows a still frame for visitors who have reduced motion turned on.

## Publish on GitHub Pages

Push this folder to a repository, then go to Settings > Pages and serve from the `main` branch root.
