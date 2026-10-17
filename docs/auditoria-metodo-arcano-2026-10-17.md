# Auditoria e reconstrução — Curso Completo de Tarot e Magia (Método Arcano)

Data: 17/10/2026 · Escopo: funil Anúncio → Página → VSL → CTA → Checkout Hotmart → Compra
Status: **nova página pronta em prévia. Nada foi publicado em produção, nenhum preço foi alterado na Hotmart e nenhuma campanha foi modificada.**

- Prévia (protegida por login da Vercel): https://site-pai-bruno-om7dw8ybv-pai-bruno.vercel.app/curso-tarot-e-magia
- Mesma prévia com o preço atual do checkout (botões ativos): …/curso-tarot-e-magia?preco=480
- Modo de inspeção dos eventos (console, sem enviar nada): acrescente `&debug=1`

---

## 1. Fontes usadas e limites de acesso

| Fonte | Acesso | O que forneceu |
|---|---|---|
| Repositório `site-pai-bruno` | total | código da página, pixel, configuração da Vercel |
| Site público www.paibrunovieira.com.br | total | conferido: idêntico à cópia de trabalho local (inclusive as alterações **não commitadas**) |
| Checkout https://pay.hotmart.com/D101917640B | página pública, sem compra | produto, preço, parcelas, formas de pagamento, pixels |
| Página do produtor na Hotmart (paibruno.hotmart.host) | pública | lista oficial dos 10 módulos, inclusões, certificado, garantia |
| Meta Ads (conta "Ganapati") e Events Manager (pixel 756056427466204) | leitura | números da campanha, anúncios, dispositivos, eventos dos últimos 28 dias |
| YouTube (VSL e depoimentos) | público | transcrição automática da VSL, durações, contagem de visualizações |
| **Painel da Hotmart (vendas, abandono, recuperação, reembolsos)** | **sem acesso** | — precisa ser conferido por você (ver §9) |
| **Retenção da VSL (YouTube Studio)** | **sem acesso** | — precisa ser conferido por você |
| Área de membros do curso | sem acesso | conteúdo real das aulas não foi verificado diretamente |

Sobre a VSL: **não assisti ao vídeo**. Trabalhei com a transcrição automática do YouTube (com marcações de tempo), com os metadados e com a miniatura.

---

## 2. Diagnóstico do funil

### 2.1 Números conferidos na Meta (campanha "Perpétuo - Curso Tarot e Magia - 1-1-3 - 2026-09-23", ID 120249927534930447, últimos 90 dias)

| Etapa | Valor | Taxa | Observação |
|---|---:|---:|---|
| Investimento | R$ 1.065,79 | — | bate com o informado |
| Cliques no link | 534 | — | CPC ≈ R$ 2,00 |
| Visualizações da página de destino | 449 | 84% dos cliques | carregamento **não** é o gargalo |
| InitiateCheckout atribuídos | 52 | 11,6% das visualizações | **inflado e não confiável** (ver §3) |
| Compras atribuídas | 1 | 0,22% das visualizações · 1,9% dos "checkouts" | CPA = R$ 1.065,79 |

*Taxas calculadas por mim a partir dos números da Meta. "Visualizações" ≠ visitantes únicos, e "InitiateCheckout" ≠ pessoas.*

Por anúncio (os 3 são imagem, conjunto "AS - Advantage+ - Brasil"):

| Anúncio | Gasto | Cliques | Visualizações | IC | Compras |
|---|---:|---:|---:|---:|---:|
| Arte 1 Microfone | R$ 295,88 | 150 | 117 | 16 | 1 |
| Arte 2 Tiragem | R$ 286,63 | 186 | 161 | 20 | 0 |
| Arte 3 Carta | R$ 483,28 | 198 | 171 | 16 | 0 |

Por dispositivo: Android gastou R$ 486 → 280 visualizações → 18 IC → 0 compras. iPhone gastou R$ 561 → 164 visualizações → 28 IC → 1 compra. **Desktop: 4 visualizações e 6 IC** (mais checkouts do que visitas, prova de contagem duplicada ou atribuída por visualização).

Existe ainda a campanha "BR - PÉRPETUO - C01" (R$ 260,54, 134 cliques, 112 visualizações, **35 IC** = 31% e 0 compras), também do curso, com uma taxa de IC improvável. O destino dela não foi retornado pela API.

### 2.2 Gargalos confirmados

