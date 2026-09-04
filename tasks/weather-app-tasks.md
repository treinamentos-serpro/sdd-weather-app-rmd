# Weather App - Backlog de Tarefas

> Entrada: [plans/weather-app-plan.md](../plans/weather-app-plan.md). Este backlog organiza a implementação por entregas, em tarefas pequenas, verificáveis e ordenadas por dependência. A sequência macro é: tipos -> funções puras -> services -> hook -> componentes -> integração -> testes -> hardening.

## Entrega 1 - Fundação do Modelo e Utilitários

### T-01 - Definir tipos compartilhados do domínio

- **Tipo:** Data
- **Descrição curta:** Criar os contratos TypeScript principais para cidade, clima atual, previsão diária, relatório, unidade, status e erro.
- **Rastreabilidade:** RF1, RF2, RF3, RF4, RF5, RF6, RF7; NFR8.
- **Critérios de aceite:**
  - `City`, `WeatherCondition`, `CurrentWeather`, `DailyForecast`, `WeatherReport`, `TemperatureUnit`, `RequestStatus`, `WeatherOperation`, `AppError` e `WeatherAppState` estão definidos.
  - Temperaturas internas usam Celsius.
  - Campos ausentes da API são opcionais quando a spec permite placeholder.
  - O projeto compila em TypeScript strict.
- **Dependências:** Nenhuma.
- **Arquivos prováveis:**
  - `src/types/weather.ts`

### T-02 - Implementar conversão e formatação de temperatura

- **Tipo:** Data
- **Descrição curta:** Criar funções puras para converter Celsius/Fahrenheit e formatar valores exibidos.
- **Rastreabilidade:** RF5; AC5.1, AC5.2, AC5.4.
- **Critérios de aceite:**
  - Celsius é exibido sem conversão e com arredondamento inteiro.
  - Fahrenheit usa `(celsius * 9) / 5 + 32` e `Math.round`.
  - Valores ausentes retornam placeholder `—`.
  - Casos 0 °C, 100 °C, -40 °C e 20.5 °C produzem os resultados esperados.
- **Dependências:** T-01.
- **Arquivos prováveis:**
  - `src/lib/temperature.ts`

### T-03 - Implementar mapeamento de códigos WMO

- **Tipo:** Data
- **Descrição curta:** Criar o mapeamento de `weather_code` para rótulos pt-BR e ícones Unicode simples.
- **Rastreabilidade:** RF3, RF4; AC3.2, AC4.2; decisão de ícones da spec.
- **Critérios de aceite:**
  - Códigos WMO usados pela Open-Meteo retornam `WeatherCondition` com `label` e `icon`.
  - Código ausente ou desconhecido retorna `Condição desconhecida` e `❓`.
  - O mapeamento fica isolado em função pura testável.
- **Dependências:** T-01.
- **Arquivos prováveis:**
  - `src/lib/weatherCodes.ts`

### T-04 - Implementar cache em memória com TTL

- **Tipo:** Data
- **Descrição curta:** Criar cache simples para geocoding e forecast, com expiração de 10 minutos.
- **Rastreabilidade:** NFR7; decisões de cache da spec.
- **Critérios de aceite:**
  - Cache retorna hit quando a entrada existe e não expirou.
  - Cache retorna miss quando a entrada não existe ou passou do TTL.
  - Chaves de busca usam termo normalizado com `trim()` e lowercase.
  - Chaves de forecast usam coordenadas da cidade de forma estável.
- **Dependências:** T-01.
- **Arquivos prováveis:**
  - `src/lib/cache.ts`

### T-05 - Implementar storage resiliente de preferências

- **Tipo:** Data
- **Descrição curta:** Encapsular leitura e escrita de unidade e última cidade em `localStorage`.
- **Rastreabilidade:** RF6; AC6.1, AC6.2, AC6.3, AC6.4.
- **Critérios de aceite:**
  - Unidade padrão é Celsius quando não há preferência salva.
  - Unidade e última cidade válidas são restauradas.
  - JSON corrompido, storage indisponível ou dados inválidos não quebram o app.
  - Falhas de escrita são ignoradas sem interromper o fluxo.
- **Dependências:** T-01.
- **Arquivos prováveis:**
  - `src/lib/storage.ts`

## Entrega 2 - Acesso a Dados Open-Meteo

### T-06 - Implementar client base HTTP com timeout e erro normalizado

- **Tipo:** Data
- **Descrição curta:** Criar utilitário interno para chamadas `fetch` com timeout de 10 s e normalização de erros.
- **Rastreabilidade:** RF7; AC1.5, AC7.1, AC7.2, AC7.5; NFR10.
- **Critérios de aceite:**
  - Requests usam `AbortController` com limite de 10 s.
  - Falhas de rede viram erro `network`.
  - Timeout vira erro `timeout`.
  - HTTP não-2xx vira erro `api`, exceto 429 que vira `rate-limit`.
  - Erros preservam a operação que falhou quando aplicável.
- **Dependências:** T-01.
- **Arquivos prováveis:**
  - `src/services/openMeteo.ts`

### T-07 - Implementar geocoding de cidades

