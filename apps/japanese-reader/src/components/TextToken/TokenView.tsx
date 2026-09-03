import type { TextToken } from '../../models/text';

interface TokenViewProps {
  token: TextToken;
  showFurigana?: boolean;
  isHidden?: boolean;
  onClick?: (token: TextToken) => void;
}

export function TokenView({
  token,
  showFurigana = true,
  isHidden = false,
  onClick,
}: TokenViewProps) {
  const className = [
    'token',
    token.isParticle ? 'token--particle' : '',
    isHidden ? 'token--hidden' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={className}
      onClick={() => onClick?.(token)}
    >
      {isHidden ? (
        '＿＿＿'
      ) : token.reading && showFurigana ? (
        <ruby>
          {token.surface}
          <rt>{token.reading}</rt>
        </ruby>
      ) : (
        token.surface
      )}
    </button>
  );
}
