// ============================================================
//  Result screen + shareable PNG card generator
// ============================================================
const { useState: useStateR, useEffect: useEffectR, useRef: useRefR } = React;

// ---- Canvas share-card renderer ----------------------------------
function drawLetterSpaced(ctx, text, cx, y, spacing) {
  const widths = [...text].map(ch => ctx.measureText(ch).width);
  const totalChars = widths.reduce((a, b) => a + b, 0);
  const totalW = totalChars + spacing * (text.length - 1);
  let x = cx - totalW / 2;
  for (let i = 0; i < text.length; i++) {
    ctx.fillText(text[i], x + widths[i] / 2, y);
    x += widths[i] + spacing;
  }
}

function buildShareCanvas(god, fate) {
  const W = 1080, H = 1620;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const ctx = c.getContext("2d");

  // background
  ctx.fillStyle = "#0c0a08";
  ctx.fillRect(0, 0, W, H);
  // warm radial glow
  let g = ctx.createRadialGradient(W / 2, H * 0.42, 60, W / 2, H * 0.42, 760);
  g.addColorStop(0, "rgba(242,107,31,0.20)");
  g.addColorStop(0.5, "rgba(242,107,31,0.05)");
  g.addColorStop(1, "rgba(12,10,8,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // starfield (seeded)
  let seed = 7;
  const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  ctx.fillStyle = "#fff";
  for (let i = 0; i < 120; i++) {
    const x = rnd() * W, y = rnd() * H, r = rnd() * 1.6 + 0.3;
    ctx.globalAlpha = rnd() * 0.5 + 0.1;
    ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  }
  ctx.globalAlpha = 1;

  // border frame
  ctx.strokeStyle = "rgba(242,107,31,0.45)";
  ctx.lineWidth = 2;
  ctx.strokeRect(48, 48, W - 96, H - 96);
  ctx.strokeStyle = "rgba(242,107,31,0.18)";
  ctx.strokeRect(62, 62, W - 124, H - 124);

  // kicker
  ctx.fillStyle = "rgba(242,107,31,0.85)";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.font = "600 26px Georgia, serif";
  drawLetterSpaced(ctx, "THE GOD WHO CHOSE YOU", W / 2, 210, 7);

  // constellation
  const ccx = W / 2, ccy = 470, scale = 3.1;
  const pts = god.stars.map(p => ({ x: ccx + (p[0] - 50) * scale, y: ccy + (p[1] - 50) * scale }));
  ctx.strokeStyle = "rgba(242,107,31,0.6)";
  ctx.lineWidth = 1.6;
  god.edges.forEach(([a, b]) => {
    ctx.beginPath(); ctx.moveTo(pts[a].x, pts[a].y); ctx.lineTo(pts[b].x, pts[b].y); ctx.stroke();
  });
  pts.forEach((p, i) => {
    ctx.beginPath();
    const r = i === 0 ? 8 : 5.5;
    const rg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 2.6);
    rg.addColorStop(0, "#ffd9b8"); rg.addColorStop(0.4, "#f26b1f"); rg.addColorStop(1, "rgba(242,107,31,0)");
    ctx.fillStyle = rg; ctx.arc(p.x, p.y, r * 2.6, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.fillStyle = "#fff"; ctx.arc(p.x, p.y, r * 0.55, 0, 7); ctx.fill();
  });

  // greek name
  ctx.fillStyle = "rgba(255,236,220,0.55)";
  ctx.font = "italic 30px Georgia, serif";
  drawLetterSpaced(ctx, god.greek, W / 2, 700, 6);

  // big name
  ctx.fillStyle = "#fff";
  const nameSize = god.name.length > 8 ? 116 : 136;
  ctx.font = `700 ${nameSize}px Georgia, serif`;
  drawLetterSpaced(ctx, god.name, W / 2, 800, 4);

  // title
  ctx.fillStyle = "#f26b1f";
  ctx.font = "italic 40px Georgia, serif";
  ctx.fillText(god.title, W / 2, 895);

  // divider
  ctx.strokeStyle = "rgba(242,107,31,0.6)";
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(W / 2 - 130, 955); ctx.lineTo(W / 2 - 20, 955); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W / 2 + 20, 955); ctx.lineTo(W / 2 + 130, 955); ctx.stroke();
  ctx.fillStyle = "#f26b1f";
  ctx.beginPath(); ctx.arc(W / 2, 955, 5, 0, 7); ctx.fill();

  // trait (wrap)
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = "34px Georgia, serif";
  wrapText(ctx, god.trait, W / 2, 1025, W - 280, 48);

  // combined prophecy: god + wheel outcome (Armenian)
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.font = "40px Georgia, serif";
  wrapText(ctx, god.am + " հովանավորում է քո ճանապարհը", W / 2, 1180, W - 240, 56);
  ctx.fillStyle = "rgba(255,236,220,0.62)";
  ctx.font = "italic 29px Georgia, serif";
  wrapText(ctx, fate ? fate.prophecy : "", W / 2, 1300, W - 250, 42);

  // footer
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.font = "600 30px Georgia, serif";
  drawLetterSpaced(ctx, "KINOPARK", W / 2, 1460, 5);
  ctx.fillStyle = "rgba(242,107,31,0.75)";
  ctx.font = "italic 25px Georgia, serif";
  ctx.fillText("Which God Chooses You?  ·  The Odyssey 2026", W / 2, 1505);

  return c;
}

function wrapText(ctx, text, cx, y, maxW, lh) {
  const words = text.split(" ");
  let line = "", lines = [];
  words.forEach(w => {
    const test = line ? line + " " + w : w;
    if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; }
    else line = test;
  });
  if (line) lines.push(line);
  lines.forEach((ln, i) => ctx.fillText(ln, cx, y + i * lh));
}