- **Tipo:** Data
- **Descrição curta:** Consultar Open-Meteo Geocoding e mapear resultados para `City[]`.
- **Rastreabilidade:** RF1; AC1.1, AC1.2, AC1.3, AC1.5; NFR6, NFR7.
- **Critérios de aceite:**
  - Endpoint usa `https://geocoding-api.open-meteo.com/v1/search`.
  - Request envia `name`, `count`, `language=pt` e `format=json`.
  - Termos com acentos, hífens e apóstrofos são codificados corretamente.
  - Resposta 200 sem resultados vira lista vazia, não erro.
  - Cada cidade válida contém `id`, `name`, `country`, `latitude` e `longitude`; `admin1` e `timezone` são opcionais.
  - Itens inválidos são descartados; se nenhum item válido sobrar, retorna vazio.
- **Dependências:** T-01, T-04, T-06.
- **Arquivos prováveis:**
  - `src/services/openMeteo.ts`

### T-08 - Implementar forecast de clima e previsão

- **Tipo:** Data
- **Descrição curta:** Consultar Open-Meteo Forecast e mapear resposta para `WeatherReport`.
- **Rastreabilidade:** RF3, RF4; AC3.1, AC3.2, AC4.1, AC4.2; edge case de resposta parcial.
- **Critérios de aceite:**
  - Endpoint usa `https://api.open-meteo.com/v1/forecast`.
  - Request envia `latitude`, `longitude`, `current`, `daily`, `forecast_days=5`, `temperature_unit=celsius`, `wind_speed_unit=kmh` e `timezone=auto`.
  - `current` é mapeado para temperatura, sensação térmica, umidade, vento e condição.
  - `daily` é mapeado para hoje + 4 dias quando disponível.
  - Campos parciais opcionais não quebram a normalização.
  - Dados mínimos inválidos geram erro `invalid-data`.
- **Dependências:** T-01, T-03, T-04, T-06.
- **Arquivos prováveis:**
  - `src/services/openMeteo.ts`

## Entrega 3 - Orquestração de Estado

### T-09 - Criar hook `useWeatherApp` com estado inicial e persistência

- **Tipo:** Data
- **Descrição curta:** Centralizar o estado da aplicação, restaurando unidade e última cidade ao iniciar.
- **Rastreabilidade:** RF6, RF7; AC6.1, AC6.2, AC6.3, AC6.4, AC7.3.
- **Critérios de aceite:**
  - Estado inicial usa `unit: 'celsius'`, `searchStatus: 'idle'` e `weatherStatus: 'idle'` quando não há persistência.
  - Unidade salva é restaurada quando válida.
  - Última cidade salva dispara carregamento automático de forecast.
  - Falha na restauração da cidade exibe erro sem travar e mantém busca disponível.
- **Dependências:** T-05, T-08.
- **Arquivos prováveis:**
  - `src/hooks/useWeatherApp.ts`

### T-10 - Orquestrar busca, vazio e erro de geocoding

- **Tipo:** Data
- **Descrição curta:** Implementar fluxo de busca confirmada, incluindo input vazio, loading, resultados, vazio e erro.
- **Rastreabilidade:** RF1, RF7; AC1.1, AC1.3, AC1.4, AC1.5, AC7.1, AC7.2, AC7.5; NFR7.
- **Critérios de aceite:**
  - Termo vazio ou apenas espaços não dispara request nem loading.
  - Busca válida muda `searchStatus` para `loading`.
  - Resultados válidos mudam `searchStatus` para `success` e atualizam `results`.
  - Busca sem resultados muda `searchStatus` para `empty`.
  - Erro de geocoding muda `searchStatus` para `error` e registra retry da mesma busca.
  - Submits repetidos são bloqueados enquanto há busca em andamento.
- **Dependências:** T-07, T-09.
- **Arquivos prováveis:**
  - `src/hooks/useWeatherApp.ts`

### T-11 - Orquestrar seleção de cidade, forecast e retry

- **Tipo:** Data
- **Descrição curta:** Implementar seleção de cidade, carregamento de forecast, preservação de dados e retry da última operação.
- **Rastreabilidade:** RF2, RF3, RF4, RF7; AC2.1, AC2.2, AC7.2, AC7.4, AC7.5.
- **Critérios de aceite:**
  - Selecionar cidade define `activeCity` e inicia forecast.
  - Forecast bem-sucedido atualiza `report`, persiste última cidade e muda `weatherStatus` para `success`.
  - Erro de primeira carga exibe estado de erro em tela cheia.
  - Erro após dados já carregados preserva `report` e habilita banner.
  - Retry reexecuta exatamente a última operação que falhou.
- **Dependências:** T-08, T-09, T-10.
- **Arquivos prováveis:**
  - `src/hooks/useWeatherApp.ts`

### T-12 - Orquestrar alternância de unidade sem request

- **Tipo:** Data
- **Descrição curta:** Implementar troca Celsius/Fahrenheit como mudança de estado local e persistida.
- **Rastreabilidade:** RF5, RF6; AC5.1, AC5.2, AC5.3, AC6.1.
- **Critérios de aceite:**
  - Toggle altera apenas `unit`.
  - `report`, `activeCity`, `results` e cache permanecem inalterados.
  - Nenhuma chamada de geocoding ou forecast é disparada ao alternar unidade.
  - Unidade escolhida é salva para próxima visita.