1. **A promessa do anúncio não aparece na página.** Os anúncios vendem "Curso Completo de Tarot e Magia — do primeiro Arcano à leitura profissional" / "Aulas completas, do básico à prática". A página atual não cita esse nome nem uma vez: abre com "Quem lê carta, dá resposta. Quem lê energia, transforma vida" e "Tarot Terapêutico · Magia Aplicada". O checkout volta a usar "Curso Completo de Tarot e Magia com Pai Bruno". São três nomes para o mesmo produto ao longo do funil.
2. **Conteúdo divergente entre página, Hotmart e VSL.** A página diz **12 módulos**, enquanto a Hotmart lista **10** (e o anúncio C01 descreve exatamente esses 10). A página promete "Certificação: prova prática + leitura supervisionada", mas a Hotmart descreve um certificado digital de conclusão emitido automaticamente. O FAQ cita "Módulo 4: Somatização Empática Diagnóstica" e "Módulo 10: posicionamento e precificação", mas na Hotmart o Módulo 4 é "O Espelho da Alma" (métodos de leitura) e o 10 é meditação. "Manual do Terapeuta Energético", "Grimório do Terreiro São Miguel" e "Estudos de caso reais" não aparecem em nenhuma outra fonte.
3. **Preço inconsistente em quatro lugares.** VSL: R$ 597 ou 12× R$ 48,42 ("pré-venda"). Página: R$ 480 à vista, 12× R$ 49,64, **com R$ 797 riscado**. Página antiga da Hotmart: "De R$ 797 por R$ 497". Checkout: R$ 480 / 12× R$ 49,64 (total parcelado R$ 595,68). O R$ 797 riscado não corresponde a nenhum preço praticado que eu tenha encontrado.
4. **Urgência artificial.** "Quando as vagas de suporte ativo fecharem…" (página atual) e "Vagas limitadas / tempo limitado" (página Hotmart), sem um limite real informado.
5. **A VSL quase não foi consumida.** O vídeo tem **178 visualizações no total** desde 24/10/2025 (todas as origens), contra 449 visitas pagas só nesta campanha. Mesmo no melhor cenário, a maior parte dos visitantes não deu play. A VSL fica atrás de uma miniatura com botão, abaixo da primeira dobra no celular, e não há nenhum evento medindo o play.
6. **Primeira dobra no celular.** Título longo (4 linhas a 13vw) + foto de 75vh. O primeiro CTA leva direto ao checkout antes de a pessoa ver o que está incluído ou o preço completo, o que ajuda a explicar muitos IC com quase nenhuma compra.
7. **Performance.** A foto do topo tem 1,1 MB (2561 px) e a página total pesa 1,2 MB. Lighthouse mobile da página atual: LCP 6,4 s, desempenho 72.

### 2.3 Hipóteses (não comprovadas, dependem de dados da Hotmart)

- **H1: a quebra principal está entre checkout e pagamento.** Mesmo descontando a duplicação, a proporção de aberturas de checkout para compras é muito baixa. Causas prováveis: desconfiança gerada pela troca de nome do produto, preço diferente do esperado (R$ 797 → R$ 480 → total parcelado R$ 595,68) e pessoas indo ao checkout "só para ver o preço". **Para confirmar:** relatório de abandono de checkout da Hotmart, por forma de pagamento.
- **H2: o público do Advantage+ com criativos de imagem é muito frio** para uma decisão de R$ 480–597 tomada direto no anúncio. O Android gerou 62% das visitas e nenhuma compra.
- **H3: o preço não é o problema principal.** Com 449 visitas e 1 venda, a amostra é pequena demais para dizer que "R$ 480 não converteu melhor que R$ 597". O intervalo de confiança da conversão vai de cerca de 0,01% a 1,2%. Não houve teste controlado de preço.

### 2.4 Conta de equilíbrio (cálculo meu, antes das taxas da Hotmart e de impostos)

Com o custo atual de R$ 2,37 por visita, uma venda de R$ 480 paga a mídia se a página converter ≥ **0,49%** das visitas (1 venda a cada ~200). A R$ 597, ≥ **0,40%** (1 a cada ~250). A conversão observada foi de 0,22%. A distância entre um número e outro é pequena: a página, a VSL e a coerência do funil, sozinhas, podem fechar boa parte dela, mas só um teste vai dizer se isso acontece.

---

## 3. Auditoria da mensuração

### 3.1 Matriz de eventos (pixel 756056427466204 "PIXEL 2026")

| Evento | Origem | Condição de disparo | Identificador / dedup | Destino | Como verifiquei | Status |
|---|---|---|---|---|---|---|
| PageView | site atual (navegador) | carregamento de `/` | sem eventID | pixel | código + Events Manager | ⚠️ funciona, mas também chega de `localhost` (44 em 28 dias), de URLs `*.vercel.app` (11) e de `evorah.app` |
| InitiateCheckout | site atual, `dist/app.js` (cópia **não commitada**, no ar) | **clique** em qualquer botão `data-checkout` | sem eventID | pixel | código + Events Manager (aparece no site só a partir de 05/10) | ❌ **duplica** o IC que a Hotmart já envia |
| InitiateCheckout | checkout Hotmart (navegador + servidor) | abertura do checkout | gerido pela Hotmart | pixel | rede do navegador ao abrir o checkout + estatísticas (chegam em grupos de 3 por hora) | ⚠️ ativo; várias contagens por abertura; sem `fbc` (o fbclid se perde no site) |
| Purchase | Hotmart (25 de 26 vêm do servidor) | pagamento aprovado | Hotmart | pixel | Events Manager (por URL) | ✅ real, mas **o mesmo pixel recebe Purchase da EVORAH** (19 em 28 dias, outros produtos), o que mistura sinais de otimização |
| PageView_Rituais / ViewContent_Rituais / WhatsApp_Rituais | `/7chaves` e outras páginas de rituais | carregamento / clique no WhatsApp | sem eventID | mesmo pixel | código + Events Manager | ℹ️ outro produto no mesmo pixel |
| TesteDedupeA | desconhecida | — | — | pixel de produção | Events Manager | ❌ evento de teste contaminando produção |
| Pixels extras no checkout: 645898778455708 e 1159677076109075 | configuração da Hotmart | — | — | — | `fbq` no checkout | ❓ confirmar de quem são |
| Eventos de servidor (CAPI) para PageView e ViewContent | **não estão neste repositório** | — | dedup desconhecida | pixel | Events Manager (4.946 PageView de servidor em 28 dias) | ❓ descobrir a origem (EVORAH? Hotmart? gateway?) e se há deduplicação |
| UTMs / fbclid até a Hotmart | site atual | — | — | — | código: o link do checkout é fixo | ❌ **perdidos**: a Hotmart não sabe de qual anúncio veio a venda |
| VSL | — | — | — | — | — | ❌ nenhuma medição |

