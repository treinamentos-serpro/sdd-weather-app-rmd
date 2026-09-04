import type { WeatherData } from '../types/weather';

export const mockWeatherData: WeatherData = {
  city: {
    id: 3448439,
    name: 'Sao Paulo',
    country: 'Brazil',
    admin1: 'Sao Paulo',
    latitude: -23.5475,
    longitude: -46.6361,
    timezone: 'America/Sao_Paulo',
  },
  current: {
    temperatureCelsius: 24.6,
    apparentTemperatureCelsius: 25.1,
    relativeHumidity: 61,
    windSpeedKmh: 12.4,
    weatherCode: 2,
  },
  forecast: [
    {
      date: '2026-09-03',
      minTemperatureCelsius: 18.4,
      maxTemperatureCelsius: 28.2,
      weatherCode: 2,
    },
    {
      date: '2026-09-04',
      minTemperatureCelsius: 17.9,
      maxTemperatureCelsius: 27.5,
      weatherCode: 3,
    },
    {
      date: '2026-09-05',
      minTemperatureCelsius: 16.8,
      maxTemperatureCelsius: 24.1,
      weatherCode: 61,
    },
    {
      date: '2026-09-06',
      minTemperatureCelsius: 16.1,
      maxTemperatureCelsius: 23.8,
      weatherCode: 80,
    },
    {
      date: '2026-09-07',
      minTemperatureCelsius: 19.2,
      maxTemperatureCelsius: 29,
      weatherCode: 1,
    },
  ],
  fetchedAt: Date.parse('2026-09-03T12:00:00.000Z'),
};