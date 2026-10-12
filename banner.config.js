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
  "frame": "0.4286",
  "fit": "cover"
};

window.BANNER_VIDEOS = [
];
// --- END banner settings ---

// Narrow screens (under 640px wide) use fewer columns and a taller frame so the name stays readable.
window.BANNER_MOBILE = { colsMobile: 80, frameMobile: "0.75" };