Qualidade de correspondência (EMQ web): 6,1 em PageView, ViewContent e InitiateCheckout; `fbc` com 46,7% de cobertura em PageView e **ausente** no InitiateCheckout.

### 3.2 O que a nova página corrige

- **Não dispara InitiateCheckout no clique.** No lugar entra `CheckoutClick` (personalizado, com `position`), para que o IC venha só da Hotmart.
- **Repassa** `utm_*`, `fbclid`, `gclid`, `src`, `sck` e `xcod` ao checkout. Se não houver `src`, usa o `utm_source`; se não houver `sck`, usa `lp_v2_<posição do botão>`. Assim a Hotmart passa a mostrar a origem de cada venda, e o checkout recebe o `fbclid` (melhora o `fbc`).
- **Eventos novos:** `ViewContent` (com o ID do produto e o valor), `OfferView`, `VSL_Play`, `VSL_Progress` 25/50/75/95% (tempo **realmente assistido**, pular capítulos não conta), `Depoimento_Play`. Todos com `eventID` único.
- **Pixel desligado** na prévia, fora do domínio de produção e com `?debug=1`.
- **Nunca envia Purchase.**

### 3.3 Correções recomendadas fora do código (precisam de você)

1. No Events Manager → Configurações → **Permissões de tráfego**: liberar só `paibrunovieira.com.br`, `pay.hotmart.com` e `evorah.app` (bloqueia localhost e vercel.app).
2. Criar uma **conversão personalizada** "Compra — Curso Tarot" (Purchase filtrado pelo produto/URL da Hotmart) e otimizar a campanha do curso por ela, não pelo Purchase geral que mistura a EVORAH. Avaliar um pixel separado para rituais.
3. Descobrir a origem dos eventos de servidor e do `TesteDedupeA`; remover o teste.
4. Na Hotmart: confirmar quais pixels estão configurados no produto (os dois IDs extras) e se o IC é enviado por navegador e servidor com o mesmo event_id.
5. Na página atual (se ela continuar no ar), remover o `fbq('track','InitiateCheckout')` do `dist/app.js`. **Não apliquei** porque exige deploy em produção.

### 3.4 Rastros deixados por esta auditoria (transparência)

Ao inspecionar o checkout, o carregamento da página enviou **1 PageView e 1 InitiateCheckout** ao pixel de produção, a partir de `pay.hotmart.com`, em 17/10 por volta das 02:20. Os testes locais da página atual (`localhost` / `127.0.0.1`) enviaram **2 a 3 PageView**. Nenhuma compra, nenhum Purchase, nenhum formulário enviado. Depois disso, não reabri o checkout com os parâmetros de rastreamento para não gerar novos eventos.

---

## 4. Checkout Hotmart (verificado em 17/10/2026, sem compra)

| Item | Resultado |
|---|---|
| Link ativo | ✅ abre normalmente (acrescenta `?bid=`) |
| Produto | "Curso Completo de Tarot e Magia com Pai Bruno", autor "Pai Bruno" ✅ |
| Preço | **R$ 480,00 à vista** (a oferta tem o rótulo "novopreçoinicial") |
| Parcelamento | 2× R$ 252,64 … **12× R$ 49,64** (total R$ 595,68), "possui acréscimo" ✅ |
| Formas de pagamento | cartão, dois cartões, **Pix**, **boleto**, Apple Pay ✅ |
| Garantia | **não aparece no checkout**. A página do produtor na Hotmart informa 7 dias. ⚠️ Confirmar no painel |
| Campos | e-mail (2×), nome, CPF/CNPJ, celular, cupom |
| Redirecionamentos | nenhum inesperado |
| Parâmetros de rastreamento | o site atual não envia nenhum ❌ |
| Celular | não testei especificamente no celular para não gerar novos IC; o checkout da Hotmart é responsivo |

---

## 5. Auditoria da VSL (pela transcrição; não assisti)

| Critério | Avaliação |
|---|---|
| Abertura (0:00–1:15) | Boa pergunta de identificação ("sente que tem um dom… travada, insegura?"), mas genérica e com 1:15 de qualificação antes de qualquer prova ou demonstração. Risco alto de abandono no celular |
| Promessa | "ler tarô com confiança e aplicar magia com ética e poder, mesmo começando do zero… ajudar outras pessoas": clara, mas ampla |
| Público | bem qualificado (iniciante, já tem baralho, já atende) ✅ |
| Diferenciação | "não decorar, conversar com símbolos" + 3 pilares ✅, o melhor trecho do vídeo |
| Mecanismo | os 3 exercícios (3:45–5:05) são **excelentes**: demonstram o método na prática. Deveriam vir antes |
| Autoridade | aparece só em 1:56 e sem números ou contexto visual |
| Provas | ⚠️ "centenas de alunos… hoje fazem atendimentos pagos… no primeiro mês começou a atender": alegações de resultado e renda sem prova exibida. Risco de política de anúncios e de confiança |
| Desejo | bom no fechamento, com tom espiritual ("chamado") |
| Objeções | só "não precisa ser médium". Faltam baralho, tempo, suporte, Umbanda e "serve para mim?" |
| Transição para a oferta | "quanto vale para você…" e lista de itens ✅ |
| Preço | ❌ **R$ 597 / 12× 48,42 "pré-venda"**, que contradiz a página e o checkout. Esse 12× não corresponde ao parcelamento atual da Hotmart para R$ 597 |
| Fechamento / CTA | "Clique no botão abaixo" ✅, mas no YouTube a descrição leva para a página antiga (`paibruno.hotmart.host`) |

