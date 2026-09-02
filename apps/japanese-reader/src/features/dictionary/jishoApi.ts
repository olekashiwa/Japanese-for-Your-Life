export interface JishoResult {
  slug: string;
  senses: { english_definitions: string[]; parts_of_speech: string[] }[];
}

export async function searchWord(word: string): Promise<JishoResult[]> {
  console.log('Jisho API: поиск слова', word);
  return [];
}
