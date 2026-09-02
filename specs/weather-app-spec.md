# Weather App — Especificação de Produto

> Fonte de entrada: [specs/discovery.md](discovery.md). Este documento é a
> fonte única da verdade para as fases de Plan → Tasks → Code → Test → Review.

## Overview

O **Weather App** é uma aplicação web de previsão do tempo, gratuita e sem
cadastro, que permite ao usuário buscar uma cidade e consultar o **clima atual**
e a **previsão de 5 dias** (hoje + 4 dias), com opção de exibir a temperatura em
**Celsius ou Fahrenheit**. A aplicação é responsiva (mobile e desktop), roda
inteiramente no cliente e consome a API pública **Open-Meteo** (geocoding +
forecast, sem API key).

**Objetivos:**

- Entregar consulta rápida e confiável de clima atual e previsão curta.
- Suportar desambiguação de cidades homônimas (país/estado).
- Permitir alternância instantânea de unidade sem nova requisição.
- Persistir localmente a unidade e a última cidade para reduzir fricção.
- Tratar sempre os estados de **loading**, **erro** e **vazio**.

**Personas-alvo:** viajante (Ana), planejador de rotina (Carlos) e usuária
internacional/bilíngue (Beatriz) — conforme o discovery.

## Functional Requirements

- **RF1 — Busca de cidades**
  - O usuário digita o nome de uma cidade e confirma a busca (Enter ou botão);
    não há autocomplete-enquanto-digita.
  - O sistema consulta o geocoding e apresenta uma lista de resultados
    correspondentes.
  - Cada resultado exibe informação de desambiguação (país e, quando o campo
    `admin1` estiver presente na resposta, o estado/região).
  - O campo de busca permanece disponível mesmo com uma cidade ativa
    carregada, permitindo nova busca a qualquer momento.
  - Falha na própria chamada de geocoding (erro de rede/API) é tratada como
    estado de erro (RF7), não como estado vazio.
- **RF2 — Seleção de cidade**
  - O usuário seleciona uma cidade da lista de resultados (mouse ou teclado)
    para carregar o clima.
  - A lista de resultados é navegável via teclado (setas para mover o foco,
    Enter para selecionar).
  - A cidade selecionada torna-se a cidade ativa exibida na tela.
- **RF3 — Clima atual**
  - Após a seleção, exibir o clima atual da cidade: temperatura (°C/°F),
    sensação térmica (°C/°F), umidade relativa (% inteiro), vento (km/h) e
    condição (código WMO traduzido para rótulo pt-BR + ícone, mapeamento em
    `lib/weatherCodes.ts`).
- **RF4 — Previsão de 5 dias**
  - Exibir a previsão para hoje + 4 dias, com data, temperatura mínima,
    temperatura máxima e condição do dia conforme o `weather_code` diário
    retornado pela API (sem cálculo/agregação adicional no cliente).
- **RF5 — Alternância de unidade (°C/°F)**
  - O usuário pode alternar a unidade de temperatura exibida; padrão inicial
    (sem preferência salva) é Celsius.
  - A conversão é local e instantânea, sem nova requisição à API e sem perder
    o contexto da cidade selecionada.
  - Temperaturas são arredondadas para o inteiro mais próximo na exibição.
- **RF6 — Persistência local de preferências**
  - A unidade escolhida e a última cidade **selecionada** são armazenadas em
    `localStorage` e restauradas no próximo acesso.
  - Se a cidade restaurada falhar ao carregar (API indisponível, cidade
    inválida), exibir o estado de erro padrão (RF7) sem travar o app.
- **RF7 — Estados de loading, erro e vazio**
  - A aplicação exibe indicador de carregamento (identificável via
    `role="status"` ou texto acessível, ex.: "Carregando...") durante
    requisições, mensagem de erro em falhas e um estado inicial/vazio antes
    de qualquer busca ou quando a busca não retorna resultados.
  - Ao clicar em "tentar novamente", o app reexecuta exatamente a última
    operação que falhou (busca ou carregamento de clima).
  - Se a falha ocorrer ao atualizar uma cidade já exibida, os dados
    anteriores permanecem visíveis com um banner de erro sobreposto; se for a
    primeira carga, exibe-se o estado de erro em tela cheia.

## User Stories

Formato: "Como [persona], quero [ação] para [valor]". Cada story referencia o
requisito funcional correspondente.

- **US1 → RF1 (Ana, viajante):** Como viajante, quero buscar uma cidade pelo
  nome para consultar rapidamente o clima do meu destino.
