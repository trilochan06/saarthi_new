import React, { useEffect, useMemo, useState } from "react";
import { fetchAacBoard, fetchAacCategories, AACTile } from "../api/aac";

// ✅ Report modal + PDF export component (make sure you created this file)
import ActivityReport, { ActivityReportData } from "@/components/reports/ActivityReport";

const DEFAULT_SELECTED = ["core", "indian_food", "actions", "feelings"];
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

type BoardMode = "today" | "random" | "stable";

function makeStableSeed() {
  const existing = sessionStorage.getItem("aac_seed");
  if (existing) return existing;
  const seed = crypto.randomUUID();
  sessionStorage.setItem("aac_seed", seed);
  return seed;
}

async function speakText(text: string, lang: string) {
  const res = await fetch(`${API_BASE}/i18n/tts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, lang }),
  });

  if (!res.ok) throw new Error("TTS failed");

  const buffer = await res.arrayBuffer();
  const audioBlob = new Blob([buffer], { type: "audio/mpeg" });
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);
  await audio.play();
}

function mapUiLangToTts(lang: string) {
  // backend expects hi-IN, ta-IN, en-IN etc
  if (lang === "hi") return "hi-IN";
  if (lang === "ta") return "ta-IN";
  if (lang === "kn") return "kn-IN";
  if (lang === "ml") return "ml-IN";
  if (lang === "te") return "te-IN";
  if (lang === "mr") return "mr-IN";
  if (lang === "bn") return "bn-IN";
  if (lang === "gu") return "gu-IN";
  if (lang === "pa") return "pa-IN";
  if (lang === "ur") return "ur-IN";
  return "en-IN";
}

export default function PreviewActivity() {
  // Language
  const [lang, setLang] = useState("hi");

  // Categories + selection (chips)
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCats, setSelectedCats] = useState<string[]>(DEFAULT_SELECTED);

  // Board mode (daily/same/refresh)
  const [mode, setMode] = useState<BoardMode>("today");
  const stableSeed = useMemo(() => makeStableSeed(), []);

  const seed = useMemo(() => {
    if (mode === "today") return "today";
    if (mode === "random") return "random";
    return stableSeed; // stable per browser session
  }, [mode, stableSeed]);

  // AAC tiles
  const [tiles, setTiles] = useState<AACTile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sentence builder
  const [sentence, setSentence] = useState<string[]>([]);
  const sentenceText = useMemo(() => sentence.join(" "), [sentence]);

  // ✅ Simple “activity metrics” we can use for report
  const [startAtMs] = useState(() => Date.now());
  const [taps, setTaps] = useState(0);

  // ✅ Report Modal states
  const [showReport, setShowReport] = useState(false);
  const [reportData, setReportData] = useState<ActivityReportData | null>(null);

  function addWordToSentence(word: string) {
    setSentence((prev) => [...prev, word]);
    setTaps((prev) => prev + 1);
  }

  function removeLastWord() {
    setSentence((prev) => prev.slice(0, -1));
  }

  function clearSentence() {
    setSentence([]);
  }

  async function speakSentence() {
    if (sentence.length === 0) return;
    const ttsLang = mapUiLangToTts(lang);

    try {
      await speakText(sentenceText, ttsLang);
    } catch (e) {
      console.error(e);
      alert("Speech failed. Check Google credentials / TTS API.");
    }
  }

  function toggleCat(cat: string) {
    setSelectedCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  // Load categories once
  useEffect(() => {
    fetchAacCategories()
      .then((cats) => setCategories(cats))
      .catch(() => setCategories([]));
  }, []);

  // Load board whenever cats/lang/mode changes
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchAacBoard({
      lang,
      size: 25,
      cats: selectedCats.length ? selectedCats : ["core"],
      seed,
    })
      .then((data) => {
        if (!cancelled) setTiles(data.tiles || []);
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message || "Failed to load board");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [lang, selectedCats, seed]);

  // ✅ Complete Activity => open report modal (with graphs + export pdf)
  function completeActivity() {
    const timeSeconds = Math.max(1, Math.round((Date.now() - startAtMs) / 1000));

    // Fake “accuracy/score” for now (you can replace later with real game scoring)
    // Here: more words/taps + shorter time => better score
    const rawScore = Math.min(100, Math.round((sentence.length * 12 + taps * 2) - timeSeconds));
    const score = Math.max(10, rawScore);

    const accuracy = Math.min(100, Math.max(40, Math.round((sentence.length / Math.max(1, taps)) * 100)));

    const attempts = taps;
    const correct = Math.max(0, Math.round((accuracy / 100) * attempts));
    const wrong = Math.max(0, attempts - correct);

    const data: ActivityReportData = {
      childName: "Child", // TODO: replace with real name from store
      activityName: "AAC Preview / Sentence Builder",
      activityId: "preview-activity",
      completedAtISO: new Date().toISOString(),

      score,
      accuracy,
      timeSeconds,

      attempts,
      correct,
      wrong,

      // ✅ Graph 1: radar “skill areas”
      skillBreakdown: [
        { skill: "Attention", score: Math.min(100, accuracy + 5) },
        { skill: "Language", score: Math.min(100, score) },
        { skill: "Speed", score: Math.min(100, Math.max(10, 100 - timeSeconds)) },
        { skill: "Consistency", score: Math.min(100, 70 + Math.round(sentence.length * 2)) },
        { skill: "Control", score: Math.min(100, 65 + Math.round(accuracy / 5)) },
      ],

      // ✅ Graph 2: trend line (demo trend, last point = today score)
      weeklyTrend: [
        { label: "S1", value: 52 },
        { label: "S2", value: 60 },
        { label: "S3", value: 66 },
        { label: "S4", value: score },
      ],

      clinicianNotes:
        "Good attempt. Next: encourage longer phrases (3–5 words) and reduce prompt support gradually.",
    };

    setReportData(data);
    setShowReport(true);
  }

  return (
    <div className="p-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <div className="text-xl font-semibold">Activity Preview</div>
          <div className="text-sm opacity-70">Tap tiles to build a sentence • Right-click to speak a single word</div>
        </div>

        {/* ✅ Complete activity */}
        <button
          onClick={completeActivity}
          className="px-4 py-2 rounded-xl bg-black text-white font-semibold"
        >
          ✅ Complete Activity
        </button>
      </div>

      {/* (Optional) Language quick toggle for testing */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm opacity-70">Lang:</span>
        <button className="px-3 py-1.5 rounded-lg border text-sm" onClick={() => setLang("en")}>
          EN
        </button>
        <button className="px-3 py-1.5 rounded-lg border text-sm" onClick={() => setLang("hi")}>
          HI
        </button>
        <button className="px-3 py-1.5 rounded-lg border text-sm" onClick={() => setLang("ta")}>
          TA
        </button>
        <button className="px-3 py-1.5 rounded-lg border text-sm" onClick={() => setLang("ml")}>
          ML
        </button>
      </div>

      {/* Sentence Builder */}
      <div className="mb-4 p-3 border rounded-xl bg-white">
        <div className="flex flex-wrap gap-2 min-h-[40px] mb-3">
          {sentence.length === 0 && (
            <span className="text-gray-400 text-sm">Tap words to build a sentence…</span>
          )}

          {sentence.map((word, idx) => (
            <span key={idx} className="px-3 py-1 bg-blue-100 rounded-full text-sm">
              {word}
            </span>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap">
          <button onClick={speakSentence} className="px-4 py-2 rounded-lg border font-semibold">
            🔊 Speak
          </button>

          <button
            onClick={removeLastWord}
            className="px-4 py-2 rounded-lg border"
            disabled={sentence.length === 0}
          >
            ⌫ Backspace
          </button>

          <button
            onClick={clearSentence}
            className="px-4 py-2 rounded-lg border"
            disabled={sentence.length === 0}
          >
            ❌ Clear
          </button>
        </div>
      </div>

      {/* Mode Buttons */}
      <div className="flex gap-2 mb-3 flex-wrap">
        <button
          className={`px-3 py-2 rounded-xl border ${mode === "today" ? "font-semibold" : ""}`}
          onClick={() => setMode("today")}
        >
          Daily Board
        </button>

        <button
          className={`px-3 py-2 rounded-xl border ${mode === "stable" ? "font-semibold" : ""}`}
          onClick={() => setMode("stable")}
        >
          Same Board
        </button>

        <button className="px-3 py-2 rounded-xl border" onClick={() => setMode("random")}>
          Refresh
        </button>
      </div>

      {/* Category Chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        {(categories.length ? categories : DEFAULT_SELECTED).map((cat) => {
          const active = selectedCats.includes(cat);
          return (
            <button
              key={cat}
              onClick={() => toggleCat(cat)}
              className={`px-3 py-1.5 rounded-full border text-sm ${
                active ? "font-semibold bg-black text-white" : ""
              }`}
              title={cat}
            >
              {cat.replaceAll("_", " ")}
            </button>
          );
        })}
      </div>

      {/* Loading / Error */}
      {loading && <div className="text-sm opacity-70 mb-2">Loading…</div>}
      {error && <div className="text-sm text-red-600 mb-2">{error}</div>}

      {/* AAC Grid (5x5) */}
      <div className="grid grid-cols-5 gap-3">
        {tiles.map((t) => (
          <button
            key={t.id}
            className="rounded-2xl border p-2 flex flex-col items-center justify-center bg-white active:scale-[0.99]"
            onClick={() => addWordToSentence(t.label)}
            onContextMenu={(e) => {
              e.preventDefault();
              speakText(t.label, t.tts_lang).catch(() => {});
            }}
            title={t.concept}
          >
            <img
              src={t.image_url}
              alt={t.label}
              className="w-14 h-14 object-contain mb-2"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://via.placeholder.com/64?text=AAC";
              }}
            />
            <div className="text-xs text-center leading-tight">{t.label}</div>
          </button>
        ))}
      </div>

      {/* ✅ Report Modal */}
      {showReport && reportData && (
        <ActivityReport
          data={reportData}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
}
