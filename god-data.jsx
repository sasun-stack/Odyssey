// ============================================================
//  Which God Chooses You? — data + scoring engine
//  Gods, constellations, quiz, fates, and the fate algorithm.
// ============================================================

// --- The Pantheon -------------------------------------------------
// Each god has a constellation: points in a 100x100 box + edges (index pairs).
const GODS = [
  {
    key: "zeus", name: "ZEUS", greek: "ΖΕΥΣ", am: "Զևսը", title: "God of Leadership",
    trait: "Commanding, principled, and unafraid to decide.",
    why: "Like a king who must hold the storm in one hand and his people in the other, you carry weight others cannot. Zeus claims you because you do not wait for permission to lead — you simply do.",
    summary: "You move through the world as someone others look to. You make the hard call, take responsibility for it, and protect those who follow. Power, to you, is a duty before it is a privilege.",
    stars: [[50,8],[28,30],[72,30],[20,62],[80,62],[50,52],[50,90]],
    edges: [[0,1],[0,2],[1,3],[2,4],[1,5],[2,5],[5,6]],
  },
  {
    key: "athena", name: "ATHENA", greek: "ΑΘΗΝΑ", am: "Աթենասը", title: "Goddess of Wisdom",
    trait: "Strategic, thoughtful, and resilient.",
    why: "Like Odysseus, you rely on intelligence rather than strength. Challenges do not intimidate you; they sharpen you into finding the way through.",
    summary: "You meet the world with a clear mind. Where others see an obstacle, you see a puzzle worth solving. You are patient, observant, and quietly unstoppable.",
    stars: [[50,10],[30,28],[70,28],[40,52],[60,52],[34,80],[66,80]],
    edges: [[0,1],[0,2],[1,3],[2,4],[3,4],[3,5],[4,6]],
  },
  {
    key: "poseidon", name: "POSEIDON", greek: "ΠΟΣΕΙΔΩΝ", am: "Պոսեյդոնը", title: "God of Adventure",
    trait: "Restless, bold, and drawn to the horizon.",
    why: "The sea does not promise safety, only wonder — and that is exactly why you set sail. Poseidon claims those who would rather be tested by the deep than grow old on the shore.",
    summary: "You are happiest in motion, chasing the next horizon. Comfort bores you; the unknown calls you by name. You trust that the journey itself is the reward.",
    stars: [[50,10],[50,40],[24,40],[76,40],[14,58],[86,58],[50,86]],
    edges: [[0,1],[1,2],[1,3],[2,4],[3,5],[1,6]],
  },
  {
    key: "artemis", name: "ARTEMIS", greek: "ΑΡΤΕΜΙΣ", am: "Արտեմիսը", title: "Goddess of Independence",
    trait: "Self-reliant, focused, and fiercely free.",
    why: "You answer to your own compass and need no chorus of approval. Artemis claims the ones who walk the wild path alone and are never truly lost.",
    summary: "You belong to yourself first. Solitude doesn't frighten you — it sharpens you. You move with quiet precision and a loyalty that, once earned, never breaks.",
    stars: [[18,30],[34,18],[52,30],[40,52],[58,70],[78,58],[86,80]],
    edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[4,6]],
  },
  {
    key: "hermes", name: "HERMES", greek: "ΕΡΜΗΣ", am: "Հերմեսը", title: "God of Curiosity",
    trait: "Quick, clever, and endlessly curious.",
    why: "You cross every border the world tries to draw — between ideas, people, and places. Hermes chooses the swift of mind, the ones who turn every road into a discovery.",
    summary: "You are driven by the question 'what if?'. You adapt fast, talk your way through anything, and find the shortcut others miss. Boredom is your only true enemy.",
    stars: [[22,22],[78,22],[50,40],[22,58],[78,58],[50,76],[50,40]],
    edges: [[0,2],[1,2],[2,5],[3,2],[4,2],[0,1],[3,4]],
  },
  {
    key: "aphrodite", name: "APHRODITE", greek: "ΑΦΡΟΔΙΤΗ", am: "Աֆրոդիտեն", title: "Goddess of Passion",
    trait: "Warm, magnetic, and led by the heart.",
    why: "You understand the oldest force in any epic: it is love that pulls heroes home. Aphrodite claims those who feel deeply and make others feel seen.",
    summary: "You live with your heart wide open. Connection, beauty, and feeling guide your choices. People are drawn to your warmth — and you give it freely.",
    stars: [[34,24],[66,24],[24,42],[76,42],[50,58],[40,78],[60,78]],
    edges: [[0,2],[0,4],[1,3],[1,4],[2,4],[3,4],[4,5],[4,6]],
  },
  {
    key: "ares", name: "ARES", greek: "ΑΡΗΣ", am: "Արեսը", title: "God of Courage",
    trait: "Fearless, direct, and unbreakable under pressure.",
    why: "When others freeze, you step forward. Ares claims the ones who meet fear face to face and refuse to look away.",
    summary: "You don't flinch. Conflict and challenge bring out your sharpest self. You'd rather fight for something and lose than stand safely on the sidelines.",
    stars: [[26,20],[74,80],[40,34],[60,66],[68,28],[32,72],[74,20]],
    edges: [[0,1],[2,4],[3,5],[6,4]],
  },
  {
    key: "hestia", name: "HESTIA", greek: "ΕΣΤΙΑ", am: "Հեստիան", title: "Goddess of Stability",
    trait: "Grounded, steadfast, and quietly warm.",
    why: "You are the still point the storm turns around. While others chase the horizon, you build the home they long to return to. Hestia claims those whose strength is steadiness — the quiet flame that never goes out.",
    summary: "You are the calm others borrow in a crisis. You value peace, security, and the people you keep close. Your power is constancy: you hold steady while everything else shakes.",
    stars: [[50,12],[34,30],[66,30],[26,54],[74,54],[40,78],[60,78]],
    edges: [[0,1],[0,2],[1,3],[2,4],[3,5],[4,6],[5,6]],
  },
];