- **US2 → RF2 (Ana, viajante):** Como viajante, quero escolher a cidade certa
  entre homônimas usando país/estado para não consultar o local errado.
- **US3 → RF3 (Carlos, planejador de rotina):** Como planejador de rotina,
  quero ver o clima atual da minha cidade para decidir o que vestir antes de
  sair.
- **US4 → RF4 (Carlos, planejador de rotina):** Como planejador de rotina,
  quero ver a previsão de 5 dias para me organizar ao longo da semana.
- **US5 → RF5 (Beatriz, usuária bilíngue):** Como usuária bilíngue, quero
  alternar entre Celsius e Fahrenheit instantaneamente para comparar
  temperaturas sem fazer conta.
- **US6 → RF6 (Carlos, planejador de rotina):** Como planejador de rotina,
  quero que o app lembre minha última cidade e unidade para não reconfigurar a
  cada acesso.
- **US7 → RF7 (Ana, viajante):** Como viajante, quero mensagens claras de
  carregamento, erro e vazio para entender o que acontece mesmo com conexão
  instável.

## Acceptance Criteria

Critérios no formato **Given/When/Then**, objetivos e testáveis — base direta
para os testes automatizados (unit + E2E) dos módulos seguintes.

### RF1 — Busca de cidades

- **AC1.1**
  - **Given** o campo de busca com um nome de cidade válido preenchido
  - **When** o usuário confirma a busca (Enter ou botão)
  - **Then** o app dispara uma consulta de geocoding e exibe uma lista com os
    resultados correspondentes.
- **AC1.2**
  - **Given** que a busca retornou um ou mais resultados, cada um com ou sem
    o campo `admin1` na resposta da API
  - **When** a lista é renderizada
  - **Then** cada item exibe o nome da cidade e o país; o estado/região é
    exibido apenas quando `admin1` estiver presente na resposta (testar os
    dois casos separadamente).
