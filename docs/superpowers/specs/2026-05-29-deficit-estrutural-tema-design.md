---
título: "Atlas — Disclaimer de déficit estrutural na página do tema"
versão: "1.0"
status: "design aprovado — pronto para writing-plans"
autor: "André Queiroz (curador) + Claude (rascunho)"
data: "2026-05-29"
spec_pai: "docs/superpowers/specs/2026-05-28-atlas-fase4-conteudo-mvp-design.md"
licença_conteúdo: "CC-BY 4.0"
---

# Disclaimer de déficit estrutural na página do tema

## Contexto

O piloto (Sprint 5.2) confirmou empiricamente o **Risco F4-5**: dois pares (candidato, tema) — **Flávio Bolsonaro × educação** e **Flávio Bolsonaro × saúde** — não têm declaração de primeira pessoa do pré-candidato dentro da janela editorial, em fonte acessível. A política já decidida (spec Fase 4 §4.3/§6.3, materializada em `/metodologia` seção 3) manda **registrar a lacuna abertamente em vez de inflar a cota artificialmente**.

Esta feature instancia essa política: torna o déficit um **dado estruturado** e o **sinaliza publicamente** na página do tema, onde o leitor procura as declarações.

## Decisão de design

1. **O déficit é um dado registrado** (não inferido por contagem). Inferir "0 declarações = déficit" seria falso durante o lote, quando um par pode estar apenas ainda-não-curado. Só pares explicitamente registrados são sinalizados.
2. **Lugar do dado:** novo campo `deficits_estruturais` em `data/criterio-selecao/latest.yaml`. O critério já define a quota 5×6; os déficits são exceções documentadas à quota → mesmo documento auditável, já lido por `/metodologia`.
3. **Exibição:** página do tema (`/temas/[slug]`), após a lista de declarações.
4. **Neutralidade (régua igual):** a exibição é genérica — qualquer candidato com déficit registrado naquele tema é sinalizado. No estado atual, só o Flávio tem déficits; o Lula (6/6) não exibe nada. Não é um tratamento dirigido a um candidato.

## Modelo de dado

Campo opcional em `criterio-selecao` (retrocompatível via `.default([])`):

```yaml
deficits_estruturais:
  - candidato_id: "bolsonaro-flavio"
    tema: "educacao"
    declaracoes_encontradas: 0
    justificativa: "Não há fala de 1ª pessoa do pré-candidato sobre educação na janela, em fonte acessível; material temático próprio é de 2024 (fora da janela)."
    data_verificacao: "2026-05-28"
  - candidato_id: "bolsonaro-flavio"
    tema: "saude"
    declaracoes_encontradas: 0
    justificativa: "Plano de saúde descrito por terceiros; a única citação direta pertence ao ex-ministro Queiroga, não a Flávio. Registrar lacuna em vez de misatribuir."
    data_verificacao: "2026-05-28"
```

Schema Zod 3 (em `src/content/config.ts` — constraint do projeto: `astro:content` re-exporta Zod 3):

```ts
deficits_estruturais: z.array(
  z.object({
    candidato_id: z.string().regex(/^[a-z0-9-]+$/),
    tema: z.string().min(1),
    declaracoes_encontradas: z.number().int().min(0),
    justificativa: z.string().min(1),
    data_verificacao: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  }),
).default([]);
```

- `candidato_id` e `tema` são FKs por slug (candidatos / temas). Validação de integridade fica a cargo de audit/uso, não do schema (consistente com o resto do projeto).
- Regenerar `data/schemas/*.json` via `pnpm generate-schemas` (gerador usa Zod 4 — constraint conhecida).

## Exibição

- **Função pura** `getDeficitsByTema(criterio, temaSlug)` em `src/lib/data/` (ou junto dos loaders de critério): filtra `deficits_estruturais` pelo tema. Testável isolada.
- **Componente** `src/components/tema/DeficitTema.astro`: recebe um déficit + o candidato resolvido; renderiza o bloco neutro.
- **Página** `/temas/[slug]`: após a lista de declarações, renderiza um `DeficitTema` por déficit do tema (resolvendo o candidato por slug, como já faz com os cards).

Redação (curta + justificativa visível; terceira pessoa, com data, sem adjetivo avaliativo):

> **Sem declaração de {nome} documentada em {tema}.**
> Dentro do critério editorial (janela até 28/05/2026), não foi localizada declaração de primeira pessoa do pré-candidato neste tema em fonte acessível. {justificativa} A cota não foi preenchida artificialmente. [Ver Metodologia →](/metodologia)

A data da janela ("28/05/2026") deriva do critério/errata; não hardcodar se já houver fonte. A redação final é conteúdo editorial do curador (ajustável no sign-off).

## Escopo

**Entra:**

- Campo `deficits_estruturais` + schema Zod + regeneração do JSON schema.
- Os 2 déficits do Flávio em `latest.yaml` (`versao` incrementa para 2).
- Função pura `getDeficitsByTema` + testes.
- Componente `DeficitTema.astro` + integração na página do tema.

**Fora (follow-up):**

- Integração com `audit:paridade` para ajustar a quota-alvo (o campo já habilita; é outro trabalho).
- Disclaimer no perfil do candidato (decisão: página do tema).
- Reescrita da narrativa pública de `/metodologia` (pertence ao P4 da AI Policy, pós-parecer jurídico).

## Teste

- `getDeficitsByTema`: retorna os déficits do tema dado; `[]` quando não há; ignora déficits de outros temas. (TDD: teste primeiro.)
- Build estático valida o schema (Zod no `astro:content`) com o novo campo populado.

## Critério de DONE

- `pnpm validate-data`, `typecheck`, `lint`, `test`, `build` verdes.
- Página `/temas/educacao` e `/temas/saude` exibem o aviso do Flávio; `/temas/economia` (Flávio tem declaração) não exibe.
- `data/schemas/criterio-selecao.schema.json` regenerado e consistente.
