import { useRef, type KeyboardEvent } from 'react';
import type { Unit } from '../types/weather';

interface UnitToggleProps {
  unit: Unit;
  onChange: (unit: Unit) => void;
}

const units: Unit[] = ['celsius', 'fahrenheit'];

export default function UnitToggle({ unit, onChange }: UnitToggleProps) {
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const currentIndex = units.indexOf(event.currentTarget.value as Unit);
    let nextIndex: number | undefined;

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextIndex = (currentIndex + 1) % units.length;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex = (currentIndex - 1 + units.length) % units.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = units.length - 1;
    }

    if (nextIndex === undefined) {
      return;
    }

    event.preventDefault();
    const nextUnit = units[nextIndex];
    buttonRefs.current[nextIndex]?.focus();
    onChange(nextUnit);
  }

  return (
    <div
      aria-label="Unidade de temperatura"
      className="inline-flex rounded-lg border border-white/10 bg-white/5 p-1 shadow-glass backdrop-blur-md"
      role="group"
    >
      {units.map((option, index) => {
        const isActive = option === unit;
        const label = option === 'celsius' ? '°C' : '°F';

        return (
          <button
            aria-label={`Usar ${option === 'celsius' ? 'Celsius' : 'Fahrenheit'}`}
            aria-pressed={isActive}
            className={`min-h-11 min-w-11 rounded-md px-3 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900 ${
              isActive
                ? 'bg-accent-500 text-white'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
            key={option}
            onClick={() => onChange(option)}
            onKeyDown={handleKeyDown}
            ref={(button) => {
              buttonRefs.current[index] = button;
            }}
            tabIndex={isActive ? 0 : -1}
            type="button"
            value={option}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}