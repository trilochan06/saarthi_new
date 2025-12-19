import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { speakText } from "@/lib/speak";

type BoardTile = {
  id: string;
  concept: string;
  label: string;
  image_url: string;
  tts_lang?: string;
};

type BoardResponse = {
  lang: string;
  size: number;
  cats: string[];
  seed: string;
  tiles: BoardTile[];
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const CATEGORY_OPTIONS = [
  { key: "core", label: "Core" },
  { key: "actions", label: "Actions" },
  { key: "feelings", label: "Feelings" },
  { key: "indian_food", label: "Indian Food" },
  { key: "places", label: "Places" },
  { key: "people", label: "People" },
];

export default function BoardGamePage() {
  const location = useLocation();
  const gameSummary = (location.state as any) || null;

  const [lang, setLang] = useState("en");
  const [seed, setSeed] = useState<"today" | "random">("today");
  const [size, setSize] = useState(25);

  const [selectedCats, setSelectedCats] = useState<string[]>([
    "core",
    "actions",
    "feelings",
    "indian_food",
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [board, setBoard] = useState<BoardResponse | null>(null);

  const catsQuery = useMemo(() => selectedCats.join(","), [selectedCats]);

  async function fetchBoard() {
    setLoading(true);
    setError(null);
    try {
      const url = `${API_URL}/aac/board?lang=${encodeURIComponent(
        lang
      )}&size=${size}&cats=${encodeURIComponent(catsQuery)}&seed=${seed}`;

      const res = await fetch(url);
      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(`Board API failed: ${res.status} ${msg}`);
      }
      const data = (await res.json()) as BoardResponse;
      setBoard(data);
    } catch (e: any) {
      setError(e?.message || "Failed to load board");
      setBoard(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBoard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleCategory(catKey: string) {
    setSelectedCats((prev) => {
      if (prev.includes(catKey)) return prev.filter((c) => c !== catKey);
      return [...prev, catKey];
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">🧩 Board Game</h1>
          <p className="text-muted-foreground">
            Tap a tile to hear it spoken. (Image above text)
          </p>
        </div>

        {/* Summary */}
        {gameSummary?.from === "color-matching" && (
          <div className="mt-4 rounded-2xl border bg-card p-4">
            <div className="text-sm text-muted-foreground">You completed</div>
            <div className="text-lg font-semibold">🎨 Color Matching</div>
            <div className="mt-2 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <div>
                <div className="text-muted-foreground">Score</div>
                <div className="font-semibold">{gameSummary.score}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Accuracy</div>
                <div className="font-semibold">{gameSummary.accuracy}%</div>
              </div>
              <div>
                <div className="text-muted-foreground">Mode</div>
                <div className="font-semibold">{gameSummary.mode}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Time</div>
                <div className="font-semibold">{gameSummary.seconds}s</div>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="mt-6 rounded-2xl border bg-card p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Language */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Lang</span>
              <select
                className="rounded-xl border bg-background px-3 py-2 text-sm"
                value={lang}
                onChange={(e) => setLang(e.target.value)}
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="ta">Tamil</option>
                <option value="te">Telugu</option>
                <option value="kn">Kannada</option>
                <option value="ml">Malayalam</option>
                <option value="mr">Marathi</option>
                <option value="bn">Bengali</option>
                <option value="gu">Gujarati</option>
                <option value="pa">Punjabi</option>
                <option value="ur">Urdu</option>
              </select>
            </div>

            {/* Size */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Tiles</span>
              <select
                className="rounded-xl border bg-background px-3 py-2 text-sm"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
              >
                <option value={12}>12</option>
                <option value={16}>16</option>
                <option value={20}>20</option>
                <option value={25}>25</option>
                <option value={30}>30</option>
              </select>
            </div>

            {/* Seed */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Board</span>
              <button
                className={`rounded-xl border px-3 py-2 text-sm ${
                  seed === "today" ? "bg-background" : ""
                }`}
                onClick={() => setSeed("today")}
              >
                Same Today
              </button>
              <button
                className={`rounded-xl border px-3 py-2 text-sm ${
                  seed === "random" ? "bg-background" : ""
                }`}
                onClick={() => setSeed("random")}
              >
                Random
              </button>
            </div>

            <div className="sm:ml-auto">
              <button
                onClick={fetchBoard}
                className="rounded-xl border px-4 py-2 text-sm hover:shadow-sm"
              >
                🔄 Refresh Board
              </button>
            </div>
          </div>

          {/* Categories */}
          <div className="mt-4 flex flex-wrap gap-2">
            {CATEGORY_OPTIONS.map((c) => {
              const active = selectedCats.includes(c.key);
              return (
                <button
                  key={c.key}
                  onClick={() => toggleCategory(c.key)}
                  className={`rounded-full border px-4 py-2 text-sm ${
                    active ? "bg-foreground text-background" : "bg-background"
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>

          <div className="mt-3">
            <button
              onClick={fetchBoard}
              className="rounded-xl bg-foreground px-4 py-2 text-sm font-semibold text-background"
            >
              Apply & Load Tiles
            </button>
          </div>
        </div>

        {/* Board */}
        <div className="mt-6">
          {loading && (
            <div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
              Loading board…
            </div>
          )}

          {error && (
            <div className="rounded-2xl border bg-card p-6">
              <div className="text-sm font-semibold text-red-600">
                Failed to load board
              </div>
              <div className="mt-2 text-sm text-muted-foreground">{error}</div>
            </div>
          )}

          {!loading && !error && board?.tiles?.length && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {board.tiles.map((tile) => (
                <TileCard key={tile.id} tile={tile} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TileCard({ tile }: { tile: BoardTile }) {
  const [imgError, setImgError] = useState(false);

  return (
    <button
      type="button"
      className="rounded-2xl border bg-card p-3 text-center shadow-sm transition hover:shadow-md active:scale-95"
      onClick={() => speakText(tile.label, tile.tts_lang || "en")}
    >
      {/* IMAGE ABOVE TEXT */}
      <div className="flex items-center justify-center">
        {!imgError && tile.image_url ? (
          <img
            src={tile.image_url}
            alt={tile.label}
            className="h-20 w-20 rounded-xl object-contain"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-xl border text-xs text-muted-foreground">
            No Image
          </div>
        )}
      </div>

      {/* TEXT BELOW */}
      <div className="mt-2 text-sm font-semibold">{tile.label}</div>
    </button>
  );
}
