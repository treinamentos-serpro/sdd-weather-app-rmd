import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useState } from 'react';

import CurrentWeather from '../../src/components/CurrentWeather';
import UnitToggle from '../../src/components/UnitToggle';
import type { City, Unit } from '../../src/types/weather';

const city: City = {
  id: 1,
  name: 'São Paulo',
  country: 'Brasil',
  latitude: -23.55,
  longitude: -46.63,
};

function UnitToggleWithCurrentWeather() {
  const [unit, setUnit] = useState<Unit>('celsius');

  return (
    <>
      <UnitToggle onChange={setUnit} unit={unit} />
      <CurrentWeather
        city={city}
        current={{
          temperatureCelsius: 0,
          apparentTemperatureCelsius: 0,
          weatherCode: 0,
        }}
        unit={unit}
      />
    </>
  );
}

afterEach(() => {
  cleanup();
});

describe('conversão de unidade na interface', () => {
  it('exibe 32° ao clicar em Fahrenheit para uma temperatura de 0°C', async () => {
    const user = userEvent.setup();

    render(<UnitToggleWithCurrentWeather />);

    expect(screen.getByText('0°')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Usar Fahrenheit' }));

    expect(screen.getByText('32°')).toBeInTheDocument();
    expect(screen.getByText('Sensação de 32°')).toBeInTheDocument();
  });
});

describe('UnitToggle', () => {
  it('informa a unidade selecionada pelo estado pressed', () => {
    const onChange = vi.fn();

    render(<UnitToggle onChange={onChange} unit="celsius" />);

    expect(screen.getByRole('button', { name: 'Usar Celsius' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Usar Fahrenheit' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });
});