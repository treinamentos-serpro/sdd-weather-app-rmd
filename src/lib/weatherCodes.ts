export interface WeatherCondition {
  label: string;
  icon: string;
}

const weatherConditions: Record<number, WeatherCondition> = {
  0: { label: 'Céu limpo', icon: '☀️' },
  1: { label: 'Predominantemente limpo', icon: '🌤️' },
  2: { label: 'Parcialmente nublado', icon: '⛅' },
  3: { label: 'Nublado', icon: '☁️' },
  45: { label: 'Neblina', icon: '🌫️' },
  48: { label: 'Neblina congelante', icon: '🌫️' },
  51: { label: 'Garoa leve', icon: '🌦️' },
  53: { label: 'Garoa moderada', icon: '🌦️' },
  55: { label: 'Garoa intensa', icon: '🌧️' },
  61: { label: 'Chuva leve', icon: '🌦️' },
  63: { label: 'Chuva moderada', icon: '🌧️' },
  65: { label: 'Chuva intensa', icon: '🌧️' },
  71: { label: 'Neve leve', icon: '🌨️' },
  73: { label: 'Neve moderada', icon: '🌨️' },
  75: { label: 'Neve intensa', icon: '❄️' },
  80: { label: 'Pancadas de chuva', icon: '🌦️' },
  81: { label: 'Pancadas moderadas', icon: '🌧️' },
  82: { label: 'Pancadas intensas', icon: '⛈️' },
  95: { label: 'Trovoada', icon: '⛈️' },
  96: { label: 'Trovoada com granizo leve', icon: '⛈️' },
  99: { label: 'Trovoada com granizo intenso', icon: '⛈️' },
};

export function getWeatherCondition(weatherCode: number | undefined): WeatherCondition {
  return weatherCode === undefined
    ? { label: 'Condição desconhecida', icon: '❓' }
    : (weatherConditions[weatherCode] ?? { label: 'Condição desconhecida', icon: '❓' });
}