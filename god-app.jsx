// ============================================================
//  App shell — state machine + screen transitions
// ============================================================
const { useState: useStateA } = React;

function App() {
  const [stage, setStage] = useStateA("landing"); // landing | quiz | wheel | result
  const [answers, setAnswers] = useStateA([]);
  const [result, setResult] = useStateA(null); // {godKey, fateKey, ranked}
  const [fading, setFading] = useStateA(false);

  function go(next, fn) {
    setFading(true);
    setTimeout(() => {
      if (fn) fn();
      setStage(next);
      requestAnimationFrame(() => setFading(false));
    }, 380);
  }

  function onBegin() { go("quiz"); }

  function onQuizDone(ans) {
    setAnswers(ans);
    go("wheel");
  }

  function onWheelDone(fateKey) {
    const r = computeResult(answers, fateKey);
    go("result", () => setResult({ ...r, fateKey }));
  }

  function onRestart() {
    go("landing", () => { setAnswers([]); setResult(null); });
  }

  return (
    <div className="app-stage">
      <div className={"app-frame stage-" + stage + (fading ? " fading" : "")}>
        {stage === "landing" && <Landing onBegin={onBegin} />}
        {stage === "quiz" && <Quiz onComplete={onQuizDone} />}
        {stage === "wheel" && <WheelOfFate onComplete={onWheelDone} />}
        {stage === "result" && result && (
          <Result godKey={result.godKey} fateKey={result.fateKey} ranked={result.ranked} onRestart={onRestart} />
        )}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