const GOD_MAP = {};
GODS.forEach(g => { GOD_MAP[g.key] = g; });

// --- The Trials (quiz) --------------------------------------------
// Each option awards the exact points provided in the source content
// to a single deity. Content placed verbatim (Armenian, unchanged).
const QUESTIONS = [
  {
    q: "Ի՞նչ ես փնտրում քո ճանապարհին։",
    options: [
      { label: "Փառք", scores: { ares: 3 } },
      { label: "Իմաստություն", scores: { athena: 3 } },
      { label: "Սեր", scores: { aphrodite: 3 } },
      { label: "Արկածներ", scores: { poseidon: 3 } },
      { label: "Իշխանություն", scores: { zeus: 3 } },
      { label: "Ստաբիլություն", scores: { hestia: 3 } },
    ],
  },
  {
    q: "Ի՞նչ կզոհաբերեիր հանուն դրա։",
    options: [
      { label: "Ժամանակ", scores: { athena: 2 } },
      { label: "Հարմարավետություն", scores: { artemis: 2 } },
      { label: "Հարստություն", scores: { hermes: 2 } },
      { label: "Հեղինակություն", scores: { ares: 2 } },
      { label: "Անվտանգություն", scores: { poseidon: 2 } },
      { label: "Ամեն ինչ", scores: { zeus: 2 } },
    ],
  },
  {
    q: "Ի՞նչն է առաջնորդում քո որոշումները։",
    options: [
      { label: "Բանականությունը", scores: { athena: 3 } },
      { label: "Ինտուիցիան", scores: { artemis: 3 } },
      { label: "Հավատարմությունը", scores: { hestia: 3 } },
      { label: "Փառասիրությունը", scores: { zeus: 3 } },
      { label: "Հետաքրքրասիրությունը", scores: { hermes: 3 } },
      { label: "Զգացմունքները", scores: { aphrodite: 3 } },
    ],
  },
  {
    q: "Փոթորկի ժամանակ ինչի՞ն ես ամենաշատը վստահում։",
    options: [
      { label: "Քո մտքին", scores: { athena: 2 } },
      { label: "Քո ուժին", scores: { ares: 2 } },
      { label: "Քո ուղեկիցներին", scores: { hestia: 2 } },
      { label: "Քո փորձին", scores: { hermes: 2 } },
      { label: "Ճակատագրին", scores: { poseidon: 2 } },
      { label: "Աստվածներին", scores: { zeus: 2 } },
    ],
  },
  {
    q: "Ո՞ր հատկանիշն է քեզ ամենից լավ նկարագրում։",
    options: [
      { label: "Քաջություն", scores: { ares: 3 } },
      { label: "Իմաստություն", scores: { athena: 3 } },
      { label: "Կրքոտություն", scores: { aphrodite: 3 } },
      { label: "Անկախություն", scores: { artemis: 3 } },
      { label: "Համառություն", scores: { poseidon: 3 } },
      { label: "Ստեղծագործական միտք", scores: { hermes: 3 } },
    ],
  },
  {
    q: "Ի՞նչն է ամենակարևորը ճանապարհի վերջում։",
    options: [
      { label: "Հաղթանակը", scores: { ares: 2 } },
      { label: "Գիտելիքը", scores: { athena: 2 } },
      { label: "Ազատությունը", scores: { artemis: 2 } },
      { label: "Ճանաչումը", scores: { zeus: 2 } },
      { label: "Սերը", scores: { aphrodite: 2 } },
      { label: "Ստաբիլությունը", scores: { hestia: 2 } },
    ],
  },
];

