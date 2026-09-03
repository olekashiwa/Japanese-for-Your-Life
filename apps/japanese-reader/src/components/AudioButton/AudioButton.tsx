import { useState } from "react";
import './AudioButton.css';

interface AudioButtonProps {
  text: string;
  lang?: string;
  rate?: number;
  label?: string;
}

export function AudioButton({ 
  text, 
  lang = 'ja-JP', 
  rate = 0.9,
  label = 'Озвучить' 
}: AudioButtonProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = () => {
    if (!('speechSynthesis' in window)) {
      alert('Ваш браузер не поддерживает Web Speech API');
      return;
    }

    // Останавливаем текущее воспроизведение
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <button
      className={`audio-button ${isSpeaking ? 'speaking' : ''}`}
      onClick={isSpeaking ? stop : speak}
      aria-label={label}
      title={label}
    >
      {isSpeaking ? '⏹' : ''}
    </button>
  );
}
