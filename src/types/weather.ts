export type Unit = 'celsius' | 'fahrenheit';

export interface City {
  /** Identificador retornado pelo geocoding da Open-Meteo. */
  id: number;

  /** Nome da cidade retornado pelo geocoding. */
  name: string;

  /** Nome do pais usado para diferenciar cidades. */
  country: string;

  /** Estado, provincia ou regiao quando disponivel. */
  admin1?: string;

  /** Latitude usada na requisicao de forecast. */
  latitude: number;

  /** Longitude usada na requisicao de forecast. */
  longitude: number;

  /** Fuso horario retornado pelo geocoding quando disponivel. */
  timezone?: string;
}

export interface CurrentWeather {
  /** Temperatura atual em Celsius. */
  temperatureCelsius?: number;

  /** Sensacao termica atual em Celsius. */
  apparentTemperatureCelsius?: number;

  /** Umidade relativa atual em percentual. */
  relativeHumidity?: number;

  /** Velocidade atual do vento em km/h. */
  windSpeedKmh?: number;

  /** Precipitacao atual em milimetros. */
  precipitationMm?: number;

  /** Pressao atmosferica atual em hPa. */
  pressureHpa?: number;

  /** Codigo WMO retornado pela Open-Meteo. */
  weatherCode?: number;
}

export interface ForecastDay {
  /** Data da previsao no formato ISO yyyy-mm-dd. */
  date: string;

  /** Temperatura minima do dia em Celsius. */
  minTemperatureCelsius?: number;

  /** Temperatura maxima do dia em Celsius. */
  maxTemperatureCelsius?: number;

  /** Probabilidade maxima de precipitacao em percentual. */
  precipitationProbability?: number;

  /** Codigo WMO diario retornado pela Open-Meteo. */
  weatherCode?: number;
}

export interface WeatherData {
  /** Cidade associada aos dados meteorologicos. */
  city: City;

  /** Condicoes meteorologicas atuais. */
  current: CurrentWeather;

  /** Previsao diaria, normalmente com hoje e mais quatro dias. */
  forecast: ForecastDay[];

  /** Momento da resposta, util para decisoes de cache. */
  fetchedAt: number;
}