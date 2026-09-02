export type LearningMode = 'reading' | 'retelling' | 'cloze' | 'listening' | 'skeleton';

export interface ModeConfig {
  showFurigana: boolean;
  showJapanese: boolean;
  showTranslation: boolean;
  interactive: boolean;
}

export const modeConfigs: Record<LearningMode, ModeConfig> = {
  reading: { showFurigana: true, showJapanese: true, showTranslation: true, interactive: true },
  retelling: { showFurigana: false, showJapanese: false, showTranslation: true, interactive: false },
  cloze: { showFurigana: false, showJapanese: true, showTranslation: true, interactive: true },
  listening: { showFurigana: false, showJapanese: false, showTranslation: true, interactive: false },
  skeleton: { showFurigana: false, showJapanese: true, showTranslation: true, interactive: true },
};