- **Dependências:** T-02, T-05, T-11.
- **Arquivos prováveis:**
  - `src/hooks/useWeatherApp.ts`

## Entrega 4 - Componentes de UI

### T-13 - Criar componente de busca

- **Tipo:** UI
- **Descrição curta:** Implementar formulário de busca com confirmação por Enter ou botão.
- **Rastreabilidade:** RF1; AC1.1, AC1.4; NFR3, NFR7.
- **Critérios de aceite:**
  - Campo de busca tem label acessível.
  - Enter e botão disparam `onSearch` com termo atual.
  - Campo continua disponível quando há cidade ativa.
  - Botão fica desabilitado durante loading de busca.
  - Termo vazio não mostra loading nem dispara request pelo fluxo integrado.
- **Dependências:** T-10.
- **Arquivos prováveis:**
  - `src/components/SearchForm.tsx`

### T-14 - Criar lista de resultados de cidades

- **Tipo:** UI
- **Descrição curta:** Renderizar resultados de geocoding com desambiguação e suporte a teclado.
- **Rastreabilidade:** RF1, RF2; AC1.2, AC2.1, AC2.3; NFR3.
- **Critérios de aceite:**
  - Cada item exibe cidade e país.
  - `admin1` é exibido apenas quando presente.
  - Clique seleciona cidade.
  - Setas para baixo/cima movem foco sequencialmente.
  - Enter seleciona o item focado.
  - Foco visível atende ao requisito de acessibilidade.
- **Dependências:** T-07, T-13.
- **Arquivos prováveis:**
  - `src/components/CityResults.tsx`

### T-15 - Criar seletor de unidade

- **Tipo:** UI
- **Descrição curta:** Implementar controle para alternar entre Celsius e Fahrenheit.
- **Rastreabilidade:** RF5; AC5.1, AC5.2, AC5.3; NFR3.
- **Critérios de aceite:**
  - Controle apresenta opções °C e °F.
  - Unidade ativa é indicada visualmente e semanticamente.
  - Alterar unidade chama `onUnitChange`.
  - O controle é operável por teclado.
- **Dependências:** T-12.
- **Arquivos prováveis:**
  - `src/components/UnitToggle.tsx`

### T-16 - Criar card de clima atual

- **Tipo:** UI
- **Descrição curta:** Exibir cidade ativa, temperatura, sensação térmica, umidade, vento e condição.
- **Rastreabilidade:** RF2, RF3, RF5; AC2.2, AC3.1, AC3.2, AC3.3, AC5.1.
- **Critérios de aceite:**
  - Nome da cidade ativa aparece com país e `admin1` quando presente.
  - Temperatura e sensação térmica respeitam a unidade atual e são inteiras.
  - Umidade é exibida como percentual inteiro.
  - Vento é exibido em km/h inteiro.
  - Condição mostra rótulo pt-BR e ícone.
  - Campos ausentes mostram `—` sem quebrar o layout.
- **Dependências:** T-02, T-03, T-11.
- **Arquivos prováveis:**
  - `src/components/CurrentWeatherCard.tsx`

### T-17 - Criar lista de previsão de 5 dias

- **Tipo:** UI
- **Descrição curta:** Renderizar previsão diária com data, mínima, máxima e condição.
- **Rastreabilidade:** RF4, RF5; AC4.1, AC4.2, AC4.3, AC5.1; NFR2.
- **Critérios de aceite:**
  - Renderiza hoje + 4 dias quando disponíveis.
  - Cada dia mostra data, temperatura mínima, temperatura máxima e condição.
  - Temperaturas respeitam unidade atual e arredondamento.
  - Campos ausentes mostram `—`.
  - Layout se adapta a mobile e desktop.
- **Dependências:** T-02, T-03, T-11.
- **Arquivos prováveis:**
  - `src/components/ForecastList.tsx`

### T-18 - Criar componente de feedback de estado

- **Tipo:** UI
- **Descrição curta:** Implementar UI reutilizável para `idle`, `loading`, `empty` e `error` em tela cheia.
- **Rastreabilidade:** RF7; AC1.3, AC7.1, AC7.2, AC7.3, AC7.5.
- **Critérios de aceite:**
  - Loading usa `role="status"` ou texto acessível.
  - Estado inicial orienta o usuário a buscar uma cidade.
  - Estado vazio mostra mensagem de nenhuma cidade encontrada.
  - Estado de erro oferece botão de tentar novamente quando houver callback.
  - Componente não acessa services, storage ou estado global diretamente.
- **Dependências:** T-10, T-11.
- **Arquivos prováveis:**
  - `src/components/FeedbackState.tsx`

### T-19 - Criar banner de erro sobre dados existentes

- **Tipo:** UI
- **Descrição curta:** Implementar banner para erro de atualização mantendo o clima anterior visível.
- **Rastreabilidade:** RF7; AC7.2, AC7.4, AC7.5.
- **Critérios de aceite:**
  - Banner exibe mensagem de erro em pt-BR.
  - Banner oferece botão de tentar novamente quando houver callback.
  - Dados anteriores não são ocultados pelo componente.
  - Componente é acessível por teclado e leitor de tela.
