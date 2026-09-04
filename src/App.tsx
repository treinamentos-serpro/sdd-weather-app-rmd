import { useState } from 'react';
import CityResults from './components/CityResults';
import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import SearchBar from './components/SearchBar';
import UnitToggle from './components/UnitToggle';
import EmptyState from './components/states/EmptyState';
import ErrorState from './components/states/ErrorState';
import LoadingState from './components/states/LoadingState';
import { useWeather } from './hooks/useWeather';
import type { Unit } from './types/weather';

export default function App() {
  const [unit, setUnit] = useState<Unit>('celsius');
  const { cities, data, error, retry, search, selectCity, status } = useWeather();

  return (
    <main className="min-h-screen overflow-x-hidden bg-night-900 px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-5 border-b border-white/10 pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-400">WeatherView</p>
              <p className="mt-1 break-words text-sm text-white/80">Previsão clara para os seus próximos dias</p>
            </div>
            <UnitToggle onChange={setUnit} unit={unit} />
          </div>
          <SearchBar disabled={status === 'loading'} onSearch={search} />
        </header>

        <div aria-busy={status === 'loading'} className="mt-8">
          {status === 'idle' && <EmptyState title="Comece por uma cidade" hint="Digite o nome de uma cidade para consultar a previsão." />}
          {status === 'loading' && <LoadingState message="Carregando previsão..." />}
          {status === 'results' && (
            <CityResults
              cities={cities}
              key={cities.map((city) => city.id).join('-')}
              onSelect={selectCity}
            />
          )}
          {status === 'empty' && <EmptyState />}
          {status === 'error' && <ErrorState message={error ?? 'Não foi possível carregar a previsão.'} onRetry={retry} />}
          {status === 'success' && (
            <div className="space-y-8">
              {data && <CurrentWeather city={data.city} current={data.current} unit={unit} />}
              {data && <ForecastList forecast={data.forecast} unit={unit} />}
            </div>
          )}
        </div>
        <div aria-live="polite" className="sr-only">
          Temperaturas exibidas em {unit === 'celsius' ? 'Celsius' : 'Fahrenheit'}.
        </div>
      </div>
    </main>
  );
}