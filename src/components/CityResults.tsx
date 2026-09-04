import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import type { City } from '../types/weather';

interface CityResultsProps {
  cities: City[];
  onSelect: (city: City) => void;
}

export default function CityResults({ cities, onSelect }: CityResultsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    buttonRefs.current[activeIndex]?.focus();
  }, [activeIndex]);

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % cities.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + cities.length) % cities.length);
    } else if (event.key === 'Home') {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      setActiveIndex(cities.length - 1);
    }
  }

  return (
    <section aria-labelledby="city-results-heading" aria-live="polite" className="mt-6">
      <h2 className="text-lg font-semibold text-white" id="city-results-heading">
        Resultados de cidades
      </h2>
      <div aria-label="Resultados de cidades" className="mt-3 space-y-2" role="listbox">
        {cities.map((city, index) => (
          <button
            aria-label={`${city.name}, ${city.admin1 ? `${city.admin1}, ` : ''}${city.country}`}
            aria-selected={index === activeIndex}
            className="w-full rounded-lg border border-white/10 bg-white/5 p-4 text-left text-white transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900"
            key={city.id}
            onClick={() => onSelect(city)}
            onKeyDown={handleKeyDown}
            ref={(button) => {
              buttonRefs.current[index] = button;
            }}
            role="option"
            tabIndex={index === activeIndex ? 0 : -1}
            type="button"
          >
            <span className="font-medium">{city.name}</span>
            <span className="mt-1 block text-sm text-white/80">
              {city.admin1 ? `${city.admin1}, ` : ''}
              {city.country}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}