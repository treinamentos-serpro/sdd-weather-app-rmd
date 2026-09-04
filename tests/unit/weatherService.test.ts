import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  getWeather,
  searchCities,
  WeatherServiceError,
} from '../../src/services/weatherService';
import type { City } from '../../src/types/weather';

const city: City = {
  id: 1,
  name: 'Sao Paulo',
  country: 'Brazil',
  admin1: 'Sao Paulo',
  latitude: -23.55,
  longitude: -46.63,
  timezone: 'America/Sao_Paulo',
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('searchCities', () => {
  it('não chama fetch quando o input está vazio', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCities('   ')).resolves.toEqual([]);

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('mapeia os resultados de geocoding para City', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          results: [
            {
              id: 1,
              name: 'Sao Paulo',
              country: 'Brazil',
              admin1: 'Sao Paulo',
              latitude: -23.55,
              longitude: -46.63,
              timezone: 'America/Sao_Paulo',
            },
          ],
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCities(' São Paulo ')).resolves.toEqual([city]);
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(new URL(fetchMock.mock.calls[0][0]).searchParams.get('name')).toBe('São Paulo');
  });

  it('retorna lista vazia quando results está ausente', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify({}), { status: 200 })),
    );

    await expect(searchCities('Cidade')).resolves.toEqual([]);
  });

  it('lança WeatherServiceError quando a resposta não é ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('indisponível', { status: 503, statusText: 'Service Unavailable' }),
      ),
    );

    await expect(searchCities('Cidade')).rejects.toMatchObject({
      name: 'WeatherServiceError',
      status: 503,
    });
  });

  it('transforma falha de rede offline em mensagem amigável', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    await expect(searchCities('Cidade')).rejects.toMatchObject({
      name: 'WeatherServiceError',
      kind: 'network',
      message: 'Não foi possível conectar ao serviço de clima. Verifique sua conexão e tente novamente.',
    });
  });
});

describe('getWeather', () => {
  it('mapeia current e os primeiros 5 dias de daily', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          current: {
            temperature_2m: 24.6,
            apparent_temperature: 25.1,
            relative_humidity_2m: 61,
            wind_speed_10m: 12.4,
            precipitation: 0.2,
            surface_pressure: 1012.8,
            weather_code: 2,
          },
          daily: {
            time: [
              '2026-09-04',
              '2026-09-05',
              '2026-09-06',
              '2026-09-07',
              '2026-09-08',
              '2026-09-09',
            ],
            temperature_2m_min: [18, 17, 16, 15, 14, 13],
            temperature_2m_max: [28, 27, 26, 25, 24, 23],
            precipitation_probability_max: [10, 20, 30, 40, 50, 60],
            weather_code: [2, 3, 61, 80, 95, 0],
          },
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    const weather = await getWeather(city);

    expect(weather.city).toEqual(city);
    expect(weather.current).toEqual({
      temperatureCelsius: 24.6,
      apparentTemperatureCelsius: 25.1,
      relativeHumidity: 61,
      windSpeedKmh: 12.4,
      precipitationMm: 0.2,
      pressureHpa: 1012.8,
      weatherCode: 2,
    });
    expect(weather.forecast).toHaveLength(5);
    expect(weather.forecast[0]).toEqual({
      date: '2026-09-04',
      minTemperatureCelsius: 18,
      maxTemperatureCelsius: 28,
      precipitationProbability: 10,
      weatherCode: 2,
    });
    expect(weather.forecast[4]).toEqual({
      date: '2026-09-08',
      minTemperatureCelsius: 14,
      maxTemperatureCelsius: 24,
      precipitationProbability: 50,
      weatherCode: 95,
    });
  });

  it('converte precipitação null para zero', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            current: { precipitation: null },
            daily: { time: [] },
          }),
          { status: 200 },
        ),
      ),
    );

    const weather = await getWeather(city);

    expect(weather.current.precipitationMm).toBe(0);
  });

  it('lança WeatherServiceError quando o forecast responde com erro HTTP', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('indisponível', { status: 503, statusText: 'Service Unavailable' }),
      ),
    );

    await expect(getWeather(city)).rejects.toMatchObject({
      name: 'WeatherServiceError',
      status: 503,
    });
  });

  it('transforma falha de rede offline do forecast em mensagem amigável', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    await expect(getWeather(city)).rejects.toMatchObject({
      name: 'WeatherServiceError',
      kind: 'network',
      message: 'Não foi possível conectar ao serviço de clima. Verifique sua conexão e tente novamente.',
    });
  });

  it('preserva campos ausentes como undefined em uma resposta parcial', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            current: {
              temperature_2m: 18,
              precipitation: null,
            },
            daily: {
              time: ['2026-09-04'],
              temperature_2m_min: [12],
              temperature_2m_max: [22],
              weather_code: [null],
            },
          }),
          { status: 200 },
        ),
      ),
    );

    const weather = await getWeather(city);

    expect(weather.current).toMatchObject({
      temperatureCelsius: 18,
      apparentTemperatureCelsius: undefined,
      relativeHumidity: undefined,
      windSpeedKmh: undefined,
      pressureHpa: undefined,
      weatherCode: undefined,
    });
    expect(weather.forecast).toEqual([
      {
        date: '2026-09-04',
        minTemperatureCelsius: 12,
        maxTemperatureCelsius: 22,
        precipitationProbability: undefined,
        weatherCode: undefined,
      },
    ]);
  });

  it('normaliza números inválidos e datas ausentes para fallbacks seguros', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            current: {
              temperature_2m: Number.NaN,
              apparent_temperature: Number.POSITIVE_INFINITY,
              relative_humidity_2m: null,
              wind_speed_10m: null,
              precipitation: null,
              surface_pressure: Number.NaN,
              weather_code: null,
            },
            daily: {
              time: [null],
              temperature_2m_min: [Number.NaN],
              temperature_2m_max: [null],
              precipitation_probability_max: [Number.POSITIVE_INFINITY],
              weather_code: [null],
            },
          }),
          { status: 200 },
        ),
      ),
    );

    const weather = await getWeather(city);

    expect(weather.current).toEqual({
      temperatureCelsius: undefined,
      apparentTemperatureCelsius: undefined,
      relativeHumidity: undefined,
      windSpeedKmh: undefined,
      precipitationMm: 0,
      pressureHpa: undefined,
      weatherCode: undefined,
    });
    expect(weather.forecast).toEqual([
      {
        date: '—',
        minTemperatureCelsius: undefined,
        maxTemperatureCelsius: undefined,
        precipitationProbability: undefined,
        weatherCode: undefined,
      },
    ]);
  });

  it.each([
    ['current', { daily: { time: [] } }],
    ['daily', { current: {} }],
  ])('lança WeatherServiceError quando %s está ausente', async (_missing, response) => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify(response), { status: 200 })),
    );

    await expect(getWeather(city)).rejects.toBeInstanceOf(WeatherServiceError);
  });
});