- **Dependências:** T-11.
- **Arquivos prováveis:**
  - `src/components/ErrorBanner.tsx`

### T-20 - Integrar componentes no `App`

- **Tipo:** UI
- **Descrição curta:** Compor hook e componentes em uma tela funcional sem ajustar estilos globais avançados.
- **Rastreabilidade:** RF1, RF2, RF3, RF4, RF5, RF7; AC1.1, AC2.1, AC3.1, AC4.1, AC5.1, AC7.1, AC7.2, AC7.3.
- **Critérios de aceite:**
  - `App` usa `useWeatherApp` como única fonte de estado da tela.
  - Busca, resultados, unidade, clima atual, previsão e feedbacks aparecem nos estados corretos.
  - Eventos de busca, seleção, alternância de unidade e retry chamam as ações do hook.
  - Texto da interface está em pt-BR.
- **Dependências:** T-13, T-14, T-15, T-16, T-17, T-18, T-19.
- **Arquivos prováveis:**
  - `src/App.tsx`

### T-21 - Aplicar layout responsivo e tema base

- **Tipo:** UI
- **Descrição curta:** Ajustar estilos da tela integrada para dark glassmorphism e breakpoint de 768px.
- **Rastreabilidade:** NFR2, NFR3; AC7.1, AC7.2, AC7.3, AC7.4.
- **Critérios de aceite:**
  - Layout se adapta a mobile e desktop a partir de 768px.
  - Alvos de toque têm área mínima de 44x44 px em telas pequenas.
  - Foco visível é preservado nos elementos interativos.
  - Estados loading, vazio, erro e sucesso não têm sobreposição incoerente.
- **Dependências:** T-20.
- **Arquivos prováveis:**
  - `src/App.tsx`
  - `src/index.css`

## Entrega 5 - Testes Automatizados e E2E

### T-22 - Testar conversão e formatação de temperatura

- **Tipo:** Test
- **Descrição curta:** Cobrir as regras puras de Celsius/Fahrenheit e placeholder.
- **Critérios de aceite:**
  - Casos 0 °C, 100 °C, -40 °C e 20.5 °C passam.
  - Valores em Celsius são arredondados corretamente.
  - Valor ausente retorna `—`.
  - Nenhum teste depende de React ou rede.
- **Dependências:** T-02.
- **Arquivos prováveis:**
  - `tests/unit/temperature.test.ts`

### T-23 - Testar mapeamento de códigos WMO

- **Tipo:** Test
- **Descrição curta:** Cobrir rótulos, ícones e fallback de condição climática.
- **Critérios de aceite:**
  - Códigos conhecidos retornam rótulo pt-BR e ícone esperado.
  - Código desconhecido retorna fallback.
  - Código ausente retorna fallback.
  - Nenhum teste depende de React ou rede.
- **Dependências:** T-03.
- **Arquivos prováveis:**
  - `tests/unit/weatherCodes.test.ts`

### T-24 - Testar cache em memória

- **Tipo:** Test
- **Descrição curta:** Cobrir hit, miss e expiração do cache com TTL de 10 minutos.
- **Critérios de aceite:**
  - Entrada válida antes do TTL retorna hit.
  - Entrada ausente retorna miss.
  - Entrada expirada retorna miss.
  - Chaves normalizadas são cobertas.
- **Dependências:** T-04.
- **Arquivos prováveis:**
  - `tests/unit/cache.test.ts`

### T-25 - Testar storage resiliente

- **Tipo:** Test
- **Descrição curta:** Cobrir restauração e falhas de `localStorage` sem envolver UI.
- **Critérios de aceite:**
  - Unidade válida é restaurada.
  - Unidade ausente ou inválida cai para Celsius.
  - Última cidade válida é restaurada.
  - JSON corrompido e storage indisponível não lançam erro.
- **Dependências:** T-05.
- **Arquivos prováveis:**
  - `tests/unit/storage.test.ts`

### T-26 - Testar service de geocoding com mock de fetch

- **Tipo:** Test
- **Descrição curta:** Cobrir contrato de busca de cidades sem depender da rede real.
- **Critérios de aceite:**
  - URL e parâmetros `name`, `count`, `language` e `format` são validados.
  - Termos com acentos e caracteres especiais são codificados.
  - Resposta 200 sem resultados retorna vazio.
  - Erros 429, não-2xx, timeout e rejeição de `fetch` são cobertos.
- **Dependências:** T-07.
- **Arquivos prováveis:**
  - `tests/unit/openMeteo.test.ts`

### T-27 - Testar service de forecast com mock de fetch

- **Tipo:** Test
- **Descrição curta:** Cobrir contrato de clima atual e previsão sem depender da rede real.
- **Critérios de aceite:**
  - Parâmetros `current`, `daily`, `timezone`, unidades e `forecast_days=5` são validados.
  - Resposta completa é mapeada para `WeatherReport`.
  - Resposta parcial preserva campos opcionais sem lançar erro.
  - Dados mínimos inválidos geram `invalid-data`.
- **Dependências:** T-08.
- **Arquivos prováveis:**
  - `tests/unit/openMeteo.test.ts`