**Mitigação sem regravar:** na nova página, o vídeo fica logo após o hero, com **capítulos clicáveis** (é possível pular direto para "Três exercícios práticos" em 3:45) e um aviso de que o preço válido é o da página. Recomendo trocar o link da descrição do YouTube para a nova página.

### 5.1 Roteiro revisado proposto (≈ 6 min) — opcional, a página não depende dele

| Tempo | Fala (resumo fiel ao método) | Cena / prova | Por que mudou |
|---|---|---|---|
| 0:00–0:20 | "Se você tira uma carta e corre pro Google pra saber o que ela significa, este vídeo é pra você. Nos próximos minutos eu vou te mostrar por que decorar não funciona e te passar um exercício que você pode fazer agora, com o seu baralho." | Close nas mãos embaralhando; corte para o rosto | Gancho concreto + promessa de valor imediato nos 20 primeiros segundos |
| 0:20–0:50 | "Eu sou Bruno Vieira, Pai Bruno, tarólogo e sacerdote do Terreiro São Miguel, em BH. [número confirmado de atendimentos]. Comecei estudando sozinho, perdido entre livros…" | Imagens reais do terreiro e do estúdio de rádio | Autoridade cedo, em 30 s |
| 0:50–1:40 | O erro da decoreba: leitura mecânica, medo de errar, contradição quando saem várias cartas. "Tarot não é dom: é caminho." | Tela com 3 cartas e "significados de livro" que não se encaixam | Identificação pelo problema concreto, não pelo "dom" |
| 1:40–2:30 | Os 3 pilares: Simbologia Viva → Intuição Estruturada → Magia Aplicada. | Gráfico simples com as 3 etapas (o mesmo da página) | Mecanismo |
| 2:30–4:00 | **Exercício ao vivo:** tirar uma carta; o que você vê/sente/lembra; as 3 perguntas; a ação (Estrela → vela branca). | Câmera sobre a mesa, carta real | A demonstração é a melhor prova: subiu de 3:45 para 2:30 |
| 4:00–4:40 | Depoimentos: trechos de 10–15 s de Sheila, Naiara e Janieth (autorizados), **sem promessa de renda**. | Vídeos verticais em tela cheia | Prova verificável no lugar de "centenas de alunos atendendo no 1º mês" |
| 4:40–5:30 | O que a formação inclui: os 10 módulos em uma tela, apostilas, suporte pelo WhatsApp com você e a equipe, acesso vitalício, certificado da Hotmart. "Não precisa ser médium, nem umbandista; precisa de um baralho e vontade de praticar." | Tela da área de membros (gravação real) | Objeções + entrega tangível |
| 5:30–6:00 | Preço **sem dizer o valor no vídeo**: "O valor e as condições estão logo abaixo deste vídeo, e você tem 7 dias de garantia pela Hotmart." | Texto na tela: "Garantia de 7 dias" | O vídeo não fica desatualizado a cada mudança de preço |
| 6:00–6:20 | Fechamento: "Se existe em você o chamado, dê a ele um método." CTA para o botão abaixo. | Rosto, luz quente | Mantém o tom espiritual sem urgência artificial |

---

## 6. Oferta e preço

- O checkout cobra hoje **R$ 480**. A nova página está configurada com a proposta de **R$ 597**, mas **só em prévia**: enquanto o preço da página for diferente do conferido na Hotmart, os botões de compra ficam **bloqueados no código** (mesmo se alguém publicar por engano).
- **Não inventei o valor da parcela de R$ 597.** A página diz "ou em até 12× no cartão (o valor de cada parcela… aparece no checkout)" até você conferir na Hotmart e preencher `offer.installmentValue` em `config.js`.
- **Removidos:** preço riscado de R$ 797 (sem respaldo), comparação "menos que 1 atendimento e meio", "vagas de suporte".
- **Decisão sua:** (a) manter R$ 480 (troca de 1 linha no config) ou (b) subir a oferta na Hotmart para R$ 597 e só então publicar. Recomendo **não** mudar preço e página ao mesmo tempo: a primeira rodada da página nova deveria rodar ao preço atual, para que o efeito da página possa ser medido.

---

## 7. Antes e depois

