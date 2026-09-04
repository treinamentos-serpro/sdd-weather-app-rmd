import type { ForecastDay, Unit } from '../types/weather';
import ForecastCard from './ForecastCard';

interface ForecastListProps {
  forecast: ForecastDay[];
  unit: Unit;
}

export default function ForecastList({ forecast, unit }: ForecastListProps) {
  return (
    <section aria-labelledby="forecast-heading" className="min-w-0">
      <h2 className="text-xl font-semibold text-white" id="forecast-heading">
        Previsão de 5 dias
      </h2>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {forecast.map((day) => (
          <ForecastCard day={day} key={day.date} unit={unit} />
        ))}
      </div>
    </section>
  );
}