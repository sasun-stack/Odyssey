// ============================================================
//  Shared bits + Landing + Quiz screens
// ============================================================
const { useState, useEffect, useRef } = React;

// --- Constellation emblem (stars + connecting lines) --------------
// size in px; `draw` true animates the lines/stars in.
function Constellation({ god, size = 120, draw = false, glow = true }) {
  const S = 100;
  return (
    <svg
      className="constellation"
      width={size} height={size} viewBox="-6 -6 112 112"
      style={{ filter: glow ? "drop-shadow(0 0 10px rgba(242,107,31,.55))" : "none" }}>
      
      {god.edges.map((e, i) => {
        const [a, b] = e;
        const p1 = god.stars[a],p2 = god.stars[b];
        return (
          <line
            key={"l" + i}
            x1={p1[0]} y1={p1[1]} x2={p2[0]} y2={p2[1]}
            className={draw ? "c-line draw" : "c-line"}
            style={{ animationDelay: i * 0.09 + 0.15 + "s" }} />);


      })}
      {god.stars.map((p, i) =>
      <circle
        key={"s" + i}
        cx={p[0]} cy={p[1]}
        r={i === 0 ? 3.4 : 2.4}
        className={draw ? "c-star draw" : "c-star"}
        style={{ animationDelay: i * 0.07 + "s" }} />

      )}
    </svg>);

}

// --- Ornamental gold/orange divider -------------------------------
function Divider({ width = 120 }) {
  return (
    <div className="divider" style={{ width }}>
      <span className="d-line"></span>
      <span className="d-dot"></span>
      <span className="d-line"></span>
    </div>);

}

// --- KinoPark wordmark (inline, white) ----------------------------
function KPLogo({ height = 18 }) {
  const src = window.__resources && window.__resources.kpLogo || "kinopark-logo.svg";
  return (
    <img src={src} alt="KinoPark" style={{ height, opacity: 0.7, display: "block" }} />);

}

// ============================================================
//  LANDING
// ============================================================
function Landing({ onBegin }) {
  return (
    <div className="screen landing">
      <div className="land-photo" aria-hidden="true"></div>

      <div className="land-bottom fade-up" style={{ animationDelay: ".4s" }}>
        <button className="cta" onClick={onBegin}>
          <span style={{ color: "#ffffff", letterSpacing: "1.2px" }}>Սկսիր քո ճանապարհը</span>
        </button>
        <div className="land-credit">
          <KPLogo height={16} />
          <span className="credit-text">Սպասելով <em>The Odyssey</em>-ին · 2026</span>
        </div>
      </div>
    </div>);

}

// ============================================================
//  QUIZ
// ============================================================
function Quiz({ onComplete }) {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [picked, setPicked] = useState(null);

  const q = QUESTIONS[idx];
  const total = QUESTIONS.length;
  const progress = (idx + (picked !== null ? 1 : 0)) / total * 100;

  function choose(opt, optIdx) {
    if (picked !== null) return;
    setPicked(optIdx);
    const next = answers.concat([opt]);
    // Single timer: glow the choice, then advance. (Avoids chained timers,
    // which background tabs throttle aggressively.)
    setTimeout(() => {
      setAnswers(next);
      if (idx + 1 >= total) {
        onComplete(next);
      } else {
        setIdx(idx + 1);
        setPicked(null);
      }
    }, 620);
  }

  return (
    <div className="screen quiz">
      <div className="quiz-head">
        <div className="progress-row">
          <span className="q-count">Փորձություն {String(idx + 1).padStart(2, "0")}<span className="q-of"> / {total}</span></span>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: progress + "%" }}></div>
          </div>
        </div>
      </div>

      <div className="quiz-body" key={idx}>
        <h2 className="q-text q-anim" style={{ animationDelay: ".05s" }}>{q.q}</h2>
        <div className="options">
          {q.options.map((opt, i) =>
          <button
            key={i}
            className={
            "option q-anim" + (
            picked === i ? " picked" : "") + (
            picked !== null && picked !== i ? " dimmed" : "")
            }
            style={{ animationDelay: 0.14 + i * 0.08 + "s" }}
            onClick={() => choose(opt, i)}>
            
              <span className="opt-label">{opt.label}</span>
            </button>
          )}
        </div>
      </div>
    </div>);

}

Object.assign(window, { Constellation, Divider, KPLogo, Landing, Quiz });