| Aspecto | Página atual | Nova página |
|---|---|---|
| Primeira dobra | Frase de efeito ("Quem lê carta, dá resposta…"); o produto não é nomeado; foto do terreiro; CTA vai direto ao checkout | Nome do produto igual ao anúncio e ao checkout; promessa clara ("Pare de decorar cartas. Aprenda a ler o Tarot."); quem ensina; 3 fatos verificados; CTA para a oferta; preço visível; foto com cartas na mesa |
| Promessa | "Transforma vida", "terapeuta energético formado" | Aprender a ler com estrutura, intuição e magia com fundamento, sem promessa de renda ou resultado espiritual |
| Mecanismo | 3 pilares em texto | 3 pilares em fluxo (→) + **demonstração interativa** com os 3 exercícios da VSL |
| VSL | Abaixo da dobra no celular, sem medição | Logo após o hero, capítulos clicáveis, medição de play e % assistido |
| Conteúdo | "12 módulos", Manual, Grimório e certificação prática (não confirmados) | **10 módulos reais**, com o que cada um ensina + 4 formas de entrega |
| Autoridade | "15 anos", "15 mil atendimentos" | História do próprio Pai Bruno (da VSL) + números marcados "a confirmar" |
| Prova social | 3 vídeos | Os mesmos 3 vídeos reais, com duração, carregamento leve e eventos |
| Oferta | R$ 797 riscado, R$ 480, comparação com consulta | Lista do que está incluído, preço único, parcelamento real, formas de pagamento conferidas, Hotmart como intermediária |
| CTAs | 6 (todos para o checkout) | Hero → oferta; oferta, final e barra fixa → checkout (com UTMs). A barra fixa some na oferta e no final |
| FAQ | 10 perguntas, várias com conteúdo não confirmado | 13 perguntas pedidas no briefing, respondidas só com fontes; 1 marcada como pendente (baralho) |
| Fechamento | "Você não chegou até aqui por acaso" + escassez de suporte | Chamado + método, sem pressão |
| Mobile (Lighthouse) | Desempenho 72 · LCP 6,4 s · 1.223 KB · Acessibilidade 95 · Boas práticas 79 | **Desempenho 97 · LCP 2,3 s · 457 KB · Acessibilidade 100 · Boas práticas 100** |

---

## 8. Implementação

**Criados** (nada existente foi alterado):
- `dist/curso-tarot-e-magia/index.html`: página completa, com dados estruturados, OG e `noindex` (prévia)
- `dist/curso-tarot-e-magia/page.css`: paleta e tipografia da marca (verde profundo, papel, terracota; Libre Baskerville / DM Sans / DM Mono)
- `dist/curso-tarot-e-magia/page.js`: preço, checkout com UTMs, pixel, VSL, depoimentos, abas acessíveis, barra fixa
- `dist/curso-tarot-e-magia/config.js`: **toda a parte comercial** (preço, parcela, checkout, prévia)
- `dist/images/arcano/`: fotos reais otimizadas (640/1100 px, 59–183 KB) + `og-curso.jpg` (1200×630)
- `.claude/launch.json`: servidor local para revisão
- este relatório

**Preservado:** `/`, `/7chaves`, `/politica`, `api/lp.js`, `api/sitemap.js`, o pixel e as alterações locais não commitadas que já estão no ar (`dist/app.js`, `dist/index.html`, `dist/site-config.js`). Nada foi commitado.

**Testes executados**

| Teste | Resultado |
|---|---|
| `npm run lint`, `typecheck`, `build` (scripts do projeto) | ✅ passam (são verificações mínimas de existência de arquivo e sintaxe) |
| `node --check` em `page.js` e `config.js` | ✅ |
| Estrutura HTML (tags, ids duplicados, `alt`) | ✅ sem erros |
| Navegador desktop 1440×900: todas as seções | ✅ |
| Navegador mobile 375×812: primeira dobra com CTA, sem rolagem horizontal, barra fixa | ✅ |
| VSL: play, capítulos, iframe API, eventos de progresso | ✅ (corrigi um bug: pular para um capítulo contava como assistido) |
| Depoimentos: os 3 carregam e tocam | ✅ |
| Preço R$ 597 → botões bloqueados + aviso | ✅ |
| `?preco=480` → R$ 480 / 12× R$ 49,64, links reais com `utm_*`, `fbclid`, `src` e `sck` | ✅ |
| Eventos (console em prévia) | ✅ PageView, ViewContent, OfferView, VSL_Play, VSL_Progress, Depoimento_Play |
| Lighthouse mobile | ✅ 97 / 100 / 100. SEO 69 **apenas** por causa do `noindex` da prévia |
| Deploy de prévia na Vercel (sem `--prod`) | ✅ protegido por login; rotas `/curso-tarot-e-magia` com e sem barra |
| Produção conferida após o deploy | ✅ inalterada (preço R$ 480; rota nova 404) |
| **Não testado:** Safari/iOS real (só Chromium com emulação mobile) | risco baixo: CSS e JS padrão, sem recursos experimentais |
| **Não testado:** pixel enviando de verdade | proposital, para não gerar eventos falsos. Validar no Test Events da Meta logo após publicar |
| **Não testado:** checkout com os novos parâmetros | evitado para não gerar IC. `src` e `sck` são parâmetros documentados da Hotmart |

**Rollback:** a nova página é aditiva. Para voltar atrás, basta apontar os anúncios para `/` de novo, ou apagar a pasta `dist/curso-tarot-e-magia/` e fazer um novo deploy. A home atual não foi tocada. Recomendo **commitar o estado atual que está no ar** antes de qualquer publicação, porque hoje ele só existe como alteração local não commitada.

---

## 9. Pendências para publicar (checklist de aprovação)

Decisões comerciais:
- [ ] Preço: manter **R$ 480** ou subir para **R$ 597** na Hotmart (e preencher a parcela real no `config.js`)

