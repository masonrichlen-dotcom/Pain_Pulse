import { useState, useEffect, useRef } from "react";

// ─── SYSTEM PROMPT ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are a movement education and self-management guide inside Pain Pulse. You help people understand what's going on with their body and explore movement and self-management strategies. You are not a physical therapist and do not provide physical therapy services — but you are a knowledgeable, genuinely curious friend who happens to know a lot about how the body moves and why things hurt.

## Language rules
Never use: "I recommend", "I prescribe", "based on your presentation", "my assessment", "I diagnose", "rehabilitation program", "clinical findings".
Always frame suggestions as general information: "Many people find...", "Something worth trying...", "A lot of people in this situation explore...", "Worth experimenting with..."

## How to explore — the core loop

**Open warmly.** First message: brief, open, unhurried. "What's been going on?" or "What's been bothering you?" Not structured. Just space.

**Listen and reflect.** After they share, reflect back what you heard in plain human language. Then get curious. A good conversation here covers:
- How long has this been going on, and did anything kick it off?
- What makes it better, what makes it worse?
- What specific activities or movements are most affected?
- What does it feel like — their words, not yours?
- If you press on the area yourself, does that reproduce the discomfort?
- Has anything like this happened before?

These are natural human questions. Ask them conversationally across the session — not as a checklist, not all at once. Two or three exchanges of genuine back-and-forth before suggesting anything.

**Self-palpation is fair game.** Asking someone to press on their own tissue and report what they feel is self-directed exploration, not examination. "If you press on that area, does it feel tender?" is a completely appropriate question. Use it.

**Activity-anchored.** Always work toward the specific activity most limited. "What's the one thing you'd most want to do without discomfort?" Then explore what that movement involves and when exactly the discomfort shows up — at the start, during, after, or the next day.

**Probe before suggesting.** Minimum two genuine follow-up exchanges before offering any movement information. Understand the situation first.

## Area-specific exploration

**Hand and fingers**: Explore which fingers are affected, what type of grip or movement triggers it (pinch, full grip, fine motor, extension), whether it's worse after rest or after use, whether there's swelling or visible change, whether pressing on specific spots reproduces it. Most hand and finger complaints are musculoskeletal — tendinopathy, joint stiffness, overuse, nerve tension from the forearm or neck. Explore thoroughly before any referral consideration. Only suggest physician evaluation if: significant unexplained swelling with warmth and redness across a joint, complete sudden loss of finger function after trauma, or numbness/tingling clearly in a nerve distribution that is progressive and not improving. Everyday aching, stiffness, grip weakness, and finger pain are appropriate to explore fully.

**Wrist and elbow**: Explore direction of pain (flexion vs extension vs rotation), whether it's worse with grip or with wrist position, and whether symptoms travel up the forearm. Most wrist and elbow complaints respond well to load management and movement exploration.

**Lower back**: Explore posture triggers (sitting, standing, bending), whether symptoms are local or travel, what time of day is worst, and what positions provide relief. Most back pain is mechanical and very appropriate to explore.

**Neck and shoulders**: Explore head position triggers, whether symptoms radiate into the arm, what movements are most limited, and whether it's muscular tension versus joint stiffness versus nerve-related.

**Knee**: Explore whether pain is front, inside, outside, or behind the knee, whether stairs or sitting-to-standing are a trigger, and whether there's any giving way or locking.

**Hip**: Explore whether pain is groin, lateral, or buttock, whether it's worse with weight-bearing or with rotation, and what positions aggravate or relieve.

**Foot and ankle**: Explore location precisely (heel, arch, ball, toes, ankle), whether it's worst with first steps in the morning, and what footwear or surfaces make a difference.

**Jaw**: Explore clicking, locking, whether it's worse with chewing or talking, and whether there's associated neck or temple tension.

**Headaches**: Explore location, onset pattern, what makes them better or worse, and whether they're associated with neck stiffness or posture. Most are tension or cervicogenic — engage with these confidently.

## Referral calibration
Refer to a physician only for genuine red flags — not for routine musculoskeletal complaints. Red flags worth stopping for: chest pain with exertion, sudden severe headache unlike any before, neurological symptoms that are new and progressive (increasing weakness, bowel/bladder changes, facial drooping), significant trauma with immediate severe pain, unexplained systemic symptoms (fever, night sweats, unintentional weight loss).

Do NOT refer prematurely for: tingling that comes and goes, everyday stiffness, pain that varies with activity, weakness that's gradual, or any complaint the person has had for a while without worsening. These are appropriate to explore fully.

## Progress framing
Non-linear progress is normal — name this. Never ask "are you better?" Ask "what feels different?" Surface improvements they haven't noticed. Encourage self-tracking as personal data.

