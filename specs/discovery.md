# Discovery — Weather App

## Resumo Executivo

Vamos construir um aplicativo web de previsão do tempo, gratuito e sem
necessidade de cadastro, onde qualquer pessoa pode buscar uma cidade e ver o
clima atual e a previsão dos próximos 5 dias, com opção de exibir a
temperatura em Celsius ou Fahrenheit. O app foi pensado para três perfis de
uso — viajantes, quem consulta o clima diariamente e usuários que comparam
temperaturas em unidades diferentes — funcionando bem tanto no celular quanto
no computador. Já definimos a fonte de dados (Open-Meteo, sem custo) e as
principais regras de negócio, o que elimina a maior parte dos riscos de
retrabalho antes de começar a construir. Os riscos remanescentes (ex.:
instabilidade da fonte de dados externa) têm planos de mitigação definidos.
Com este discovery concluído, o projeto está pronto para avançar à
especificação técnica detalhada.

## Contexto

A empresa solicitou o desenvolvimento de uma aplicação de previsão do tempo
voltada ao usuário final. A aplicação deve permitir a busca de cidades e a
consulta de condições climáticas atuais e futuras, com suporte a diferentes
unidades de temperatura e uso confortável em dispositivos móveis. O briefing
é intencionalmente enxuto, portanto esta análise formaliza os requisitos
implícitos e explicita as lacunas que precisam ser esclarecidas antes do
planejamento técnico.

## Personas

| Persona | Objetivo principal | Contexto de uso | Métrica de sucesso (da persona) |
| --- | --- | --- | --- |
| **Ana, a viajante** — consulta o clima de cidades diferentes ao planejar ou durante viagens. | Saber rapidamente se precisa levar casaco/guarda-chuva no destino antes de embarcar ou ao chegar. | Mobile, em movimento (aeroporto, rua), muitas vezes com conexão instável. | Consegue buscar uma cidade nova e ver o clima atual em poucos toques, mesmo com rede ruim. |
| **Carlos, o planejador de rotina** — checa o clima da própria cidade todo dia antes de sair de casa ou trabalhar. | Decidir o que vestir e se leva guarda-chuva, com base na previsão do dia e dos próximos dias. | Mobile pela manhã (checagem rápida) e desktop durante o trabalho (aba aberta em segundo plano). | Consegue ver o clima atual e a previsão de 5 dias em uma única tela, sem precisar buscar a cidade novamente a cada acesso. |
| **Beatriz, a usuária internacional/bilíngue** — compara temperaturas em unidades diferentes (ex.: recebe informação de parentes nos EUA em Fahrenheit). | Alternar rapidamente entre Celsius e Fahrenheit para entender e comparar temperaturas sem fazer conta manual. | Desktop e mobile, uso ocasional mas recorrente. | Consegue alternar a unidade instantaneamente, sem recarregar a busca ou perder o contexto da cidade selecionada. |

## Requisitos Funcionais

1. **Busca de cidades**
   - O usuário deve poder digitar o nome de uma cidade e selecioná-la entre
     resultados sugeridos (geocoding).
   - O sistema deve lidar com nomes ambíguos (cidades homônimas em países ou
     estados diferentes).
2. **Clima atual**
   - Exibir temperatura atual, condição (ex.: ensolarado, nublado, chuva) e
     ícone/representação visual correspondente.
   - Exibir dados complementares mínimos (ex.: sensação térmica, umidade,
     vento), se disponíveis na fonte de dados.
3. **Previsão de 5 dias**
   - Exibir, para cada um dos próximos 5 dias, ao menos: data, temperatura
     mínima/máxima e condição predominante.
4. **Alternância de unidade (°C/°F)**
   - O usuário deve poder alternar a unidade de temperatura exibida.
   - A troca de unidade deve ser instantânea, sem nova consulta à fonte de
     dados (conversão local).

> Nota: o item "Uso em dispositivos móveis" foi reclassificado — trata-se de
> um atributo de qualidade (responsividade), não de uma funcionalidade
> distinta. Veja "Responsividade" em Requisitos Não-Funcionais.

## Requisitos Não-Funcionais

