// @ts-ignore
import kuromoji from 'kuromoji';

console.log('Worker запущен, загружаем kuromoji...');

let tokenizer: any = null;

const initTokenizer = (): Promise<any> => {
  console.log('Инициализация kuromoji в Worker...');
  return new Promise((resolve, reject) => {
    try {
      kuromoji.builder({ dicPath: '/dict' }).build((err: any, _tokenizer: any) => {
        if (err) {
          console.error('Ошибка инициализации kuromoji:', err);
          reject(err);
        } else {
          console.log('Kuromoji инициализирован в Worker!');
          resolve(_tokenizer);
        }
      });
    } catch (error) {
      console.error('Исключение при инициализации:', error);
      reject(error);
    }
  });
};

self.onmessage = async (e) => {
  const { text, id } = e.data;
  console.log('Worker получил текст:', text);
  
  try {
    if (!tokenizer) {
      tokenizer = await initTokenizer();
    }
    
    console.log('Токенизация...');
    const result = tokenizer.tokenize(text);
    console.log('Результат:', result);
    
    self.postMessage({ id, success: true, data: result });
  } catch (error) {
    console.error('Ошибка в Worker:', error);
    self.postMessage({ id, success: false, error: (error as Error).message });
  }
};
