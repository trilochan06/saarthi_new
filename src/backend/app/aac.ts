export type AACTile = {
  id: string;
  concept: string;
  label: string;
  image_url: string;
  tts_lang: string;
};

export type AACBoardResponse = {
  lang: string;
  size: number;
  cats: string[];
  seed: string;
  tiles: AACTile[];
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export async function fetchAacCategories(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/aac/categories`);
  if (!res.ok) throw new Error("Failed to fetch categories");
  const data = await res.json();
  return data.categories || [];
}

export async function fetchAacBoard(params: {
  lang: string;
  size?: number;
  cats: string[];
  seed: string;
}): Promise<AACBoardResponse> {
  const { lang, size = 25, cats, seed } = params;

  const url = new URL(`${API_BASE}/aac/board`);
  url.searchParams.set("lang", lang);
  url.searchParams.set("size", String(size));
  url.searchParams.set("cats", cats.join(","));
  url.searchParams.set("seed", seed);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to fetch board");
  return await res.json();
}
