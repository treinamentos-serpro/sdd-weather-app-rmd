import { describe, expect, it } from 'vitest';

import {
  convertTemperature,
  formatTemperature,
  unitLabel,
} from '../../src/lib/temperature';

describe('convertTemperature', () => {
  it('converte 0 °C para 32 °F', () => {
    expect(convertTemperature(0, 'fahrenheit')).toBe(32);
  });

  it('converte 100 °C para 212 °F', () => {
    expect(convertTemperature(100, 'fahrenheit')).toBe(212);
  });

  it('converte -40 °C para -40 °F', () => {
    expect(convertTemperature(-40, 'fahrenheit')).toBe(-40);
  });

  it('mantém o valor quando a unidade é Celsius', () => {
    expect(convertTemperature(23.5, 'celsius')).toBe(23.5);
  });
});

describe('formatTemperature', () => {
  it('arredonda o valor convertido e adiciona o símbolo de temperatura', () => {
    expect(formatTemperature(20.5, 'fahrenheit')).toBe('69°');
  });

  it('arredonda valores Celsius e adiciona o símbolo de temperatura', () => {
    expect(formatTemperature(19.6, 'celsius')).toBe('20°');
  });

  it('retorna placeholder para valor indefinido', () => {
    expect(formatTemperature(undefined, 'celsius')).toBe('—');
  });
});

describe('unitLabel', () => {
  it('retorna o símbolo de Celsius', () => {
    expect(unitLabel('celsius')).toBe('°C');
  });

  it('retorna o símbolo de Fahrenheit', () => {
    expect(unitLabel('fahrenheit')).toBe('°F');
  });
});