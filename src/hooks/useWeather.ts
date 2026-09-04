import { useRef, useState } from 'react';
import { getWeather, searchCities } from '../services/weatherService';
import type { City, WeatherData } from '../types/weather';

export type WeatherStatus = 'idle' | 'loading' | 'success' | 'error' | 'empty' | 'results';

type WeatherOperation =
  | { type: 'search'; name: string }
  | { type: 'selectCity'; city: City };

interface UseWeatherResult {
  status: WeatherStatus;
  data: WeatherData | null;
  cities: City[];
  error: string | null;
  query: string;
  search: (name: string) => Promise<void>;
  selectCity: (city: City) => Promise<void>;
  retry: () => Promise<void>;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Ocorreu um erro inesperado.';
}

export function useWeather(): UseWeatherResult {
  const [status, setStatus] = useState<WeatherStatus>('idle');
  const [data, setData] = useState<WeatherData | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const lastOperation = useRef<WeatherOperation | null>(null);
  const requestId = useRef(0);

  async function selectCity(city: City): Promise<void> {
    const currentRequestId = ++requestId.current;
    lastOperation.current = { type: 'selectCity', city };
    setStatus('loading');
    setError(null);

    try {
      const weather = await getWeather(city);
      if (currentRequestId !== requestId.current) {
        return;
      }

      setData(weather);
      setStatus('success');
    } catch (requestError) {
      if (currentRequestId !== requestId.current) {
        return;
      }

      setError(getErrorMessage(requestError));
      setStatus('error');
    }
  }

  async function search(name: string): Promise<void> {
    const trimmedName = name.trim();
    setQuery(trimmedName);

    if (!trimmedName) {
      setCities([]);
      setError(null);
      setStatus('empty');
      lastOperation.current = null;
      return;
    }

    const currentRequestId = ++requestId.current;
    lastOperation.current = { type: 'search', name: trimmedName };
    setStatus('loading');
    setError(null);

    try {
      const results = await searchCities(trimmedName);
      if (currentRequestId !== requestId.current) {
        return;
      }

      setCities(results);
      if (results.length === 0) {
        setData(null);
        setStatus('empty');
        return;
      }

      setStatus('results');
    } catch (requestError) {
      if (currentRequestId !== requestId.current) {
        return;
      }

      setError(getErrorMessage(requestError));
      setStatus('error');
    }
  }

  async function retry(): Promise<void> {
    const operation = lastOperation.current;
    if (!operation) {
      return;
    }

    if (operation.type === 'search') {
      await search(operation.name);
      return;
    }

    await selectCity(operation.city);
  }

  return {
    status,
    data,
    cities,
    error,
    query,
    search,
    selectCity,
    retry,
  };
}