- **Desempenho**: resposta perceptível ao usuário (busca e carregamento de
  clima) em tempo aceitável, com feedback visual de carregamento.
- **Disponibilidade/Resiliência**: tratamento adequado de falhas de rede ou
  indisponibilidade da fonte de dados externa, sem quebrar a aplicação.
- **Acessibilidade**: navegação por teclado, uso de roles/labels semânticos e
  contraste adequado (WCAG AA como referência).
- **Responsividade**: a interface deve se adaptar a telas pequenas (mobile
  first ou breakpoints definidos) e elementos interativos devem ser
  utilizáveis por toque (tamanho e espaçamento adequados).
- **Usabilidade**: estados de carregamento, erro e vazio sempre tratados e
  comunicados claramente ao usuário.
- **Portabilidade**: compatibilidade com os principais navegadores modernos
  (desktop e mobile).
- **Manutenibilidade**: código organizado em camadas (apresentação, lógica,
  acesso a dados) que favoreçam testes automatizados.
- **Privacidade**: não há indicação de necessidade de dados pessoais do
  usuário; qualquer uso de geolocalização deve ser opcional e consentido.
- **Segurança**: sanitização/validação da entrada de busca de cidade e das
  respostas da API externa antes de renderizar (mitigar XSS/injeção).
- **Escalabilidade/Uso de API**: respeitar limites de requisição (rate
  limiting) da fonte de dados, com cache e debounce na busca para evitar
  chamadas excessivas.
- **Observabilidade**: registro mínimo de erros de integração (ex.: falhas de
  API) para permitir diagnóstico em produção.
- **Compatibilidade de dispositivo**: suporte a diferentes tamanhos de tela e
  orientações (retrato/paisagem) em smartphones e tablets.

## Riscos

| Risco | Probabilidade | Impacto | Mitigação |
| --- | --- | --- | --- |
| **Dependência de API externa**: indisponibilidade, rate limiting ou mudança de contrato da fonte de dados climáticos. | Média | Alto — a aplicação fica inutilizável sem dados de clima. | Isolar acesso à API em `services/`, tratar erros com retry/backoff e mensagens claras; monitorar limites de requisição e usar cache de curto prazo. |
| **Ambiguidade de localização**: cidades homônimas levam o usuário ao local errado. | Alta | Médio — dado exibido incorreto sem aviso ao usuário. | Exibir país/estado nos resultados de busca e exigir confirmação explícita antes de carregar o clima. |
| **Qualidade/precisão dos dados de previsão**: previsão de 5 dias perde precisão nos últimos dias. | Alta | Baixo — expectativa do usuário pode ser frustrada, mas não quebra a aplicação. | Comunicar na UI que a precisão diminui em dias mais distantes; escolher fonte de dados com boa reputação de acurácia. |
| **Escopo mal definido de "dispositivos móveis"**: falta de breakpoints/dispositivos-alvo. | Média | Médio — retrabalho de layout ao descobrir problemas tarde. | Definir breakpoints e dispositivos de referência no plano técnico antes de iniciar a UI; testar em emulação mobile desde o início. |
| **Ausência de critérios de aceite mensuráveis**: sem metas de desempenho, cobertura de testes ou navegadores suportados. | Alta | Médio — qualidade final sujeita a interpretação, dificultando "definição de pronto". | Formalizar critérios de aceite (tempo de resposta, cobertura mínima de testes, matriz de navegadores) na fase de Plan antes do Code. |
| **Rate limiting da API de geocoding/forecast**: buscas rápidas e repetidas do usuário excedem cota. | Média | Alto — bloqueio temporário da fonte de dados afeta todos os usuários. | Implementar debounce na busca, cache de resultados recentes e tratamento gracioso de erro 429. |
| **Regressão em conversão de unidades (°C/°F)**: erro de arredondamento ou fórmula incorreta. | Baixa | Médio — dado exibido incorreto, mas de fácil detecção em testes. | Cobrir a função de conversão com testes unitários dedicados e casos de borda (negativos, zero, decimais). |
| **Falta de tratamento de estados vazio/erro na UI**: tela em branco ou travada em falha de rede. | Média | Alto — percepção de aplicação quebrada. | Implementar e testar explicitamente os três estados (loading, erro, vazio) em cada tela que consome dados remotos. |

