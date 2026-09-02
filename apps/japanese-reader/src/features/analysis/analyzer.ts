import type { Token, PartOfSpeech } from '../../models/text';

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

export async function analyzeText(text: string): Promise<Token[]> {
  console.log('🔍 Начинаем анализ текста:', text);
  
  return new Promise((resolve, reject) => {
    console.log('📦 Создаём Worker...');
    
    const worker = new Worker(
      new URL('./nlp.worker.ts', import.meta.url),
      { type: 'module' }
    );
    
    const requestId = Date.now().toString();
    
    worker.onmessage = (e) => {
      console.log('📨 Получено сообщение от Worker:', e.data);
      
      if (e.data.id === requestId) {
        worker.terminate();
        
        if (e.data.success) {
          console.log('✅ Worker вернул результат:', e.data.data);
          
          const tokens: Token[] = e.data.data.map((t: any, index: number) => ({
            id: `${index}`,
            surface: t.surface_form,
            reading: t.reading || undefined,
            pos: mapPartOfSpeech(t.pos),
            isParticle: t.pos === '助詞',
          }));
          
          resolve(tokens);
        } else {
          console.error('❌ Worker вернул ошибку:', e.data.error);
          reject(new Error(e.data.error));
        }
      }
    };
    
    worker.onerror = (err) => {
      console.error(' Ошибка Worker:', err);
      console.error('Тип ошибки:', err.type);
      console.error('Сообщение:', err.message);
      console.error('Файл:', err.filename);
      console.error('Строка:', err.lineno);
      worker.terminate();
      reject(err);
    };
    
    console.log('🚀 Отправляем текст в Worker...');
    worker.postMessage({ text, id: requestId });
  });
}
