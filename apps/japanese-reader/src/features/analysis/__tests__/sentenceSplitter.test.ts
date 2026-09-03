import { describe, it, expect } from 'vitest';
import { splitSentences } from '../sentenceSplitter';

describe('splitSentences', () => {
  it('должен разделять текст по японским знакам препинания', () => {
    const text = '今日は良い天気です。猫が好きです！';
    const result = splitSentences(text);
    expect(result).toHaveLength(2);
    expect(result[0]).toBe('今日は良い天気です。');
    expect(result[1]).toBe('猫が好きです！');
  });

  it('должен возвращать массив с одним элементом', () => {
    const text = 'テスト';
    expect(splitSentences(text)).toEqual(['テスト']);
  });
});
