import { useMemo, useState, useEffect } from 'react';
import { TokenView } from '../components/Token/TokenView';
import { AudioButton } from '../components/AudioButton/AudioButton';
import { splitSentences } from '../features/analysis/sentenceSplitter';
import { saveText, loadAllTexts, deleteText, createNewText } from '../features/storage/database';
import type { Token, LearningText } from '../models/text';
import '../styles/globals.css';

const demoText = '今日は良い天気です。';
const demoTranslation = 'Сегодня хорошая погода.';
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
  const [translation, setTranslation] = useState(demoTranslation);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [savedTexts, setSavedTexts] = useState<LearningText[]>([]);
  const [currentTextId, setCurrentTextId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  
  const sentences = useMemo(() => splitSentences(text), [text]);
  const translations = useMemo(() => splitSentences(translation), [translation]);
  const isDemoSentence = sentences.length === 1 && sentences[0] === demoText;

  // Загружаем сохранённые тексты при монтировании
  useEffect(() => {
    loadAllTexts()
      .then(setSavedTexts)
      .catch((err) => console.error('Ошибка загрузки текстов:', err));
  }, []);

  // Автосохранение при изменении текста (с задержкой 1 секунда)
  useEffect(() => {
    if (!text.trim() && !translation.trim()) return;

    const timeoutId = setTimeout(() => {
      handleSave();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [text, translation]);

  const handleSave = async () => {
    if (!text.trim()) return;

    setSaveStatus('saving');
    
    try {
      let textToSave: LearningText;
      
      if (currentTextId) {
        // Обновляем существующий текст
        textToSave = {
          id: currentTextId,
          japanese: text,
          russian: translation,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      } else {
        // Создаём новый текст
        textToSave = createNewText(text, translation);
        setCurrentTextId(textToSave.id);
      }

      await saveText(textToSave);
      setSaveStatus('saved');
      
      // Обновляем список
      const allTexts = await loadAllTexts();
      setSavedTexts(allTexts);
      
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      console.error('Ошибка сохранения:', err);
      setSaveStatus('idle');
    }
  };

  const handleLoad = async (textToLoad: LearningText) => {
    setText(textToLoad.japanese);
    setTranslation(textToLoad.russian);
    setCurrentTextId(textToLoad.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить этот текст?')) return;
    
    try {
      await deleteText(id);
      const allTexts = await loadAllTexts();
      setSavedTexts(allTexts);
      
      if (currentTextId === id) {
        setCurrentTextId(null);
        setText(demoText);
        setTranslation(demoTranslation);
      }
    } catch (err) {
      console.error('Ошибка удаления:', err);
    }
  };

  const handleNew = () => {
    setText('');
    setTranslation('');
    setCurrentTextId(null);
    setSelectedToken(null);
  };

  return (
    <main className="app">
      <header>
        <p className="eyebrow">Japanese Reader — MVP</p>
        <h1>Интерактивный японский текст</h1>
        <p className="intro">
          Введите японский текст и его русский перевод. Тексты сохраняются автоматически.
        </p>
      </header>

      <div className="toolbar">
        <button className="btn btn-primary" onClick={handleNew}>
           Новый текст
        </button>
        <button 
          className="btn btn-secondary" 
          onClick={handleSave}
          disabled={saveStatus === 'saving'}
        >
          {saveStatus === 'saving' ? '💾 Сохранение...' : 
           saveStatus === 'saved' ? '✅ Сохранено' : '💾 Сохранить'}
        </button>
      </div>

      <label className="field">
        <span>Японский текст</span>
        <div className="field-with-button">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            placeholder="今日は良い天気です。"
          />
          <AudioButton 
            text={text} 
            lang="ja-JP" 
            rate={0.9}
            label="Озвучить весь японский текст"
          />
        </div>
      </label>

      <label className="field">
        <span>Русский перевод</span>
        <textarea
          value={translation}
          onChange={(e) => setTranslation(e.target.value)}
          rows={4}
          placeholder="Сегодня хорошая погода."
        />
      </label>

      <section className="panel" aria-labelledby="sentences-title">
        <h2 id="sentences-title">Предложения</h2>
        {sentences.length === 0 ? (
          <p className="muted">Введите текст, чтобы увидеть предложения.</p>
        ) : isDemoSentence ? (
          <div className="demo-sentence">
            <p className="japanese-text">
              {demoTokens.map((token) => (
                <TokenView key={token.id} token={token} onClick={setSelectedToken} />
              ))}
            </p>
            <p className="translation-text">{demoTranslation}</p>
          </div>
        ) : (
          <div className="sentence-pairs">
            {sentences.map((sentence, index) => (
              <div key={index} className="sentence-pair">
                <div className="sentence-japanese">
                  <span className="sentence-number">{index + 1}.</span>
                  <span className="sentence-text">{sentence}</span>
                </div>
                <div className="sentence-russian">
                  <span className="sentence-text">{translations[index] || '—'}</span>
                </div>
              </div>
            ))}
          </div>
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

      {savedTexts.length > 0 && (
        <section className="panel">
          <h2>Сохранённые тексты ({savedTexts.length})</h2>
          <div className="saved-texts-list">
            {savedTexts.map((savedText) => (
              <div 
                key={savedText.id} 
                className={`saved-text-item ${currentTextId === savedText.id ? 'active' : ''}`}
              >
                <div 
                  className="saved-text-content"
                  onClick={() => handleLoad(savedText)}
                >
                  <p className="saved-text-japanese">{savedText.japanese}</p>
                  <p className="saved-text-russian">{savedText.russian}</p>
                  <p className="saved-text-date">
                    {new Date(savedText.updatedAt).toLocaleString('ru-RU')}
                  </p>
                </div>
                <button 
                  className="btn btn-danger"
                  onClick={() => handleDelete(savedText.id)}
                  title="Удалить"
                >
                  🗑
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
