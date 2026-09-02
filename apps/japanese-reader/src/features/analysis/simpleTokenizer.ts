import type { Token, PartOfSpeech } from '../../models/text';
// @ts-ignore
import TinySegmenter from 'tiny-segmenter';

const segmenter = new TinySegmenter();

const PARTICLES = new Set([
  'は', 'が', 'を', 'に', 'で', 'も', 'へ', 'と', 'から', 'まで', 'より',
  'の', 'や', 'か', 'ね', 'よ', 'な', 'わ', 'ぜ', 'ぞ', 'さ'
]);

function guessPartOfSpeech(token: string): PartOfSpeech {
  if (PARTICLES.has(token)) return 'particle';
  if (token.endsWith('ます') || token.endsWith('です') || token.endsWith('た')) return 'verb';
  if (token.endsWith('い') && token.length > 1) return 'adjective';
  if (/[\u4E00-\u9FFF]/.test(token)) return 'noun';
  return 'other';
}

export function tokenizeText(text: string): Token[] {
  const segments = segmenter.segment(text);
  
  return segments.map((segment: string, index: number) => ({
    id: `${index}`,
    surface: segment,
    reading: undefined,
    pos: guessPartOfSpeech(segment),
    isParticle: PARTICLES.has(segment),
  }));
}
