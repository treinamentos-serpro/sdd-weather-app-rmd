import type { City, CurrentWeather as CurrentWeatherData, Unit } from '../types/weather';
import { formatTemperature } from '../lib/temperature';
import { getWeatherCondition } from '../lib/weatherCodes';

interface CurrentWeatherProps {
  city: City;
  current: CurrentWeatherData;
  unit: Unit;
}

function formatMetric(value: number | undefined, suffix: string): string {
  return value === undefined || !Number.isFinite(value) ? '—' : `${Math.round(value)}${suffix}`;
}

export default function CurrentWeather({ city, current, unit }: CurrentWeatherProps) {
  const condition = getWeatherCondition(current.weatherCode);

  return (
    <section
      aria-labelledby="current-weather-heading"
      className="min-w-0 rounded-2xl border border-white/10 bg-white/5 p-5 text-white shadow-glass backdrop-blur-md sm:p-8"
    >
      <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-white/70">Clima atual</p>
          <h1 className="mt-2 text-2xl font-semibold" id="current-weather-heading">
            {city.name}
          </h1>
          <p className="mt-1 text-white/80">
            {city.admin1 ? `${city.admin1}, ` : ''}
            {city.country}
          </p>
        </div>

        <div
          aria-label={`Condição: ${condition.label}`}
          className="flex items-center gap-4"
          role="group"
        >
          <span aria-hidden="true" className="text-6xl leading-none">
            {condition.icon}
          </span>
          <div>
            <p className="text-6xl font-bold leading-none tracking-tight">
              {formatTemperature(current.temperatureCelsius, unit)}
            </p>
              <p className="mt-3 text-lg text-white/90">{condition.label}</p>
              <p className="mt-1 text-sm text-white/80">
              Sensação de {formatTemperature(current.apparentTemperatureCelsius, unit)}
            </p>
          </div>
        </div>
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <dt className="text-sm text-white/80">Umidade</dt>
          <dd className="mt-1 text-lg font-semibold">{formatMetric(current.relativeHumidity, '%')}</dd>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <dt className="text-sm text-white/80">Vento</dt>
          <dd className="mt-1 text-lg font-semibold">{formatMetric(current.windSpeedKmh, ' km/h')}</dd>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <dt className="text-sm text-white/80">Precipitação</dt>
          <dd className="mt-1 text-lg font-semibold">{formatMetric(current.precipitationMm, ' mm')}</dd>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <dt className="text-sm text-white/80">Pressão</dt>
          <dd className="mt-1 text-lg font-semibold">{formatMetric(current.pressureHpa, ' hPa')}</dd>
        </div>
      </dl>
    </section>
  );
}