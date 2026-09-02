import type { Token, PartOfSpeech } from '../../models/text';
// @ts-ignore
import * as kuromoji from 'kuromoji';

let tokenizer: any = null;
let isInitializing = false;

export function mapPartOfSpeech(pos: string): PartOfSpeech {
  if (pos === '助詞') return 'particle';
  if (pos === '名詞') return 'noun';
  if (pos === '動詞') return 'verb';
  if (pos === '形容詞') return 'adjective';
  if (pos === '助動詞') return 'auxiliary';
  if (pos === '副詞') return 'adverb';
  if (pos === '代名詞') return 'pronoun';
  return 'other';
}

const initTokenizer = (): Promise<any> => {
  if (tokenizer) {
    return Promise.resolve(tokenizer);
  }
  
  if (isInitializing) {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (tokenizer) {
          clearInterval(interval);
          resolve(tokenizer);
        }
      }, 100);
    });
  }

  isInitializing = true;
  
  return new Promise((resolve, reject) => {
    kuromoji.builder({ dicPath: '/dict' }).build((err: any, _tokenizer: any) => {
      if (err) {
        console.error('Kuromoji error:', err);
        isInitializing = false;
        reject(err);
      } else {
        console.log('✅ Kuromoji initialized!');
        tokenizer = _tokenizer;
        isInitializing = false;
        resolve(_tokenizer);
      }
    });
  });
};

export async function analyzeText(text: string): Promise<Token[]> {
  const tok = await initTokenizer();
  const result = tok.tokenize(text);
  
  return result.map((t: any, index: number) => ({
    id: `${index}`,
    surface: t.surface_form,
    reading: t.reading || undefined,
    pos: mapPartOfSpeech(t.pos),
    isParticle: t.pos === '助詞',
  }));
}
