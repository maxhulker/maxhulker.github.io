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

### From the live site (no git needed)

Open **maxhulker.com/glyph-reel/?edit**. The site editor loads the banner's clips and settings straight from GitHub. Add clips, remove them (×), tune each one, then press **Publish to site**. It uploads new clips to `assets/banner/`, deletes clips you removed, and rewrites the settings block in `banner.config.js`, all in one commit. The live site updates a minute or two later.

The editor only shows up at `?edit`, and publishing only works with a GitHub token saved in your browser. Visitors can still use Glyph Reel on their own videos, but they can't change the site.

**One-time setup: make a token**

1. On GitHub, go to Settings > Developer settings > Personal access tokens > Fine-grained tokens > Generate new token (or open https://github.com/settings/personal-access-tokens/new).
2. Pick an expiration. 7 or 30 days is a good default: when it expires, publishing simply stops working until you make a new one.
3. Under **Repository access**, choose **Only select repositories** and pick `maxhulker.github.io`.
4. Under **Permissions > Repository permissions**, set **Contents** to **Read and write**. Leave everything else alone.
5. Generate it, copy it, and paste it into the editor's token box. It's saved in that browser only.

**Turning editing off.** Clips you publish stay up no matter what happens to the token. To make sure nobody can edit, even from your own browser, delete the token at https://github.com/settings/personal-access-tokens. **Forget token** in the editor only removes it from that one browser.

The editor reads and writes the repo and branch named in `window.BANNER_REPO` at the bottom of `banner.config.js`.

### By hand

1. Copy your clips into `assets/banner/`. Keep them small (720p H.264 MP4, a few MB each); the banner only needs about 140 columns of detail.
2. With the local server running, open http://localhost:8000/glyph-reel/. It loads the banner's current settings automatically.
3. Add the same clips from `assets/banner/`. Tick **Stay on this clip** so the rotation doesn't move on while you work.
4. Click a clip and tune it. Settings labelled in blue (contrast, brightness, character ramp, color, invert, edge boost, fit, text color, text position, sensitivity) are saved per clip. Everything else, including your name text, is shared by all clips.
5. Press **Copy settings for site** and paste over everything between the START and END lines in `banner.config.js`.

Clips saved in the config that you didn't load in Glyph Reel stay in the banner. To remove a clip from the banner, delete its line in `BANNER_VIDEOS`. If you rename a file, re-tune it or update its `src`.

The banner pauses when scrolled out of view, has a Pause button, and shows a still frame for visitors who have reduced motion turned on.

## Publish on GitHub Pages

Push this folder to a repository, then go to Settings > Pages and serve from the `main` branch root.