// ---- Per-fate finished poster screens (keyed by wheel outcome; full-bleed baked art) ----
const RESULT_POSTERS = {
  storm: "assets/result-storm.png",
  battle: "assets/result-battle.png",
  journey: "assets/result-journey.png",
  unknown: "assets/result-unknown.png",
  return: "assets/result-return.png",
  sea: "assets/result-sea.png",
};

async function sharePoster(src, god) {
  try {
    const blob = await (await fetch(src)).blob();
    const file = new File([blob], `which-god-${god.key}.png`, { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ title: "Which God Chooses You?", files: [file] });
      return true;
    }
  } catch (e) {/* fall through to download */}
  try {
    const a = document.createElement("a");
    a.href = src; a.download = `which-god-${god.key}.png`;
    document.body.appendChild(a); a.click(); a.remove();
  } catch (e) {/* noop */}
  return false;
}

// ---- Result screen -----------------------------------------------
function Result({ godKey, fateKey, ranked, onRestart }) {
  const god = GOD_MAP[godKey];
  const fate = FATE_MAP[fateKey];
  const second = ranked ? GOD_MAP[ranked.find(k => k !== godKey)] : null;
  const [revealed, setRevealed] = useStateR(false);
  const [saved, setSaved] = useStateR(false);

  useEffectR(() => {
    const t = setTimeout(() => setRevealed(true), 60);
    return () => clearTimeout(t);
  }, []);

  // Finished per-fate poster (baked art + text). Overlay only the action.
  const posterSrc = RESULT_POSTERS[fateKey];
  if (posterSrc) {
    return (
      <div className={"screen result-poster" + (revealed ? " in" : "")}>
        <div className="poster-bg" aria-hidden="true" style={{ backgroundImage: `url("${posterSrc}")` }}></div>
        <div className="poster-actions">
          <button className="cta sm" onClick={onRestart}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M20 12a8 8 0 1 1-2.34-5.66M20 4v4h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span>Անցնել փորձությունը կրկին</span>
          </button>
        </div>
      </div>);
  }

  function saveImage() {
    const canvas = buildShareCanvas(god, fate);
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `which-god-${god.key}.png`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      setSaved(true); setTimeout(() => setSaved(false), 2200);
    }, "image/png");
  }

  async function shareImage() {
    const canvas = buildShareCanvas(god, fate);
    canvas.toBlob(async (blob) => {
      const file = new File([blob], `which-god-${god.key}.png`, { type: "image/png" });
      const shareData = {
        title: "Which God Chooses You?",
        text: `${god.name} — ${god.title}. The gods have chosen my patron. Discover yours.`,
      };
      try {
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ ...shareData, files: [file] });
          return;
        }
        if (navigator.share) { await navigator.share(shareData); return; }
      } catch (e) { /* user cancelled or unsupported */ }
      saveImage();
    }, "image/png");
  }

  return (
    <div className={"screen result" + (revealed ? " in" : "")}>
      <div className="result-stars" aria-hidden="true"></div>

      <div className="result-scroll">
        <div className="res-kicker r-anim" style={{ animationDelay: ".15s" }}>The gods have chosen</div>

        <div className="res-emblem r-anim" style={{ animationDelay: ".3s" }}>
          <div className="res-halo"></div>
          <Constellation god={god} size={150} draw={revealed} />
        </div>

        <div className="res-greek r-anim" style={{ animationDelay: ".5s" }}>{god.greek}</div>
        <h1 className="res-name r-anim" style={{ animationDelay: ".6s" }}>{god.name}</h1>
        <div className="res-title r-anim" style={{ animationDelay: ".75s" }}>{god.title}</div>

        <div className="r-anim" style={{ animationDelay: ".85s" }}><Divider width={130} /></div>

        <div className="res-prophecy r-anim" style={{ animationDelay: ".9s" }}>
          <p className="proph-line">{god.am} հովանավորում է քո ճանապարհը</p>
          {fate && <p className="proph-fate">{fate.prophecy}</p>}
        </div>

        <p className="res-trait r-anim" style={{ animationDelay: "1s" }}>{god.trait}</p>

        <div className="res-block r-anim" style={{ animationDelay: "1.05s" }}>
          <div className="res-label">Why {god.name.charAt(0) + god.name.slice(1).toLowerCase()} chose you</div>
          <p className="res-body">{god.why}</p>
        </div>

        <div className="res-block r-anim" style={{ animationDelay: "1.15s" }}>
          <div className="res-label">Your nature</div>
          <p className="res-body">{god.summary}</p>
        </div>

        <div className="res-meta r-anim" style={{ animationDelay: "1.25s" }}>
          <div className="meta-item">
            <span className="meta-k">Trial of fate</span>
            <span className="meta-v">{fate ? fate.am : "—"}</span>
          </div>
          {second && (
            <div className="meta-item">
              <span className="meta-k">Shadow patron</span>
              <span className="meta-v">{second.name.charAt(0) + second.name.slice(1).toLowerCase()}</span>
            </div>
          )}
        </div>

        <div className="res-actions r-anim" style={{ animationDelay: "1.35s" }}>
          <button className="cta" onClick={shareImage}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 3v13M12 3L7 8M12 3l5 5M5 14v4a2 2 0 002 2h10a2 2 0 002-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span>Share Your Prophecy</span>
          </button>
          <button className="ghost-btn" onClick={saveImage}>{saved ? "✓ Image saved" : "Save card image"}</button>
          <button className="text-btn" onClick={onRestart}>Take the trial again</button>
        </div>

        <div className="res-credit r-anim" style={{ animationDelay: "1.45s" }}>
          <KPLogo height={15} />
          <span>The Odyssey · 2026</span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Result, buildShareCanvas });