Confirmações de conteúdo (aparecem marcadas "a confirmar" na prévia):
- [ ] "+15 mil atendimentos" e "centenas de alunos" (vêm das suas páginas, mas o briefing pede confirmação)
- [ ] Janieth, Sheila e Naiara são alunas desta formação e autorizaram o uso
- [ ] Baralho: qual recomendar e se dá para começar sem ele (FAQ)
- [ ] "Exercícios e tiragens" (citado na VSL) e suporte pelo WhatsApp ativo, com você e a equipe
- [ ] Certificado de conclusão habilitado no produto da Hotmart e garantia configurada em 7 dias
- [ ] Manual do Terapeuta, Grimório, estudos de caso e certificação prática: **existem?** Se existirem, entram na página; hoje estão fora

Dados que só você acessa:
- [ ] Hotmart: abandono de checkout no período 23/09–hoje, por forma de pagamento; vendas por origem; reembolsos
- [ ] YouTube Studio: retenção da VSL (onde as pessoas saem)

Para publicar (depois do OK): `preview: false` e preço igual ao da Hotmart no `config.js`; remover `noindex` do HTML; commit; `vercel deploy --prod`; testar no Test Events da Meta; apontar um conjunto de anúncios para `/curso-tarot-e-magia` (ou trocar a home).

---

## 10. Plano de validação comercial

**Princípio:** mudar **uma coisa de cada vez**. Primeira rodada: página nova, **mesmo preço (R$ 480)**, mesmos criativos, mesmo público.

1. **Divisão de tráfego:** dois conjuntos de anúncios idênticos (mesmo orçamento e criativos), um apontando para `/` (atual) e outro para `/curso-tarot-e-magia` (nova), com `utm_content` diferente. Se possível, use o **Teste A/B** nativo da Meta para dividir o público sem sobreposição.
2. **Fonte da verdade da venda:** relatório da Hotmart filtrado por `sck` (`lp_v2_*` = página nova) e `src`. A atribuição da Meta é secundária.
3. **Indicadores por etapa** (nova página): visitas → `VSL_Play` → `VSL_Progress` 50% → `OfferView` → `CheckoutClick` → IC (Hotmart) → compra (Hotmart). Por dispositivo.
4. **Tamanho da amostra:** para separar 0,22% de 0,6% de conversão (95% de confiança, 80% de poder) seriam necessárias ~4.400 visitas por versão (≈ R$ 10 mil por versão ao custo atual de R$ 2,37 por visita). Isso provavelmente está acima do orçamento, então a avaliação deve ser **progressiva**:
   - **Fase 1 (≈ 300–400 visitas por versão):** comparar indicadores intermediários: taxa de play da VSL, % que chega à oferta, cliques no checkout por visita e, principalmente, **compras por abertura de checkout na Hotmart**. Se a nova página levar a pelo menos o mesmo número de checkouts com mais compras, avançar.
   - **Fase 2:** concentrar o orçamento na vencedora e somar vendas ao longo de semanas. Decidir com intervalos de confiança, não com 1 ou 2 vendas.
   - **Fase 3 (só depois):** testar o preço (R$ 480 × R$ 597) com a página fixa.
5. **Cuidados:** não trocar criativos, público ou orçamento no meio de uma fase; registrar datas de qualquer mudança; separar o tráfego frio (Advantage+) de remarketing (quem assistiu ≥ 50% da VSL, quem chegou à oferta, quem abriu o checkout). O remarketing deve ser o primeiro público a ganhar escala, porque agora existem eventos para criá-lo.
6. **Receita por visitante** = receita líquida da Hotmart ÷ visitas da página (por versão). Esse é o número final para decidir.

---

## 11. Atualização — oferta de R$ 597 (17/10/2026)

**Prévia atual:** https://site-pai-bruno-1jjx8pw9h-pai-bruno.vercel.app/curso-tarot-e-magia (protegida por login da Vercel). Produção conferida: inalterada (R$ 480, oferta padrão).

### 11.1 As ofertas são separadas? Sim

Conferido no payload público do checkout, sem abrir o navegador (portanto sem disparar pixel):

| | Página atual (`/`) | Nova página |
|---|---|---|
| Link | `pay.hotmart.com/D101917640B` | `pay.hotmart.com/D101917640B?off=x6ba7awn` |
| Código da oferta | `5zft0ttu` ("novopreçoinicial") | `x6ba7awn` ("Novembro 2026") |
| À vista | R$ 480 | R$ 597 |
| 12× | R$ 49,64 (total R$ 595,68, juros pagos pelo comprador) | **R$ 49,75 (total R$ 597,00, juros absorvidos por você: R$ 115,97 em 12×)** |
| Máximo de parcelas | 12 | 12 |
| Formas de pagamento | cartão, dois cartões, Pix, boleto, boleto parcelado, PayPal, Apple Pay | cartão, dois cartões, Pix, boleto, PayPal, Apple Pay |

Pontos de atenção na oferta nova:
- **Pix, boleto e "dois cartões" apontam para um terceiro código de oferta, `6x3p7uv7`** (também R$ 597). Cartão, PayPal e Apple Pay usam `x6ba7awn`. Isso pode fazer as vendas por Pix ou boleto aparecerem no relatório da Hotmart com outro código. Vale conferir no painel o que é `6x3p7uv7`.
- Em 7×, 8×, 9× e 11×, o total arredondado fica de R$ 0,03 a R$ 0,08 acima de R$ 597 (centavos de arredondamento da Hotmart). Em 12× fecha em R$ 597,00 exatos.
- "Dois cartões" tem taxa de juros própria (3,49%) no payload, por isso a página **não** diz "sem juros" para essa forma.
- O parcelamento "sem juros" tem custo para você: em 12×, R$ 115,97 por venda saem da sua receita (antes da taxa da Hotmart).

