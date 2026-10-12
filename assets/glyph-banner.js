// Live ASCII banner. The renderer from Glyph Reel (glyph-reel/index.html) without the editing UI.
// Setting names match Glyph Reel's, so its "Copy settings for site" output can be used as-is,
// including per-clip settings on each video entry.
(() => {
  const DEFAULTS = {
    cols: 140, ramp: ' .:-=+*#%@', contrast: 1.2, bright: 0, color: 'mono', invert: false, edges: false,
    msg: 'GLYPH\nREEL', msgOn: true, msgPulse: false, msgSize: 55, msgY: 50, msgColor: 'invert', msgAccent: '#ff3d7f',
    msgStyle: 'block', msgFill: 'video', msgWeight: '700', reveal: 'always', revealT: 50, trail: 0.8,
    frame: '0.4286', fit: 'cover',
    // site-only options
    colsMobile: 80, frameMobile: null, videos: [],
    ink: '#e6edf5', bg: '#05070a',
    monoFont: '"JetBrains Mono", ui-monospace, Menlo, Consolas, monospace',
    displayFont: '"Familjen Grotesk", "Helvetica Neue", Arial, sans-serif',
  };

  function hexRgb(hex) {
    let h = String(hex).trim().replace('#', '');
    if (h.length === 3) h = [...h].map(c => c + c).join('');
    const n = parseInt(h.slice(0, 6), 16);
    return Number.isNaN(n) ? [0, 0, 0] : [n >> 16 & 255, n >> 8 & 255, n & 255];
  }
  const hexLum = hex => { const [r, g, b] = hexRgb(hex); return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255; };
  const invertHex = hex => '#' + hexRgb(hex).map(v => (255 - v).toString(16).padStart(2, '0')).join('');

  function mount(canvas, opts = {}) {
    const base = { ...DEFAULTS, ...opts };
    const s = { ...base };
    const narrow = matchMedia('(max-width: 640px)');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    const octx = canvas.getContext('2d');
    const sample = document.createElement('canvas'), sctx = sample.getContext('2d', { willReadFrequently: true });
    const maskC = document.createElement('canvas'), mctx = maskC.getContext('2d', { willReadFrequently: true });
    const demo = document.createElement('canvas'); demo.width = 640; demo.height = 360;
    const dctx = demo.getContext('2d');
    const vid = document.createElement('video');
    vid.muted = true; vid.playsInline = true; vid.setAttribute('playsinline', ''); vid.preload = 'auto';

    const cell = { w: 8, h: 13, font: 13 };
    const videos = [...(s.videos || [])];
    let source = 'demo', current = -1;
    let playing = !reduce.matches, visible = true, dirty = true;
    let demoT = reduce.matches ? 3 : 0, lastTs = 0, lastRenderT = performance.now();
    let prevLum = null, presence = null, pendingLook = null;
    const listeners = new Set();
    // A video entry is either a path or { src, ...settings for that clip }.
    const srcOf = v => (typeof v === 'string' ? v : v.src);
    const lookOf = v => (typeof v === 'string' ? {} : v);

    // ---------- theme ----------
    // The banner takes its colors from the page (--stage, --stage-ink) so it blends in. Dark parts of the video stay
    // empty in both themes, which keeps the banner's edges invisible; on a light page the glyphs are drawn darker instead.
    let light = false;
    const srcColor = p => light
      ? `rgb(${px[p] * 0.55 | 0},${px[p + 1] * 0.55 | 0},${px[p + 2] * 0.55 | 0})`
      : `rgb(${px[p]},${px[p + 1]},${px[p + 2]})`;
    let px = null;
    function readTheme() {
      const cs = getComputedStyle(canvas);
      const bg = cs.getPropertyValue('--stage').trim(), ink = cs.getPropertyValue('--stage-ink').trim();
      if (bg) base.bg = bg;
      if (ink) base.ink = ink;
      s.bg = base.bg; s.ink = base.ink;
      light = hexLum(base.bg) > 0.5;
      dirty = true;
    }

    const cols = () => (narrow.matches ? s.colsMobile : s.cols) || s.cols;
    const frame = () => (narrow.matches && s.frameMobile) || s.frame;

    // ---------- sources ----------
    function drawDemo(t) {
      const w = demo.width, h = demo.height;
      const g = dctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#0a1440'); g.addColorStop(1, '#ff7a3d');
      dctx.fillStyle = g; dctx.fillRect(0, 0, w, h);
      const sy = h * 0.55 + Math.sin(t * 0.4) * 20;
      const rg = dctx.createRadialGradient(w / 2, sy, 10, w / 2, sy, 120);
      rg.addColorStop(0, '#fff6c8'); rg.addColorStop(0.4, '#ffd04a'); rg.addColorStop(1, 'rgba(255,120,60,0)');
      dctx.fillStyle = rg; dctx.beginPath(); dctx.arc(w / 2, sy, 120, 0, Math.PI * 2); dctx.fill();
      for (let layer = 0; layer < 3; layer++) {
        dctx.fillStyle = ['#2a1b4a', '#1a1033', '#08060f'][layer];
        dctx.beginPath(); dctx.moveTo(0, h);
        for (let x = 0; x <= w; x += 8) {
          const k = x * (0.01 + layer * 0.006) + t * (0.3 + layer * 0.5);
          const y = h * (0.62 + layer * 0.1) - (Math.sin(k) * 30 + Math.sin(k * 2.3) * 15) * (1 - layer * 0.2);
          dctx.lineTo(x, y);
        }
        dctx.lineTo(w, h); dctx.fill();
      }
      dctx.strokeStyle = '#7df9ff'; dctx.lineWidth = 6;
      dctx.beginPath();
      dctx.ellipse(w / 2, h * 0.3, 90 + Math.sin(t) * 10, 22, Math.sin(t * 0.5) * 0.4, 0, Math.PI * 2);
      dctx.stroke();
    }

    function randomIndex() {
      if (videos.length < 2) return 0;
      let i; do i = Math.floor(Math.random() * videos.length); while (i === current);
      return i;
    }
    function playClip(i) {
      if (!videos.length) { source = 'demo'; current = -1; Object.assign(s, base); dirty = true; return; }
      current = i;
      pendingLook = lookOf(videos[i]);
      vid.src = srcOf(videos[i]);
      vid.loop = videos.length < 2;
      prevLum = null; presence = null;
    }
    function dropCurrent(reason) {
      console.warn(`[glyph-banner] ${reason}: ${srcOf(videos[current])}`);
      videos.splice(current, 1);
      vid.removeAttribute('src'); vid.load();
      playClip(randomIndex());
    }
    // The new clip's settings take effect on its first frame, so the cut and the change of look land together.
    vid.addEventListener('loadeddata', () => {
      Object.assign(s, base, pendingLook);
      source = 'video'; dirty = true;
      if (playing && visible) vid.play().catch(() => {});
    });
    vid.addEventListener('ended', () => { if (videos.length > 1) playClip(randomIndex()); });
    vid.addEventListener('error', () => { if (vid.getAttribute('src')) dropCurrent("Can't play this video"); });

    // ---------- converter ----------
    function layout(srcW, srcH) {
      const W = canvas.parentElement.clientWidth;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const c = cols();
      octx.font = `100px ${s.monoFont}`;
      const ratio = octx.measureText('M').width / 100;
      cell.w = W / c; cell.font = cell.w / ratio; cell.h = cell.font;
      // 'fill' sizes the grid to the container's CSS height, so the banner takes whatever shape the page gives it.
      const f = frame();
      canvas.parentElement.classList.toggle('fill', f === 'fill');
      let rows;
      if (f === 'fill') rows = Math.max(1, Math.floor(canvas.parentElement.clientHeight / cell.h));
      else {
        const aspect = f === 'match' ? srcH / srcW : parseFloat(f);
        rows = Math.max(1, Math.round(c * aspect * (cell.w / cell.h)));
      }
      const H = rows * cell.h;
      const pw = Math.round(W * dpr), ph = Math.round(H * dpr);
      if (canvas.width !== pw || canvas.height !== ph) {
        canvas.width = pw; canvas.height = ph;
        canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      }
      octx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return [c, rows];
    }

    function updatePresence(raw, dt) {
      const len = raw.length;
      if (!presence || presence.length !== len) { presence = new Float32Array(len); prevLum = null; }
      const t = 1 - s.revealT / 100;
      const decay = s.trail > 0 ? Math.exp(-dt / (s.trail / 3)) : 0;
      for (let i = 0; i < len; i++) {
        let hit;
        if (s.reveal === 'bright') hit = raw[i] > 0.15 + t * 0.75;
        else if (s.reveal === 'dark') hit = raw[i] < 0.85 - t * 0.75;
        else hit = prevLum ? Math.abs(raw[i] - prevLum[i]) > 0.01 + t * 0.2 : false;
        presence[i] = hit ? 1 : presence[i] * decay;
      }
      prevLum = raw.slice();
    }

    // The grid's cells are taller than wide, so the text is squashed vertically in grid space to look right on screen.
    function buildMask(cols, rows, t) {
      if (!s.msgOn || !s.msg.trim()) return null;
      maskC.width = cols; maskC.height = rows;
      const k = cell.w / cell.h;
      const H = rows / k;
      const lines = s.msg.split('\n').filter((l, i, a) => l.trim() || a.length === 1);
      mctx.setTransform(1, 0, 0, k, 0, 0);
      let fs = (s.msgSize / 100) * H / lines.length;
      mctx.font = `${s.msgWeight} ${fs}px ${s.displayFont}`;
      const widest = Math.max(...lines.map(l => mctx.measureText(l).width));
      if (widest > cols * 0.96) { fs *= (cols * 0.96) / widest; mctx.font = `${s.msgWeight} ${fs}px ${s.displayFont}`; }
      mctx.fillStyle = '#fff'; mctx.textAlign = 'center'; mctx.textBaseline = 'middle';
      const lh = fs * 0.95, total = lh * lines.length;
      let cy = (s.msgY / 100) * H, cx = cols / 2;
      if (s.msgPulse) { cx += Math.sin(t * 0.6) * cols * 0.12; cy += Math.cos(t * 0.45) * H * 0.06; }
      cy = Math.min(H - total / 2, Math.max(total / 2, cy));
      lines.forEach((l, i) => mctx.fillText(l, cx, cy - total / 2 + lh * (i + 0.5)));
      const d = mctx.getImageData(0, 0, cols, rows).data;
      const m = new Uint8Array(cols * rows);
      for (let i = 0; i < m.length; i++) m[i] = d[i * 4 + 3] > 110 ? 1 : 0;
      return m;
    }

    function rgbToHue(r, g, b) {
      r /= 255; g /= 255; b /= 255;
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
      if (mx === mn) return 0;
      const d = mx - mn;
      return 60 * (mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4);
    }
    // A fixed text color tuned on the dark stage would vanish on a light page, so light colors flip to their opposite.
    const accentNow = () => (!light ? s.msgAccent : s.msgAccentLight || (hexLum(s.msgAccent) > 0.5 ? invertHex(s.msgAccent) : s.msgAccent));
    let accent = s.msgAccent;
    function contrastColor(r, g, b, L) {
      if (s.msgColor === 'accent') return accent;
      if (s.msgColor === 'comp') return `hsl(${(rgbToHue(r, g, b) + 180) % 360},95%,${L > 0.5 ? 22 : 68}%)`;
      const push = v => { v = 255 - v; return v > 128 ? Math.min(255, v + 60) : Math.max(0, v - 60); };
      return `rgb(${push(r)},${push(g)},${push(b)})`;
    }

    function render(img, srcW, srcH, t) {
      const [cols, rows] = layout(srcW, srcH);
      sample.width = cols; sample.height = rows;
      const W = cols * cell.w, H = rows * cell.h;
      const sc = (s.fit === 'cover' ? Math.max : Math.min)(W / srcW, H / srcH);
      const dw = srcW * sc / cell.w, dh = srcH * sc / cell.h;
      sctx.fillStyle = '#000'; sctx.fillRect(0, 0, cols, rows);
      sctx.drawImage(img, (cols - dw) / 2, (rows - dh) / 2, dw, dh);
      px = sctx.getImageData(0, 0, cols, rows).data;
      const ramp = s.ramp.length ? s.ramp : ' #';
      const n = ramp.length - 1;
      const lum = new Float32Array(cols * rows);
      for (let i = 0, p = 0; i < lum.length; i++, p += 4) {
        let v = 0.2126 * px[p] + 0.7152 * px[p + 1] + 0.0722 * px[p + 2];
        v = (v - 128) * s.contrast + 128 + s.bright;
        lum[i] = Math.min(255, Math.max(0, v)) / 255;
      }
      if (s.edges) {
        const e = new Float32Array(lum.length);
        for (let y = 1; y < rows - 1; y++) for (let x = 1; x < cols - 1; x++) {
          const i = y * cols + x;
          const gx = lum[i + 1] - lum[i - 1], gy = lum[i + cols] - lum[i - cols];
          e[i] = Math.min(1, lum[i] * 0.6 + Math.hypot(gx, gy) * 2);
        }
        for (let i = 0; i < lum.length; i++) if (e[i]) lum[i] = e[i];
      }
      accent = accentNow();
      octx.fillStyle = s.bg; octx.fillRect(0, 0, W, H);
      octx.font = `${cell.font}px ${s.monoFont}`;
      octx.textBaseline = 'top';
      const mask = buildMask(cols, rows, t);
      const nowR = performance.now(), dtR = Math.min(0.25, (nowR - lastRenderT) / 1000); lastRenderT = nowR;
      let alpha = null;
      if (mask && s.reveal !== 'always') {
        if (s.reveal !== 'motion' || playing) updatePresence(lum, dtR);
        else if (presence) for (let i = 0; i < presence.length; i++) presence[i] *= Math.exp(-dtR / Math.max(0.05, s.trail / 3));
        alpha = presence || new Float32Array(lum.length);
        for (let i = 0; i < mask.length; i++) if (mask[i] && alpha[i] < 0.08) mask[i] = 0;
      } else { presence = null; prevLum = null; }
      const msgChars = s.msg.replace(/\s+/g, '') || '#';
      let mi = 0;
      for (let y = 0; y < rows; y++) {
        let line = '', base = '';
        for (let x = 0; x < cols; x++) {
          let v = lum[y * cols + x];
          if (s.invert) v = 1 - v;
          let ch = ramp[Math.round(v * n)];
          const inText = mask && mask[y * cols + x];
          if (inText) {
            if (s.msgFill === 'msg') ch = msgChars[mi++ % msgChars.length];
            else if (s.msgFill === 'solid') ch = '█';
            else if (ch === ' ') ch = ramp[Math.max(1, Math.round(n * 0.4))] || '#';
          }
          line += ch;
          base += inText ? ' ' : ch;
        }
        if (s.color === 'mono') {
          octx.fillStyle = s.ink;
          octx.fillText(base, 0, y * cell.h);
        } else {
          for (let x = 0; x < cols; x++) {
            const ch = base[x]; if (ch === ' ') continue;
            const p = (y * cols + x) * 4;
            if (s.color === 'full') octx.fillStyle = srcColor(p);
            else { const v = lum[y * cols + x]; octx.fillStyle = `hsl(${220 + v * 150},90%,${light ? 50 - v * 30 : 35 + v * 50}%)`; }
            octx.fillText(ch, x * cell.w, y * cell.h);
          }
        }
        if (!mask) continue;
        for (let x = 0; x < cols; x++) {
          const i = y * cols + x; if (!mask[i]) continue;
          const p = i * 4, col = contrastColor(px[p], px[p + 1], px[p + 2], lum[i]);
          if (alpha && alpha[i] < 1) {
            octx.fillStyle = s.color === 'full' ? srcColor(p) : s.ink;
            const vch = ramp[Math.round((s.invert ? 1 - lum[i] : lum[i]) * n)];
            if (vch !== ' ') octx.fillText(vch, x * cell.w, y * cell.h);
            octx.globalAlpha = alpha[i];
          }
          octx.fillStyle = col;
          if (s.msgStyle === 'block') {
            octx.fillRect(x * cell.w, y * cell.h, cell.w + 0.5, cell.h + 0.5);
            if (s.msgFill !== 'solid') { octx.fillStyle = s.bg; octx.fillText(line[x], x * cell.w, y * cell.h); }
          } else octx.fillText(line[x], x * cell.w, y * cell.h);
          octx.globalAlpha = 1;
        }
      }
    }

    // ---------- loop ----------
    function frameTick(ts) {
      const dt = lastTs ? Math.min(0.1, (ts - lastTs) / 1000) : 0; lastTs = ts;
      if (visible && (playing || dirty)) {
        dirty = false;
        try {
          if (source === 'video' && vid.readyState >= 2 && vid.videoWidth) {
            render(vid, vid.videoWidth, vid.videoHeight, vid.currentTime);
          } else {
            if (playing) demoT += dt;
            drawDemo(demoT);
            render(demo, demo.width, demo.height, demoT);
          }
        } catch (err) {
          // Opening the page from file:// taints the canvas with local videos. Serve it over http instead.
          if (err.name !== 'SecurityError') throw err;
          source = 'demo'; dirty = true;
          dropCurrent('Video blocked by the browser (open the site through a local server, not file://)');
        }
      }
      requestAnimationFrame(frameTick);
    }

    function setPlaying(p) {
      playing = p;
      if (source === 'video' || vid.getAttribute('src')) p && visible ? vid.play().catch(() => {}) : vid.pause();
      dirty = true;
      listeners.forEach(fn => fn(playing));
    }

    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (playing && vid.getAttribute('src')) visible ? vid.play().catch(() => {}) : vid.pause();
    }).observe(canvas);
    document.addEventListener('visibilitychange', () => { lastTs = 0; });
    new ResizeObserver(() => { dirty = true; }).observe(canvas.parentElement);
    narrow.addEventListener('change', () => { dirty = true; });
    reduce.addEventListener('change', e => setPlaying(!e.matches));
    readTheme();
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', readTheme);
    new MutationObserver(readTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    if (document.fonts) {
      [s.monoFont, `${s.msgWeight} 40px ${s.displayFont}`].forEach(f =>
        document.fonts.load(f.includes('px') ? f : `40px ${f}`).then(() => { dirty = true; }, () => {}));
    }

    if (videos.length) playClip(randomIndex());
    requestAnimationFrame(frameTick);

    return {
      get playing() { return playing; },
      play: () => setPlaying(true),
      pause: () => setPlaying(false),
      toggle: () => setPlaying(!playing),
      onChange: fn => listeners.add(fn),
    };
  }

  window.GlyphBanner = { mount, DEFAULTS };
})();
