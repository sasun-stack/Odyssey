// ============================================================
//  Wheel of Fate — tap to spin, auto-decelerates to a fate.
//  The wheel is a MODIFIER, not the final answer.
// ============================================================
const { useState: useStateW, useRef: useRefW } = React;

// ---- WebAudio SFX: ratchet ticks during spin + landing chime ----
let _wheelAudioCtx = null;
function wheelAudio() {
  if (!_wheelAudioCtx) {
    try { _wheelAudioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch (e) { return null; }
  }
  if (_wheelAudioCtx.state === "suspended") _wheelAudioCtx.resume();
  return _wheelAudioCtx;
}
function playTick() {
  const ctx = wheelAudio(); if (!ctx) return;
  const t = ctx.currentTime;
  // Deep wooden knock: short filtered noise burst + low body thump
  const dur = 0.05;
  const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2.5);
  const src = ctx.createBufferSource(); src.buffer = buf;
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass"; bp.frequency.value = 320 + Math.random() * 120; bp.Q.value = 5;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.5, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(bp).connect(g).connect(ctx.destination);
  src.start(t); src.stop(t + dur);
}
function playChime() {
  const ctx = wheelAudio(); if (!ctx) return;
  const t = ctx.currentTime;
  // Mystical gong: low fundamental + shimmering overtones, long decay
  const master = ctx.createGain();
  master.gain.value = 0.9;
  master.connect(ctx.destination);
  const partials = [
    { f: 174.6, g: 0.5, d: 2.6 },  // F3 fundamental
    { f: 261.6, g: 0.3, d: 2.2 },  // C4
    { f: 349.2, g: 0.22, d: 1.8 }, // F4
    { f: 523.2, g: 0.16, d: 1.4 }, // C5
    { f: 698.4, g: 0.1, d: 1.1 }   // F5
  ];
  partials.forEach(p => {
    const osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(p.f, t);
    osc.frequency.exponentialRampToValueAtTime(p.f * 0.992, t + p.d);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(p.g, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t + p.d);
    osc.connect(g).connect(master);
    osc.start(t); osc.stop(t + p.d + 0.1);
  });
}
// Schedule ticks that follow the wheel's ease-out: dense at the start,
// spreading out as it slows, matching the 4.3s deceleration curve.
function scheduleSpinTicks(durationMs) {
  const timers = [];
  const dur = durationMs / 1000;
  const TICKS = 46;
  for (let i = 0; i < TICKS; i++) {
    const p = i / TICKS;
    // cubic ease-out position -> tick when the wheel crosses each notch
    const eased = 1 - Math.pow(1 - p, 3);
    const at = eased * dur;
    timers.push(setTimeout(playTick, at * 1000));
  }
  return timers;
}

function polar(cx, cy, r, angDeg) {
  const a = (angDeg - 90) * Math.PI / 180; // 0deg = top
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}
function segPath(cx, cy, r, startAng, endAng) {
  const s = polar(cx, cy, r, startAng);
  const e = polar(cx, cy, r, endAng);
  const large = endAng - startAng > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y} Z`;
}

function WheelOfFate({ onComplete }) {
  // 6-segment wheel — the six fates that have finished result posters
  // (Oracle is excluded so every spin lands on a real outcome screen).
  const WHEEL_FATES = FATES.filter(f => f.key !== "oracle");
  const N = WHEEL_FATES.length;
  const seg = 360 / N;
  const [rotation, setRotation] = useStateW(0);
  const [spinning, setSpinning] = useStateW(false);
  const [landed, setLanded] = useStateW(null); // fate key
  const [spun, setSpun] = useStateW(false);
  const tickTimers = useRefW([]);
  const cx = 150,cy = 150,R = 138,LR = 92;

  function spin() {
    if (spinning || landed) return;
    setSpun(true);
    setSpinning(true);
    const target = Math.floor(Math.random() * N);
    const center = target * seg + seg / 2;
    const jitter = (Math.random() - 0.5) * seg * 0.5;
    const spins = 5 + Math.floor(Math.random() * 2);
    // current rotation may be nonzero; build absolute target that's a fresh big spin
    const base = Math.ceil(rotation / 360) * 360;
    const next = base + spins * 360 + (360 - center) - jitter;
    setRotation(next);
    tickTimers.current = scheduleSpinTicks(4300);
    setTimeout(() => {
      setSpinning(false);
      setLanded(WHEEL_FATES[target].key);
      playChime();
    }, 4300);
  }

  const fate = landed ? FATE_MAP[landed] : null;

  return (
    <div className="screen wheel-screen">
      <div className="wheel-head">
        <div className="kicker">Ճակատագրի Անիվ</div>
        <h2 className="wheel-title">Պտտիր Ճակատագրի Անիվը։</h2>
        <p className="wheel-sub">Ճակատագիրը չի անվանում քո աստծուն -այն ձևավորում է ճանապարհը, որ տանում է դեպի նա։</p>
      </div>

      <div className="wheel-stage">
        <div className="wheel-pointer" aria-hidden="true"></div>
        <div className="wheel-halo" aria-hidden="true"></div>
        <svg
          className="wheel-svg"
          width="300" height="300" viewBox="0 0 300 300"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? "transform 4.3s cubic-bezier(.15,.66,.12,1)" : "none"
          }}>
          
          
          <defs>
            <radialGradient id="wheelDark" cx="50%" cy="47%" r="62%">
              <stop offset="0%" stopColor="#2d2218" />
              <stop offset="100%" stopColor="#181107" />
            </radialGradient>
          </defs>
          <circle cx={cx} cy={cy} r={R + 5} className="wheel-rim" />
          {WHEEL_FATES.map((f, i) => {
            const a0 = i * seg,a1 = (i + 1) * seg;
            return <path key={f.key} d={segPath(cx, cy, R, a0, a1)} className={"wheel-seg s" + i % 2} />;
          })}
          {WHEEL_FATES.map((f, i) => {
            const a0 = i * seg,a1 = (i + 1) * seg;
            const mid = a0 + seg / 2;
            return (
              <g key={"l" + f.key} transform={`rotate(${mid} ${cx} ${cy})`}>
                <text
                  x={cx} y={cy - LR}
                  className={"seg-word " + (i % 2 === 0 ? "on-cream" : "on-dark")}
                  textAnchor="middle"
                  transform={`rotate(90 ${cx} ${cy - LR})`}>
                  {f.wheelLabel}
                </text>
              </g>);

          })}
          <circle cx={cx} cy={cy} r={R} className="wheel-ring-inner" />
        </svg>

        <div className={"wheel-cap" + (spinning ? " is-spinning" : "") + (landed ? " is-done" : "")} aria-hidden="true">
          {landed ? "✦" : ""}
        </div>
      </div>

      <div className={"fate-reveal" + (fate ? " show" : "")}>
        {fate &&
        <React.Fragment>
            <Divider width={90} />
            <div className="fate-name">{fate.am}</div>
            <div className="fate-line">{fate.prophecy}</div>
            <button className="cta sm" onClick={() => onComplete(fate.key)}>
              <span>Բացահայտիր քո հովանավորին</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </React.Fragment>
        }
        {!fate && !spinning &&
        <button className="cta" onClick={spin}>
          <span style={{ color: "#ffffff" }}>Պտտել անիվը</span>
        </button>
        }
        {spinning && <div className="wheel-hint spinning">Ճակատագիրը որոշում է…</div>}
      </div>
    </div>);

}

Object.assign(window, { WheelOfFate });