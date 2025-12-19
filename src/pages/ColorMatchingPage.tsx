import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";


const BOARD_GAME_ROUTE = "/board-game"; // 👈 change if your board game route is different

type Mode = "tap" | "drag";

type ColorKey =
  | "red"
  | "blue"
  | "green"
  | "yellow"
  | "orange"
  | "purple"
  | "pink"
  | "brown";

type ColorDef = {
  key: ColorKey;
  label: string;
  hex: string;
};

const COLOR_BANK: ColorDef[] = [
  { key: "red", label: "Red", hex: "#ef4444" },
  { key: "blue", label: "Blue", hex: "#3b82f6" },
  { key: "green", label: "Green", hex: "#22c55e" },
  { key: "yellow", label: "Yellow", hex: "#eab308" },
  { key: "orange", label: "Orange", hex: "#f97316" },
  { key: "purple", label: "Purple", hex: "#a855f7" },
  { key: "pink", label: "Pink", hex: "#ec4899" },
  { key: "brown", label: "Brown", hex: "#8b5e34" },
];

type Round = {
  id: string;
  target: ColorDef; // the correct answer for this round
  options: ColorDef[]; // selectable/draggable options
};

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickDistinctColors(count: number): ColorDef[] {
  return shuffle(COLOR_BANK).slice(0, Math.min(count, COLOR_BANK.length));
}

function makeRounds(levelCount: number, optionCount: number): Round[] {
  const base = pickDistinctColors(Math.max(levelCount, optionCount));
  const targets = shuffle(base).slice(0, levelCount);

  return targets.map((t, idx) => {
    const others = shuffle(base.filter((c) => c.key !== t.key)).slice(
      0,
      Math.max(0, optionCount - 1)
    );
    const options = shuffle([t, ...others]);
    return {
      id: `round_${idx}_${t.key}`,
      target: t,
      options,
    };
  });
}

function useLocalStorageState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return initial;
      return JSON.parse(raw) as T;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);

  return [value, setValue] as const;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function gentleBeep(kind: "good" | "bad") {
  // tiny feedback sound without assets (safe to fail silently)
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    o.type = "sine";
    o.frequency.value = kind === "good" ? 740 : 220;
    g.gain.value = 0.0001;
    o.start();

    const now = ctx.currentTime;
    g.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    o.stop(now + 0.2);

    setTimeout(() => ctx.close().catch(() => {}), 350);
  } catch {}
}

