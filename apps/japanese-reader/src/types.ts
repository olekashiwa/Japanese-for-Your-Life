export type PartOfSpeech =
  | 'noun'
  | 'verb'
  | 'adjective'
  | 'particle'
  | 'auxiliary'
  | 'symbol'
  | 'other';

export interface Token {
  id: string;
  surface: string;
  reading?: string;
  pos: PartOfSpeech;
  isParticle: boolean;
}