## Tone
Warm, direct, genuinely curious. The goal is to feel like a knowledgeable friend having a real conversation — not a clinician running a protocol, and not a wellness app giving generic advice. Short responses. Never bullet lists in conversation. Ask one question at a time.`;

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const C = {
  teal: "#1D9E75", tealDark: "#0F6E56", tealDeep: "#085041",
  tealBg: "#0A1F18", tealMid: "#9FE1CB",
  amber: "#BA7517", amberBg: "#1A1200",
  coral: "#D85A30",
  bg0: "#0D1117", bg1: "#141B24", bg2: "#1E2530",
  text0: "#E8E6E1", text1: "#9F9B94", text2: "#666", text3: "#444",
  border: "#1E2530", borderLight: "#2A3340",
};

const PROXY_TESTS = {
  back:     { name: "Forward reach",             unit: "fist-widths from floor",              lowerIsBetter: true,  instruction: "Stand tall, feet hip-width apart. Slowly bend forward and reach fingertips toward the floor. Stop at resistance or discomfort. Count fist-widths between fingertips and floor." },
  neck:     { name: "Chin-to-shoulder reach",    unit: "finger-widths short of shoulder",     lowerIsBetter: true,  instruction: "Sit upright, shoulders relaxed. Slowly turn your head right as far as comfortable. Note how many finger-widths your chin falls short of your shoulder. Repeat left if needed." },
  knee:     { name: "Squat hold depth",          unit: "seconds held at deepest pain-free position", lowerIsBetter: false, instruction: "Stand facing a wall, fingertips lightly touching it. Feet hip-width apart. Slowly lower into a squat — stop the moment knee pain begins. Hold the deepest pain-free position and count seconds until form breaks." },
  hip:      { name: "Knee-to-chest pull",        unit: "fist-widths from chest",              lowerIsBetter: true,  instruction: "Lie on your back on a firm surface. Pull one knee toward your chest with both hands as far as comfortable without hip or groin pain. Count fist-widths of gap between knee and chest. Test the affected side." },
  wrist:    { name: "Wall wrist extension",      unit: "degrees short of flat (0 = full)",    lowerIsBetter: true,  instruction: "Stand facing a wall. Place your palm flat on the wall, fingers pointing up. Slowly lean forward until you feel resistance. Estimate how many degrees short of flat (90°) your wrist is." },
  foot:     { name: "Single-leg balance",        unit: "seconds balanced",                    lowerIsBetter: false, instruction: "Stand near a wall for safety — don't touch it. Lift one foot slightly and balance. Count seconds before touching down or grabbing the wall. Test the affected side first." },
  hand:     { name: "Grip span",                 unit: "finger-widths gap to palm",           lowerIsBetter: true,  instruction: "Open your hand naturally, palm facing you. Slowly close fingers into a fist as fully as comfortable without pain. Count finger-widths of gap remaining between fingertips and palm." },
  jaw:      { name: "Mouth opening",             unit: "finger-widths opening",               lowerIsBetter: false, instruction: "Sit upright, head neutral. Open your mouth as wide as comfortable without pain or clicking. Stack fingers vertically between upper and lower front teeth and count how many fit." },
  headache: { name: "Symptom-free activity window", unit: "minutes before symptom onset",    lowerIsBetter: false, instruction: "Choose a mildly demanding activity — reading, screen work, light walking. Start a timer. Stop and record the time when headache symptoms begin or noticeably worsen. Use the same activity each session." },
};

const PAIN_AREAS = [
  { id: "back",     label: "Lower back",       sub: "Ache, stiffness, spasms" },
  { id: "neck",     label: "Neck & shoulders", sub: "Tension, stiffness, soreness" },
  { id: "knee",     label: "Knee",             sub: "Pain, swelling, stiffness" },
  { id: "hip",      label: "Hip",              sub: "Deep ache, groin, movement limits" },
  { id: "wrist",    label: "Wrist & elbow",    sub: "Strain, numbness" },
  { id: "foot",     label: "Foot & ankle",     sub: "Pain, instability, stiffness" },
  { id: "hand",     label: "Hand & fingers",   sub: "Grip, dexterity, swelling" },
  { id: "jaw",      label: "Jaw (TMJ)",        sub: "Clicking, locking, face pain",     caution: true },
  { id: "headache", label: "Headaches",        sub: "Tension, cervicogenic, migraine",  caution: true },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

function Sparkline({ data, lowerIsBetter }) {
  if (!data || data.length < 2) return null;
  const w = 72, h = 28, p = 3;
  const vals = data.map(d => parseFloat(d.value)).filter(v => !isNaN(v));
  if (vals.length < 2) return null;
  const mn = Math.min(...vals), mx = Math.max(...vals), rng = mx - mn || 1;
  const pts = vals.map((v, i) => {
    const x = p + (i / (vals.length - 1)) * (w - p * 2);
    const y = p + ((lowerIsBetter ? v - mn : mx - v) / rng) * (h - p * 2);
    return `${x},${y}`;
  }).join(" ");
  const improving = lowerIsBetter ? vals.at(-1) <= vals[0] : vals.at(-1) >= vals[0];
  const col = improving ? C.teal : C.amber;
  const lx = pts.split(" ").at(-1).split(",");
  return (
    <svg width={w} height={h} style={{ overflow: "visible", flexShrink: 0 }}>
      <polyline points={pts} fill="none" stroke={col} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={lx[0]} cy={lx[1]} r="3" fill={col} />
    </svg>
  );
}

function useTimer() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const iv = useRef(null);
  useEffect(() => {
    if (running) { iv.current = setInterval(() => setElapsed(e => e + 1), 1000); }
    else clearInterval(iv.current);
    return () => clearInterval(iv.current);
  }, [running]);
  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  return {
    elapsed, running, fmt,
    start: () => setRunning(true),
    stop:  () => { setRunning(false); return elapsed; },
    reset: () => { setRunning(false); setElapsed(0); },
  };
}

async function callClaude(messages, onChunk) {
  // Routes through /api/chat — keeps the API key server-side.
  // In local development, CRA proxies this to localhost:3001 (or Vercel dev).
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: SYSTEM_PROMPT, messages }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `API error ${res.status}`);
  }
  const data = await res.json();
  if (!data.content?.[0]?.text) throw new Error("No response from API");
  const words = data.content[0].text.split(" ");
  let out = "";
  for (const w of words) {
    await new Promise(r => setTimeout(r, 16));
    out += (out ? " " : "") + w;
    onChunk(out);
  }
  return out;
}

// ─── EMPTY CASE FACTORY ───────────────────────────────────────────────────────
function newCase(areaId, painLevel) {
  const area = PAIN_AREAS.find(a => a.id === areaId);
  return {
    id: uid(),
    areaId,
    areaLabel: area.label,
    painLevel,
    createdAt: new Date().toLocaleDateString(),
    sessions: [],
    proxyReadings: [],   // [{ date, value }]
    messages: [],        // full AI conversation history (including hidden context)
    displayMessages: [], // what the user sees
    notes: "",
  };
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  // Cases
  const [cases, setCases] = useState([]); // array of case objects
  const [activeCaseId, setActiveCaseId] = useState(null);
  const activeCase = cases.find(c => c.id === activeCaseId) || null;

  // Screen: "home" | "new-case" | "session" | "progress" | "proxy"
  const [screen, setScreen] = useState("home");

  // New-case form
  const [newArea, setNewArea] = useState(null);
  const [newLevel, setNewLevel] = useState(5);

  // Session
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [listening, setListening] = useState(false);
  const recRef = useRef(null);
  const chatRef = useRef(null);
  const inputRef = useRef(null);
  const timer = useTimer();

  // Proxy
  const [proxyEntry, setProxyEntry] = useState("");

  // Scroll chat
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [activeCase?.displayMessages, streamText]);

  // ── Case mutations ──────────────────────────────────────────────────────────
  function updateCase(id, fn) {
    setCases(prev => prev.map(c => c.id === id ? { ...c, ...fn(c) } : c));
  }

  // ── New case → start session ────────────────────────────────────────────────
  async function createAndStartCase() {
    if (!newArea) return;
    const c = newCase(newArea, newLevel);
    setCases(prev => [...prev, c]);
    setActiveCaseId(c.id);
    setScreen("session");
    setNewArea(null);
    setNewLevel(5);

    const area = PAIN_AREAS.find(a => a.id === newArea);
    const ctx = {
      role: "user",
      content: `[App context — not shown to user]: Movement area selected: ${area.label}. Self-reported discomfort: ${newLevel}/10. Session 1. Open with a single warm, brief, genuinely open question — not "tell me your story", not a structured intake. Just create space. Nothing else yet.`,
    };
    const apiMsgs = [ctx];

    setStreaming(true);
    setStreamText("");
    try {
      let full = "";
      await callClaude(apiMsgs, t => { setStreamText(t); full = t; });
      const aiMsg = { role: "assistant", content: full };
      setCases(prev => prev.map(pc => pc.id === c.id ? {
        ...pc,
        messages: [...apiMsgs, aiMsg],
        displayMessages: [aiMsg],
      } : pc));
      setStreamText("");
    } catch {
      const err = { role: "assistant", content: "I'm having trouble connecting. Please check your connection and try again." };
      setCases(prev => prev.map(pc => pc.id === c.id ? { ...pc, messages: [ctx, err], displayMessages: [err] } : pc));
      setStreamText("");
    }
    setStreaming(false);
  }

  // ── Resume existing case ────────────────────────────────────────────────────
  async function resumeCase(caseId) {
    const c = cases.find(x => x.id === caseId);
    if (!c) return;
    setActiveCaseId(caseId);
    setScreen("session");

    // If no messages yet somehow, start fresh
    if (c.messages.length === 0) { await createAndStartCase(); return; }

    // Otherwise send a resume context so AI knows we're continuing
    const sessionNum = c.sessions.length + 1;
    const lastProxy = c.proxyReadings.at(-1);
    const proxy = PROXY_TESTS[c.areaId];
    const proxyCtx = lastProxy
      ? `Last proxy reading: ${lastProxy.value} ${proxy.unit} (${lastProxy.date}).`
      : "No proxy readings recorded yet.";

    const ctx = {
      role: "user",
      content: `[App context — not shown to user]: Returning session ${sessionNum} for ${c.areaLabel} area. ${proxyCtx} Brief warm acknowledgement they're back, then ask how things have been since you last spoke. Keep it natural and open.`,
    };
    const apiMsgs = [...c.messages, ctx];

    setStreaming(true);
    setStreamText("");
    try {
      let full = "";
      await callClaude(apiMsgs, t => { setStreamText(t); full = t; });
      const aiMsg = { role: "assistant", content: full };
      updateCase(caseId, pc => ({
        messages: [...pc.messages, ctx, aiMsg],
        displayMessages: [...pc.displayMessages, aiMsg],
      }));
      setStreamText("");
    } catch {
      const err = { role: "assistant", content: "Having trouble connecting. Please try again." };
      updateCase(caseId, pc => ({ displayMessages: [...pc.displayMessages, err] }));
      setStreamText("");
    }
    setStreaming(false);
  }

  // ── Send message ────────────────────────────────────────────────────────────
  async function sendMessage() {
    const text = input.trim();
    if (!text || streaming || !activeCase) return;
    setInput("");
    const userMsg = { role: "user", content: text };
    updateCase(activeCaseId, c => ({
      messages: [...c.messages, userMsg],
      displayMessages: [...c.displayMessages, userMsg],
    }));
    const apiMsgs = [...activeCase.messages, userMsg];
    setStreaming(true);
    setStreamText("");
    try {
      let full = "";
      await callClaude(apiMsgs, t => { setStreamText(t); full = t; });
      const aiMsg = { role: "assistant", content: full };
      updateCase(activeCaseId, c => ({
        messages: [...c.messages, userMsg, aiMsg],
        displayMessages: [...c.displayMessages, userMsg, aiMsg],
      }));
      setStreamText("");
    } catch {
      const err = { role: "assistant", content: "Something went wrong. Please try again." };
      updateCase(activeCaseId, c => ({
        messages: [...c.messages, userMsg],
        displayMessages: [...c.displayMessages, userMsg, err],
      }));
      setStreamText("");
    }
    setStreaming(false);
    inputRef.current?.focus();
  }

  // ── End session ─────────────────────────────────────────────────────────────
  function endSession() {
    if (activeCase) {
      updateCase(activeCaseId, c => ({
        sessions: [...c.sessions, { date: new Date().toLocaleDateString(), duration: timer.elapsed }],
      }));
    }
    timer.reset();
    setScreen("home");
  }

  // ── Proxy logging ───────────────────────────────────────────────────────────
  function logProxy() {
    const val = proxyEntry.trim();
    if (!val || !activeCase) return;
    updateCase(activeCaseId, c => ({
      proxyReadings: [...c.proxyReadings, { date: new Date().toLocaleDateString(), value: val }],
    }));
    setProxyEntry("");
  }

  // ── Dictation ───────────────────────────────────────────────────────────────
  function toggleDictation() {
    if (listening) { recRef.current?.stop(); setListening(false); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Dictation not supported in this browser. Try Chrome or Safari."); return; }
    navigator.mediaDevices?.getUserMedia({ audio: true })
      .then(stream => {
        stream.getTracks().forEach(t => t.stop());
        const rec = new SR();
        rec.continuous = false; rec.interimResults = true; rec.lang = "en-US";
        rec.onresult = e => setInput(Array.from(e.results).map(r => r[0].transcript).join(""));
        rec.onend = () => setListening(false);
        rec.onerror = () => setListening(false);
        recRef.current = rec; rec.start(); setListening(true);
      })
      .catch(() => alert("Microphone access denied. Allow mic access in browser settings and try again."));
  }

  // ─── STYLES ────────────────────────────────────────────────────────────────
  const S = {
    app:      { minHeight: "100vh", background: C.bg0, color: C.text0, fontFamily: "'DM Sans', system-ui, sans-serif", display: "flex", flexDirection: "column" },
    header:   { background: C.bg0, borderBottom: `1px solid ${C.border}`, padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 },
    logoMark: { width: 30, height: 30, borderRadius: 7, background: C.teal, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
    body:     { flex: 1, maxWidth: 500, width: "100%", margin: "0 auto", padding: "0 0 40px" },
    btn:      (bg, col, border) => ({ padding: "10px 18px", borderRadius: 9, border: `1px solid ${border || bg}`, background: bg, color: col, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", transition: "opacity 0.15s" }),
    card:     (extra) => ({ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 16px", ...extra }),
    label:    { fontSize: 11, fontWeight: 600, color: C.text2, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 10 },
    disclaimer: { margin: "14px 20px 0", padding: "10px 12px", background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 11, color: C.text2, lineHeight: 1.5 },
  };

  const [consentGiven, setConsentGiven] = useState(false);

  // ─── RENDER: CONSENT ───────────────────────────────────────────────────────
  const renderConsent = () => (
    <div style={{ maxWidth: 500, margin: "0 auto", padding: "40px 24px" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: C.teal, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <svg width="26" height="26" viewBox="0 0 18 18" fill="none">
            <path d="M9 2C9 2 5 6 5 10C5 12.2 6.8 14 9 14C11.2 14 13 12.2 13 10C13 6 9 2 9 2Z" fill="white" opacity="0.9"/>
            <path d="M9 14V16M7 16H11" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.6px", color: C.text0, marginBottom: 6 }}>Pain Pulse</div>
        <div style={{ fontSize: 13, color: C.text2 }}>Movement education & self-management</div>
      </div>

      <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 22px", marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.text0, marginBottom: 14 }}>Before you begin — please read this</div>

        {[
          { icon: "📋", title: "This is not physical therapy", body: "Pain Pulse provides general movement education and self-management information. It is not a physical therapy service and does not replace evaluation or treatment by a licensed healthcare professional." },
          { icon: "🤝", title: "No clinical relationship is formed", body: "Using this app does not create a provider-patient relationship of any kind. The information shared is general in nature and is not individualized clinical advice." },
          { icon: "🧭", title: "You are in the driver's seat", body: "You decide what to explore, what to try, and what to skip. The guide shares information — you apply your own judgment about what makes sense for your situation." },
          { icon: "🚨", title: "Know when to seek care", body: "If you experience chest pain, sudden severe pain, numbness or tingling radiating down a limb, loss of bladder or bowel control, or any symptom that feels urgent — stop using this app and seek medical care immediately." },
        ].map(({ icon, title, body }) => (
          <div key={title} style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{icon}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text0, marginBottom: 3 }}>{title}</div>
              <div style={{ fontSize: 12, color: C.text2, lineHeight: 1.6 }}>{body}</div>
            </div>
          </div>
        ))}
      </div>

      <button
        style={{ ...S.btn(C.teal, "#fff"), width: "100%", padding: "14px", fontSize: 14, fontWeight: 600, marginBottom: 12 }}
        onClick={() => setConsentGiven(true)}>
        I understand — let's get started
      </button>
      <div style={{ fontSize: 11, color: C.text3, textAlign: "center", lineHeight: 1.6 }}>
        By continuing you acknowledge that Pain Pulse is a self-management tool, not a clinical service.
      </div>
    </div>
  );
  const renderHome = () => (
    <div>
      <div style={{ padding: "28px 20px 16px" }}>
        <div style={{ fontSize: 11, color: C.teal, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>Pain Pulse</div>
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.6px", lineHeight: 1.25, marginBottom: 6 }}>Your active cases</div>
        <div style={{ fontSize: 13, color: C.text2, lineHeight: 1.6 }}>Each case tracks a separate area independently — its own sessions, benchmarks, and trends.</div>
      </div>

      {/* Active cases */}
      <div style={{ padding: "0 20px" }}>
        {cases.length === 0 ? (
          <div style={{ ...S.card(), textAlign: "center", padding: "32px 24px", marginBottom: 12 }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>🩺</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.text0, marginBottom: 6 }}>No cases yet</div>
            <div style={{ fontSize: 13, color: C.text2, lineHeight: 1.6 }}>Start your first case and tell the AI PT what's been going on.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
            {cases.map(c => {
              const proxy = PROXY_TESTS[c.areaId];
              const lastReading = c.proxyReadings.at(-1);
              return (
                <div key={c.id} style={{ ...S.card(), display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
                  onClick={() => resumeCase(c.id)}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: C.tealBg, border: `1px solid ${C.tealDark}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 18 }}>
                      {{ back: "🔹", neck: "🔷", knee: "🦵", hip: "🔸", wrist: "✋", foot: "🦶", hand: "🤚", jaw: "😮", headache: "🧠" }[c.areaId] || "🔹"}
                    </span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.text0, marginBottom: 2 }}>{c.areaLabel}</div>
                    <div style={{ fontSize: 11, color: C.text2 }}>
                      {c.sessions.length} session{c.sessions.length !== 1 ? "s" : ""} · started {c.createdAt}
                      {lastReading ? ` · last benchmark: ${lastReading.value} ${proxy.unit}` : ""}
                    </div>
                  </div>
                  {c.proxyReadings.length >= 2 && (
                    <Sparkline data={c.proxyReadings} lowerIsBetter={proxy.lowerIsBetter} />
                  )}
                  <div style={{ fontSize: 16, color: C.text2, flexShrink: 0 }}>→</div>
                </div>
              );
            })}
          </div>
        )}

        <button style={{ ...S.btn(C.teal, "#fff"), width: "100%", padding: "13px", fontSize: 14, fontWeight: 600 }}
          onClick={() => setScreen("new-case")}>
          + New case
        </button>
      </div>

      <div style={S.disclaimer}>
        Pain Pulse provides general movement education and self-management information only. It does not provide physical therapy services, does not form a clinical relationship, and is not a substitute for professional evaluation or care. If you experience worsening pain or new symptoms, please see a licensed healthcare provider.
      </div>
    </div>
  );

  // ─── RENDER: NEW CASE ──────────────────────────────────────────────────────
  const renderNewCase = () => {
    const sel = PAIN_AREAS.find(a => a.id === newArea);
    return (
      <div>
        <div style={{ padding: "20px 20px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <button style={{ ...S.btn("transparent", C.text1, C.border), padding: "6px 12px" }} onClick={() => setScreen("home")}>← Back</button>
          <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.4px" }}>New case</div>
        </div>

        <div style={{ padding: "0 20px" }}>
          <div style={S.label}>What area is this case for?</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 20 }}>
            {PAIN_AREAS.map(a => (
              <div key={a.id}
                style={{ background: newArea === a.id ? C.tealBg : C.bg1, border: `1px solid ${newArea === a.id ? C.teal : C.border}`, borderRadius: 10, padding: "11px 12px", cursor: "pointer", transition: "all 0.15s" }}
                onClick={() => setNewArea(a.id)}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.text0, marginBottom: 3, lineHeight: 1.3 }}>{a.label}</div>
                <div style={{ fontSize: 10, color: C.text2, lineHeight: 1.3 }}>{a.sub}</div>
                {a.caution && <div style={{ fontSize: 9, color: C.text2, marginTop: 4, letterSpacing: "0.03em" }}>SCREENED</div>}
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ ...S.label, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Pain level right now</span>
              <span style={{ color: newLevel >= 7 ? C.coral : newLevel >= 4 ? C.amber : C.teal, fontWeight: 700, fontSize: 14 }}>{newLevel}/10</span>
            </div>
            <input type="range" min={1} max={10} step={1} value={newLevel} onChange={e => setNewLevel(+e.target.value)} style={{ width: "100%", accentColor: C.teal }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.text3, marginTop: 4 }}>
              <span>Mild</span><span>Moderate</span><span>Severe</span>
            </div>
          </div>

          {newLevel >= 8 && (
            <div style={{ background: "#1A0A0A", border: `1px solid ${C.coral}40`, borderRadius: 9, padding: "12px 14px", marginBottom: 16, fontSize: 12, color: C.coral, lineHeight: 1.5 }}>
              ⚠ Pain at {newLevel}/10 is high. If it's accompanied by chest pain, numbness down a limb, or loss of bladder control — please seek emergency care before continuing.
            </div>
          )}

          {sel?.caution && (
            <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 9, padding: "12px 14px", marginBottom: 16, fontSize: 12, color: C.text2, lineHeight: 1.5 }}>
              {sel.id === "jaw"
                ? "The guide will explore whether your symptoms suggest a dentist or physician visit before sharing movement information."
                : "Most headaches respond well to movement and self-management. The guide will check for the rare patterns that need a doctor first, and will share information about what tends to drive yours."}
            </div>
          )}

          <button
            style={{ ...S.btn(newArea ? C.teal : C.bg2, newArea ? "#fff" : C.text2), width: "100%", padding: "13px", fontSize: 14, fontWeight: 600 }}
            onClick={newArea ? createAndStartCase : undefined}
            disabled={!newArea}>
            {newArea ? `Start ${PAIN_AREAS.find(a => a.id === newArea)?.label} case →` : "Select an area to continue"}
          </button>
        </div>
      </div>
    );
  };

  // ─── RENDER: SESSION ───────────────────────────────────────────────────────
  const renderSession = () => {
    if (!activeCase) return null;
    const proxy = PROXY_TESTS[activeCase.areaId];
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 57px)" }}>
        {/* Case pill */}
        <div style={{ padding: "8px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: streaming ? C.amber : C.teal }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: C.text0 }}>{activeCase.areaLabel}</span>
            <span style={{ fontSize: 11, color: C.text2 }}>· session {activeCase.sessions.length + 1}</span>
          </div>
          <button style={{ ...S.btn("transparent", C.text2, "transparent"), padding: "4px 8px", fontSize: 11 }} onClick={() => setScreen("home")}>← Cases</button>
        </div>

        {/* Messages */}
        <div ref={chatRef} style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          {activeCase.displayMessages.map((m, i) => (
            <div key={i} style={{
              maxWidth: "86%", padding: "10px 14px", fontSize: 14, lineHeight: 1.65,
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              background: m.role === "user" ? C.teal : C.bg1,
              color: m.role === "user" ? "#fff" : C.text0,
              borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
              border: m.role === "assistant" ? `1px solid ${C.border}` : "none",
            }}>{m.content}</div>
          ))}
          {streaming && streamText && (
            <div style={{ maxWidth: "86%", padding: "10px 14px", fontSize: 14, lineHeight: 1.65, alignSelf: "flex-start", background: C.bg1, color: C.text0, borderRadius: "16px 16px 16px 4px", border: `1px solid ${C.border}` }}>
              {streamText}<span style={{ opacity: 0.4 }}>▍</span>
            </div>
          )}
          {streaming && !streamText && (
            <div style={{ padding: "10px 14px", background: C.bg1, border: `1px solid ${C.border}`, borderRadius: "16px 16px 16px 4px", alignSelf: "flex-start", fontSize: 13, color: C.text2 }}>
              <span style={{ animation: "ptpulse 1.2s ease-in-out infinite" }}>thinking…</span>
            </div>
          )}
        </div>

        {/* Timer strip */}
        {timer.running && (
          <div style={{ padding: "8px 16px", background: C.tealBg, borderTop: `1px solid ${C.tealDark}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, color: C.tealMid, fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>⏱ {timer.fmt(timer.elapsed)}</span>
            <button style={{ ...S.btn(C.tealDark, C.tealMid, C.tealDark), padding: "5px 12px", fontSize: 12 }} onClick={() => { timer.stop(); timer.reset(); }}>Stop</button>
          </div>
        )}

        {/* Toolbar */}
        <div style={{ padding: "8px 16px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 6, overflowX: "auto" }}>
          {[
            { label: timer.running ? `⏹ ${timer.fmt(timer.elapsed)}` : "⏱ Timer", action: () => timer.running ? timer.stop() : timer.start() },
            { label: "📏 Benchmark", action: () => setScreen("proxy") },
            { label: "📈 Progress", action: () => setScreen("progress") },
            { label: "✓ End session", action: endSession },
          ].map(({ label, action }) => (
            <button key={label} style={{ ...S.btn("transparent", C.text1, C.border), padding: "6px 12px", fontSize: 12, whiteSpace: "nowrap", flexShrink: 0 }} onClick={action}>{label}</button>
          ))}
        </div>

        {/* Input */}
        <div style={{ padding: "10px 16px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 8, background: C.bg0 }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Describe what you're feeling…"
            style={{ flex: 1, background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 14px", color: C.text0, fontSize: 14, fontFamily: "inherit", outline: "none" }}
          />
          <button
            style={{ width: 38, height: 38, borderRadius: 9, border: "none", background: listening ? C.coral : C.bg2, cursor: "pointer", fontSize: 16, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
            onClick={toggleDictation} title={listening ? "Stop dictation" : "Speak"}>
            {listening ? "⏹" : "🎙"}
          </button>
          <button
            style={{ width: 38, height: 38, borderRadius: 9, border: "none", background: C.teal, color: "#fff", cursor: "pointer", fontSize: 17, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
            onClick={sendMessage} disabled={streaming}>→</button>
        </div>
      </div>
    );
  };

  // ─── RENDER: PROGRESS ─────────────────────────────────────────────────────
  const renderProgress = () => {
    if (!activeCase) return null;
    const proxy = PROXY_TESTS[activeCase.areaId];
    const readings = activeCase.proxyReadings;
    const hasReadings = readings.length > 0;
    const numVals = readings.map(r => parseFloat(r.value)).filter(v => !isNaN(v));
    const improving = numVals.length >= 2
      ? (proxy.lowerIsBetter ? numVals.at(-1) <= numVals[0] : numVals.at(-1) >= numVals[0])
      : null;

    return (
      <div style={{ padding: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <button style={{ ...S.btn("transparent", C.text1, C.border), padding: "6px 12px" }} onClick={() => setScreen("session")}>← Session</button>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.4px" }}>Progress</div>
            <div style={{ fontSize: 11, color: C.text2 }}>{activeCase.areaLabel} case</div>
          </div>
        </div>

        {/* Metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
          {[
            { val: activeCase.sessions.length, label: "Sessions" },
            { val: readings.length, label: "Benchmarks" },
            { val: activeCase.sessions.length > 0 ? `${Math.round(activeCase.sessions.reduce((a, s) => a + (s.duration || 0), 0) / 60)} min` : "—", label: "Total time" },
          ].map(({ val, label }) => (
            <div key={label} style={{ ...S.card(), textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.5px" }}>{val}</div>
              <div style={{ fontSize: 11, color: C.text2, marginTop: 3 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* No data state */}
        {!hasReadings && activeCase.sessions.length === 0 && (
          <div style={{ ...S.card(), textAlign: "center", padding: "28px 20px" }}>
            <div style={{ fontSize: 13, color: C.text2, lineHeight: 1.6, marginBottom: 16 }}>
              No data yet. Complete a session and take your first benchmark reading to start tracking.
            </div>
            <button style={{ ...S.btn(C.teal, "#fff"), fontSize: 13 }} onClick={() => setScreen("session")}>Go to session →</button>
          </div>
        )}

        {/* Insight card */}
        {numVals.length >= 3 && (
          <div style={{ background: C.tealBg, border: `1px solid ${C.tealDark}`, borderRadius: 12, padding: "14px 16px", marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.teal, marginBottom: 6 }}>↑ Something you might not have noticed</div>
            <div style={{ fontSize: 13, color: C.tealMid, lineHeight: 1.6 }}>
              {proxy.lowerIsBetter
                ? numVals.at(-1) < numVals[0]
                  ? `Your first reading was ${numVals[0]} ${proxy.unit}. Your most recent is ${numVals.at(-1)}. That's measurable improvement — even if it doesn't feel dramatic yet.`
                  : `There's been variation in your readings. That's expected with chronic conditions — the trend matters more than any single data point. Your floor is what we're watching.`
                : numVals.at(-1) > numVals[0]
                  ? `Your first reading was ${numVals[0]} ${proxy.unit}. Your most recent is ${numVals.at(-1)}. Real progress, regardless of how today felt.`
                  : `There's been variation in your readings. Non-linear progress is normal — we're watching the overall trend, not individual dips.`
              }
            </div>
          </div>
        )}

        {/* Chart */}
        {hasReadings && (
          <div style={{ ...S.card(), marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{proxy.name}</div>
            <div style={{ fontSize: 11, color: C.text2, marginBottom: 14 }}>{proxy.unit}</div>
            {readings.length === 1 ? (
              <div style={{ fontSize: 13, color: C.text2 }}>
                First reading: <strong style={{ color: C.text0 }}>{readings[0].value}</strong> · Complete another session to see your trend.
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 80 }}>
                {readings.slice(-10).map((r, i, arr) => {
                  const sliceVals = arr.map(x => parseFloat(x.value)).filter(v => !isNaN(v));
                  const mx = Math.max(...sliceVals), mn = Math.min(...sliceVals), rng = mx - mn || 1;
                  const v = parseFloat(r.value);
                  const h = isNaN(v) ? 20 : 8 + ((proxy.lowerIsBetter ? mx - v : v - mn) / rng) * 60;
                  return (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                      <div style={{ fontSize: 9, color: C.text2 }}>{r.value}</div>
                      <div style={{ width: "100%", height: Math.max(h, 6), background: C.teal, borderRadius: "3px 3px 0 0" }} />
                      <div style={{ fontSize: 9, color: C.text3 }}>{r.date.slice(0, 5)}</div>
                    </div>
                  );
                })}
              </div>
            )}
            <button style={{ ...S.btn("transparent", C.teal, C.tealDark), marginTop: 14, fontSize: 12, padding: "6px 14px" }}
              onClick={() => setScreen("proxy")}>+ New reading</button>
          </div>
        )}

        {/* Higher lows callout */}
        {numVals.length >= 4 && (() => {
          const firstHalf = numVals.slice(0, Math.floor(numVals.length / 2));
          const secondHalf = numVals.slice(Math.floor(numVals.length / 2));
          const worstFirst = proxy.lowerIsBetter ? Math.max(...firstHalf) : Math.min(...firstHalf);
          const worstRecent = proxy.lowerIsBetter ? Math.max(...secondHalf) : Math.min(...secondHalf);
          const floorRising = proxy.lowerIsBetter ? worstRecent < worstFirst : worstRecent > worstFirst;
          return floorRising ? (
            <div style={{ background: "#0A1A10", border: `1px solid #1E3328`, borderRadius: 10, padding: "12px 14px", marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: C.text2, marginBottom: 4 }}>Higher lows over time</div>
              <div style={{ fontSize: 13, color: C.tealMid, lineHeight: 1.6 }}>
                Your worst reading early on: <strong style={{ color: C.text0 }}>{worstFirst} {proxy.unit}</strong><br />
                Your worst reading recently: <strong style={{ color: C.teal }}>{worstRecent} {proxy.unit}</strong><br />
                <span style={{ fontSize: 12, color: C.text2 }}>Setbacks are getting shallower. This is what recovery looks like.</span>
              </div>
            </div>
          ) : null;
        })()}
      </div>
    );
  };

  // ─── RENDER: PROXY ─────────────────────────────────────────────────────────
  const renderProxy = () => {
    if (!activeCase) return null;
    const proxy = PROXY_TESTS[activeCase.areaId];
    const readings = activeCase.proxyReadings;
    return (
      <div style={{ padding: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <button style={{ ...S.btn("transparent", C.text1, C.border), padding: "6px 12px" }} onClick={() => setScreen("session")}>← Session</button>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.4px" }}>Benchmark</div>
            <div style={{ fontSize: 11, color: C.text2 }}>{proxy.name} · {activeCase.areaLabel}</div>
          </div>
        </div>

        {/* Instructions */}
        <div style={{ ...S.card(), marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.text0, marginBottom: 8 }}>Setup — do this the same way every time</div>
          <div style={{ fontSize: 13, color: C.text1, lineHeight: 1.7 }}>{proxy.instruction}</div>
        </div>

        {/* Previous readings */}
        {readings.length > 0 && (
          <div style={{ background: "#0A1A10", border: `1px solid #1E3328`, borderRadius: 10, padding: "12px 14px", marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: C.text2, marginBottom: 8 }}>Previous readings</div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: readings.length >= 2 ? 10 : 0 }}>
              {readings.slice(-5).map((r, i) => (
                <span key={i} style={{ fontSize: 12, color: C.tealMid }}>{r.date}: <strong style={{ color: C.text0 }}>{r.value}</strong></span>
              ))}
            </div>
            {readings.length >= 2 && <Sparkline data={readings} lowerIsBetter={proxy.lowerIsBetter} />}
          </div>
        )}

        {/* Entry */}
        <div style={{ fontSize: 12, color: C.text2, marginBottom: 8 }}>Enter your result <span style={{ color: C.text3 }}>({proxy.unit})</span></div>
        <input
          value={proxyEntry}
          onChange={e => setProxyEntry(e.target.value)}
          onKeyDown={e => e.key === "Enter" && logProxy()}
          placeholder={`e.g. 2`}
          style={{ width: "100%", background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 16px", color: C.text0, fontSize: 16, fontFamily: "inherit", outline: "none", marginBottom: 12 }}
        />
        <button style={{ ...S.btn(C.teal, "#fff"), width: "100%", padding: "13px", fontSize: 14, fontWeight: 600 }} onClick={logProxy}>
          Save reading
        </button>

        <div style={{ marginTop: 12, fontSize: 12, color: C.text2, lineHeight: 1.6, textAlign: "center" }}>
          Precision over accuracy — use the same protocol every time.<br />You are your own baseline.
        </div>
      </div>
    );
  };

  // ─── NAV ───────────────────────────────────────────────────────────────────
  const navItems = [
    { id: "home",     label: "Cases",    screens: ["home", "new-case"] },
    { id: "session",  label: "Session",  screens: ["session"] },
    { id: "progress", label: "Progress", screens: ["progress"] },
    { id: "proxy",    label: "Benchmark",screens: ["proxy"] },
  ];

  // ─── ROOT ──────────────────────────────────────────────────────────────────
  return (
    <div style={S.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        input[type=range]{-webkit-appearance:none;height:4px;border-radius:2px;background:#1E2530;outline:none}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:${C.teal};cursor:pointer}
        input::placeholder{color:#444}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#1E2530;border-radius:2px}
        @keyframes ptpulse{0%,100%{opacity:1}50%{opacity:0.4}}
      `}</style>

      {/* Header */}
      <div style={S.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={S.logoMark}>
            <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
              <path d="M9 2C9 2 5 6 5 10C5 12.2 6.8 14 9 14C11.2 14 13 12.2 13 10C13 6 9 2 9 2Z" fill="white" opacity="0.9"/>
              <path d="M9 14V16M7 16H11" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.text0 }}>Pain Pulse</div>
            <div style={{ fontSize: 10, color: C.text2 }}>movement & self-management</div>
          </div>
        </div>
        {consentGiven && (
        <div style={{ display: "flex", gap: 3 }}>
          {navItems.map(n => {
            const active = n.screens.includes(screen);
            const disabled = (n.id === "session" || n.id === "progress" || n.id === "proxy") && !activeCase;
            return (
              <button key={n.id}
                style={{ padding: "5px 10px", borderRadius: 7, border: "none", background: active ? C.bg2 : "transparent", color: active ? C.teal : disabled ? C.text3 : C.text2, fontSize: 12, cursor: disabled ? "default" : "pointer", fontFamily: "inherit", fontWeight: active ? 500 : 400 }}
                onClick={() => !disabled && setScreen(n.id === "home" ? "home" : n.id)}
                disabled={disabled}>
                {n.label}
              </button>
            );
          })}
        </div>
        )}
      </div>

      {/* Consent gate */}
      {!consentGiven ? (
        renderConsent()
      ) : (
      <div style={screen === "session" ? { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", maxWidth: 500, width: "100%", margin: "0 auto" } : S.body}>
        {screen === "home"      && renderHome()}
        {screen === "new-case"  && renderNewCase()}
        {screen === "session"   && renderSession()}
        {screen === "progress"  && renderProgress()}
        {screen === "proxy"     && renderProxy()}
      </div>
      )}
    </div>
  );
}