// --- The Wheel of Fate --------------------------------------------
// Modifier only: boosts a few gods. primary +4, second +2, third +1.
// am = Armenian trial name; prophecy = Armenian line woven into the result.
const FATES = [
  { key: "journey", label: "The Journey", am: "Ճանապարհը", wheelLabel: "Ճանապարհ", line: "The road reveals who you are.", prophecy: "Ճանապարհը կբացահայտի, թե ով ես դու։", boost: ["hermes", "athena", "poseidon"] },
  { key: "storm",   label: "The Storm",   am: "Փոթորիկը", wheelLabel: "Փոթորիկ", line: "Chaos uncovers your true nature.", prophecy: "Փոթորիկը կբացահայտի քո ճշմարիտ էությունը։", boost: ["poseidon", "zeus", "ares"] },
  { key: "battle",  label: "The Battle",  am: "Ճակատամարտը", wheelLabel: "Մարտ", line: "Conflict forges the spirit.", prophecy: "Ճակատամարտը կկոփի քո ոգին։", boost: ["ares", "athena", "zeus"] },
  { key: "unknown", label: "The Unknown", am: "Անհայտը", wheelLabel: "Անհայտ", line: "What you cannot see, you must feel.", prophecy: "Անհայտը կպահանջի վստահել քո ներքին ձայնին։", boost: ["artemis", "poseidon", "hermes"] },
  { key: "return",  label: "The Return",  am: "Վերադարձը", wheelLabel: "Վերադարձ", line: "Every odyssey bends toward home.", prophecy: "Ամեն ոդիսական ի վերջո դառնում է դեպի տուն։", boost: ["hestia", "athena", "aphrodite"] },
  { key: "sea",     label: "The Sea",     am: "Ծովը", wheelLabel: "Ծով", line: "Vast, deep, impossible to tame.", prophecy: "Ծովն անսահման է ու անսանձ. այն կփորձարկի քեզ։", boost: ["poseidon", "artemis", "hermes"] },
  { key: "oracle",  label: "The Oracle",  am: "Գուշակությունը", wheelLabel: "Օրակուլ", line: "Destiny speaks to those who listen.", prophecy: "Ճակատագիրը խոսում է նրանց հետ, ովքեր լսում են։", boost: ["athena", "aphrodite", "hestia"] },
];

const FATE_MAP = {};
FATES.forEach(f => { FATE_MAP[f.key] = f; });

// --- The Fate Algorithm -------------------------------------------
// answers: array of option objects chosen (each has .scores map)
// fateKey: chosen fate. Logic unchanged: accumulate, apply fate
// modifier, highest total wins (deterministic single winner).
function computeResult(answers, fateKey) {
  const scores = {};
  GODS.forEach(g => { scores[g.key] = 0; });
  answers.forEach(opt => {
    if (!opt || !opt.scores) return;
    Object.keys(opt.scores).forEach(gk => {
      if (gk in scores) scores[gk] += opt.scores[gk];
    });
  });
  const fate = FATE_MAP[fateKey];
  if (fate) {
    const w = [4, 2, 1];
    fate.boost.forEach((gk, i) => { scores[gk] += (w[i] || 0); });
  }
  // winner: highest score, tie-break by GODS order (deterministic, always one)
  let best = GODS[0].key;
  GODS.forEach(g => { if (scores[g.key] > scores[best]) best = g.key; });
  // runner-up for the "personality summary" flavor
  const ranked = GODS.map(g => g.key).sort((a, b) => scores[b] - scores[a]);
  return { godKey: best, scores, ranked };
}

Object.assign(window, { GODS, GOD_MAP, QUESTIONS, FATES, FATE_MAP, computeResult });
