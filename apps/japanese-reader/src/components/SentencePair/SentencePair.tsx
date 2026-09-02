import React from 'react';
import { AudioButton } from '../AudioButton/AudioButton';
import './SentencePair.css';

interface SentencePairProps {
  japanese: string;
  russian: string;
  index: number;
  isHighlighted?: boolean;
  onHighlight?: () => void;
}

export function SentencePair({ 
  japanese, 
  russian, 
  index, 
  isHighlighted = false,
  onHighlight 
}: SentencePairProps) {
  return (
    <div 
      className={`sentence-pair ${isHighlighted ? 'highlighted' : ''}`}
      onClick={onHighlight}
      tabIndex={0}
      role="button"
      aria-label={`Предложение ${index}`}
    >
      <div className="sentence-content">
        <div className="sentence-japanese">
          <span className="sentence-number">{index}.</span>
          <span className="sentence-text">{japanese}</span>
          <AudioButton 
            text={japanese} 
            lang="ja-JP" 
            rate={0.9}
            label={`Озвучить японское предложение ${index}`}
          />
        </div>
        <div className="sentence-russian">
          <span className="sentence-text">{russian}</span>
        </div>
      </div>
    </div>
  );
}
