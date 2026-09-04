import { useState, type FormEvent } from 'react';

interface SearchBarProps {
  onSearch: (city: string) => void;
  disabled?: boolean;
}

export default function SearchBar({ onSearch, disabled = false }: SearchBarProps) {
  const [city, setCity] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedCity = city.trim();
    if (!trimmedCity || disabled) {
      return;
    }

    onSearch(trimmedCity);
  }

  return (
    <form
      aria-label="Buscar cidade"
      className="flex w-full flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-4 shadow-glass backdrop-blur-md sm:flex-row"
      onSubmit={handleSubmit}
      role="search"
    >
      <div className="flex-1">
        <label className="sr-only" htmlFor="city-search">
          Nome da cidade
        </label>
        <input
          aria-label="Nome da cidade"
          className="min-h-11 w-full rounded-lg border border-white/10 bg-night-800/80 px-4 py-3 text-white outline-none transition placeholder:text-white/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900 disabled:cursor-not-allowed disabled:border-white/5 disabled:opacity-60"
          disabled={disabled}
          id="city-search"
          onChange={(event) => setCity(event.target.value)}
          placeholder="Digite uma cidade"
          type="search"
          value={city}
        />
      </div>
      <button
        className="min-h-11 rounded-lg bg-accent-500 px-5 py-3 font-medium text-white transition hover:bg-accent-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900 disabled:cursor-not-allowed disabled:bg-accent-600 disabled:opacity-60"
        disabled={disabled}
        type="submit"
      >
        Buscar
      </button>
    </form>
  );
}