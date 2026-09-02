// @ts-ignore
import kuromoji from 'kuromoji';

console.log('🔧 Worker загружен, начинаем инициализацию kuromoji...');

let tokenizer: any = null;

const initTokenizer = (): Promise<any> => {
  console.log('📚 Инициализация kuromoji с dicPath=/dict...');
  
  return new Promise((resolve, reject) => {
    try {
      kuromoji.builder({ dicPath: '/dict' }).build((err: any, _tokenizer: any) => {
        if (err) {
          console.error('❌ Ошибка инициализации kuromoji:', err);
          reject(err);
        } else {
          console.log('✅ Kuromoji успешно инициализирован!');
          resolve(_tokenizer);
        }
      });
    } catch (error) {
      console.error('💥 Исключение при инициализации:', error);
      reject(error);
    }
  });
};

self.onmessage = async (e) => {
  const { text, id } = e.data;
  console.log('Worker получил текст:', text);
  
  try {
    if (!tokenizer) {
      console.log('Токенайзер ещё не создан, инициализируем...');
      tokenizer = await initTokenizer();
    }
    
    console.log('Токенизация текста...');
    const result = tokenizer.tokenize(text);
    console.log('Результат токенизации:', result);
    
    self.postMessage({ id, success: true, data: result });
  } catch (error) {
    console.error('Ошибка в Worker:', error);
    self.postMessage({ id, success: false, error: (error as Error).message });
  }
};