### T-28 - Testar fluxo de busca no hook

- **Tipo:** Test
- **Descrição curta:** Cobrir busca confirmada, input vazio, empty, erro e retry no hook.
- **Critérios de aceite:**
  - Termo vazio não chama service nem muda para loading.
  - Busca com resultados atualiza `results` e `searchStatus: 'success'`.
  - Busca sem resultados usa `searchStatus: 'empty'`.
  - Erro registra `lastFailedOperation` e retry repete a mesma busca.
- **Dependências:** T-10.
- **Arquivos prováveis:**
  - `tests/unit/useWeatherApp.test.tsx`

### T-29 - Testar forecast, unidade e preservação no hook

- **Tipo:** Test
- **Descrição curta:** Cobrir seleção de cidade, forecast, toggle de unidade e erro com dados existentes.
- **Critérios de aceite:**
  - Seleção de cidade carrega forecast e define `activeCity`.
  - Erro de primeira carga expõe erro em tela cheia.
  - Erro após sucesso preserva `report`.
  - Toggle de unidade não chama geocoding nem forecast.
- **Dependências:** T-11, T-12.
- **Arquivos prováveis:**
  - `tests/unit/useWeatherApp.test.tsx`

### T-30 - Testar feedback nos estados principais

- **Tipo:** Test
- **Descrição curta:** Validar `FeedbackState` e `ErrorBanner` nos estados loading, erro, vazio e sucesso.
- **Rastreabilidade:** RF7; AC7.1, AC7.2, AC7.3, AC7.4, AC7.5.
- **Critérios de aceite:**
  - `FeedbackState` renderiza conteúdo distinto para `idle`, `loading`, `empty` e `error`.
  - Estado `loading` possui `role="status"` ou texto acessível.
  - Estado `empty` exibe mensagem de nenhuma cidade encontrada e não exibe lista.
  - Estado `error` exibe mensagem e aciona `onRetry` uma vez ao clicar no botão.
  - `ErrorBanner` exibe erro sem remover o conteúdo de sucesso recebido por props.
- **Dependências:** T-18, T-19.
- **Arquivos prováveis:**
  - `tests/unit/FeedbackState.test.tsx`
  - `tests/unit/ErrorBanner.test.tsx`

### T-31 - Testar `CityResults` em sucesso e resposta parcial

- **Tipo:** Test
- **Descrição curta:** Validar a lista de cidades com desambiguação e dados externos parciais.
- **Rastreabilidade:** RF1, RF2; AC1.2, AC2.1, AC2.3.
- **Critérios de aceite:**
  - `CityResults` exibe cidade, país e `admin1` somente quando presente.
  - Nomes com acentos e caracteres especiais são renderizados como texto.
  - A seleção por clique chama o callback esperado.
- **Dependências:** T-14.
- **Arquivos prováveis:**
  - `tests/unit/CityResults.test.tsx`

### T-32 - Testar `CurrentWeatherCard` em sucesso e resposta parcial

- **Tipo:** Test
- **Descrição curta:** Validar o card de clima atual com dados completos, unidade e campos ausentes.
- **Rastreabilidade:** RF2, RF3, RF5; AC2.2, AC3.1, AC3.2, AC3.3, AC5.1.
- **Critérios de aceite:**
  - Card exibe cidade ativa, temperatura, sensação, umidade, vento e condição.
  - Temperaturas respeitam a unidade recebida e são inteiras.
  - Campos numéricos ausentes exibem `—` sem lançar erro.
  - Código WMO ausente ou desconhecido exibe condição desconhecida e ícone neutro.
- **Dependências:** T-16.
- **Arquivos prováveis:**
  - `tests/unit/CurrentWeatherCard.test.tsx`

### T-33 - Testar `ForecastList` em sucesso e resposta parcial

- **Tipo:** Test
- **Descrição curta:** Validar a previsão diária com cinco dias, conversão e campos ausentes.
- **Rastreabilidade:** RF4, RF5; AC4.1, AC4.2, AC4.3, AC5.1.
- **Critérios de aceite:**
  - Lista exibe data, mínima, máxima e condição para cinco dias.
  - Temperaturas respeitam a unidade recebida e são inteiras.
  - Campos numéricos ausentes exibem `—` sem lançar erro.
  - Código WMO ausente ou desconhecido exibe condição desconhecida e ícone neutro.
- **Dependências:** T-17.
- **Arquivos prováveis:**
  - `tests/unit/ForecastList.test.tsx`

### T-34 - Testar fluxo feliz E2E

- **Tipo:** Test
- **Descrição curta:** Validar busca, seleção, clima atual e previsão em browser real com rede mockada.
- **Critérios de aceite:**
  - Usuário busca uma cidade por texto e confirma.
  - Lista exibe cidade, país e `admin1` quando presente.
  - Seleção carrega clima atual.
  - Previsão renderiza hoje + 4 dias.
- **Dependências:** T-20, T-21, T-26, T-27, T-29, T-30, T-31, T-32, T-33.
- **Arquivos prováveis:**
  - `tests/e2e/weather-app.spec.ts`

### T-35 - Testar persistência E2E

