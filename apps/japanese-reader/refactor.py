import os
import shutil

base = 'src'

# 1. Создаем новую структуру папок
folders = [
    'app',
    'components/TextEditor',
    'components/SentencePair',
    'components/JapaneseSentence',
    'components/Token',
    'components/WordPopover',
    'components/ModeSwitcher',
    'components/AudioButton',
    'features/analysis',
    'features/dictionary',
    'features/learning',
    'features/storage',
    'models',
    'store',
    'styles',
]

for folder in folders:
    os.makedirs(os.path.join(base, folder), exist_ok=True)
    print(f" Создана папка: {folder}")

# 2. Перемещаем существующие файлы в новую структуру
# App.tsx -> app/App.tsx
if os.path.exists(f'{base}/App.tsx'):
    shutil.move(f'{base}/App.tsx', f'{base}/app/App.tsx')
    print("✅ Перемещен App.tsx -> app/App.tsx")

# App.css -> styles/globals.css
if os.path.exists(f'{base}/App.css'):
    shutil.move(f'{base}/App.css', f'{base}/styles/globals.css')
    print("✅ Перемещен App.css -> styles/globals.css")

# TokenView.tsx -> components/Token/TokenView.tsx
if os.path.exists(f'{base}/components/TokenView.tsx'):
    shutil.move(f'{base}/components/TokenView.tsx', f'{base}/components/Token/TokenView.tsx')
    print("✅ Перемещен TokenView.tsx -> components/Token/TokenView.tsx")

# types.ts -> models/text.ts (переименовываем)
if os.path.exists(f'{base}/types.ts'):
    shutil.move(f'{base}/types.ts', f'{base}/models/text.ts')
    print("✅ Перемещен types.ts -> models/text.ts")

# 3. Создаем заглушки для будущих файлов
stubs = {
    'app/routes.tsx': '''// Маршруты приложения (пока не используется, готовимся к React Router)
export const routes = {
  home: '/',
  reader: '/reader',
  settings: '/settings',
};
''',
    'components/TextEditor/TextEditor.tsx': '''import React from 'react';

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function TextEditor({ value, onChange, placeholder }: TextEditorProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={4}
    />
  );
}
''',
    'components/SentencePair/SentencePair.tsx': '''import React from 'react';

interface SentencePairProps {
  japanese: string;
  russian: string;
  index: number;
}

export function SentencePair({ japanese, russian, index }: SentencePairProps) {
  return (
    <div className="sentence-pair">
      <p className="japanese">{japanese}</p>
      <p className="russian">{russian}</p>
    </div>
  );
}
''',
    'components/JapaneseSentence/JapaneseSentence.tsx': '''import React from 'react';
import { TokenView } from '../Token/TokenView';
import type { Token } from '../../models/text';

interface JapaneseSentenceProps {
  tokens: Token[];
  showFurigana?: boolean;
  onTokenClick?: (token: Token) => void;
}

export function JapaneseSentence({ tokens, showFurigana = true, onTokenClick }: JapaneseSentenceProps) {
  return (
    <p className="japanese-text">
      {tokens.map((token) => (
        <TokenView key={token.id} token={token} showFurigana={showFurigana} onClick={onTokenClick} />
      ))}
    </p>
  );
}
''',
    'components/WordPopover/WordPopover.tsx': '''import React from 'react';
import type { Token } from '../../models/text';

interface WordPopoverProps {
  token: Token | null;
  onClose: () => void;
}

export function WordPopover({ token, onClose }: WordPopoverProps) {
  if (!token) return null;
  
  return (
    <div className="word-popover">
      <h3>{token.surface}</h3>
      <p>Чтение: {token.reading ?? '—'}</p>
      <p>Часть речи: {token.pos}</p>
      <button onClick={onClose}>Закрыть</button>
    </div>
  );
}
''',
    'components/ModeSwitcher/ModeSwitcher.tsx': '''import React from 'react';

export type LearningMode = 'reading' | 'retelling' | 'cloze' | 'listening' | 'skeleton';

interface ModeSwitcherProps {
  mode: LearningMode;
  onChange: (mode: LearningMode) => void;
}

const modes: { id: LearningMode; label: string }[] = [
  { id: 'reading', label: 'Чтение' },
  { id: 'retelling', label: 'Пересказ' },
  { id: 'cloze', label: 'Пропуски' },
  { id: 'listening', label: 'Аудирование' },
  { id: 'skeleton', label: 'Скелет' },
];

export function ModeSwitcher({ mode, onChange }: ModeSwitcherProps) {
  return (
    <div className="mode-switcher">
      {modes.map((m) => (
        <button
          key={m.id}
          className={mode === m.id ? 'active' : ''}
          onClick={() => onChange(m.id)}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
''',
    'components/AudioButton/AudioButton.tsx': '''import React from 'react';

interface AudioButtonProps {
  text: string;
  lang?: string;
}

export function AudioButton({ text, lang = 'ja-JP' }: AudioButtonProps) {
  const speak = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <button onClick={speak} aria-label="Озвучить">
      🔊
    </button>
  );
}
''',
    'features/dictionary/jishoApi.ts': '''// Сервисный слой для Jisho API
// TODO: реализовать интеграцию

export interface JishoResult {
  slug: string;
  is_common: boolean;
  tags: string[];
  jlpt: number[];
  senses: {
    english_definitions: string[];
    parts_of_speech: string[];
  }[];
}

export async function searchWord(word: string): Promise<JishoResult[]> {
  // Заглушка для MVP
  console.log('Jisho API: поиск слова', word);
  return [];
}
''',
    'features/dictionary/dictionaryTypes.ts': '''export interface DictionaryEntry {
  word: string;
  reading: string;
  meanings: string[];
  pos: string;
}

export interface DictionaryService {
  search(word: string): Promise<DictionaryEntry[]>;
}
''',
    'features/learning/learningModes.ts': '''export type LearningMode = 'reading' | 'retelling' | 'cloze' | 'listening' | 'skeleton';

export interface ModeConfig {
  showFurigana: boolean;
  showJapanese: boolean;
  showTranslation: boolean;
  interactive: boolean;
}

export const modeConfigs: Record<LearningMode, ModeConfig> = {
  reading: {
    showFurigana: true,
    showJapanese: true,
    showTranslation: true,
    interactive: true,
  },
  retelling: {
    showFurigana: false,
    showJapanese: false,
    showTranslation: true,
    interactive: false,
  },
  cloze: {
    showFurigana: false,
    showJapanese: true,
    showTranslation: true,
    interactive: true,
  },
  listening: {
    showFurigana: false,
    showJapanese: false,
    showTranslation: true,
    interactive: false,
  },
  skeleton: {
    showFurigana: false,
    showJapanese: true,
    showTranslation: true,
    interactive: true,
  },
};
''',
    'features/learning/answerChecker.ts': '''import type { Token } from '../../models/text';

export interface AnswerResult {
  correct: boolean;
  expected: string;
  actual: string;
}

export function checkAnswer(token: Token, userAnswer: string): AnswerResult {
  const expected = token.reading || token.surface;
  return {
    correct: userAnswer.trim().toLowerCase() === expected.toLowerCase(),
    expected,
    actual: userAnswer,
  };
}
''',
    'features/storage/database.ts': '''// IndexedDB через idb
// TODO: реализовать полноценное хранилище

import type { LearningText } from '../../models/text';

const DB_NAME = 'japanese-reader';
const STORE_NAME = 'texts';

export async function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveText(text: LearningText): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(text);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadText(id: string): Promise<LearningText | undefined> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
''',
    'store/textStore.ts': '''// Zustand store для управления состоянием текстов
// TODO: подключить zustand после установки

export interface TextState {
  currentText: string;
  setCurrentText: (text: string) => void;
}

// Заглушка до установки zustand
export const useTextStore = () => ({
  currentText: '',
  setCurrentText: (text: string) => console.log('set text:', text),
});
''',
}

