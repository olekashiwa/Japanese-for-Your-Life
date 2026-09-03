
export type LearningMode = 'reading' | 'retelling' | 'cloze' | 'listening' | 'skeleton';

interface ModeSwitcherProps {
  mode: LearningMode;
  onChange: (mode: LearningMode) => void;
}

const modes: { id: LearningMode; label: string }[] = [
  { id: 'reading', label: 'Чтение' },
  { id: 'retelling', label: 'Пересказ' },
  { id: 'cloze', label: 'Пропуски' },
  { id: 'listening', label: 'Аудирование' },
  { id: 'skeleton', label: 'Скелет' },
];

export function ModeSwitcher({ mode, onChange }: ModeSwitcherProps) {
  return (
    <div className="mode-switcher">
      {modes.map((m) => (
        <button key={m.id} className={mode === m.id ? 'active' : ''} onClick={() => onChange(m.id)}>
          {m.label}
        </button>
      ))}
    </div>
  );
}
