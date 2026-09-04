import type { City, CurrentWeather, ForecastDay, WeatherData } from '../types/weather';

const GEOCODING_ENDPOINT = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_ENDPOINT = 'https://api.open-meteo.com/v1/forecast';
const REQUEST_TIMEOUT_MS = 10_000;

export class WeatherServiceError extends Error {
  readonly status?: number;
  readonly kind: 'timeout' | 'network' | 'http' | 'invalid-response';

  constructor(
    message: string,
    status?: number,
    kind: 'timeout' | 'network' | 'http' | 'invalid-response' = 'network',
  ) {
    super(message);
    this.name = 'WeatherServiceError';
    this.status = status;
    this.kind = kind;
  }
}

export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = REQUEST_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new WeatherServiceError(
        'A conexão demorou mais que o esperado. Tente novamente.',
        undefined,
        'timeout',
      );
    }

    throw new WeatherServiceError(
      'Não foi possível conectar ao serviço de clima. Verifique sua conexão e tente novamente.',
      undefined,
      'network',
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

interface GeocodingResult {
  id: number;
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

interface GeocodingResponse {
  results?: GeocodingResult[];
}

interface ForecastResponse {
  current?: {
    temperature_2m?: number;
    apparent_temperature?: number;
    relative_humidity_2m?: number;
    wind_speed_10m?: number;
    precipitation?: number;
    surface_pressure?: number;
    weather_code?: number;
  };
  daily?: {
    time?: string[];
    temperature_2m_min?: Array<number | null>;
    temperature_2m_max?: Array<number | null>;
    precipitation_probability_max?: Array<number | null>;
    weather_code?: Array<number | null>;
  };
}

function finiteNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

export async function searchCities(name: string): Promise<City[]> {
  const trimmedName = name.trim();
  if (!trimmedName) {
    return [];
  }

  const url = `${GEOCODING_ENDPOINT}?name=${encodeURIComponent(trimmedName)}&count=10&language=pt&format=json`;
  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    throw new WeatherServiceError(
      response.status === 429
        ? 'Muitas buscas foram realizadas. Aguarde um momento e tente novamente.'
        : 'Não foi possível buscar cidades agora. Tente novamente.',
      response.status,
      'http',
    );
  }

  let data: GeocodingResponse;
  try {
    data = (await response.json()) as GeocodingResponse;
  } catch {
    throw new WeatherServiceError('O serviço de cidades retornou dados inválidos.', undefined, 'invalid-response');
  }
  return (data.results ?? []).map((result) => ({
    id: result.id,
    name: result.name,
    country: result.country,
    admin1: result.admin1,
    latitude: result.latitude,
    longitude: result.longitude,
    timezone: result.timezone,
  }));
}

export async function getWeather(city: City): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current:
      'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,precipitation,surface_pressure,weather_code',
    daily: 'temperature_2m_min,temperature_2m_max,precipitation_probability_max,weather_code',
    forecast_days: '5',
    temperature_unit: 'celsius',
    wind_speed_unit: 'kmh',
    timezone: 'auto',
  });
  const response = await fetchWithTimeout(`${FORECAST_ENDPOINT}?${params.toString()}`);

  if (!response.ok) {
    throw new WeatherServiceError(
      response.status === 429
        ? 'Muitas consultas foram realizadas. Aguarde um momento e tente novamente.'
        : 'Não foi possível carregar a previsão agora. Tente novamente.',
      response.status,
      'http',
    );
  }

  let data: ForecastResponse;
  try {
    data = (await response.json()) as ForecastResponse;
  } catch {
    throw new WeatherServiceError('O serviço de clima retornou dados inválidos.', undefined, 'invalid-response');
  }
  if (!data.current || !data.daily) {
    throw new WeatherServiceError('Resposta de forecast incompleta.');
  }

  const current: CurrentWeather = {
    temperatureCelsius: finiteNumber(data.current.temperature_2m),
    apparentTemperatureCelsius: finiteNumber(data.current.apparent_temperature),
    relativeHumidity: finiteNumber(data.current.relative_humidity_2m),
    windSpeedKmh: finiteNumber(data.current.wind_speed_10m),
    precipitationMm: finiteNumber(data.current.precipitation) ?? 0,
    pressureHpa: finiteNumber(data.current.surface_pressure),
    weatherCode: finiteNumber(data.current.weather_code),
  };

  const dates = data.daily.time ?? [];
  const forecast: ForecastDay[] = dates.slice(0, 5).map((date, index) => ({
    date: typeof date === 'string' && date ? date : '—',
    minTemperatureCelsius: finiteNumber(data.daily?.temperature_2m_min?.[index]),
    maxTemperatureCelsius: finiteNumber(data.daily?.temperature_2m_max?.[index]),
    precipitationProbability: finiteNumber(data.daily?.precipitation_probability_max?.[index]),
    weatherCode: finiteNumber(data.daily?.weather_code?.[index]),
  }));

  return {
    city,
    current,
    forecast,
    fetchedAt: Date.now(),
  };
}