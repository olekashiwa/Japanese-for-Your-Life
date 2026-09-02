import { useMemo, useState } from 'react';
import { TokenView } from './components/TokenView';
import { splitSentences } from './features/analysis/sentenceSplitter';
import type { Token } from './types';
import './App.css';

const demoText = '今日は良い天気です。';
const demoTokens: Token[] = [
  { id: '1', surface: '今日', reading: 'きょう', pos: 'noun', isParticle: false },
  { id: '2', surface: 'は', reading: 'は', pos: 'particle', isParticle: true },
  { id: '3', surface: '良い', reading: 'よい', pos: 'adjective', isParticle: false },
  { id: '4', surface: '天気', reading: 'てんき', pos: 'noun', isParticle: false },
  { id: '5', surface: 'です', reading: 'です', pos: 'auxiliary', isParticle: false },
  { id: '6', surface: '。', pos: 'symbol', isParticle: false },
];

export default function App() {
  const [text, setText] = useState(demoText);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const sentences = useMemo(() => splitSentences(text), [text]);
  const isDemoSentence = sentences.length === 1 && sentences[0] === demoText;

  return (
    <main className="app">
      <header>
        <p className="eyebrow">Japanese Reader — MVP</p>
        <h1>Интерактивный японский текст</h1>
        <p className="intro">
          Введите японский текст. Для демо-фразы отображаются токены, фуригана и частицы.
        </p>
      </header>

      <label className="field">
        <span>Японский текст</span>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={4}
          placeholder="今日は良い天気です。"
        />
      </label>

      <section className="panel" aria-labelledby="sentences-title">
        <h2 id="sentences-title">Предложения</h2>
        {sentences.length === 0 ? (
          <p className="muted">Введите текст, чтобы увидеть предложения.</p>
        ) : isDemoSentence ? (
          <p className="japanese-text">
            {demoTokens.map((token) => (
              <TokenView key={token.id} token={token} onClick={setSelectedToken} />
            ))}
          </p>
        ) : (
          <ol className="sentence-list">
            {sentences.map((sentence, index) => (
              <li key={`${sentence}-${index}`}>{sentence}</li>
            ))}
          </ol>
        )}
      </section>

      <section className="panel" aria-live="polite">
        <h2>Выбранное слово</h2>
        {selectedToken ? (
          <dl className="token-details">
            <div><dt>Слово</dt><dd>{selectedToken.surface}</dd></div>
            <div><dt>Чтение</dt><dd>{selectedToken.reading ?? '—'}</dd></div>
            <div><dt>Часть речи</dt><dd>{selectedToken.pos}</dd></div>
          </dl>
        ) : (
          <p className="muted">Нажмите на слово в демо-предложении.</p>
        )}
      </section>
    </main>
  );
}