- **AC1.3**
  - **Given** um termo de busca que não corresponde a nenhuma cidade
  - **When** a consulta de geocoding retorna uma lista vazia (200 OK sem
    resultados)
  - **Then** o app exibe um estado vazio com mensagem clara (ex.: "Nenhuma
    cidade encontrada") e não exibe lista de resultados.
- **AC1.4**
  - **Given** o campo de busca vazio ou contendo apenas espaços
  - **When** o usuário tenta confirmar a busca
  - **Then** nenhuma requisição é disparada e nenhum indicador de
    carregamento é exibido.
- **AC1.5**
  - **Given** um termo de busca válido
  - **When** a chamada de geocoding falha (erro de rede, timeout ou resposta
    não-2xx)
  - **Then** o app exibe o estado de erro (RF7), distinto do estado vazio de
    AC1.3.

### RF2 — Seleção de cidade

- **AC2.1**
  - **Given** uma lista de resultados de busca exibida
  - **When** o usuário seleciona um item da lista (clique ou Enter com o item
    focado)
  - **Then** o app inicia o carregamento do clima da cidade selecionada.
- **AC2.2**
  - **Given** que uma cidade foi selecionada e seu clima carregado
  - **When** o resultado é exibido
  - **Then** o nome da cidade ativa (com país/estado) aparece junto aos dados
    de clima.
- **AC2.3**
  - **Given** a lista de resultados renderizada e o foco no campo de busca
  - **When** o usuário pressiona as setas para baixo/cima
  - **Then** o foco move entre os itens da lista de forma sequencial e
    visível (indicador de foco).

### RF3 — Clima atual

- **AC3.1**
  - **Given** uma cidade selecionada com clima carregado com sucesso
  - **When** o bloco de clima atual é renderizado
  - **Then** são exibidos temperatura (°C/°F, inteiro), sensação térmica
    (°C/°F, inteiro), umidade (% inteiro), vento (km/h, inteiro) e a condição
    (rótulo textual + ícone).
- **AC3.2**
  - **Given** que a API retornou um `weather_code` (padrão WMO)
  - **When** a condição é apresentada
  - **Then** o rótulo textual e o ícone correspondem ao mapeamento pt-BR
    definido para aquele código.
- **AC3.3**
  - **Given** uma unidade de temperatura selecionada (°C ou °F)
  - **When** o clima atual é exibido
  - **Then** a temperatura é apresentada na unidade atualmente selecionada.

### RF4 — Previsão de 5 dias

- **AC4.1**
  - **Given** uma cidade selecionada com previsão carregada
  - **When** a lista de previsão é renderizada
  - **Then** são exibidos exatamente 5 dias (hoje + 4).
- **AC4.2**
  - **Given** a lista de previsão renderizada
  - **When** cada dia é exibido
  - **Then** cada item mostra data, temperatura mínima, temperatura máxima e a
    condição (rótulo + ícone).
- **AC4.3**
  - **Given** uma unidade de temperatura selecionada
  - **When** a previsão é exibida
  - **Then** todas as temperaturas mínimas e máximas respeitam a unidade
    selecionada.

### RF5 — Alternância de unidade (°C/°F)

- **AC5.1**
  - **Given** clima atual e previsão exibidos em uma unidade
  - **When** o usuário alterna a unidade
  - **Then** todas as temperaturas na tela (atual e previsão) são atualizadas
    para a nova unidade.
- **AC5.2**
  - **Given** dados de clima já carregados
  - **When** o usuário alterna a unidade
  - **Then** nenhuma nova requisição de rede é disparada.
- **AC5.3**
  - **Given** uma cidade ativa com dados carregados
  - **When** o usuário alterna a unidade
  - **Then** a cidade ativa e os dados carregados permanecem inalterados.
- **AC5.4**
  - **Given** valores de temperatura conhecidos em Celsius
  - **When** convertidos para Fahrenheit e arredondados ao inteiro mais
    próximo
  - **Then** o resultado está correto (ex.: 0 °C → 32 °F; 100 °C → 212 °F;
    -40 °C → -40 °F; 20.5 °C → 69 °F).

### RF6 — Persistência local de preferências

- **AC6.1**
  - **Given** que o usuário escolheu uma unidade de temperatura
  - **When** a página é recarregada
  - **Then** a mesma unidade é restaurada a partir do `localStorage`.
- **AC6.2**
  - **Given** que o usuário buscou e selecionou uma cidade
  - **When** a página é recarregada
  - **Then** a última cidade selecionada é restaurada e seu clima é exibido
    automaticamente.
- **AC6.3**
  - **Given** nenhuma preferência de unidade salva em `localStorage`
  - **When** a aplicação é carregada pela primeira vez
  - **Then** a unidade exibida por padrão é Celsius.
- **AC6.4**
  - **Given** uma cidade restaurada do `localStorage`
  - **When** o carregamento do clima dessa cidade falha
  - **Then** o app exibe o estado de erro (RF7) sem travar, mantendo a busca
    disponível para uma nova tentativa.

### RF7 — Estados de loading, erro e vazio

- **AC7.1**
  - **Given** uma requisição de busca ou de clima em andamento
  - **When** o app aguarda a resposta
  - **Then** um indicador de carregamento é exibido, identificável via
    `role="status"` ou texto acessível (ex.: "Carregando...").
- **AC7.2**
  - **Given** uma falha de rede ou erro da API (ex.: 4xx/5xx/timeout)
  - **When** a requisição falha
  - **Then** o app exibe uma mensagem de erro sem quebrar, oferecendo a opção
    de tentar novamente.
- **AC7.3**
  - **Given** que o usuário ainda não realizou nenhuma busca
  - **When** a aplicação é carregada pela primeira vez (sem cidade persistida)
  - **Then** um estado inicial/vazio é exibido orientando o usuário a buscar
    uma cidade.
- **AC7.4**
  - **Given** uma cidade já carregada com sucesso
  - **When** o usuário tenta atualizar/recarregar e a requisição falha
  - **Then** os dados anteriores permanecem visíveis com um banner de erro
    sobreposto (não substituem a tela por um erro em branco).
- **AC7.5**
  - **Given** um erro exibido (busca ou clima)
  - **When** o usuário aciona "tentar novamente"
  - **Then** o app reexecuta exatamente a última operação que falhou (mesmo
    termo de busca ou mesma cidade).

## Traceability Matrix

Rastreabilidade entre User Story, requisito funcional, critérios de aceite e
requisitos não-funcionais relevantes — base para quebra de tarefas e desenho
de testes.

| User Story | RF | Acceptance Criteria | NFRs relevantes |
| --- | --- | --- | --- |
| US1 (Ana) — buscar cidade pelo nome | RF1 | AC1.1, AC1.2, AC1.3, AC1.4, AC1.5 | NFR1 (desempenho), NFR6 (segurança/sanitização), NFR7 (uso responsável de API), NFR10 (timeout) |
| US2 (Ana) — escolher cidade certa entre homônimas | RF2 | AC2.1, AC2.2, AC2.3 | NFR3 (acessibilidade/teclado) |
| US3 (Carlos) — ver clima atual | RF3 | AC3.1, AC3.2, AC3.3 | NFR1 (desempenho), NFR2 (responsividade) |
| US4 (Carlos) — ver previsão de 5 dias | RF4 | AC4.1, AC4.2, AC4.3 | NFR1 (desempenho), NFR2 (responsividade) |
| US5 (Beatriz) — alternar °C/°F instantaneamente | RF5 | AC5.1, AC5.2, AC5.3, AC5.4 | NFR1 (desempenho — sem nova requisição) |
| US6 (Carlos) — lembrar última cidade e unidade | RF6 | AC6.1, AC6.2, AC6.3, AC6.4 | NFR4 (resiliência), NFR8 (manutenibilidade) |
| US7 (Ana) — mensagens claras de loading/erro/vazio | RF7 | AC7.1, AC7.2, AC7.3, AC7.4, AC7.5 | NFR3 (acessibilidade), NFR4 (resiliência), NFR10 (timeout) |

## Non-Functional Requirements

- **NFR1 — Desempenho:** p95 do tempo de resposta percebido (busca +
  carregamento de clima) inferior a 2 s, medido sob throttling de rede "Fast
  3G" (Lighthouse/Playwright); feedback visual de carregamento sempre
  presente.
- **NFR2 — Responsividade:** layout adaptável com breakpoint em 768px
  (mobile/desktop); alvos de toque adequados em telas pequenas.
- **NFR3 — Acessibilidade:** navegação por teclado, roles/labels semânticos e
  contraste conforme WCAG AA.
- **NFR4 — Disponibilidade/Resiliência:** falhas de rede ou da API são tratadas
  graciosamente, sem travar a aplicação.
- **NFR5 — Portabilidade:** compatível com as 2 últimas versões de Chrome,
  Firefox, Safari e Edge.
- **NFR6 — Segurança:** entrada de busca e respostas da API são
  validadas/sanitizadas antes de renderizar (mitigar XSS/injeção).
- **NFR7 — Uso responsável de API:** bloquear submits repetidos da busca
  enquanto uma requisição estiver em andamento (evitar disparo duplicado) e
  cachear resultados de geocoding/forecast em memória por 10 minutos
  (chaveados por termo de busca ou coordenadas) para respeitar limites de
  requisição do Open-Meteo; tratamento gracioso de erro 429.
- **NFR8 — Manutenibilidade:** código em camadas (apresentação, lógica, acesso
  a dados) favorecendo testes automatizados.
- **NFR9 — Idioma:** interface em pt-BR; identificadores de código em en-US.
- **NFR10 — Timeout:** requisições de geocoding e forecast expiram em 10 s;
  após esse limite, tratar como erro (RF7).

## Edge Cases

Para cada caso, o comportamento esperado é objetivo e testável.

| Edge case | Condição | Comportamento esperado da aplicação |
| --- | --- | --- |
| **Cidade inexistente** | Usuário busca um nome que não corresponde a nenhuma cidade real (ex.: "asdfgh"). | Exibir estado vazio com mensagem clara (ex.: "Nenhuma cidade encontrada"); não renderizar lista nem bloco de clima; manter o campo de busca utilizável. |
| **Input vazio** | Campo de busca vazio ou apenas com espaços. | Não disparar requisição; opcionalmente sinalizar que é preciso digitar um nome; nenhum estado de loading é exibido. |
| **Caracteres especiais / acentos** | Termo com acentos, hífens, apóstrofos ou não-ASCII (ex.: "São Paulo", "L'Aquila"). | Codificar corretamente o termo na URL (encoding) e realizar a busca normalmente; resultados válidos são exibidos sem erro. |
| **Falha de API** | API responde com erro (4xx/5xx) ou está indisponível. | Exibir estado de erro com mensagem amigável e botão "tentar novamente" (AC7.2); se houver dados de uma cidade já carregada, preservá-los com banner de erro sobreposto (AC7.4); não quebrar a UI. |
| **Timeout** | A requisição excede 10 s (NFR10). | Cancelar a espera, tratar como erro (mesmo fluxo de "Falha de API") e encerrar o estado de loading. |
| **Geocoding sem resultados** | A busca é válida, mas o geocoding retorna lista vazia (200 OK, array vazio). | Exibir estado vazio (mesmo tratamento de "cidade inexistente"); não iniciar a busca de clima. Distinto de falha na chamada (AC1.5), que é tratada como erro. |
| **Resposta parcial da API** | Clima/previsão retorna com campos ausentes ou nulos (ex.: sem umidade, sem `weather_code`). | Renderizar os campos disponíveis; exibir "—" como placeholder para campos numéricos ausentes; se `weather_code` estiver ausente, exibir rótulo "Condição desconhecida" com ícone neutro (❓). Nunca lançar erro nem quebrar o layout. |

### Casos de borda adicionais (já previstos)

- **Cidades homônimas:** múltiplos resultados diferenciados por país/estado; o
  usuário escolhe explicitamente antes de carregar o clima.
- **Rate limiting (HTTP 429):** tratado como erro específico, informando o
  usuário sem quebrar; recomendável orientar a tentar novamente em instantes.
- **Temperaturas negativas, zero e decimais:** conversão °C/°F correta em todos
  os casos de borda (ex.: -40 °C = -40 °F; 0 °C = 32 °F).
- **`localStorage` indisponível ou corrompido:** app funciona sem persistência,
  ignorando dados inválidos e caindo no estado inicial padrão.

## Assumptions

- Aplicação web responsiva; sem app nativo neste momento.
- Uso anônimo; sem autenticação e sem backend/persistência de servidor.
- Open-Meteo fornece geocoding e forecast em integrações compatíveis, sem API
  key.
- A conversão °C/°F é apenas de apresentação, sem impacto nos dados
  consultados.
- Idioma principal da interface é pt-BR; termos técnicos de código em en-US.
- Não há requisito de suporte offline; tratar erro de rede é suficiente no
  escopo inicial (o cache é otimização, não modo offline).

## Risks

| Risco | Probabilidade | Impacto | Mitigação |
| --- | --- | --- | --- |
| Dependência de API externa (indisponibilidade, mudança de contrato). | Média | Alto | Isolar acesso em camada de serviços; tratar erros com feedback e nova tentativa; cache de curto prazo. |
| Ambiguidade de localização (cidades homônimas). | Alta | Médio | Exibir país/estado e exigir seleção explícita antes de carregar o clima. |
| Precisão decrescente da previsão em dias distantes. | Alta | Baixo | Comunicar limitação na UI; usar fonte com boa reputação de acurácia. |
| Rate limiting (HTTP 429) por buscas repetidas. | Média | Alto | Debounce, cache de resultados recentes e tratamento gracioso do 429. |
| Regressão na conversão de unidades. | Baixa | Médio | Testes unitários dedicados com casos de borda. |
| Estados de erro/vazio não tratados na UI. | Média | Alto | Implementar e testar os três estados em cada tela que consome dados remotos. |

## Out of Scope

- Autenticação, contas de usuário e sincronização entre dispositivos.
- Backend próprio ou persistência de servidor.
- Aplicativos nativos (iOS/Android) e PWA instalável.
- Modo offline completo (além do cache de curto prazo).
- Internacionalização (idiomas além de pt-BR).
- Autocomplete-enquanto-digita, histórico e favoritos de cidades no v1.
- Geolocalização automática do usuário.
- Mapas, radar meteorológico, alertas severos e previsão horária detalhada.
- Notificações push e agendamento de consultas.
- Alternância de tema claro/escuro (interface fixa em tema escuro).
- Comparação simultânea de múltiplas cidades na mesma tela (uma cidade ativa
  por vez).
- Conversão de unidades além de temperatura (vento sempre em km/h, umidade
  sempre em %; sem toggle para mph, m/s etc.).
- Indicação visual de confiabilidade decrescente da previsão nos últimos
  dias (apenas texto informativo, se necessário, fora do escopo do v1).
- Analytics, tracking de uso ou otimização de SEO.

## Decisions (fechadas nesta revisão)

- **Ícones de condição:** emojis Unicode simples mapeados por `weather_code`
  em `lib/weatherCodes.ts`, sem biblioteca externa de ícones (fecha a antiga
  OQ2 do ciclo anterior).
- **Placeholder de campos ausentes:** "—" para valores numéricos; rótulo
  "Condição desconhecida" + ícone ❓ quando `weather_code` estiver ausente
  (fecha a antiga OQ3 do ciclo anterior).
- **Estratégia de cache:** resultados de geocoding e forecast são cacheados em
  memória (não persistido), por 10 minutos, chaveados por termo de busca ou
  por coordenadas da cidade; expirado o TTL, uma nova requisição é feita
  normalmente (fecha a antiga OQ1).

Nenhuma Open Question permanece pendente — a especificação está completa e
pronta para a fase de Plan.
