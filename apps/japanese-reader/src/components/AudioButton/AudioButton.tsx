import React from 'react';

interface AudioButtonProps {
  text: string;
  lang?: string;
}

export function AudioButton({ text, lang = 'ja-JP' }: AudioButtonProps) {
  const speak = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      window.speechSynthesis.speak(utterance);
    }
  };
  return <button onClick={speak} aria-label="Озвучить"></button>;
}