- **Tipo:** Test
- **Descrição curta:** Validar restauração de unidade e última cidade após reload.
- **Critérios de aceite:**
  - Unidade escolhida permanece após recarregar a página.
  - Última cidade selecionada é restaurada após reload.
  - Forecast da cidade restaurada é exibido automaticamente.
  - Restauração usa dados mockados de rede no teste.
- **Dependências:** T-20, T-21, T-25, T-34.
- **Arquivos prováveis:**
  - `tests/e2e/weather-app.spec.ts`

### T-36 - Testar estados empty e error E2E

- **Tipo:** Test
- **Descrição curta:** Validar vazio, erro e retry em browser real com rede mockada.
- **Critérios de aceite:**
  - Geocoding sem resultados exibe estado vazio.
  - Falha de geocoding exibe erro e botão de retry.
  - Retry repete a mesma busca.
  - Falha de forecast após dados existentes mantém tela e mostra banner.
- **Dependências:** T-20, T-21, T-26, T-27, T-34.
- **Arquivos prováveis:**
  - `tests/e2e/weather-app.spec.ts`

### T-37 - Testar viewport mobile E2E

- **Tipo:** Test
- **Descrição curta:** Validar fluxo principal e erro em viewport abaixo de 768px.
- **Critérios de aceite:**
  - Pelo menos um fluxo feliz roda em viewport mobile.
  - Pelo menos um fluxo de erro roda em viewport mobile.
  - Campo de busca, lista, cards e retry são utilizáveis por toque.
  - Não há sobreposição incoerente nos estados principais.
- **Dependências:** T-34, T-36.
- **Arquivos prováveis:**
  - `tests/e2e/weather-app.spec.ts`
  - `playwright.config.ts`

### T-38 - Testar acessibilidade básica E2E

- **Tipo:** Test
- **Descrição curta:** Validar teclado, foco e loading acessível nos fluxos principais.
- **Critérios de aceite:**
  - Campo de busca aceita Enter para confirmar.
  - Lista permite navegação por setas e seleção por Enter.
  - Foco visível aparece nos controles interativos.
  - Loading é identificável por `role="status"` ou texto acessível.
- **Dependências:** T-34, T-36.
- **Arquivos prováveis:**
  - `tests/e2e/weather-app.spec.ts`

## Entrega 6 - Hardening e Entrega

### T-39 - Validar segurança no service de dados

- **Tipo:** Infra
- **Descrição curta:** Garantir encoding de entrada e validação de respostas antes do modelo interno.
- **Critérios de aceite:**
  - Termo de busca é enviado por URL encoding, sem interpolação insegura.
  - Respostas de geocoding são validadas antes de virar `City`.
  - Respostas de forecast são validadas antes de virar `WeatherReport`.
  - Testes cobrem caracteres especiais e dados externos inválidos.
- **Dependências:** T-26, T-27.
- **Arquivos prováveis:**
  - `src/services/openMeteo.ts`
  - `tests/unit/openMeteo.test.ts`

### T-40 - Validar renderização segura de resultados de cidade

- **Tipo:** Infra
- **Descrição curta:** Conferir que dados externos de geocoding são renderizados como texto seguro.
- **Critérios de aceite:**
  - `CityResults` não usa `dangerouslySetInnerHTML`.
  - Nomes com caracteres especiais são exibidos como texto.
  - País e `admin1` seguem a mesma regra de renderização segura.
  - Teste cobre valores com caracteres especiais.
- **Dependências:** T-14, T-39.
- **Arquivos prováveis:**
  - `src/components/CityResults.tsx`
  - `tests/unit/CityResults.test.tsx`

### T-41 - Validar renderização segura de clima atual

- **Tipo:** Infra
- **Descrição curta:** Conferir que dados externos do clima atual são renderizados como texto seguro e placeholders.
- **Critérios de aceite:**
  - `CurrentWeatherCard` não usa `dangerouslySetInnerHTML`.
  - Condição e valores ausentes são renderizados de forma segura.
  - Placeholder `—` aparece para campos numéricos ausentes.
  - Teste cobre condição desconhecida no clima atual.
- **Dependências:** T-16, T-39.
- **Arquivos prováveis:**
  - `src/components/CurrentWeatherCard.tsx`
  - `tests/unit/CurrentWeatherCard.test.tsx`

### T-42 - Validar renderização segura de previsão

- **Tipo:** Infra
- **Descrição curta:** Conferir que dados externos da previsão são renderizados como texto seguro e placeholders.
- **Critérios de aceite:**
  - `ForecastList` não usa `dangerouslySetInnerHTML`.
  - Datas, condições e valores ausentes são renderizados de forma segura.
  - Placeholder `—` aparece para temperaturas ausentes.
  - Teste cobre condição desconhecida na previsão.
- **Dependências:** T-17, T-39.
- **Arquivos prováveis:**
  - `src/components/ForecastList.tsx`
  - `tests/unit/ForecastList.test.tsx`

### T-43 - Configurar matriz Playwright de browsers

