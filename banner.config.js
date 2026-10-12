// Banner settings. To change them: open Glyph Reel next to the site (http://localhost:8000/glyph-reel/),
// add your banner clips, tune each one, press "Copy settings for site", and paste over everything
// between the START and END lines below.
//
// BANNER_SETTINGS is the shared look (and the look of the built-in scene when there are no videos).
// Each entry in BANNER_VIDEOS is a file in assets/banner/ plus any settings that clip changes.

// --- START banner settings ---
window.BANNER_SETTINGS = {
  "msg": "MAX\nHULKER",
  "msgSize": 62,
  "color": "full",
  "msgColor": "accent",
  "msgAccent": "#f4efe6",
  "msgStyle": "block",
  "reveal": "bright",
  "revealT": 70,
  "trail": 1.5,
  "frame": "0.4286",
  "fit": "cover"
};

window.BANNER_VIDEOS = [
];
// --- END banner settings ---

// Page layout. These override whatever Glyph Reel copies above.
// frame "fill" makes the banner fill the browser window, whatever its shape. Use a ratio like "0.5625" (16:9) for a fixed shape.
// Narrow screens (under 640px wide) use fewer columns so the name stays readable.
// revealSpread: when the name only shows over bright areas or movement, also light it up this many characters around each spot.
window.BANNER_PAGE = { frame: "fill", colsMobile: 80, revealSpread: 0 };
