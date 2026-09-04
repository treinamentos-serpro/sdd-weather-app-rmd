import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import CurrentWeather from '../../src/components/CurrentWeather';
import type { City } from '../../src/types/weather';

const city: City = {
  id: 1,
  name: 'São Paulo',
  country: 'Brasil',
  latitude: -23.55,
  longitude: -46.63,
};

afterEach(() => {
  cleanup();
});

describe('CurrentWeather', () => {
  it('exibe placeholder para campos ausentes ou inválidos', () => {
    render(
      <CurrentWeather
        city={city}
        current={{
          temperatureCelsius: Number.NaN,
          apparentTemperatureCelsius: undefined,
          relativeHumidity: Number.POSITIVE_INFINITY,
          windSpeedKmh: undefined,
          precipitationMm: 0,
          pressureHpa: Number.NaN,
          weatherCode: undefined,
        }}
        unit="celsius"
      />,
    );

    expect(screen.getAllByText('—')).toHaveLength(4);
    expect(screen.getByText('0 mm')).toBeInTheDocument();
    expect(screen.queryByText(/NaN|undefined|null/)).not.toBeInTheDocument();
  });
});