export default function ColorMatchingPage() {
  const navigate = useNavigate();

  // ---- Settings (adjust anytime) ----
  const LEVELS = 8; // total rounds
  const OPTIONS_PER_ROUND = 4; // how many colors shown each round
  const AUTO_NEXT_MS = 650;

  // ---- UI/State ----
  const [mode, setMode] = useLocalStorageState<Mode>("cm_mode", "tap");
  const [difficulty, setDifficulty] = useLocalStorageState<"easy" | "med" | "hard">(
    "cm_diff",
    "easy"
  );

  const levelCount = useMemo(() => {
    if (difficulty === "easy") return 6;
    if (difficulty === "med") return 8;
    return 10;
  }, [difficulty]);

  const optionCount = useMemo(() => {
    if (difficulty === "easy") return 3;
    if (difficulty === "med") return 4;
    return 5;
  }, [difficulty]);

  const [countdown, setCountdown] = useState(3);
  const [started, setStarted] = useState(false);

  const [rounds, setRounds] = useState<Round[]>(() => makeRounds(levelCount, optionCount));
  const [idx, setIdx] = useState(0);

  const current = rounds[idx];

  const [selectedTap, setSelectedTap] = useState<ColorDef | null>(null);
  const [feedback, setFeedback] = useState<null | "good" | "bad">(null);
  const [shake, setShake] = useState(false);

  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [streak, setStreak] = useState(0);

  const startTimeRef = useRef<number | null>(null);

  const progress = useMemo(() => {
    return Math.round(((idx) / rounds.length) * 100);
  }, [idx, rounds.length]);

  const isLast = idx >= rounds.length - 1;

  // ---- Countdown flow ----
  useEffect(() => {
    setStarted(false);
    setCountdown(3);
    const t = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(t);
          setStarted(true);
          startTimeRef.current = Date.now();
          return 0;
        }
        return c - 1;
      });
    }, 800);

    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  // ---- Helpers ----
  function resetGame() {
    setRounds(makeRounds(levelCount, optionCount));
    setIdx(0);
    setSelectedTap(null);
    setFeedback(null);
    setShake(false);
    setCorrect(0);
    setWrong(0);
    setStreak(0);

    setStarted(false);
    setCountdown(3);
    const t = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(t);
          setStarted(true);
          startTimeRef.current = Date.now();
          return 0;
        }
        return c - 1;
      });
    }, 800);
  }

  function nextRoundOrFinish() {
    setSelectedTap(null);
    setFeedback(null);

    if (isLast) {
      const endTime = Date.now();
      const start = startTimeRef.current ?? endTime;
      const seconds = Math.max(1, Math.round((endTime - start) / 1000));

      const accuracy = correct + wrong === 0 ? 0 : Math.round((correct / (correct + wrong)) * 100);
      // Smooth celebration moment then navigate
      setTimeout(() => {
        navigate(BOARD_GAME_ROUTE, {
          state: {
            from: "color-matching",
            score: correct * 10 - wrong * 2,
            correct,
            wrong,
            accuracy,
            seconds,
            difficulty,
            mode,
          },
        });
      }, 900);
      return;
    }

    setIdx((p) => p + 1);
  }

  function markGood() {
    gentleBeep("good");
    setFeedback("good");
    setCorrect((c) => c + 1);
    setStreak((s) => s + 1);
    setTimeout(nextRoundOrFinish, AUTO_NEXT_MS);
  }

  function markBad() {
    gentleBeep("bad");
    setFeedback("bad");
    setWrong((w) => w + 1);
    setStreak(0);
    setShake(true);
    setTimeout(() => setShake(false), 320);
    // don’t auto-next; let user try again
  }

  // ---- Tap mode logic ----
  function onTapOption(color: ColorDef) {
    if (!started) return;
    setSelectedTap(color);

    if (color.key === current.target.key) {
      markGood();
    } else {
      markBad();
    }
  }

  // ---- Drag mode logic ----
  function onDragStart(e: React.DragEvent, color: ColorDef) {
    if (!started) return;
    e.dataTransfer.setData("text/plain", color.key);
    e.dataTransfer.effectAllowed = "move";
  }

  function onDropTarget(e: React.DragEvent) {
    e.preventDefault();
    if (!started) return;

    const droppedKey = e.dataTransfer.getData("text/plain") as ColorKey;
    if (!droppedKey) return;

    const dropped = current.options.find((o) => o.key === droppedKey);
    if (!dropped) return;

    if (dropped.key === current.target.key) {
      markGood();
    } else {
      markBad();
    }
  }

  function onDragOverTarget(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  // ---- Difficulty change should regenerate rounds cleanly ----
  useEffect(() => {
    // regenerate only if game not started or user explicitly changes
    setRounds(makeRounds(levelCount, optionCount));
    setIdx(0);
    setSelectedTap(null);
    setFeedback(null);
    setShake(false);
    setCorrect(0);
    setWrong(0);
    setStreak(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelCount, optionCount]);

  // ---- UI ----
  const headerTitle = "Color Matching";
  const subTitle =
    mode === "tap" ? "Tap the correct color" : "Drag the color into the box";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-3xl mx-auto p-4 sm:p-6">
        {/* Top Bar */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold">{headerTitle}</h1>
            <p className="text-sm opacity-70">{subTitle}</p>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="px-3 py-2 rounded-xl border bg-white hover:bg-slate-50"
          >
            Back
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="flex rounded-xl border bg-white overflow-hidden">
            <button
              className={`px-4 py-2 text-sm ${
                mode === "tap" ? "font-semibold bg-slate-50" : ""
              }`}
              onClick={() => setMode("tap")}
            >
              Tap
            </button>
            <button
              className={`px-4 py-2 text-sm border-l ${
                mode === "drag" ? "font-semibold bg-slate-50" : ""
              }`}
              onClick={() => setMode("drag")}
            >
              Drag
            </button>
          </div>

          <div className="flex rounded-xl border bg-white overflow-hidden">
            <button
              className={`px-4 py-2 text-sm ${
                difficulty === "easy" ? "font-semibold bg-slate-50" : ""
              }`}
              onClick={() => setDifficulty("easy")}
            >
              Easy
            </button>
            <button
              className={`px-4 py-2 text-sm border-l ${
                difficulty === "med" ? "font-semibold bg-slate-50" : ""
              }`}
              onClick={() => setDifficulty("med")}
            >
              Medium
            </button>
            <button
              className={`px-4 py-2 text-sm border-l ${
                difficulty === "hard" ? "font-semibold bg-slate-50" : ""
              }`}
              onClick={() => setDifficulty("hard")}
            >
              Hard
            </button>
          </div>

          <button
            onClick={resetGame}
            className="px-4 py-2 rounded-xl border bg-white hover:bg-slate-50 text-sm"
          >
            Restart
          </button>

          <div className="ml-auto flex items-center gap-3">
            <div className="text-sm">
              <span className="opacity-70">Streak:</span>{" "}
              <span className="font-semibold">{streak}</span>
            </div>
            <div className="text-sm">
              <span className="opacity-70">Score:</span>{" "}
              <span className="font-semibold">{correct * 10 - wrong * 2}</span>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="opacity-70">
              Level {idx + 1} / {rounds.length}
            </span>
            <span className="opacity-70">{progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%`, background: "#0ea5e9" }}
            />
          </div>
        </div>

        {/* Countdown Overlay */}
        {!started && (
          <div className="relative mb-6">
            <div className="p-6 sm:p-10 rounded-3xl border bg-white text-center">
              <div className="text-sm opacity-70 mb-2">Get ready…</div>
              <div className="text-5xl sm:text-6xl font-bold">
                {countdown === 0 ? "GO!" : countdown}
              </div>
              <div className="text-sm opacity-70 mt-3">
                {mode === "tap" ? "Tap the correct color" : "Drag the color into the box"}
              </div>
            </div>
          </div>
        )}

        {/* Game Card */}
        {started && current && (
          <div
            className={`p-5 sm:p-7 rounded-3xl border bg-white shadow-sm transition-transform duration-300 ${
              shake ? "animate-[shake_.3s_ease-in-out]" : ""
            }`}
          >
            {/* Target area */}
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <div className="text-sm opacity-70 mb-1">Match this</div>
                <div className="text-lg font-semibold">{current.target.label}</div>
              </div>

              {/* Target box */}
              <div
                className={`w-28 h-28 sm:w-32 sm:h-32 rounded-3xl border-2 flex items-center justify-center transition-all duration-300 ${
                  feedback === "good"
                    ? "border-green-500 scale-[1.02]"
                    : feedback === "bad"
                    ? "border-red-500"
                    : "border-slate-200"
                }`}
                onDrop={mode === "drag" ? onDropTarget : undefined}
                onDragOver={mode === "drag" ? onDragOverTarget : undefined}
                style={{
                  background:
                    mode === "drag"
                      ? "linear-gradient(180deg, rgba(15,23,42,0.04), rgba(15,23,42,0.02))"
                      : "transparent",
                }}
              >
                {/* inner color indicator */}
                <div
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl"
                  style={{ background: current.target.hex }}
                  aria-label={`Target color: ${current.target.label}`}
                />
              </div>
            </div>

            {/* Instructions */}
            <div className="text-sm opacity-70 mb-4">
              {mode === "tap"
                ? "Tap the color that matches the box."
                : "Drag a color tile and drop it into the box."}
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {current.options.map((c) => {
                const activeTap = mode === "tap" && selectedTap?.key === c.key;
                return (
                  <button
                    key={c.key}
                    className={`rounded-2xl border p-3 flex items-center gap-3 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] ${
                      activeTap ? "ring-2 ring-sky-400" : ""
                    } ${
                      feedback === "good" && c.key === current.target.key
                        ? "border-green-500"
                        : feedback === "bad" && activeTap
                        ? "border-red-500"
                        : "border-slate-200"
                    }`}
                    onClick={() => (mode === "tap" ? onTapOption(c) : undefined)}
                    draggable={mode === "drag"}
                    onDragStart={(e) => (mode === "drag" ? onDragStart(e, c) : undefined)}
                    style={{ background: "white" }}
                  >
                    <span
                      className="w-10 h-10 rounded-xl border"
                      style={{ background: c.hex, borderColor: "rgba(15,23,42,0.12)" }}
                    />
                    <div className="text-left">
                      <div className="text-sm font-semibold">{c.label}</div>
                      <div className="text-xs opacity-60">
                        {mode === "tap" ? "Tap" : "Drag"}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Feedback */}
            <div className="mt-5 min-h-[28px]">
              {feedback === "good" && (
                <div className="text-green-600 font-semibold">✅ Correct! Great job!</div>
              )}
              {feedback === "bad" && (
                <div className="text-red-600 font-semibold">❌ Try again!</div>
              )}
            </div>

            {/* Hint */}
            {mode === "drag" && (
              <div className="mt-2 text-xs opacity-60">
                Tip: Drop the tile inside the big box.
              </div>
            )}
          </div>
        )}

        {/* Tiny keyframes (shake) */}
        <style>{`
          @keyframes shake {
            0% { transform: translateX(0px); }
            25% { transform: translateX(-6px); }
            50% { transform: translateX(6px); }
            75% { transform: translateX(-4px); }
            100% { transform: translateX(0px); }
          }
        `}</style>
      </div>
    </div>
  );
}
