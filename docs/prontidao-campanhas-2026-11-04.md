# Prontidão técnica para campanhas — Método Arcano (04/11/2026, ~21:45 BRT)

## 1. Site × commit
- Produção (`site-pai-bruno-bs9w695yr`) = commit `18ed721`: todos os arquivos versionados de `dist/` comparados byte a byte, 0 diferenças.
- GitHub: `f172a24..18ed721` enviado (fast-forward, sem force). Não versionados e não enviados: `.DS_Store`, `.claude/`, `originais/`.

## 2. VSL `PjLWENcb39k`
- Publicada: **896,4 s = 14:56** (áudio e vídeo coincidem, de 896,37 a 896,43 s); não listada; processada até 2160p; incorporação permitida.
- Transcrição automática: começa no gancho (0:00), fala contínua (sem pausa maior que 12 s) e termina na despedida (14:49–14:56). Preço falado entre 12:59 e 13:04: "12 vezes de 51,40 … à vista R$ 497", garantia de 7 dias — igual ao checkout principal.
- O conteúdo descrito (3 pilares, 3 exercícios, módulos) bate com a página. Também cita a aluna "Duda" e "como cobrar pelo seu trabalho".
- Não recebi o número da "duração da edição", então não dá para fechar a diferença. Causas comuns: exportação com outro trecho, contagem com vinheta/cartela final, arredondamento de quadros. Para conferir, basta comparar o número informado pelo editor com 14:56,4. Se ele for maior, o arquivo enviado pode não ser o final.

## 3. Checkouts (mesmo produto, id 6255680, garantia 7 dias)
| | Principal `fjjf36k2` | Alternativo `gxj0d4vh` |
|---|---|---|
| Valor | R$ 497 à vista · 12× R$ 51,40 (R$ 616,80) | Parcelamento Hotmart: Pix Parcelado, Boleto Parcelado, cartão recorrente · 12× R$ 51,46 (R$ 617,52) |
| Celular / desktop | 200, exibe a oferta certa | 200, exibe "Pague do seu jeito…" |
| Pixels carregados | os mesmos 3 Meta + tags Google da Hotmart | idem |

Rastros desta auditoria: 3 aberturas no navegador (principal 2×, alternativo 1×) com `utm_source=auditoria_interna`, que geraram InitiateCheckout reais nos 3 pixels. Nenhuma compra.

## 4. Integrações encontradas
| Integração | Onde | De quem | Situação |
|---|---|---|---|
| Meta Pixel 756056427466204 "PIXEL 2026" | site + checkout | Pai Bruno (conta Ganapati, BM Encruzilhada) | ativo; navegador + servidor |
| Meta Pixel 645898778455708 "Pixel de Bruno Vieira" | só checkout | Pai Bruno (conta 601503116537717) | ativo; só navegador |
| Meta Pixel 1159677076109075 | só checkout | **desconhecido** (sem acesso por aqui) | ativo — confirmar se é seu ou de coprodutor/afiliado |
| GA4 `G-GQH2V1F11Q` | checkout | **Hotmart** (fixo no código do checkout) | não é seu |
| Google Ads `AW-991176222`, `AW-11378722631` | checkout | **Hotmart** | não é seu |
| GA4 / GTM / Google Ads do Pai Bruno | — | — | **não existem** |

## 5. Como a Hotmart transmite compras
- Os pixels Meta do checkout vêm da configuração "Pixel de rastreamento" do produto (API `launcher-pixel`; script com `agent: plhotmart`). Na abertura: PageView + InitiateCheckout em cada pixel.
- Compra: nos últimos 28 dias o pixel 756056427466204 recebeu **63 Purchase, todos por servidor**:
  - **56** com URL `evorah.app` = vendas do EVORAH (rituais), enviadas pelo próprio EVORAH (`services/landing/meta-purchase.ts`).
  - **7** com URL `www.paibrunovieira.com.br` (03–04/11), por servidor. É o padrão da API de Conversões da Hotmart (usa a página de origem como URL). Precisa ser confirmado contra as vendas no painel da Hotmart.
  - Nenhum Purchase pelo navegador.
- Qualidade (EMQ) Purchase/InitiateCheckout: 9,3 (e-mail, telefone, nome, fbc, fbp, external_id 100%).
- Google: a Hotmart só envia ao Google Ads/GA4 do produtor se os IDs dele estiverem cadastrados no produto. Hoje não há nenhum.

## 6. Problemas e o que falta
1. **Não existe conversão "Compra do curso"** no Meta: o evento Purchase mistura EVORAH e Hotmart. Criar uma conversão personalizada (Purchase + regra que identifique o curso) e confirmar a regra na primeira venda real pelo Test Events.
2. Pixel 1159677076109075 sem dono identificado; 645898778455708 recebe só navegador. Decidir se ficam na Hotmart.
3. Google: criar/informar GA4 (`G-…`) e Google Ads (`AW-…` + rótulo de conversão de compra); cadastrar no produto da Hotmart (Ferramentas → Pixel de rastreamento) e preencher `config.google` no site.
4. Confirmar no painel da Hotmart as 7 compras de 03–04/11 (reais × testes).
5. Duração informada pelo editor, para fechar o item 2.
