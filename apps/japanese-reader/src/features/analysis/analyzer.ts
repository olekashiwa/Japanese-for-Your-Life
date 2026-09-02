import type { Token, PartOfSpeech } from '../../models/text';

// Адаптер частей речи из kuromoji в наши типы
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

// Анализ текста через Web Worker
export async function analyzeText(text: string): Promise<Token[]> {
  return new Promise((resolve, reject) => {
    // Создаём Web Worker
    const worker = new Worker(
      new URL('./nlp.worker.ts', import.meta.url),
      { type: 'module' }
    );
    
    const requestId = Date.now().toString();
    
    console.log('🔧 Отправка текста на анализ в Worker...');
    
    // Обработка ответа от Worker
    worker.onmessage = (e) => {
      if (e.data.id === requestId) {
        worker.terminate(); // Очищаем worker
        
        if (e.data.success) {
          console.log('✅ Получен результат от Worker');
          
          // Маппим данные kuromoji в наш формат Token
          const tokens: Token[] = e.data.data.map((t: any, index: number) => ({
            id: `${index}`,
            surface: t.surface_form,
            reading: t.reading || undefined,
            pos: mapPartOfSpeech(t.pos),
            isParticle: t.pos === '助詞',
          }));
          
          resolve(tokens);
        } else {
          console.error('❌ Ошибка в Worker:', e.data.error);
          reject(new Error(e.data.error));
        }
      }
    };
    
    // Обработка ошибок Worker
    worker.onerror = (err) => {
      worker.terminate();
      console.error('❌ Ошибка Worker:', err);
      reject(err);
    };
    
    // Отправляем текст на анализ
    worker.postMessage({ text, id: requestId });
  });
}
