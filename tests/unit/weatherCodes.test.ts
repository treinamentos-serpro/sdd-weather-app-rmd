import { describe, expect, it } from 'vitest';

import { getWeatherCondition } from '../../src/lib/weatherCodes';

describe('getWeatherCondition', () => {
  it('retorna a condição conhecida para um código WMO', () => {
    expect(getWeatherCondition(0)).toEqual({
      label: 'Céu limpo',
      icon: '☀️',
    });
  });

  it('retorna o fallback para um código desconhecido', () => {
    expect(getWeatherCondition(999)).toEqual({
      label: 'Condição desconhecida',
      icon: '❓',
    });
  });

  it('retorna o fallback quando o código não foi informado', () => {
    expect(getWeatherCondition(undefined)).toEqual({
      label: 'Condição desconhecida',
      icon: '❓',
    });
  });
});