// @ts-nocheck
import kuromoji from "kuromoji/build/kuromoji.js";

let tokenizer: any = null;

self.onmessage = (e: any) => {
  const { type, text, dicPath } = e.data;
  if (type === "INIT") {
    try {
      kuromoji.builder({ dicPath }).build((err: any, tk: any) => {
        if (err) self.postMessage({ type: "INIT_ERROR", error: String(err) });
        else { tokenizer = tk; self.postMessage({ type: "INIT_SUCCESS" }); }
      });
    } catch (err) { self.postMessage({ type: "INIT_ERROR", error: String(err) }); }
  }
  if (type === "TOKENIZE") {
    if (!tokenizer) { self.postMessage({ type: "TOKENIZE_ERROR" }); return; }
    self.postMessage({ type: "TOKENIZE_RESULT", tokens: merge(tokenizer.tokenize(text || "")) });
  }
};

function mapPos(p: string) {
  if (p === "助詞") return "particle";
  if (p === "名詞") return "noun";
  if (p === "動詞") return "verb";
  if (p === "助動詞") return "auxiliary";
  if (p === "形容詞") return "adjective";
  if (p === "副詞") return "adverb";
  return "other";
}

function merge(tokens: any[]) {
  const aux = ["て","で","た","だ","ます","ません","ました","ない","なかった","う","よう","いけ","ませ","ん","ては","では","たり","だり","ても","でも","てい","でい","ちゃ","でちゃ","とも","でとも","ながら","ば","たら","なら"];
  const r: any[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const c: any = Object.assign({}, tokens[i]);
    const isVerb = c.pos === "動詞" || c.pos === "助動詞";
    let mergedTe = false;
    if (isVerb) {
      while (i + 1 < tokens.length) {
        const n = tokens[i + 1];
        const nIsVerb = n.pos === "動詞" || n.pos === "助動詞";
        if (aux.includes(n.surface)) {
          c.surface += n.surface;
          c.reading = (c.reading || "") + (n.reading || "");
          if (n.surface === "て" || n.surface === "で" || n.surface === "ては" || n.surface === "では") mergedTe = true;
          i++;
        } else if (mergedTe && nIsVerb) {
          c.surface += n.surface;
          c.reading = (c.reading || "") + (n.reading || "");
          i++;
        } else break;
      }
    }
    r.push({ id: String(r.length), surface: c.surface, reading: c.reading || undefined, pos: isVerb ? "verb" : mapPos(c.pos), isParticle: !isVerb && mapPos(c.pos) === "particle" });
  }
  return r;
}
