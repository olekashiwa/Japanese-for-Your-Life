export type PartOfSpeech =
  | 'noun'
  | 'verb'
  | 'adjective'
  | 'particle'
  | 'auxiliary'
  | 'symbol'
  | 'adverb'
  | 'pronoun'
  | 'other';

export interface Token {
  id: string;
  surface: string;
  reading?: string;
  pos: PartOfSpeech;
  isParticle: boolean;
}

export interface LearningText {
  id: string;
  japanese: string;
  russian: string;
  createdAt: string;
  updatedAt: string;
}
