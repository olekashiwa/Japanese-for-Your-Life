import type { TextToken } from "../../models/text";
import { tokenizeText as fallback } from "./simpleTokenizer";

const API_URLS = [
  "http://localhost:3000/analyze",
  "https://japanese-reader-api.onrender.com/analyze"
];

function mapPos(p: string) {
  const m: Record<string, string> = {
    particle: "particle", noun: "noun", verb: "verb",
    auxiliary: "auxiliary", adjective: "adjective",
    adverb: "adverb", symbol: "symbol"
  };
  return m[p] || "other";
}

function isVerbPos(p: string) {
  return p === "verb" || p === "auxiliary";
}

function merge(tokens: any[]) {
  const aux = ["て","で","た","だ","ます","ません","ました","ない","なかった","う","よう","いけ","ませ","ん","ては","では","たり","だり","ても","でも","てい","でい","ちゃ","でちゃ","とも","ば","たら","なら"];
  const r: any[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const c: any = Object.assign({}, tokens[i]);
    let mergedTe = false;
    if (isVerbPos(c.pos)) {
      while (i + 1 < tokens.length) {
        const n = tokens[i + 1];
        if (aux.includes(n.surface)) {
          c.surface += n.surface;
          c.reading = (c.reading || "") + (n.reading || "");
          if (n.surface === "て" || n.surface === "で" || n.surface === "ては" || n.surface === "では") mergedTe = true;
          i++;
        } else if (mergedTe && isVerbPos(n.pos)) {
          c.surface += n.surface;
          c.reading = (c.reading || "") + (n.reading || "");
          i++;
        } else break;
      }
    }
    const mappedPos = isVerbPos(c.pos) ? "verb" : mapPos(c.pos);
    r.push({
      id: String(r.length),
      surface: c.surface,
      reading: c.reading || undefined,
      pos: mappedPos,
      isParticle: mappedPos === "particle"
    });
  }
  return r;
}

export async function analyzeText(text: string): Promise<TextToken[]> {
  try {
    let res: Response | null = null;
    for (const url of API_URLS) {
      try {
        res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });
    if (!res.ok) throw new Error("api " + res.status);
    const raw = await res.json();
    const result = merge(raw);
    console.log("tokens:", result.length, result.map(t => t.surface));
    return result;
  } catch (e) {
    console.warn("[analyzer] fallback tokenizer", e);
    return fallback(text);
  }
}
