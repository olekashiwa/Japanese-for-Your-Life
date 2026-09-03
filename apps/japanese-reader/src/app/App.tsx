import { useMemo, useState, useEffect } from 'react';
import { TokenView } from '../components/TextToken/TokenView';
import { AudioButton } from '../components/AudioButton/AudioButton';
import { splitSentences } from '../features/analysis/sentenceSplitter';
import { analyzeText } from '../features/analysis/analyzer';
import { saveText, loadAllTexts, deleteText, createNewText } from '../features/storage/database';
import type { TextToken, LearningText } from '../models/text';
import '../styles/globals.css';

const demoText = '今日は良い天気です。';
const demoTranslation = 'Сегодня хорошая погода.';

export default function App() {
  const [text, setText] = useState(demoText);
  const [translation, setTranslation] = useState(demoTranslation);
  const [selectedToken, setSelectedToken] = useState<TextToken | null>(null);
  const [savedTexts, setSavedTexts] = useState<LearningText[]>([]);
  const [currentTextId, setCurrentTextId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  
  const sentences = useMemo(() => splitSentences(text), [text]);
  const translations = useMemo(() => splitSentences(translation), [translation]);
  
  const [tokenizedSentences, setTokenizedSentences] = useState<TextToken[][]>([]);
  
  useEffect(() => {
    if (sentences.length === 0) return;
    
    const tokenizeAll = async () => {
      const results = await Promise.all(sentences.map(sentence => analyzeText(sentence)));
      setTokenizedSentences(results);
    };
    
    tokenizeAll();
  }, [sentences]);

  useEffect(() => {
    loadAllTexts().then(setSavedTexts).catch(console.error);
  }, []);

  useEffect(() => {
    if (!text.trim() && !translation.trim()) return;
    const timeoutId = setTimeout(handleSave, 1000);
    return () => clearTimeout(timeoutId);
  }, [text, translation]);

  const handleSave = async () => {
    if (!text.trim()) return;
    setSaveStatus('saving');
    try {
      let textToSave: LearningText;
      if (currentTextId) {
        textToSave = { id: currentTextId, japanese: text, russian: translation, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      } else {
        textToSave = createNewText(text, translation);
        setCurrentTextId(textToSave.id);
      }
      await saveText(textToSave);
      setSaveStatus('saved');
      setSavedTexts(await loadAllTexts());
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      console.error(err);
      setSaveStatus('idle');
    }
  };

  const handleLoad = async (t: LearningText) => { setText(t.japanese); setTranslation(t.russian); setCurrentTextId(t.id); };
  const handleDelete = async (id: string) => {
    if (!confirm('Удалить?')) return;
    await deleteText(id);
    setSavedTexts(await loadAllTexts());
  };
  const handleNew = () => { setText(''); setTranslation(''); setCurrentTextId(null); setSelectedToken(null); };

  return (
    <main className="app">
      <header>
        <p className="eyebrow">Japanese Reader — MVP</p>
        <h1>Интерактивный японский текст</h1>
        <p className="intro">Введите японский текст и его русский перевод.</p>
      </header>
      <div className="toolbar">
        <button className="btn btn-primary" onClick={handleNew}>✨ Новый текст</button>
        <button className="btn btn-secondary" onClick={handleSave} disabled={saveStatus === 'saving'}>
          {saveStatus === 'saving' ? '💾 Сохранение...' : saveStatus === 'saved' ? '✅ Сохранено' : '💾 Сохранить'}
        </button>
      </div>
      <label className="field">
        <span>Японский текст</span>
        <div className="field-with-button">
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} placeholder="今日は良い天気です。" />
          <AudioButton text={text} lang="ja-JP" rate={0.9} label="Озвучить" />
        </div>
      </label>
      <label className="field">
        <span>Русский перевод</span>
        <textarea value={translation} onChange={(e) => setTranslation(e.target.value)} rows={4} placeholder="Перевод..." />
      </label>
      <section className="panel">
        <h2>Предложения</h2>
        {sentences.length === 0 ? <p className="muted">Введите текст</p> : tokenizedSentences.length === 0 ? <p className="muted">🔄 Анализируем...</p> : (
          <div className="sentence-pairs">
            {sentences.map((sentence, i) => (
              <div key={i} className="sentence-pair">
                <div className="sentence-japanese">
                  <span className="sentence-number">{i + 1}.</span>
                  <span className="japanese-text">
                    {(tokenizedSentences[i] || []).map((token: TextToken) => (
                      <TokenView key={token.id} token={token} onClick={setSelectedToken} />
                    ))}
                  </span>
                  <AudioButton text={sentence} lang="ja-JP" rate={0.9} label="Озвучить" />
                </div>
                <div className="sentence-russian"><span className="sentence-text">{translations[i] || '—'}</span></div>
              </div>
            ))}
          </div>
        )}
      </section>
      <section className="panel">
        <h2>Выбранное слово</h2>
        {selectedToken ? (
          <dl className="token-details">
            <div><dt>Слово</dt><dd>{selectedToken.surface}</dd></div>
            <div><dt>Чтение</dt><dd>{selectedToken.reading ?? '—'}</dd></div>
            <div><dt>Часть речи</dt><dd>{selectedToken.pos}</dd></div>
            <div><dt>Частица?</dt><dd>{selectedToken.isParticle ? '✅ Да' : 'Нет'}</dd></div>
          </dl>
        ) : <p className="muted">Нажмите на слово</p>}
      </section>
      {savedTexts.length > 0 && (
        <section className="panel">
          <h2>Сохранённые тексты ({savedTexts.length})</h2>
          <div className="saved-texts-list">
            {savedTexts.map((t) => (
              <div key={t.id} className={`saved-text-item ${currentTextId === t.id ? 'active' : ''}`}>
                <div className="saved-text-content" onClick={() => handleLoad(t)}>
                  <p className="saved-text-japanese">{t.japanese}</p>
                  <p className="saved-text-russian">{t.russian}</p>
                  <p className="saved-text-date">{new Date(t.updatedAt).toLocaleString('ru-RU')}</p>
                </div>
                <button className="btn btn-danger" onClick={() => handleDelete(t.id)}>🗑</button>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