- **Tipo:** Infra
- **Descrição curta:** Garantir cobertura mínima de portabilidade em Chromium, Firefox e WebKit quando disponíveis.
- **Critérios de aceite:**
  - `playwright.config.ts` define projetos para Chromium, Firefox e WebKit.
  - Configuração mantém pelo menos um projeto mobile.
  - Configuração não duplica cenários além do necessário.
  - Ambiente sem browsers instalados falha com mensagem clara de setup.
- **Dependências:** T-34, T-37.
- **Arquivos prováveis:**
  - `playwright.config.ts`

### T-44 - Validar performance percebida sob rede simulada

- **Tipo:** Infra
- **Descrição curta:** Cobrir feedback de loading e resposta percebida no fluxo principal sob rede lenta.
- **Critérios de aceite:**
  - Fluxo principal exibe loading durante requests simuladas.
  - Teste ou checklist registra critério de p95 inferior a 2 s sob Fast 3G ou equivalente.
  - Cache evita requests repetidas dentro do TTL quando aplicável.
  - Resultado da validação fica reproduzível para revisão.
- **Dependências:** T-34, T-43.
- **Arquivos prováveis:**
  - `tests/e2e/weather-app.spec.ts`

### T-45 - Executar validações finais do projeto

- **Tipo:** Infra
- **Descrição curta:** Rodar lint, build e testes antes da revisão final.
- **Critérios de aceite:**
  - `pnpm lint` passa.
  - `pnpm build` passa.
  - `pnpm test` passa.
  - Falhas encontradas são corrigidas ou registradas para revisão.
- **Dependências:** T-22, T-23, T-24, T-25, T-26, T-27, T-28, T-29, T-30, T-31, T-32, T-33, T-34, T-35, T-36, T-37, T-38, T-39, T-40, T-41, T-42, T-43, T-44.
- **Arquivos prováveis:**
  - `package.json`

## Matriz de Rastreabilidade

A tabela liga cada requisito funcional da spec às tarefas que o implementam e às tarefas que validam seu comportamento. Tarefas de infraestrutura e testes aparecem quando contribuem diretamente para o requisito.

| Requisito | Escopo coberto | Tarefas de implementação | Tarefas de validação |
| --- | --- | --- | --- |
| **RF1 - Busca de cidades** | Busca por confirmação, input vazio, resultados, país/`admin1`, cidade inexistente, erro de geocoding e busca disponível com cidade ativa | T-07, T-10, T-13, T-14, T-20 | T-26, T-28, T-31, T-34, T-36 |
| **RF2 - Seleção de cidade** | Seleção por clique/teclado, foco sequencial e cidade ativa | T-11, T-14, T-16, T-20 | T-31, T-34, T-36 |
| **RF3 - Clima atual** | Temperatura, sensação térmica, umidade, vento, condição WMO, rótulo pt-BR e ícone | T-03, T-08, T-11, T-16, T-20 | T-23, T-27, T-32, T-34 |
| **RF4 - Previsão de 5 dias** | Hoje + 4 dias, mínima, máxima, data, condição e uso do `daily.weather_code` | T-03, T-08, T-11, T-17, T-20 | T-23, T-27, T-33, T-34 |
| **RF5 - Alternância de unidade** | Celsius/Fahrenheit, conversão local, arredondamento, atualização de todos os valores e ausência de novo request | T-02, T-12, T-15, T-16, T-17, T-20 | T-22, T-29, T-32, T-33, T-34 |
| **RF6 - Persistência local** | Persistência/restauração de unidade e última cidade selecionada, fallback para storage inválido e forecast automático | T-05, T-09, T-11, T-12, T-20 | T-25, T-29, T-35 |
| **RF7 - Loading, erro e vazio** | Estados explícitos, mensagens, retry da última operação, timeout, 429 e preservação de dados anteriores | T-06, T-10, T-11, T-18, T-19, T-20 | T-26, T-27, T-28, T-30, T-34, T-36 |

### Lacunas encontradas

Nenhum requisito funcional `RF1`–`RF7` está sem tarefa correspondente. Todos possuem ao menos uma tarefa de implementação e uma tarefa de validação.

Os requisitos não funcionais também têm tarefas associadas: segurança em T-39 a T-42, responsividade em T-21 e T-37, acessibilidade em T-21 e T-38, performance em T-44, portabilidade em T-43, uso responsável da API em T-04, T-07 e T-10, e timeout em T-06.

## Prioridade e Tamanho

Legenda: `P0` é bloqueador do caminho mínimo utilizável; `P1` é requisito importante para a release candidata; `P2` é hardening complementar ou validação de qualidade. O tamanho é relativo ao esforço e ao risco da tarefa: `P` pequeno, `M` médio e `G` grande.