for path, content in stubs.items():
    full_path = os.path.join(base, path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"📝 Создан файл: {path}")

# 4. Обновляем импорты в main.tsx
main_tsx = '''import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';
import './styles/globals.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
'''

with open(f'{base}/main.tsx', 'w', encoding='utf-8') as f:
    f.write(main_tsx)
print("✅ Обновлен main.tsx (новые импорты)")

# 5. Обновляем импорты в App.tsx
app_tsx = open(f'{base}/app/App.tsx', 'r', encoding='utf-8').read()
app_tsx = app_tsx.replace("from './components/TokenView'", "from '../components/Token/TokenView'")
app_tsx = app_tsx.replace("from './features/analysis/sentenceSplitter'", "from '../features/analysis/sentenceSplitter'")
app_tsx = app_tsx.replace("from './types'", "from '../models/text'")
app_tsx = app_tsx.replace("import './App.css'", "import '../styles/globals.css'")

with open(f'{base}/app/App.tsx', 'w', encoding='utf-8') as f:
    f.write(app_tsx)
print("✅ Обновлен App.tsx (новые импорты)")

# 6. Обновляем импорты в TokenView.tsx
token_view = open(f'{base}/components/Token/TokenView.tsx', 'r', encoding='utf-8').read()
token_view = token_view.replace("from '../types'", "from '../../models/text'")

with open(f'{base}/components/Token/TokenView.tsx', 'w', encoding='utf-8') as f:
    f.write(token_view)
print("✅ Обновлен TokenView.tsx (новый импорт)")

# 7. Обновляем импорты в analyzer.ts
analyzer = open(f'{base}/features/analysis/analyzer.ts', 'r', encoding='utf-8').read()
analyzer = analyzer.replace("from '../../types'", "from '../../models/text'")

with open(f'{base}/features/analysis/analyzer.ts', 'w', encoding='utf-8') as f:
    f.write(analyzer)
print("✅ Обновлен analyzer.ts (новый импорт)")

# 8. Создаем public/icons
os.makedirs('public/icons', exist_ok=True)
print("📁 Создана папка public/icons")

# 9. Удаляем старые пустые папки
if os.path.exists(f'{base}/components') and not os.listdir(f'{base}/components'):
    os.rmdir(f'{base}/components')
    print("🗑 Удалена пустая папка components")

print("\n🎉 Рефакторинг завершён! Структура соответствует ТЗ.")