### 11.2 Mudanças aplicadas (só na prévia)

- Checkout → `?off=x6ba7awn`. Os botões preservam `off` e acrescentam as UTMs, `src` e `sck`.
- Preço "R$ 597 à vista ou 12× de R$ 49,75 sem juros" no topo (antes do botão), no card da oferta, na barra fixa, no fechamento e no FAQ.
- Trava de segurança: se preço, parcela, "sem juros" ou o código da oferta no link divergirem do que foi conferido, os botões se bloqueiam sozinhos.
- 12 módulos (topo, título da seção e oferta). Os módulos 11 e 12 aparecem como "a confirmar".
- Legenda da foto: "Pai Bruno na Rádio Globo BHFM" (o texto alternativo também).
- VSL atual mantida.
- **Retirado por falta de comprovação:** "+15 mil atendimentos", "centenas de alunos", "médium", a frase "o que eu ensino é o que uso todos os dias", "Exercícios e tiragens" na lista da oferta, o FAQ "Não sou umbandista", a referência a "alunas da formação" nos depoimentos e as menções a números de módulo no FAQ.

Critério adotado: é "comprovado" o que está no checkout da Hotmart, na página oficial do produto na Hotmart (o que você publicou na plataforma) e o que você me confirmou por escrito. Afirmações que só aparecem na página atual ou na VSL de pré-venda saíram.

### 11.3 Pixels e eventos — diagnóstico (nada foi alterado)

- O pixel **não é declarado por oferta** no HTML do checkout: ele carrega depois, no navegador. Por isso não confirmei visualmente que a oferta `x6ba7awn` dispara o pixel 756056427466204. Abrir a oferta no navegador geraria um InitiateCheckout real. Para confirmar sem sujar os dados, use o **Test Events** do Events Manager (ou o Meta Pixel Helper) ao abrir o link.
- Nas últimas 12 h, o pixel registrou 6 eventos vindos de `pay.hotmart.com` na hora em que eu abri o checkout uma única vez. Isso é coerente com cada abertura gerar várias contagens (navegador e servidor), o que reforça que "52 checkouts" não são 52 pessoas.
- Continuam chegando eventos de `127.0.0.1` (4, dos meus testes locais da página atual, que tem o pixel fixo) e um **Purchase de `evorah.app`** (outro produto no mesmo pixel).
- As recomendações da §3.3 continuam valendo e dependem da sua aprovação: permissões de tráfego, conversão personalizada só para o curso, remover `TesteDedupeA`, descobrir a origem dos eventos de servidor e tirar o InitiateCheckout no clique da página atual.

---

## 12. Versão final para aprovação (17/10/2026)

**Prévia final (protegida):** https://site-pai-bruno-f46gdh52i-pai-bruno.vercel.app/curso-tarot-e-magia. Produção conferida: home idêntica à anterior, R$ 480, oferta padrão, rota nova com 404.

**Oferta:** todos os 4 botões (topo, oferta, fechamento, barra fixa mobile) → `pay.hotmart.com/D101917640B?off=x6ba7awn` + UTMs, `fbclid`, `gclid`, `src`, `sck=lp_v2_<posição>`. O link com parâmetros responde HTTP 200 e o checkout carrega a oferta `x6ba7awn` com 12× de 49,75 (conferido sem navegador).

**12 módulos:** títulos oficiais. 1–10 com a descrição da página oficial da Hotmart; 11 "Espiritualidade e Tarot" e 12 "Prática com Tarot" marcados "Em preparação", sem descrição nem data, também no topo, na oferta e no FAQ. O topo não fala mais em "acesso imediato".

**Confirmado e mantido:**
- Garantia de 7 dias: `warrantyDays: 7` na configuração do checkout.
- Suporte pelo WhatsApp com Pai Bruno e equipe, certificado digital de conclusão emitido pela Hotmart (com a ressalva de que **não é certificação profissional nem habilitação legal**), apostilas e acesso vitalício: página oficial do produto na Hotmart.
- Bônus Workshop Umbanda em Casa: área de membros, conferida por você.

**Retirado da versão publicável (conservador):**
- "+15 mil atendimentos", "centenas de alunos", "médium"
- Manual do Terapeuta, Grimório, estudos de caso, certificação prática
- FAQ do baralho e FAQ "não sou umbandista"
- **Seção de depoimentos**: oculta (`testimonialsEnabled: false` em `config.js`) até haver autorização de uso confirmada e definição de que são, ou não, alunas do curso. Para reativar, basta mudar uma linha.

**VSL:** mantida. ID, duração, capítulos e aviso ficam em `config.js` (`vsl`), e trocar o vídeo é só editar essa configuração. Abaixo do vídeo aparecem "Condição atual: R$ 597 à vista ou 12× de R$ 49,75 sem juros" e o aviso de que prevalecem as condições da página e do checkout.

