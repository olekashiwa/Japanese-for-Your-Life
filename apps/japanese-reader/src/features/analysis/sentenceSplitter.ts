export function splitSentences(text: string): string[] {
  return text
    .replace(/\r\n/g, '\n')
    .split(/(?<=[。！？])/u)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}
