import type { ForecastDay, Unit } from '../types/weather';
import { formatDayLabel } from '../lib/format';
import { formatTemperature } from '../lib/temperature';
import { getWeatherCondition } from '../lib/weatherCodes';

interface ForecastCardProps {
  day: ForecastDay;
  unit: Unit;
}

function formatProbability(value: number | undefined): string {
  return value === undefined || !Number.isFinite(value) ? '—' : `${Math.round(value)}%`;
}

export default function ForecastCard({ day, unit }: ForecastCardProps) {
  const condition = getWeatherCondition(day.weatherCode);

  return (
    <article className="flex min-w-0 flex-col rounded-xl border border-white/10 bg-white/5 p-3 text-white shadow-glass backdrop-blur-md sm:p-4">
      <h3 className="break-words text-sm font-semibold capitalize text-white/90">{formatDayLabel(day.date)}</h3>
      <span aria-hidden="true" className="mt-5 text-4xl leading-none">
        {condition.icon}
      </span>
      <p className="mt-3 min-h-10 break-words text-sm text-white/80">{condition.label}</p>
      <dl className="mt-4 flex items-baseline gap-2">
        <dt className="sr-only">Temperatura máxima</dt>
        <dd className="text-xl font-bold">{formatTemperature(day.maxTemperatureCelsius, unit)}</dd>
        <dt className="sr-only">Temperatura mínima</dt>
        <dd className="text-sm text-white/80">{formatTemperature(day.minTemperatureCelsius, unit)}</dd>
      </dl>
      <dl className="mt-4 border-t border-white/10 pt-3 text-sm">
        <dt className="text-white/60">Chuva</dt>
        <dd className="mt-1 font-medium">{formatProbability(day.precipitationProbability)}</dd>
      </dl>
    </article>
  );
}