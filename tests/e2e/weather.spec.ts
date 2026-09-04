import { expect, test } from '@playwright/test';

test('busca uma cidade, exibe a previsão e alterna para Fahrenheit', async ({ page }) => {
  await page.route('**/geocoding-api.open-meteo.com/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        results: [
          {
            id: 3448439,
            name: 'São Paulo',
            country: 'Brasil',
            admin1: 'São Paulo',
            latitude: -23.55,
            longitude: -46.63,
            timezone: 'America/Sao_Paulo',
          },
        ],
      }),
    });
  });

  await page.route('**/api.open-meteo.com/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        current: {
          temperature_2m: 0,
          apparent_temperature: 0,
          relative_humidity_2m: 65,
          wind_speed_10m: 10,
          precipitation: 0,
          surface_pressure: 1013,
          weather_code: 0,
        },
        daily: {
          time: [
            '2026-09-04',
            '2026-09-05',
            '2026-09-06',
            '2026-09-07',
            '2026-09-08',
          ],
          temperature_2m_min: [0, 1, 2, 3, 4],
          temperature_2m_max: [10, 11, 12, 13, 14],
          precipitation_probability_max: [0, 10, 20, 30, 40],
          weather_code: [0, 1, 2, 3, 61],
        },
      }),
    });
  });

  await page.goto('/');
  await page.getByLabel('Nome da cidade').fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await page.getByRole('option', { name: 'São Paulo, São Paulo, Brasil' }).click();

  await expect(page.getByRole('heading', { name: 'São Paulo' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Previsão de 5 dias' })).toBeVisible();
  const currentCondition = page.getByRole('group', { name: 'Condição: Céu limpo' });
  await expect(currentCondition.getByText('0°', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Usar Fahrenheit' }).click();

  await expect(currentCondition.getByText('32°', { exact: true })).toBeVisible();
});

test('exibe estado vazio quando o geocoding não retorna resultados', async ({ page }) => {
  let forecastRequests = 0;

  await page.route('**/geocoding-api.open-meteo.com/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({}),
    });
  });

  await page.route('**/api.open-meteo.com/**', async (route) => {
    forecastRequests += 1;
    await route.abort();
  });

  await page.goto('/');
  await page.getByLabel('Nome da cidade').fill('Cidade inexistente');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(
    page.getByRole('heading', { name: 'Nenhuma cidade encontrada', exact: true }),
  ).toBeVisible();
    expect(forecastRequests).toBe(0);
});

test('renderiza o fluxo principal corretamente em viewport mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });

  await page.route('**/geocoding-api.open-meteo.com/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        results: [
          {
            id: 3448439,
            name: 'São Paulo',
            country: 'Brasil',
            admin1: 'São Paulo',
            latitude: -23.55,
            longitude: -46.63,
            timezone: 'America/Sao_Paulo',
          },
        ],
      }),
    });
  });

  await page.route('**/api.open-meteo.com/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        current: {
          temperature_2m: 0,
          apparent_temperature: 0,
          relative_humidity_2m: 65,
          wind_speed_10m: 10,
          precipitation: 0,
          surface_pressure: 1013,
          weather_code: 0,
        },
        daily: {
          time: [
            '2026-09-04',
            '2026-09-05',
            '2026-09-06',
            '2026-09-07',
            '2026-09-08',
          ],
          temperature_2m_min: [0, 1, 2, 3, 4],
          temperature_2m_max: [10, 11, 12, 13, 14],
          precipitation_probability_max: [0, 10, 20, 30, 40],
          weather_code: [0, 1, 2, 3, 61],
        },
      }),
    });
  });

  await page.goto('/');
  await page.getByLabel('Nome da cidade').fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await page.getByRole('option', { name: 'São Paulo, São Paulo, Brasil' }).click();

  await expect(page.getByRole('heading', { name: 'São Paulo' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Previsão de 5 dias' })).toBeVisible();
  await expect(page.getByRole('group', { name: 'Condição: Céu limpo' })).toBeVisible();
});

test('renderiza placeholders quando o forecast está incompleto', async ({ page }) => {
  await page.route('**/geocoding-api.open-meteo.com/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        results: [
          {
            id: 3448439,
            name: 'São Paulo',
            country: 'Brasil',
            admin1: 'São Paulo',
            latitude: -23.55,
            longitude: -46.63,
          },
        ],
      }),
    });
  });

  await page.route('**/api.open-meteo.com/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        current: {
          temperature_2m: null,
          apparent_temperature: null,
          relative_humidity_2m: null,
          wind_speed_10m: null,
          precipitation: null,
          surface_pressure: null,
          weather_code: null,
        },
        daily: {
          time: [],
        },
      }),
    });
  });

  await page.goto('/');
  await page.getByLabel('Nome da cidade').fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await page.getByRole('option', { name: 'São Paulo, São Paulo, Brasil' }).click();

  const currentWeather = page.getByRole('region', { name: 'São Paulo' });
  await expect(currentWeather).toBeVisible();
  await expect(currentWeather).not.toContainText(/NaN|undefined|null/);
  await expect(currentWeather.getByText('—', { exact: true })).toHaveCount(4);
  await expect(currentWeather.getByText('0 mm', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Previsão de 5 dias' })).toBeVisible();
});