| Tarefa | Prioridade | Tamanho | Justificativa curta |
| --- | --- | --- | --- |
| T-01 | P0 | M | Contratos usados por todas as camadas |
| T-02 | P0 | P | Regra pura e isolada de conversão |
| T-03 | P0 | M | Mapeamento de condições usado na UI |
| T-04 | P1 | M | Cache exigido pelo NFR7, mas não bloqueia o primeiro caminho feliz |
| T-05 | P1 | M | Persistência exigida pelo RF6 após o fluxo principal |
| T-06 | P0 | M | Base de requests, timeout e erros |
| T-07 | P0 | M | Busca de cidades é a entrada do produto |
| T-08 | P0 | M | Dados necessários para clima e previsão |
| T-09 | P0 | M | Estado inicial e restauração do app |
| T-10 | P0 | M | Orquestração do primeiro fluxo visível |
| T-11 | P0 | G | Seleção, forecast, retry e preservação de dados |
| T-12 | P1 | M | Alternância e persistência da unidade |
| T-13 | P0 | P | Formulário de busca |
| T-14 | P0 | M | Resultados e seleção acessível |
| T-15 | P1 | P | Controle de unidade |
| T-16 | P0 | M | Apresentação do clima atual |
| T-17 | P0 | M | Apresentação da previsão |
| T-18 | P0 | M | Estados idle/loading/empty/error |
| T-19 | P0 | P | Banner de atualização com erro |
| T-20 | P0 | G | Composição da aplicação funcional |
| T-21 | P1 | M | Responsividade, tema e foco visual |
| T-22 | P0 | P | Teste da conversão e arredondamento |
| T-23 | P0 | P | Teste do mapeamento WMO |
| T-24 | P1 | P | Teste de TTL e chaves do cache |
| T-25 | P1 | P | Teste de persistência resiliente |
| T-26 | P0 | M | Testes do geocoding e erros HTTP |
| T-27 | P0 | M | Testes do forecast e respostas parciais |
| T-28 | P0 | M | Testes do fluxo de busca no hook |
| T-29 | P0 | M | Testes do forecast, unidade e preservação |
| T-30 | P0 | M | Estados de feedback em componentes |
| T-31 | P0 | P | Teste de `CityResults` |
| T-32 | P0 | P | Teste de `CurrentWeatherCard` |
| T-33 | P0 | P | Teste de `ForecastList` |
| T-34 | P0 | M | E2E do caminho principal |
| T-35 | P1 | M | E2E de persistência após reload |
| T-36 | P1 | M | E2E de vazio, erro e retry |
| T-37 | P1 | M | E2E mobile abaixo de 768px |
| T-38 | P1 | M | E2E de teclado, foco e loading acessível |
| T-39 | P1 | M | Validação de entrada e respostas no service |
| T-40 | P1 | P | Renderização segura de cidades |
| T-41 | P1 | P | Renderização segura do clima atual |
| T-42 | P1 | P | Renderização segura da previsão |
| T-43 | P2 | P | Matriz adicional de browsers |
| T-44 | P2 | M | Medição reproduzível sob rede lenta |
| T-45 | P0 | P | Gate final de lint, build e testes |

## Sequência de Fatias Verticais

As fatias abaixo atravessam as camadas necessárias e entregam valor observável ao final de cada etapa. A implementação pode manter as dependências internas, mas cada fatia deve terminar com um estado demonstrável na UI.

### Fatia 1 - Busca de cidades visível

Objetivo: permitir que o usuário digite uma cidade, confirme e veja resultados reais.

- **Tarefas:** T-01, T-06, T-07, T-09, T-10, T-13, T-14, T-18, T-20.
- **Resultado visível:** formulário funcional, loading, lista de cidades com país/estado, vazio e erro de busca.
- **Verificação:** T-26, T-28 e um cenário E2E de T-34.

### Fatia 2 - Clima atual após seleção

Objetivo: transformar a seleção de uma cidade em uma tela de clima atual utilizável.

- **Tarefas:** T-03, T-08, T-11, T-16, T-19.
- **Resultado visível:** cidade ativa, temperatura, sensação, umidade, vento, condição WMO e retry.
- **Verificação:** T-23, T-27, T-29, T-30 e T-32.

### Fatia 3 - Previsão e unidade

Objetivo: completar o produto principal com cinco dias de previsão e alternância instantânea.

- **Tarefas:** T-02, T-12, T-15, T-17.
- **Resultado visível:** previsão de hoje + 4 dias e todas as temperaturas alternando entre °C e °F sem request adicional.
- **Verificação:** T-22, T-29, T-33 e a asserção de unidade de T-34.

### Fatia 4 - Persistência e resiliência

Objetivo: reduzir fricção e garantir que falhas não destruam dados já exibidos.

- **Tarefas:** T-04, T-05, refinamentos de T-09 e T-11.
- **Resultado visível:** cache de 10 minutos, unidade e última cidade restauradas, retry e banner sobre dados anteriores.
- **Verificação:** T-24, T-25, T-35 e T-36.

### Fatia 5 - Qualidade de interação e mobile

Objetivo: preparar a experiência para uso real em telas pequenas e por teclado.

- **Tarefas:** T-21, T-18/T-19 se houver ajustes, e refinamentos de componentes.
- **Resultado visível:** layout responsivo, foco visível, alvos de toque adequados e estados sem sobreposição.
- **Verificação:** T-30, T-37 e T-38.

### Fatia 6 - Hardening e release

Objetivo: fechar riscos técnicos e executar os gates do projeto.

- **Tarefas:** T-39, T-40, T-41, T-42, T-43, T-44 e T-45.
- **Resultado visível:** comportamento seguro, compatibilidade verificada e evidência final de qualidade.
- **Verificação:** `pnpm lint`, `pnpm build`, `pnpm test` e a matriz Playwright configurada.