## Perguntas em Aberto

Análise de discovery sob a ótica de um Product Manager cético: cada lacuna do
briefing vira uma pergunta em aberto com o **impacto** de seguir sem resposta.

| # | Ambiguidade / Lacuna | Pergunta em aberto | Impacto de seguir sem resposta |
| --- | --- | --- | --- |
| 1 | Fonte de dados não especificada | Qual API de clima/geocoding usaremos? Há restrições de custo, chave, SLA ou limite de requisições? | Retrabalho arquitetural: a escolha define contratos, campos disponíveis e limites de rate. Decisão errada força reescrita da camada de serviços e dos tipos. |
| 2 | Profundidade da busca de cidades | A busca é só por nome digitado, ou precisa de autocomplete, histórico, favoritos ou geolocalização automática? | Sub-entrega ou sobre-entrega: entregar um campo simples frustra quem espera autocomplete; investir em favoritos sem demanda gasta esforço fora do escopo. |
| 3 | Cidades homônimas / desambiguação | Como diferenciar cidades de mesmo nome (país/estado/coordenadas)? | Erro silencioso: o usuário vê o clima da cidade errada sem perceber, destruindo a confiança no produto. |
| 4 | Campos do "clima atual" | Além de temperatura e condição, precisamos de sensação térmica, umidade, vento, UV, nascer/pôr do sol? | Escopo de UI indefinido: estimativas e testes imprecisos; retrabalho de componentes ao descobrir campos faltantes tarde. |
| 5 | Granularidade da "previsão de 5 dias" | É resumo diário (mín/máx) ou também horário? "5 dias" inclui o dia atual? | Ambiguidade de contagem e volume de dados: afeta layout da lista, chamadas à API e expectativa do usuário ("5 dias" pode virar 4 ou 6). |
| 6 | Unidade padrão e persistência | Qual unidade inicial (°C/°F)? Depende da localidade? A preferência é lembrada entre sessões? | Fricção recorrente: sem persistência ou padrão adequado, o usuário reconfigura a cada uso. |
| 7 | Alvo de "dispositivos móveis" | Quais tamanhos/orientações e navegadores mínimos suportar? É web responsiva ou PWA instalável? | Critério de "pronto" não validável: sem breakpoints/dispositivos-alvo, o QA não tem baseline e há risco de retrabalho de layout. |
| 8 | Comportamento offline / falha de rede | O que exibir sem rede ou com a API fora do ar? Cache da última consulta? | Tela quebrada ou vazia em campo: sem definição, o app "não faz nada", passando impressão de bug. |
| 9 | Estados vazios e de erro | O que o usuário vê antes de buscar (estado inicial) e quando a busca não retorna resultados? | Experiência incompleta: estados não tratados são a causa mais comum de UX pobre e de bugs percebidos. |
| 10 | Métricas de desempenho e escala | Há metas de tempo de carregamento? Volume esperado de usuários? Limite de requisições por usuário? | Impossível dizer se o produto "atende": "rápido" é subjetivo e pode estourar cotas da API externa em produção. |
| 11 | Acessibilidade e internacionalização | Há exigência formal de WCAG? A interface precisa de múltiplos idiomas? | Custo de conformidade tardio: adaptar a11y/i18n depois é muito mais caro e pode gerar risco legal/contratual. |
| 12 | Identidade visual e critérios de aceite | Existe design system, marca ou protótipo? Quais os critérios objetivos de aceite por funcionalidade? | Ciclos de revisão intermináveis: sem critérios mensuráveis, "pronto" vira opinião e o escopo nunca fecha. |

## Decisões

Decisões fechadas para destravar a especificação, com justificativa e a(s)
pergunta(s) em aberto que resolvem (referência à tabela de Perguntas em
Aberto acima).

