# Aldeia Dorme — PRD

## Problema original
App para o jogo de dedução social "Aldeia Dorme" (versão PT de Lobisomem/Mafia).
Fluxo ÚNICO, offline, num só telemóvel: distribuir cartas em segredo (passa-passa) e
depois servir de guião interativo para o narrador até ao fim do jogo.

## Personas
- **Narrador**: gere a partida, segue o guião passo-a-passo, regista escolhas/mortes.
- **Jogadores**: recebem a carta em privado no telemóvel; não interagem com a app depois disso.

## Arquitetura
- Frontend: Expo Router (stack) + React 19 + RN 0.81. Estado do jogo em Context
  (`src/game/GameContext.tsx`) persistido localmente via `@/src/utils/storage`
  (chave `aldeia_dorme_game_v1`). **Sem backend / sem rede** — 100% offline por fiabilidade
  no passa-passa e para resistir a saídas acidentais da app.
- Lógica pura em `src/game/engine.ts` e `src/game/roles.ts` (composição, resolução da noite,
  gémeos, vitória).
- Design: tema "Glass/Luxe DARK" — preto/vermelho/dourado, ícones MaterialCommunityIcons
  (Lobo usa `paw`, pois `wolf` não existe nesta versão).

## Requisitos estáticos (não alterar)
- Bandas de composição (limite superior pertence à banda): n<=5, <=10, <=15, <=20, <=30.
- Condição de vitória dos Lobos: `nº outras personagens vivas < nº Lobos vivos`.
  Aldeia vence quando não há Lobos vivos. Verificado após cada morte.
- Gémeos: se um morre, o outro também morre.
- "ESCONDER CARTA" obrigatório antes de passar o telemóvel; impede reentrada.
- Jogo só termina/limpa por ação explícita ("Terminar Jogo" / "Novo Jogo").

## Implementado (2026-06-15)
- Setup com stepper de jogadores (3–30) + pré-visualização das personagens.
- Distribuição passa-passa: nome → carta privada → esconder carta.
- Dashboard do narrador: lista viva/morta, causa + noite da morte, toque para ver a carta,
  botão "Terminar Jogo" com confirmação.
- Guião de noite interativo adaptado às personagens presentes e vivas: Lobos, Caçador(es),
  Profeta (revela É LOBO / NÃO É LOBO), Dentista (silêncio), Protetor.
- "A Aldeia Acorda": resumo da noite + aviso de silenciado + votação/eliminação.
- Resolução: proteção, caçador mata Lobo, encadeamento de gémeos, mortes registadas.
- Ecrã de vitória com papéis revelados + Novo Jogo.
- Persistência e retoma após saída acidental da app.
- Testado end-to-end (todas as bandas, mortes, gémeos, vitória) — testing agent: PASS.

## Backlog priorizado
- P1: Histórico do jogo (log completo por noite consultável durante a partida).
- P2: Sons/ambiente e vibração temática por fase.
- P2: Personagens/variações adicionais configuráveis.
- P2: Temporizador opcional para a discussão da aldeia.

## Próximas tarefas
- Aguardar feedback do utilizador sobre regras de proteção/caçador em casos-limite.
