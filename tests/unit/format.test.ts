import { describe, expect, it } from 'vitest';

import { formatDayLabel, getShortDate } from '../../src/lib/format';

describe('formatDayLabel', () => {
  it('retorna Hoje para o índice 0', () => {
    expect(formatDayLabel('2026-09-02', 0)).toBe('Hoje');
  });

  it('retorna Amanhã para o índice 1', () => {
    expect(formatDayLabel('2026-09-03', 1)).toBe('Amanhã');
  });

  it('retorna o dia da semana abreviado a partir do índice 2', () => {
    expect(formatDayLabel('2026-09-04', 2)).toBe('sex');
  });
});

describe('getShortDate', () => {
  it('retorna a data no formato curto pt-BR', () => {
    expect(getShortDate('2026-09-02')).toBe('02/09');
  });
});