**Oferta `6x3p7uv7` (nada foi alterado):** mesmo produto, descrição "Novembro 2026", R$ 597. Aberta diretamente, cobra no cartão **12× R$ 61,74 (total R$ 740,88)**, com juros para o comprador. No checkout `x6ba7awn`, apenas Pix, boleto e "dois cartões" passam por ela. Pix e boleto saem a R$ 597, então o preço está correto. "Dois cartões" pode ter juros, por isso a página não promete "sem juros" para essa forma. Ela não é usada em nenhum link da página.

**Rastreamento — validação controlada:** modo `?pixeltest=1` (só na prévia), com um `fbq` falso que só registra as chamadas; nada foi enviado à Meta.
- Resultado: `init` 1×, `PageView` 1×, `ViewContent` 1×, `OfferView` 1× (não repete ao rolar de novo), `VSL_Play` 1× (sem progresso falso ao pular capítulo), `CheckoutClick` 1× por botão com `position`, todos com `eventID` único.
- **Nenhum `InitiateCheckout` nem `Purchase` sai da página**: a contagem de checkout fica só com a Hotmart.

**Funciona:** eventos da página, destino dos CTAs, preservação de UTMs, `sck` por posição, bloqueio automático se preço e oferta divergirem.

**Exige correção fora do código (aguarda sua decisão, nada foi alterado):**
- A Hotmart envia várias contagens de IC por abertura.
- O pixel está compartilhado com a EVORAH e os rituais.
- Há eventos de localhost e de teste (`TesteDedupeA`).
- Os eventos de servidor têm origem desconhecida.
- A página atual dispara IC no clique.
- Não deu para confirmar sem gerar um IC real que a oferta `x6ba7awn` dispara o pixel 756056427466204. Faça a checagem com o Test Events no momento da publicação.

**Testes:**
- `npm run lint`, `typecheck` e `build`: ✅
- `node --check`: ✅
- HTML sem erros: ✅
- Lighthouse mobile: 96 / 100 / 100. Desktop: 98 / 100 / 100 (após o ajuste de contraste nas etiquetas dos módulos). SEO 69 só por causa do `noindex` da prévia.
- Sem rolagem horizontal nem texto cortado em 375 px. Preço e botão de compra na primeira dobra do celular e do desktop. Vídeo 16:9 responsivo. Barra fixa funcionando.

**Para publicar (após sua autorização):** `preview: false` em `config.js`; remover a linha `noindex` do HTML; commit; `vercel deploy --prod`; conferir no Test Events; trocar a home ou apontar os anúncios para `/curso-tarot-e-magia`.

---

## 13. Publicação em produção (17/10/2026, ~12:23 BRT)

- **URL:** https://www.paibrunovieira.com.br/. O domínio sem `www` redireciona (308) com a query string preservada.
- **Deployment de produção:** `dpl_5mViYLUfejobyYoJpvFGS9EVvWuW` (https://site-pai-bruno-k5m13kyl7-pai-bruno.vercel.app), promovido a partir do build de preview já testado `site-pai-bruno-rbqn0pmwf`.
- **Commits (locais):**
  - `d7c2ddb`: registra a home antiga que estava no ar sem commit.
  - `72c188f`: nova página.
  - O `git push` não foi feito (bloqueado pelas permissões da sessão). Quando você quiser, rode `git push origin main`.
- **Rollback:**
  - Imediato: `vercel rollback dpl_42xgsccs13qxEkCxCn969Jxem6oJ` (a home anterior, de 05/10).
  - No código: `git revert 72c188f`.
- **Mudanças de roteamento:**
  - A home `/` passa a ser a página nova.
  - `/curso-tarot-e-magia` redireciona (307) para `/`, preservando UTMs.
  - Os botões de compra da `/politica` (via `site-config.js`) agora levam à oferta `x6ba7awn`.
  - As âncoras antigas (`#metodo`, `#formacao`, `#depoimentos`, `#oferta`) continuam existindo.
  - `/7chaves`, `/politica`, `/sitemap.xml`, `/robots.txt` e as landing pages da EVORAH (`/{endereço}`) estão intactas.
- **Testes no site público, sem login:**
  - Todas as rotas respondem 200.
  - A home está indexável (sem `noindex`) e sem nenhuma referência a R$ 480.
  - Lighthouse mobile antes do deploy: 98 / 100 / 100 / 100.
  - Desktop: botão do card de oferta → checkout `x6ba7awn` com UTMs e `sck=lp_v2_oferta`. Checkout exibe "12 x de R$ 49,75 · Ou R$ 597,00 à vista · Total de R$ 597,00", sem nota de acréscimo.
  - Celular (375 px): preço e botão na primeira dobra; barra fixa aparece no meio da página e some no topo e na oferta. O toque na barra abriu o checkout com o mesmo preço e `sck=lp_v2_sticky`.
  - Três depoimentos ativos (343×236 no celular), reproduzindo no player do YouTube.
- **Rastreamento:**
  - Test Events (sessão `TEST66819`): `PageView` e `ViewContent` do site "Processado" (configuração manual, com os nossos `eventID`). Da Hotmart, ao abrir o checkout: `PageView` + `InitiateCheckout` (integração de parceiros), 1 por abertura no navegador.
  - `VSL_Play`, `OfferView` e `CheckoutClick` saem com sucesso para `facebook.com/tr` (verificado na rede), mas a tela padrão do Test Events não lista eventos personalizados. Confira em Visão geral daqui a algumas horas.
  - Nenhuma compra, nenhum Purchase e nenhuma configuração do pixel alterada.