| Decisão | Justificativa | Resolve |
| --- | --- | --- |
| **Fonte de dados: Open-Meteo (sem API key)** | Gratuita, sem necessidade de autenticação/chave, oferece geocoding e forecast em uma única integração — reduz atrito de setup e custo para um projeto de treinamento. | Q1 (fonte de dados) e a suposição de integração única de geocoding + previsão. |
| **"5 dias" = hoje + 4 dias** | Interpretação mais comum de "previsão de 5 dias" e alinhada ao que a API Open-Meteo retorna por padrão; evita ambiguidade de contagem. | Q5 (granularidade e contagem da previsão de 5 dias). |
| **Unidade padrão: Celsius** | Simplifica o estado inicial da aplicação e é a unidade padrão da fonte de dados escolhida; a alternância para Fahrenheit continua disponível sob demanda do usuário. | Q6 (unidade padrão inicial). |
| **Sem autenticação e sem persistência de servidor** | Escopo de treinamento não exige contas de usuário nem backend próprio; toda a lógica roda no cliente, consumindo a API pública diretamente. | Confirma a suposição de uso anônimo e remove a necessidade de backend/persistência como pré-requisito de arquitetura. |
| **Idioma da UI: pt-BR** | Público-alvo do treinamento é pt-BR; evita esforço de internacionalização fora do escopo atual. | Q11 (internacionalização) — fixa pt-BR como único idioma da interface por ora. |
| **Busca: submit (não autocomplete), com lista de resultados para desambiguação** | O usuário digita e confirma a busca (Enter/botão); o geocoding retorna uma lista de cidades correspondentes, exibindo país/estado, para o usuário escolher a correta. Sem autocomplete-enquanto-digita, sem histórico/favoritos no v1 — mantém o escopo enxuto do treinamento. | Q2 (profundidade da busca) e Q3 (desambiguação de cidades homônimas). |
| **Persistência local (client-side) de unidade e última cidade** | Sem backend, mas `localStorage` guarda a unidade de temperatura escolhida e a última cidade pesquisada, evitando reconfiguração a cada acesso — sustenta a métrica de sucesso da persona Carlos. | Q6 (persistência da preferência de unidade) e a expectativa da persona "planejador de rotina". |
| **Campos do clima atual: temperatura, sensação térmica, umidade relativa, vento, código de condição** | Conjunto mínimo suportado nativamente pelo endpoint `current` da Open-Meteo, sem exigir chamadas extras; cobre RF2 sem ambiguidade de "se disponível". | Q4 (campos do clima atual) — remove a cláusula de escape do RF2. |
| **Previsão diária: data, temperatura mínima, temperatura máxima, código de condição predominante** | Conjunto mínimo suportado nativamente pelo endpoint `daily` da Open-Meteo, compatível com "5 dias = hoje + 4 dias". | Complementa a decisão de granularidade da previsão (RF3). |
| **Mapeamento de códigos WMO → rótulo pt-BR + ícone, mantido em `lib/weatherCodes.ts`** | O Open-Meteo retorna `weather_code` numérico (padrão WMO); é preciso uma tabela de tradução fixa para rótulo textual e ícone antes de exibir "ensolarado/nublado/chuva" na UI. | Fecha a lacuna de tradução entre RF2/RF3 (texto de condição) e o dado real da API. |
| **Metas numéricas: p95 &lt; 2s (busca + carregamento), breakpoint mobile/desktop em 768px, suporte às 2 últimas versões de Chrome/Firefox/Safari/Edge** | Torna os RNF de desempenho, responsividade e portabilidade testáveis e mensuráveis, em vez de termos subjetivos como "rápido" ou "telas pequenas". | Q7 (alvo de dispositivos móveis) e Q10 (métricas de desempenho e escala). |

## Suposições

- A aplicação será web (responsiva), sem necessidade de app nativo neste
  momento.
- Não há requisito de autenticação de usuário; o uso é anônimo.
- A fonte de dados climáticos oferece tanto geocoding quanto previsão em uma
  única integração (ou integrações compatíveis).
- A conversão entre Celsius e Fahrenheit é apenas de apresentação, sem impacto
  na fonte de dados armazenada/consultada.
- O idioma principal da interface é pt-BR, com termos técnicos em en-US no
  código.
- Não há requisito imediato de suporte offline; tratamento de erro de rede é
  suficiente para o escopo inicial.
