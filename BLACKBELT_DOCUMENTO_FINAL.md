# BLACKBELT v2 — O DOCUMENTO FINAL

> Depois deste, não existe próximo. Este é o teto.
> Seed + UX + Experiência + Inteligência + Cada Detalhe de Cada Perfil
> Tudo num só lugar. Nada falta. Nada sobra.
>
> 12 Camadas · 50 Prompts Executáveis · 30 Usuários · 3500+ Registros
> Cada tela uma experiência. Cada perfil uma jornada. Cada dado uma história.
>
> Autor: Gregory Gonçalves Silveira Pinto
> Março 2026

---

## COMO USAR ESTE DOCUMENTO

Este é UM documento que substitui os 3 anteriores:
- BLACKBELT_SEED_USABILIDADE.md (absorvido aqui)
- BLACKBELT_UX_PREMIUM.md (absorvido aqui)
- BLACKBELT_LIMITE_ABSOLUTO.md (absorvido e expandido)

Cole no Claude Code:
```
Leia o BLACKBELT_DOCUMENTO_FINAL.md nesta pasta.
Execute TODAS as 12 camadas (L01 até L50) em sequência.
Primeiro execute o seed (Camada 0). Depois as camadas 1-12.
Crie services/mocks novos conforme necessário (padrão isMock + handleServiceError).
Ao final de cada camada: pnpm build && pnpm typecheck.
Corrija erros sozinho. Não pare entre camadas.
Ao final: commit e push.
```

---

# ═══════════════════════════════════════════════════════
# CAMADA 0 — SEED: A ACADEMIA VIVA
# ═══════════════════════════════════════════════════════

O seed não é "dados de teste". É a academia que o cliente vai ver na demo.
Cada nome, cada presença, cada mensagem precisa ser crível.

---

#### L00: Seed Completo da Academia

```
Crie scripts/seed-full-academy.ts que popula uma academia
realista completa no Supabase. Use supabase.auth.admin.createUser()
para cada usuário. Service role key do .env.local.

══════════════════════════
A ACADEMIA
══════════════════════════

Nome: Academia Guerreiros do Tatame
Slug: guerreiros-tatame
Endereço: Rua dos Atletas, 250 - Centro - Matozinhos/MG
Telefone: (31) 99999-1234
Plano BlackBelt: Pro
Criada há: 14 meses (jan/2025)
Logo: usar placeholder (URL genérica)

UNIDADES:
1. Sede Principal — Rua dos Atletas, 250 - Centro
   3 espaços: Tatame Principal (80m²), Tatame 2 (40m²), Sala Musculação
   Horário: seg-sex 6h-22h, sáb 8h-14h
   Capacidade: 80 alunos

2. Filial Shopping — Av. Brasil, 1500 - Shopping Matozinhos, sala 205
   1 espaço: Tatame Único (50m²)
   Horário: seg-sex 8h-21h, sáb 9h-13h
   Capacidade: 40 alunos

MODALIDADES:
1. Jiu-Jitsu Brasileiro (adulto) — faixa mínima: branca
2. Judô — faixa mínima: branca
3. Muay Thai — faixa mínima: branca
4. MMA — faixa mínima: amarela
5. Jiu-Jitsu Kids (6-12 anos) — faixa mínima: branca

══════════════════════════
30 USUÁRIOS
══════════════════════════

Todos com senha: BlackBelt@2026
Todos com email_confirm: true

--- ADMINISTRADORES (2) ---

1. Roberto Carlos Mendes | roberto@guerreiros.com | admin
   Faixa preta 3o grau, 20 anos de JiuJitsu, fundou a academia
   Acesso total, ambas unidades

2. Camila Ferreira Santos | camila@guerreiros.com | admin
   Administradora, cuida do financeiro e operações

--- PROFESSORES (3) ---

3. André Luis da Silva | andre@guerreiros.com | professor
   Faixa preta BJJ, marrom Judô. Unidade: Sede
   Turmas: BJJ Iniciante, BJJ Avançado, MMA, Competição, Muay Thai (sub)
   Bio: "Faixa preta há 5 anos, campeão estadual 2024"

4. Fernanda Oliveira | fernanda@guerreiros.com | professor
   Faixa preta Judô. Unidade: Sede
   Turmas: Judô Adulto, Jiu-Jitsu Kids
   Bio: "Judoca desde os 8 anos, bronze no Brasileiro sub-21"

5. Thiago Nakamura | thiago@guerreiros.com | professor
   Ex-lutador Muay Thai (8 lutas, 6 vitórias). Unidade: Filial
   Turmas: BJJ Filial, Muay Thai Filial, Funcional Luta

--- ALUNOS ADULTOS (12) ---

6. João Pedro Almeida | joao@email.com | aluno_adulto
   28 anos, faixa azul, 11 meses, BJJ Avançado + MMA
   Frequência: 4x/semana, competidor, streak 12, 142 presenças

7. Marcos Vinícius Costa | marcos@email.com | aluno_adulto
   35 anos, faixa branca, 3 meses, BJJ Iniciante
   Frequência: 2x/semana irregular, streak 0 (faltou 5d), 18 presenças
   INADIMPLENTE: fatura março vencida há 5 dias (R$129)

8. Rafael Santos Lima | rafael@email.com | aluno_adulto
   31 anos, faixa roxa, 14 meses (desde fundação), BJJ Avançado + MMA
   Frequência: 5x/semana monstro, streak 23, 245 presenças
   Faixa mais alta da academia. TOP do ranking.

9. Bruno Henrique Souza | bruno@email.com | aluno_adulto
   26 anos, faixa azul, 8 meses, BJJ Avançado + Judô
   Cross-training, streak 5, 87 presenças

10. Luciana Pereira | luciana@email.com | aluno_adulto
    29 anos, branca 4 graus, 5 meses, BJJ Iniciante + Muay Thai
    Quase pronta pra faixa azul, streak 8, 52 presenças

11. Pedro Augusto Rocha | pedro@email.com | aluno_adulto
    42 anos, faixa branca, 2 meses, BJJ Iniciante
    Começou tarde mas motivado, streak 3, 14 presenças

12. Ana Carolina Dias | anacarol@email.com | aluno_adulto
    24 anos, faixa azul, 10 meses, BJJ Avançado + Muay Thai
    Competidora forte, streak 15, 128 presenças

13. Diego Martins | diego@email.com | aluno_adulto
    33 anos, branca 2 graus, 4 meses, Muay Thai + BJJ Iniciante
    Streak 6, 38 presenças

14. Isabela Fonseca | isabela@email.com | aluno_adulto
    27 anos, faixa branca, 1 mês, BJJ Iniciante
    NOVA — recém matriculou, streak 2, 6 presenças

15. Guilherme Neves | guilherme@email.com | aluno_adulto
    29 anos, faixa roxa, 13 meses, BJJ Avançado
    EM RISCO: não vem há 8 dias, frequência caiu, 156 presenças
    INADIMPLENTE: fatura março vencida há 12 dias (R$229)

16. Juliana Alves | juliana@email.com | aluno_adulto
    31 anos, faixa azul, 9 meses, Judô + BJJ Avançado
    Streak 4, 95 presenças

17. Matheus Ribeiro | matheus@email.com | aluno_adulto
    22 anos, faixa branca, 6 meses, MMA + Muay Thai
    Quer competir MMA amador, streak 10, 78 presenças

--- ALUNOS TEEN 13-17 (5) ---

18. Lucas Gabriel Mendes | lucas.teen@email.com | aluno_teen
    15 anos, faixa amarela, BJJ Iniciante + Judô
    Filho do admin Roberto. XP: 2.450 (Level 8). 7 conquistas.

19. Sophia Oliveira | sophia@email.com | aluno_teen
    16 anos, faixa laranja, BJJ Iniciante + Muay Thai
    TOP ranking teen. XP: 3.100 (Level 10). 12 conquistas.

20. Gabriel Santos | gabriel.teen@email.com | aluno_teen
    14 anos, faixa branca, Judô + BJJ Iniciante
    NOVO (2 meses). XP: 980 (Level 4). 3 conquistas.

21. Valentina Costa | valentina@email.com | aluno_teen
    17 anos, faixa amarela, Muay Thai + BJJ Iniciante
    Quase faixa laranja. XP: 2.800 (Level 9). 9 conquistas.

22. Enzo Ferreira | enzo@email.com | aluno_teen
    13 anos, faixa branca, Judô
    Só 1x/semana (precisa motivar). XP: 320 (Level 2). 1 conquista.

--- ALUNOS KIDS 6-12 (4) ---

23. Miguel Pereira | miguel.kids@email.com | aluno_kids
    10 anos, faixa branca, JiuJitsu Kids
    2x/semana, 45 estrelas, 8 figurinhas

24. Helena Costa | helena.kids@email.com | aluno_kids
    8 anos, faixa cinza, JiuJitsu Kids
    2x/semana, 78 estrelas (top da turma), 15 figurinhas

25. Arthur Nakamura | arthur.kids@email.com | aluno_kids
    7 anos, faixa branca, JiuJitsu Kids
    Filho do prof. Thiago. 3x/semana, 92 estrelas, 18 figurinhas

26. Laura Almeida | laura.kids@email.com | aluno_kids
    9 anos, faixa branca, JiuJitsu Kids + Judô
    1x/semana (mãe quer aumentar), 22 estrelas, 4 figurinhas

--- RESPONSÁVEIS (4) ---

27. Maria Clara Mendes | maria.resp@email.com | responsavel
    Mãe do Lucas Teen (18). Esposa do Roberto (admin).
    Plano família.

28. Patrícia Oliveira | patricia@email.com | responsavel
    Mãe da Sophia (19) e do Miguel (23). 2 filhos em perfis diferentes.

29. Carlos Pereira | carlos.resp@email.com | responsavel
    Pai do Gabriel (20) e da Helena (24). 2 filhos.

30. Renata Costa | renata@email.com | responsavel
    Mãe da Valentina (21) e da Laura (26). Preocupada com frequência da Laura.

══════════════════════════
11 TURMAS
══════════════════════════

SEDE PRINCIPAL:
1. BJJ Iniciante — Prof. André — Seg/Qua/Sex 19:00-20:30 — Tatame Principal — 25 vagas — 14 matriculados
2. BJJ Avançado — Prof. André — Ter/Qui 19:00-20:30 — Tatame Principal — 20 vagas — 8 matriculados
3. Judô Adulto — Prof. Fernanda — Ter/Qui 18:00-19:30 — Tatame 2 — 20 vagas — 6 matriculados
4. Muay Thai Sede — Prof. André — Seg/Qua/Sex 20:30-22:00 — Tatame Principal — 20 vagas — 7 matriculados
5. MMA — Prof. André — Sáb 10:00-12:00 — Tatame Principal — 15 vagas — 5 matriculados
6. JiuJitsu Kids — Prof. Fernanda — Ter/Qui 17:00-18:00 — Tatame 2 — 20 vagas — 4 matriculados
7. Competição BJJ — Prof. André — Sáb 08:00-10:00 — Tatame Principal — 10 vagas — 4 matriculados
8. Open Mat — Dom 09:00-11:00 — Tatame Principal — 30 vagas — livre

FILIAL SHOPPING:
9. BJJ Filial — Prof. Thiago — Seg/Qua/Sex 19:00-20:30 — 15 vagas — 6 matriculados
10. Muay Thai Filial — Prof. Thiago — Ter/Qui 19:00-20:30 — 15 vagas — 8 matriculados
11. Funcional Luta — Prof. Thiago — Sáb 09:00-10:00 — 20 vagas — 10 matriculados

══════════════════════════
MATRÍCULAS POR TURMA
══════════════════════════

BJJ Iniciante: Marcos, Pedro, Luciana, Diego, Isabela, Lucas, Sophia, Gabriel, Valentina, Enzo + 4 filial
BJJ Avançado: João, Rafael, Bruno, Ana Carol, Guilherme, Juliana + 2
Judô: Bruno, Juliana, Lucas, Gabriel, Laura + 1
Muay Thai: Luciana, Ana Carol, Diego, Sophia, Valentina, Matheus + 1
MMA: João, Rafael, Ana Carol, Matheus + 1
Kids: Miguel, Helena, Arthur, Laura
Competição: João, Rafael, Ana Carol, Sophia

══════════════════════════
3.500+ PRESENÇAS (90 DIAS)
══════════════════════════

Para CADA aluno, gerar presenças dos últimos 90 dias:
- Respeitar frequência individual descrita acima
- Variação natural (não exatamente os mesmos dias)
- 2 semanas de férias em janeiro (sem ninguém)
- Isabela só 1 mês de dados. Pedro 2 meses.
- Guilherme: normal até 8 dias atrás, depois nada
- Feriados sem aula: 1/jan, carnaval
- Método: 70% manual, 30% qr_code
- Horário do check-in: 5min antes até 15min após início da aula

══════════════════════════
60+ AVALIAÇÕES
══════════════════════════

Para alunos com 3+ meses, 1 avaliação/mês:
Critérios: técnica (0-100), disciplina, evolução, consistência

João: 72→78→82→85→88 (crescimento constante)
Rafael: 88→90→92→94→95 (excelência)
Marcos: 40→45→50→55 (devagar mas crescendo)
Luciana: 55→62→68→72→78 (rápido, quase pronta)
Guilherme: 85→88→85→82→80 (CAINDO — correlaciona com ausências)
Bruno: 68→72→75→78
Ana Carol: 75→80→83→86
Pedro: 45→52 (2 meses apenas)
Sophia: 65→70→75→78
Lucas: 60→65→70

Para cada avaliação: observação do professor (texto real, relevante).

══════════════════════════
12 PROMOÇÕES DE FAIXA
══════════════════════════

Rafael: branca→azul (mês 3), azul→roxa (mês 10)
João: branca→azul (mês 5)
Bruno: branca→azul (mês 6)
Ana Carol: branca→azul (mês 4)
Juliana: branca→azul (mês 7)
Luciana: branca 1→2→3→4 graus (meses 2,3,4,5)
Sophia: branca→amarela (mês 3), amarela→laranja (mês 8)
Lucas: branca→amarela (mês 6)
Helena: branca→cinza (mês 5)

══════════════════════════
80+ CONQUISTAS
══════════════════════════

Primeira Aula: todos
10 Aulas: todos com 2+ meses
50 Aulas: João, Rafael, Ana Carol, Guilherme, Luciana, Bruno, Juliana, Matheus, Sophia
100 Aulas: João, Rafael, Ana Carol, Guilherme
Streak 7: João, Rafael, Ana Carol, Luciana, Matheus, Sophia
Streak 14: João, Rafael, Ana Carol
Streak 30: Rafael
Promoção de faixa: cada promoção = 1 conquista
Cross-training: Bruno, Juliana, Ana Carol (2+ modalidades)
Estudioso: Rafael (15 vídeos), João (12), Ana Carol (10)
Treino no sábado: João, Rafael, Ana Carol, Sophia (competição)

══════════════════════════
15+ CONVERSAS COM MENSAGENS
══════════════════════════

Prof. André → João (3 dias):
A: "João, seu armlock na terça estava muito bom. Foca na transição mount→braço."
J: "Valeu professor! Vou assistir o vídeo que indicou. Até quinta!"

Prof. André → Marcos (5 dias):
A: "Marcos, senti sua falta essa semana. Tá tudo bem?"
M: "Oi professor, hora extra no trabalho. Semana que vem volto!"

Prof. André → Guilherme (2 dias):
A: "Guilherme, faz 8 dias que não aparece. Tá acontecendo alguma coisa?"
(Sem resposta — preocupante)

Prof. André → Luciana (1 dia):
A: "Luciana, suas avaliações estão ótimas. Mais 2 meses e faixa azul!"
L: "Que felicidade professor!! Vou continuar firme! 💪"

Prof. André → Isabela (ontem):
A: "Isabela, como está se sentindo nas primeiras semanas? Alguma dúvida?"
I: "Adorando professor! Só estou com dor no braço do armlock kkk"
A: "Normal no começo! Vai passando. Qualquer coisa me avisa."

Prof. Fernanda → Patrícia (4 dias):
F: "Patrícia, a Sophia está evoluindo muito. Quero indicar pro campeonato."
P: "Claro professora! Ela vai amar! Pode me passar detalhes?"

Prof. Fernanda → Renata (3 dias):
F: "Renata, a Laura vem só 1x/semana. Ideal seria 2x pra evoluir."
R: "Ela tem natação na terça. Vou reorganizar pra vir quinta também."

Prof. Fernanda → Carlos (1 dia):
F: "Carlos, Gabriel e Helena estão indo muito bem!"
C: "Obrigado professora! Helena já diz que quer ser faixa preta 😄"

Admin Roberto → todos (comunicado 5 dias):
"SEMINÁRIO com Prof. convidado dia 20/abril! Vagas limitadas. Inscrevam-se."

Prof. André → turma BJJ Avançado (2 dias):
"Treino de quinta: foco em guarda De La Riva. Quem tiver, traga protetor de joelho."

══════════════════════════
20+ NOTIFICAÇÕES RECENTES
══════════════════════════

Gerar dos últimos 7 dias:
- Lembretes de aula (30min antes, para cada aluno)
- Mensagens de professor
- Conquistas desbloqueadas
- Faturas vencendo
- Check-ins de filhos (para responsáveis)
- Novo vídeo disponível
- Desafio progresso
- Promoção de faixa
- Comunicado do admin (seminário)

══════════════════════════
FINANCEIRO — 6 MESES
══════════════════════════

PLANOS:
1. Básico R$129/mês — 1 modalidade, 3x/semana
2. Padrão R$179/mês — 2 modalidades, livre
3. Premium R$229/mês — todas, livre, competição
4. Família R$299/mês — 2 membros, todas
5. Kids R$99/mês — Kids, 2x/semana
6. Teen R$149/mês — 2 modalidades, livre

ASSINATURAS:
João: Premium R$229, em dia
Marcos: Básico R$129, ATRASADO 5 dias
Rafael: Premium R$229, em dia
Bruno: Padrão R$179, em dia
Luciana: Padrão R$179, em dia
Pedro: Básico R$129, em dia
Ana Carol: Premium R$229, em dia
Diego: Padrão R$179, em dia
Isabela: Básico R$129, em dia (1ª fatura)
Guilherme: Premium R$229, ATRASADO 12 dias
Juliana: Padrão R$179, em dia
Matheus: Padrão R$179, em dia
Lucas: Teen R$149, Maria paga
Sophia: Teen R$149, Patrícia paga
Gabriel: Teen R$149, Carlos paga
Valentina: Teen R$149, Renata paga
Enzo: Teen R$149, em dia
Miguel: Kids R$99, Patrícia paga
Helena: Kids R$99, Carlos paga
Arthur: Kids R$99, grátis (filho professor)
Laura: Kids R$99, Renata paga

Gerar 126 faturas (6 meses × 21 pagantes):
- 95% pagas em dia
- Marcos: março overdue
- Guilherme: março overdue
- 3 pagas com 1-3 dias de atraso
- Métodos: 60% PIX, 30% boleto, 10% cartão

MÉTRICAS:
Receita março: R$3.847
Inadimplência: R$358 (9.3%)
MRR: R$3.847
Ticket médio: R$183
Alunos ativos: 21 adultos + 5 teens + 4 kids

══════════════════════════
CONTEÚDO — 15 VÍDEOS
══════════════════════════

Série "Fundamentos BJJ" (Prof. André):
1. "Postura base e equilíbrio" 8min, branca
2. "Fuga de montada" 12min, branca
3. "Raspagem guarda fechada" 15min, branca
4. "Passagem de guarda básica" 10min, branca
5. "Armlock do mount" 8min, branca

Série "BJJ Intermediário" (Prof. André):
6. "Guarda De La Riva" 18min, azul
7. "Passagem com pressão" 14min, azul
8. "Triângulo do guard" 12min, azul
9. "Controle das costas" 16min, azul

Série "Judô para Jiu-Jiteiro" (Prof. Fernanda):
10. "O-soto-gari" 10min, branca
11. "Ippon seoi-nage" 12min, branca
12. "Footwork e pegada" 8min, branca

Avulsos:
13. "Preparação física" 20min, todas
14. "Aquecimento e alongamento" 15min, todas
15. "Estratégia de competição" 25min, azul+

PROGRESSO:
João: 12/15 (80%), completou intermediário
Rafael: 15/15 (100%)
Luciana: 5/5 fundamentos, intermediário bloqueado
Marcos: 2/15 (13%)

══════════════════════════
RANKING E XP
══════════════════════════

1. Rafael — 4.850 XP — Level 15 — "Centurião"
2. João — 3.200 XP — Level 11 — "Dedicado"
3. Ana Carol — 2.980 XP — Level 10 — "Guerreira"
4. Sophia — 3.100 XP — Level 10 — "Top Teen"
5. Luciana — 1.560 XP — Level 6 — "Em Ascensão"
6-10: Juliana, Bruno, Matheus, Lucas, Diego

DESAFIOS ATIVOS:
1. "Guerreiro de Março" — 12 presenças no mês, 200XP + badge
2. "Traga um Amigo" — permanente, 100XP + 10% off

══════════════════════════
LEADS NO CRM
══════════════════════════

1. Marina Silva — Lead — Instagram — BJJ — 2 dias atrás — status: contatada
2. Carlos Eduardo — Lead — Indicação do João — MMA — 4 dias — experimental marcada sex 19h
3. Fernanda Rodrigues — Lead — Google — Judô — 1 semana — não respondeu follow-up
4. Ricardo Alves — Lead — Passou na frente — Muay Thai — ontem — primeiro contato
5. Amanda Torres — Ex-aluna — Cancelou há 3 meses — reativação enviada
6. Júlio César — Lead — Indicação do Diego — BJJ — experimental marcada seg 19h
7. Beatriz Lima — Lead — Facebook — Kids (filho 9 anos) — experimental marcada sáb 10h
8. Paulo Mendes — Lead — LinkedIn — BJJ — descartado (mudou de cidade)

EVENTOS PRÓXIMOS:
1. Seminário Prof. Convidado — 20/abr — 40 vagas — 22 inscritos — R$80
2. Campeonato Interno BJJ — 15/mai — 60 vagas — 8 inscritos — R$50
3. Graduação Trimestral — 30/abr — todos convidados — gratuito

══════════════════════════
EXECUÇÃO DO SEED
══════════════════════════

O script deve:
1. Limpar dados existentes de teste
2. Criar academia + unidades + modalidades
3. Criar 30 users via auth.admin.createUser (email_confirm: true)
4. Criar profiles + memberships + students + guardian_links
5. Criar 11 turmas + matrículas
6. Gerar 3.500+ presenças (90 dias, frequência individual)
7. Gerar 60+ avaliações (scores crescentes)
8. Gerar 12 promoções de faixa
9. Gerar 80+ conquistas
10. Gerar 15+ conversas com mensagens
11. Gerar 20+ notificações
12. Criar 6 planos
13. Criar 21 assinaturas
14. Gerar 126 faturas (6 meses)
15. Criar 15 vídeos com metadados
16. Gerar progresso de visualização
17. Gerar XP + ranking
18. Criar 2 desafios com progresso
19. Criar 8 leads no CRM
20. Criar 3 eventos próximos
21. Printar: "✅ Seed completo: X registros criados"

Execute: npx tsx scripts/seed-full-academy.ts
```

---

# ═══════════════════════════════════════════════════════
# CAMADA 1 — PRIMEIRO CONTATO (60 segundos que decidem tudo)
# ═══════════════════════════════════════════════════════

---

#### L01: Loading Premium

```
Crie loading screen premium para app/loading.tsx:
- Logo BlackBelt com fade in + scale 0.95→1.0 (CSS only)
- Fundo: gradiente #0A0A0A→#1A1A1A
- Barra de progresso vermelha fina no bottom
- Mensagem por perfil: "Preparando seu tatame..." (admin), "Carregando sua jornada..." (aluno)
- Duração: 1.5s mínimo, transição crossfade para conteúdo
- Skeleton DEPOIS do loading (nunca junto)
```

---

#### L02: Login com Glassmorphism

```
Reescreva app/(auth)/login/page.tsx:
- Fullscreen, sem scroll
- Background: preto com textura CSS de tatame
- Card central: glassmorphism (backdrop-filter: blur(20px))
- Logo grande, tagline "O sistema operacional da sua academia" (fade in delay 0.5s)
- Inputs dark theme, focus ring vermelho, ícones
- Botão "Entrar": full-width vermelho, hover escurece, loading state
- "Esqueci senha" | "Criar conta"
- Erro: shake animation no card + mensagem clara
- Sucesso: scale down + fade → dashboard
- Multi-perfil: após login, se 2+ perfis, mostra seletor com cards animados
- Autofocus email, submit com Enter, validação real-time
- Mobile: 95% largura. Desktop: max-width 420px.
```

---

#### L03: Primeiros 30 Segundos no Dashboard

```
Regra para TODOS os dashboards:
1. Header pessoal: INSTANTÂNEO (dados do token, 0ms)
2. Seção principal: fetch prioritário (< 500ms)
3. Seções secundárias: fetch paralelo com skeleton (< 1000ms)
4. Seções lazy: Intersection Observer (quando scrolla)
5. Cada seção independente: fade in + translateY(8px→0) staggered
6. NUNCA: tela inteira de loading. NUNCA: "Sem dados" antes de tentar.
```

---

# ═══════════════════════════════════════════════════════
# CAMADA 2 — RITMO DIÁRIO (O app vira hábito em 7 dias)
# ═══════════════════════════════════════════════════════

---

#### L04: Status do Dia (Componente Universal)

```
Crie components/shared/StatusDoDia.tsx — adapta por perfil.
Aparece no TOPO de todo dashboard. Sem fetch (usa dados já carregados).
Muda conforme hora do dia e dados do usuário.

ADMIN: "🟢 Academia saudável (92/100) · 4 aulas hoje · 42 esperados · ⚠️ 1 risco"
PROFESSOR: "🥋 Hoje: 3 aulas · 35 alunos · Primeira às 19h · 💬 2 não lidas"
ALUNO: "🥋 BJJ Iniciante às 19h (em 6h) · 🔥 12 dias · 📺 Novo vídeo"
TEEN: "🎮 Level 8 · #3 ranking · 🏆 8/12 desafio · 🔥 4 dias"
KIDS: "⭐ 78 estrelas! · 🥋 Aula quinta 17h · 🎁 22 p/ próximo prêmio"
RESPONSÁVEL: "👨‍👧‍👦 Sophia aula 19h ✅ · Miguel sem aula · 💬 1 msg professora"
```

---

#### L05: Ações Rápidas

```
Crie components/shared/QuickActions.tsx — grid de 3-4 botões por perfil.
Ícone grande + label curta. Mobile: scroll horizontal. Touch: haptic feedback.
Badge vermelho se urgência (ex: "3" em Mensagens).

ADMIN: [📊 Riscos] [💰 Cobranças] [📱 Leads] [📢 Comunicado]
PROFESSOR: [🥋 Aula] [📝 Avaliar] [💬 Mensagens] [📊 Turma]
ALUNO: [✅ Check-in] [📺 Vídeo] [🏆 Ranking] [📅 Agenda]
TEEN: [✅ Check-in] [🏆 Desafio] [🎮 Ranking] [📺 Vídeos]
KIDS: [⭐ Estrelas] [🥋 Aula] [🎁 Figurinhas]
RESPONSÁVEL: [👀 Presenças] [💬 Mensagens] [💰 Pagamentos] [📅 Agenda]
```

---

#### L06: Resumo do Dia (Noite)

```
Crie components/shared/DayRecap.tsx — aparece se hora > 20h.
Card no topo do dashboard, dismissável. Não reaparece até amanhã.

ADMIN: "Hoje: 38 check-ins, R$507 recebidos, Guilherme 9 dias sem vir."
PROFESSOR: "2 aulas: BJJ 12/14 (86%), Muay Thai 6/7 (86%). 18 presenças."
ALUNO: "✅ Presente no BJJ! 🔥 Streak 13. 68% para faixa roxa."
TEEN: "+10 XP. Streak 5. Desafio 9/12. Subiu p/ #3! 🎉"
RESPONSÁVEL: "Sophia treinou ✅. Miguel sem aula. Amanhã: Sophia 19h, Miguel 17h."
```

---

# ═══════════════════════════════════════════════════════
# CAMADA 3 — ADMIN: COMMAND CENTER
# ═══════════════════════════════════════════════════════

---

#### L07: Dashboard Admin — Command Center

```
Reescreva COMPLETAMENTE app/(admin)/admin/page.tsx:

SEÇÃO 1 — Saudação contextual:
"Bom dia, Roberto. Sua academia está 92% saudável hoje."
Dinâmico: se problemas, tom de ação. Se OK, positivo.

SEÇÃO 2 — KPIs vivos (4 cards):
"25 ativos" ↑2 vs fev | "R$3.847" ↑8% sparkline | "78% presença" ↓3% | "9.3% inadimplência" ⚠️
Cada KPI: valor + comparativo + tendência + click → detalhe.

SEÇÃO 3 — CENTRAL DE ATENÇÃO (vermelho/âmbar):
"PRECISA DE AÇÃO AGORA"
🔴 Guilherme Neves — 8 dias sem aparecer [Mensagem] [Perfil] [Ligar]
🟡 Marcos — fatura vencida 5d R$129 [Cobrar] [WhatsApp]
🟡 Enzo — 1x/semana [Falar c/ responsável]
Se 0 alertas: "✅ Tudo em ordem hoje!"

SEÇÃO 4 — Hoje na Academia (timeline):
"17h Kids · 18h Judô · 19h BJJ Ini ← PRÓXIMA · 20:30 MT"

SEÇÃO 5 — Feed de Atividade:
"🟢 Ana Carol check-in 15min atrás"
"🎓 Luciana 52 aulas"
"💳 João PIX confirmado"
"⚠️ Guilherme 8º dia"

SEÇÃO 6 — Presença por Modalidade (bar chart horizontal)
SEÇÃO 7 — Receita 6 meses (bar chart + previsão abril)
```

---

#### L08: Health Score e Central de Retenção

```
Crie lib/api/health-score.service.ts + app/(admin)/admin/retencao/page.tsx

HEALTH SCORE (0-100):
= (frequência × 0.30) + (financeiro × 0.25) + (evolução × 0.20) + (engajamento × 0.15) + (social × 0.10)

Frequência: % presenças vs esperado (últimos 30d)
Financeiro: em dia=100, 1-5d atraso=60, 5-10d=30, 10+=0
Evolução: avaliação recente=+20, promoção=+30, estagnado=-20
Engajamento: vídeo=+10, resposta msg=+10, conquista=+15, desafio=+10
Social: indicação=+20, evento=+15, comunidade ativa=+10

TELA DE RETENÇÃO:
Gauge grande: saúde geral da academia (média)
Tabela: aluno | faixa | score | risco | freq | financeiro | último check-in | [Agir]

Click [Agir] abre modal:
- Perfil resumido + health score detalhado por componente
- Histórico: "Frequência caiu de 3x pra 1x em 2 semanas"
- Insight: "Se perder Guilherme: -R$229/mês, MRR cai 6%"
- Sugestão: "Contato pessoal do professor recupera 73%"
- Ações: Mensagem | Ligar | Desconto | Registrar tentativa
- Histórico de tentativas
```

---

#### L09: CRM — Pipeline Comercial

```
Crie lib/api/leads.service.ts + app/(admin)/admin/comercial/page.tsx

PIPELINE KANBAN (drag-drop):
Lead → Contatado → Experimental Marcada → Compareceu → Matriculou

Cards: "Marina Silva — BJJ — Instagram — 2 dias"
Arrastar entre colunas.

FORMULÁRIO DE LEAD: nome, tel, email, modalidade, origem
[Instagram, Facebook, Indicação, Google, Passou na frente, Outro]
Se indicação: quem indicou (dropdown alunos)

EXPERIMENTAL: agendar turma + data, lembrete 24h + 1h antes (auto)
PÓS-EXPERIMENTAL: "Compareceu?" [Sim → Converter] [Não → Motivo → Reagendar]
CONVERSÃO: pré-preenche cadastro com dados do lead

MÉTRICAS: leads mês, experimentais, compareceram, matricularam, por origem
REATIVAÇÃO: lista de ex-alunos (cancelaram últimos 6 meses) + campanha auto

Seed: 8 leads em diferentes estágios.
```

---

#### L10: Financeiro Premium

```
Reescreva app/(admin)/admin/financeiro/page.tsx:

NÚMERO ENORME: "RECEITA MARÇO — R$3.847 — ↑8% vs fev — 93% da meta"
4 KPIs: MRR | Ticket médio | Inadimplência % | Previsão abril

QUEM ESTÁ DEVENDO (vermelho se > 0):
| Guilherme | Premium R$229 | 12 dias | [Cobrar] [WhatsApp] |
| Marcos | Básico R$129 | 5 dias | [Cobrar] [WhatsApp] |

GRÁFICO: receita 6 meses (bar) + meta (linha tracejada)
PAGAMENTOS RECENTES: tabela com aluno, plano, valor, método, hora
ANÁLISE POR PLANO: tabela com alunos, receita, % de cada plano

PROJEÇÃO:
"Se nada mudar: abril R$4.100 (+6.5%)"
"Se Guilherme cancelar: -R$229/mês → MRR R$3.618"
"Se converter 2 leads: +~R$308/mês"
```

---

#### L11: Relatórios PDF Automáticos

```
Crie 5 relatórios que geram PDF bonito (jsPDF):

1. RELATÓRIO MENSAL EXECUTIVO:
   Capa + KPIs + gráficos + destaques + riscos + projeção
2. PRESENÇA POR TURMA:
   Tabela aluno × dias, totais, destaques abaixo 50%
3. FINANCEIRO DETALHADO:
   Faturas, totais por plano/método, recebimento ao longo do mês
4. EVOLUÇÃO DOS ALUNOS:
   Promoções, avaliações, top 5 evoluções, estagnados
5. RELATÓRIO PARA RESPONSÁVEIS (auto mensal):
   Presenças, evolução, observações professor, por filho

Botão "Gerar Relatório" em cada seção. Admin pode agendar envio mensal.
```

---

# ═══════════════════════════════════════════════════════
# CAMADA 4 — PROFESSOR AMPLIFICADO
# ═══════════════════════════════════════════════════════

---

#### L12: Dashboard Professor

```
Reescreva app/(professor)/professor/page.tsx:

HEADER CONTEXTUAL:
Se aula em 30min: "BJJ Iniciante em 28min. 14 esperados."
Se aula agora: 🔴 "Aula em andamento" + [Abrir Chamada]
Se sem aula: "Sem aulas hoje. Revise o progresso dos alunos."

SEÇÃO 1 — Alunos que Precisam de Atenção:
- Guilherme 8d sem vir [Mensagem]
- Marcos frequência caindo [Perfil]
- Enzo 1x/semana [Falar responsável]

SEÇÃO 2 — Próximas Aulas (hoje + amanhã) com observações
SEÇÃO 3 — Prontos para Avaliação: "Luciana 52 aulas, score 78" [Avaliar]
SEÇÃO 4 — Mensagens Não Lidas
SEÇÃO 5 — Minhas Turmas resumo
```

---

#### L13: Modo Aula — A Tela Perfeita

```
Reescreva app/(professor)/turma-ativa/page.tsx:
FULLSCREEN, fundo escuro, elementos GRANDES, zero distração.

HEADER: "BJJ Iniciante — Seg 19h — Timer 00:23:45" [QR] [Encerrar]

LISTA (touch-friendly, card por aluno):
┌──────────────────────────────────────────────────┐
│ João Pedro Almeida         🟢 Presente (QR)      │
│ Azul · Streak 12 · Nota 88                       │
│ 📝 "Foco na transição mount→braço"              │
└──────────────────────────────────────────────────┘
Toggle: toque no card inteiro = toggle presença.
QR check-in: aparece automaticamente como "🟢 Presente (QR)".
📝 = observação privada do professor sobre o aluno.

QR (modal fullscreen): QR enorme + timer "Expira em 4:32"
Alunos aparecem em tempo real ao escanear.

OBSERVAÇÕES DA AULA (colapsável): textarea auto-save.

ENCERRAR: "12/14 presentes (86%) — Ausentes: Marcos, Diego"
[Confirmar] → toast + volta dashboard
Automático pós-aula: notificar ausentes, atualizar streaks.
```

---

#### L14: Avaliação Premium do Aluno

```
Crie app/(professor)/avaliar/[studentId]/page.tsx:
Header: foto, nome, faixa, aulas, última avaliação.

SLIDERS VISUAIS (0-100):
Técnica: [======|====] 78 — "Execução, precisão, timing"
Disciplina: [========|==] 82 — "Respeito, pontualidade"
Evolução: [=====|=====] 72 — "Melhora vs anterior"
Consistência: [=========|=] 90 — "Frequência, dedicação"

RADAR: comparativo anterior (cinza) vs agora (vermelho)
OBSERVAÇÕES: textarea com sugestão de texto
RECOMENDAÇÕES: "Sugerir vídeos de passagem (ponto mais baixo)"

[Salvar] → push pro aluno "Nova avaliação: 80.5 📊"
[Promover Faixa] → aparece se atende requisitos → fluxo especial (L18)
```

---

#### L15: Plano de Aula e Observações

```
Crie sistema de notas do professor:

OBSERVAÇÕES POR ALUNO (privadas):
"João: precisa trabalhar base da guarda."
Persistem entre aulas. Aparecem no modo aula ao lado do nome.

PLANO DE AULA:
"BJJ Iniciante — Seg 15/mar"
Tema: Fuga de montada
Aquecimento: mobilidade quadril (5min)
Técnica 1: upa (10min)
Técnica 2: elbow-knee (10min)
Drilling: 3 rounds 3min
Sparring: 3 rounds 5min

Templates reutilizáveis. Histórico. Sugestão por nível da turma.
```

---

# ═══════════════════════════════════════════════════════
# CAMADA 5 — JORNADA DO GUERREIRO (Aluno Adulto)
# ═══════════════════════════════════════════════════════

---

#### L16: Dashboard Aluno

```
Reescreva app/(main)/dashboard/page.tsx:

HEADER EMOCIONAL:
"Fala, João! 🔥 12 dias. Top 5 da academia."
Dinâmico por perfil e dados.

CARD HERO — Próxima Aula:
"BJJ Avançado · Ter 19h · Prof. André · Em 3h 42min" [Check-in →]
Se aula agora: botão pulsante. Se sem aula: "Descanse! Amanhã: BJJ 19h"

CARD — Progresso de Faixa:
Barra: Azul ────●──── Roxa (68%)
Requisitos: Presenças 142/180 ✅ · Avaliação 88/100 ✅ · Tempo 6m ✅
"Mantenha o ritmo! ~2 meses."

CARD — Frequência: heatmap mini + "Março: 10/12 (83%) ↑5%"
Streak: "🔥 12 dias · Recorde: 18"

CONQUISTAS (scroll horizontal): badges recentes + "Próxima: Streak 30 (faltam 18d)"
CONTINUAR ASSISTINDO: "Guarda De La Riva 12:34/18:00 [Continuar]"
MINHA SEMANA: agenda seg-sáb com status por dia

FAB de check-in: sempre visível se aula agora. Pull-to-refresh.
```

---

#### L17: Perfil do Aluno — A Página Mais Bonita

```
Crie perfil completo reutilizável por admin, professor e aluno:

HEADER HERO: gradiente cor da faixa + foto grande + nome + stats
"142 aulas · 11 meses · Streak 12 🔥 · Top #2"
Health Score badge (só admin/prof).

TABS:
[Jornada] — Timeline vertical com cada marco (matrícula, conquistas, promoções, avaliações)
  Cada promoção: borda cor da faixa, texto emocional, dados quantitativos
[Evolução] — Radar técnica + gráfico de linha score ao longo do tempo
[Presenças] — Heatmap GitHub-style 365 dias + stats + distribuição por modalidade
[Avaliações] — Histórico + observações professor
[Conteúdo] — Vídeos assistidos, trilhas, progresso
[Financeiro] — Plano, faturas, total pago (admin/próprio)
```

---

#### L18: Promoção de Faixa — Cerimônia Digital

```
QUANDO PROFESSOR CLICA "PROMOVER":
Step 1: tela dedicada (foto, faixa atual → nova, stats, mensagem do professor)
Step 2: animação (tela escurece, faixa dissolve, nova surge com glow dourado, confetti)
Step 3: automático (push aluno, push responsável, email certificado PDF, post feed, conquista, +100XP)

QUANDO ALUNO ABRE DEPOIS:
Banner dourado 7 dias: "🎉 Faixa Azul! Ver jornada →"
Header com glow. Conquista nova.
```

---

#### L19: Conquistas Significativas

```
Categorias com raridade:
JORNADA (azul): Primeira Aula, 10, 50, 100, 365 aulas
CONSTÂNCIA (laranja): Streak 7, 14, 30, 90, 365
FAIXA (cor da faixa): cada promoção
SOCIAL (verde): Embaixador (1 indicação), Ouro (5), Mentor
COMPETIÇÃO (dourado): Primeiro Campeonato, Medalha, Campeão
CONTEÚDO (roxo): Estudioso (10 vídeos), Trilha Completa, Maratonista

Raridade: Comum > Raro > Épico > Lendário (glow dourado + partículas CSS)
Conquistado: cor + brilho + data. Não conquistado: silhueta + progress bar.
Tela: grid, filtro por categoria, header "X/Y (Z%)" + mais rara.
```

---

#### L20: Streaming Premium — Netflix da Academia

```
Reescreva app/(main)/conteudo/page.tsx:
Fundo escuro, thumbnails vibrantes, hover effects.

SEÇÕES:
1. Continuar Assistindo (barra progresso + [▶ Continuar])
2. Recomendado Para Você (baseado em faixa + avaliações)
3. Trilhas Oficiais (progress bar, 🔒 se faixa insuficiente)
4. Por Modalidade (tabs: BJJ | Judô | MT | MMA | Prep. Física)
5. Por Professor
6. Treinos em Casa (novo: exercícios para fora da academia)

Bloqueado: overlay escuro + cadeado + "Disponível a partir da faixa azul"
Player: controles, velocidade 0.5x-2x, fullscreen, próximo na trilha
Quiz pós-vídeo (3 perguntas): acertou = +10XP. Errou = "Reveja minuto 3:42."
Trilha completa = certificado PDF + badge "Trilha Completa"
```

---

#### L21: Metas Pessoais e Diário

```
Aluno define metas visíveis no dashboard:
"Faixa Roxa até dez/2026" → 68% requisitos
"4x/semana" → esta semana 3/4
"Trilha Intermediário" → 2/4 vídeos

Professor pode ver e aconselhar.

DIÁRIO DE TREINO (opcional, pós-aula):
"Como foi?" [😊 Ótimo] [😐 Ok] [😓 Difícil]
Tags: guarda, passagem, raspagem, finalização
Nota pessoal (texto livre)
Professor pode ver se aluno permitir.
30min após aula: push perguntando (1 toque).
Se 60%+ turma diz "Ótimo": post automático no feed.
```

---

# ═══════════════════════════════════════════════════════
# CAMADA 6 — TEEN & KIDS
# ═══════════════════════════════════════════════════════

---

#### L22: Teen Gamificado

```
Reescreva app/(teen)/teen/page.tsx:
NÃO É dashboard de adulto com cores. É experiência pra 15 anos.

XP BAR grande + level + avatar com borda rank:
"Lucas · Level 8 · 2.450 XP" [════════|════] 2.450/3.000

DESAFIO ATIVO: "GUERREIRO MARÇO — 8/12 · Faltam 4 em 16 dias! 💪"
RANKING: "#3 · Sophia 3.100 · Valentina 2.800 · VOCÊ 2.450"
CONQUISTAS: badges com glow. Próxima: "Streak 14 (faltam 2!)"
STREAK: chama animada 🔥 se > 3.

Cores vibrantes. Animações de XP subindo.
Identidade: avatar com moldura rank, título visível, bio curta.
Perfil visível para outros teens (rede interna, não social aberta).
```

---

#### L23: Kids Lúdico

```
Reescreva app/(kids)/kids/page.tsx:
PARA 7-12 ANOS. Interface COMPLETAMENTE diferente.

Fundo claro, ilustrações, ícones ENORMES, texto CURTO (max 15 palavras).
Avatar mascote + nome + faixa visual (fita colorida, não texto).

"Helena · Faixa Cinza ⭐ 78 estrelas"
Próxima Aula: ilustração tatame + "Jiu-Jitsu Kids · Quinta 17h · 2 dias!"
Estrelas: 78 ⭐ (brilho animado) + "5 novas esta semana!"
Figurinhas: álbum digital, 15/30 coletadas, temas marciais
Faixa: visual desenhado, próxima em cinza claro

Sistema de troca:
50 estrelas = figurinha especial
100 = título "Super Lutador"
200 = medalha física (professor entrega)

NENHUM número negativo. Tudo positivo. Tudo motivacional.
```

---

# ═══════════════════════════════════════════════════════
# CAMADA 7 — FAMÍLIA CONECTADA
# ═══════════════════════════════════════════════════════

---

#### L24: Dashboard Responsável

```
Reescreva app/(parent)/parent/page.tsx:

SELETOR (se 2+ filhos): Tabs [Sophia (16)] [Miguel (10)]

POR DEPENDENTE:
Card resumo: foto, nome, idade, faixa, frequência mês, pagamento, health score
Presenças da semana: Seg ✅ | Ter — | Qua ✅ | Qui ✅ | Sex ⏳
Evolução: últimos 3 marcos da jornada + [Ver completa →]
Mensagens: preview conversa com professor + [Responder]
Pagamento: "Teen R$149 · Em dia ✅" + [Faturas] [Trocar plano]

CONSOLIDADO (2+ filhos):
"Total: R$248/mês (Sophia R$149 + Miguel R$99)"
Agenda: todas as aulas de todos os filhos num calendário semanal.

NOTIFICAÇÕES: "Sophia check-in 19:05 ✅" | "Prof. Fernanda msg sobre Sophia"
```

---

#### L25: Agenda Familiar + Relatório Mensal

```
AGENDA: calendário semanal com aulas de TODOS os filhos.
Seg: Sophia BJJ 19h | Ter: Miguel Kids 17h | ...
Exportar para Google Calendar (futuro).

RELATÓRIO MENSAL AUTOMÁTICO (email + in-app, dia 1):
"Família Oliveira — Março 2026"
Sophia: 12 presenças, avaliação 78, conquista "50 Aulas"
Miguel: 8 presenças, 78 estrelas (+15), "adorando as aulas"
Pagamentos: R$248 em dia ✅
PDF anexo. Compartilhável via WhatsApp.

AUTORIZAÇÃO DE EVENTOS:
"Prof. Fernanda indicou Sophia para campeonato."
[✅ Autorizar] [❌ Não autorizar] [❓ Mais informações]
```

---

# ═══════════════════════════════════════════════════════
# CAMADA 8 — COMUNIDADE E PERTENCIMENTO
# ═══════════════════════════════════════════════════════

---

#### L26: Mural da Academia

```
Crie app/(main)/comunidade/page.tsx — feed moderado.

POSTS AUTOMÁTICOS (sistema):
🥋 "João promovido para Faixa Azul! 🎉" — 15 curtidas, 4 comentários
🏆 "Sophia completou Guerreiro de Março!" — 8 curtidas
📊 "500 check-ins este mês! 💪" — 22 curtidas

POSTS MANUAIS (professor/admin):
📝 "Excelente treino hoje! Amanhã: raspagem." — [foto]
📢 "Seminário 20/abr! Vagas limitadas." — [Inscrever-se]

DESTAQUES (sidebar ou card fixo):
⭐ Aluno da semana: Rafael (streak 23)
🔥 Turma destaque: BJJ Avançado (92%)
🎂 Aniversariantes: Marcos (hoje!), Luciana (sexta)

Quem posta: admin/professor + sistema. Alunos comentam e curtem (não postam).
Moderação: admin deleta, aluno denuncia.
```

---

#### L27: Hub de Eventos

```
Crie hub de eventos integrado.

TIPOS: 🥋 Graduação | 🏆 Campeonato | 📚 Seminário | 🥊 Workshop | 🎉 Social | 🥋 Open Mat

CARD:
"🏆 CAMPEONATO INTERNO BJJ — Sáb 15/abr · 09-17h · 42/60 inscritos · R$50"
[Inscrever-se]

Admin: lista inscritos, check-in dia, financeiro evento, chaveamento, resultados, fotos
Aluno: ver eventos, inscrever, ver inscrições
Responsável: autorizar participação dos filhos
Professor: indicar aluno para evento

Integrar no calendário de todos os perfis.
Seed: 3 eventos próximos (seminário, campeonato, graduação).
```

---

# ═══════════════════════════════════════════════════════
# CAMADA 9 — INTELIGÊNCIA INVISÍVEL
# ═══════════════════════════════════════════════════════

---

#### L28: Contexto Temporal

```
Crie lib/utils/temporal-context.ts
O app muda conforme hora/dia/mês:

MANHÃ: "Bom dia" + agenda do dia
TARDE: "Boa tarde" + próxima aula
NOITE: "Boa noite" + aula agora ou resumo
NOITE TARDIA: "Descanse" + amanhã

SEGUNDA: "Nova semana!" + aulas da semana
SEXTA: "Última aula da semana!" + resumo
DIA 1: relatório mensal + "Novo mês, novos desafios!"

Integrar no StatusDoDia e saudação do header.
```

---

#### L29: Sugestões Proativas

```
Crie lib/api/suggestions.service.ts — max 3 por sessão, dismissável 7 dias.

ALUNO:
- Se frequência caiu: "Treinou 2x esta semana (normal 4x). Vem amanhã?"
- Se avaliação fraca: "Recomendado: Passagem com pressão (10min)"
- Se perto de streak recorde: "2 dias para bater seu recorde! 🔥"
- Se perto de conquista: "3 aulas para '50 Aulas'!"
- Se 1 modalidade: "Experimenta Judô? Fortalece jogo por cima."

ADMIN:
- Se turma lotada: "BJJ Ini 90% lotado. Abrir nova turma?"
- Se horário ocioso: "Terça 18h só 3 alunos. Mover horário?"
- Se lead parado: "3 leads sem follow-up 48h. Conversão cai 40%."

PROFESSOR:
- Se apto avaliação: "Luciana atingiu requisitos. Avaliar?"
- Se sumiu: "Guilherme 8d. Mensagem pessoal recupera 73%."
```

---

#### L30: Busca Global (Command Palette)

```
Crie components/shared/CommandPalette.tsx — Cmd+K desktop, ícone busca mobile.

Busca em: alunos, turmas, vídeos, leads, faturas, eventos.
Resultados agrupados por tipo. Debounce 300ms.
"/" mostra comandos: /nova-turma, /novo-aluno, /cobrar, /comunicado...
Keyboard: ↑↓ + Enter. ESC fecha.
```

---

#### L31: Notificações Inteligentes

```
Crie components/shell/NotificationCenter.tsx

PRIORIDADE:
🔴 URGENTE (push): aluno risco crítico, pagamento 5d+, aula cancelada
🟡 IMPORTANTE (push, pode esperar): msg professor, avaliação, fatura vencendo
🟢 INFO (in-app): conquista, vídeo, ranking
⚪ SILENCIOSO (histórico): update sistema

Sino header com badge (urgente + importante). Panel deslizante.
Agrupamento: "Sophia, Miguel e Laura treinaram hoje ✅"
Max 3 push/dia. Silêncio 22h-7h.
```

---

# ═══════════════════════════════════════════════════════
# CAMADA 10 — MENSAGENS COM PROPÓSITO
# ═══════════════════════════════════════════════════════

---

#### L32: Mensagens com Contexto

```
Quando professor abre conversa, vê CONTEXTO ao lado:
Última presença, streak, health score, avaliação, plano.

MENSAGENS SUGERIDAS (para aluno em risco):
"Guilherme, sentimos sua falta! O tatame não é o mesmo sem você."
[Usar] [Personalizar]

AUTOMAÇÕES (configuráveis pelo admin, ON/OFF):
- Boas-vindas (1d após matrícula)
- Parabéns 10 aulas
- "Sentimos sua falta" (3d sem vir se freq > 3x)
- Aniversário aluno
- Aniversário matrícula ("1 ano! 🎉")
- Pré-aula: "BJJ hoje 19h. Te esperamos!"
- Pós-conquista: "Streak 7! 🔥"

Canal: [In-App] [WhatsApp] [Email]
Read receipts: discreto para professor. Invisível para aluno.
```

---

# ═══════════════════════════════════════════════════════
# CAMADA 11 — MICRO-INTERAÇÕES PREMIUM
# ═══════════════════════════════════════════════════════

---

#### L33: Celebrações e Polish

```
CHECK-IN: confetti leve + toast "Check-in! 🎉" + vibração mobile
CONQUISTA: modal celebração, badge com glow + bounce + push
PROMOÇÃO: animação especial (faixa dissolve → nova com glow dourado)
STREAK > 7: chama 🔥 com partículas CSS
STREAK RECORDE: "NOVO RECORDE! 🏆"

LOADING: skeleton com shimmer (formato do conteúdo real)
EMPTY STATES: ilustração + msg contextual + CTA (nunca "Sem dados")
TRANSIÇÕES: fade in + translateY. Tabs: slide direction. Modais: fade + slide up.
RESPONSIVIDADE: mobile single-col, 44px touch min. Tablet 2-col. Desktop sidebar.
```

---

#### L34: Dark Mode Premium

```
NÃO é "cores invertidas". Design system pensado para dark:
- Cada componente tem variante dark testada
- Toggle no perfil + automático por horário (19h escurece)
- CSS variables para theme switching instantâneo
- Cores: #0A0A0A fundo, #1A1A1A cards, #E5E5E5 texto, vermelho BlackBelt
- Contrastes WCAG AA em ambos os modos
```

---

# ═══════════════════════════════════════════════════════
# CAMADA 12 — O IMPOSSÍVEL (O que ninguém espera)
# ═══════════════════════════════════════════════════════

---

#### L35: Os 15 Detalhes que Ninguém Tem

```
1. RESUMO POR VOZ
   Admin pode ouvir: "Bom dia Roberto. Ontem 38 check-ins, R$507 recebidos..."
   Web Speech Synthesis. Botão ▶️ no dashboard.

2. COMPARATIVO PERÍODOS
   Todo KPI: valor + tendência + comparativo mês anterior + mesmo mês ano passado.

3. PREVISÃO DE IMPACTO DO CHURN
   "Se Guilherme cancelar: -R$229/mês, MRR cai 6%."

4. ANIVERSÁRIO DE MATRÍCULA
   Push auto + post feed + conquista "1 Ano de Tatame".

5. TEMPO NO TATAME
   "Tempo total estimado: 213 horas (8.9 dias inteiros no tatame)"
   No perfil do aluno. Impressionante quando alto.

6. RECORD BOARD — HALL DA FAMA
   🏆 Maior streak: Rafael 47 dias
   🏆 Mais aulas/mês: Rafael 22
   🏆 Promoção mais rápida: Ana Carol (4 meses)
   Quem quebra recorde: notificação + post feed.

7. CERTIFICADO DE FAIXA
   PDF bonito a cada promoção. QR verificação pública.

8. CERTIFICADO DE TRILHA
   PDF por trilha de vídeo completa. Compartilhável LinkedIn/Instagram.

9. GRATIDÃO PÓS-AULA
   30min após: "Como foi?" [😊] [😐] [😓]. 1 toque. Professor vê.

10. LANDING PAGE DA ACADEMIA
    guerreiros-tatame.blackbelt.app — gerada dos dados.
    Hero, modalidades, professores, planos, depoimentos, experimental.
    "Agendar Aula Experimental" → form de lead.

11. INDICAÇÃO PREMIADA
    Link pessoal: guerreiros.blackbelt.app/ref/joao123
    Amigo matricula → XP + desconto. Admin vê conversões.

12. REATIVAÇÃO DE EX-ALUNOS
    Lista de cancelamentos 6 meses. Campanha: "Volte com 50% off."

13. CLIMA + SUGESTÃO
    Se chovendo: "Presença cai 15% em dias assim. Enviar lembrete?"
    wttr.in API (grátis).

14. MODO OFFLINE (professor)
    Chamada funciona offline. Sincroniza quando voltar online.
    Cache dos alunos da turma. Service Worker.

15. EXPORTAR PARA GOOGLE CALENDAR
    Aluno/responsável exporta agenda de aulas para Calendar.
    Link .ics gerado por turma.
```

---

#### L36-L40: Campanhas Inteligentes + NPS + Wizard

```
L36 — MOTOR DE CAMPANHAS:
Admin cria campanhas com templates:
"Volte a treinar" (para sumidos)
"Traga um amigo" (para ativos, com link)
"Upgrade Premium" (para básico com alta frequência)
"Família" (para responsáveis com 1 filho, oferecer plano família)
"Competição" (para competidores, evento próximo)
Disparo: manual ou automático por trigger (ex: 5d sem vir → envia).
Track: quantos receberam, abriram, agiram, converteram.

L37 — NPS DA ACADEMIA:
A cada 30 dias, push para alunos ativos:
"De 0 a 10, quanto recomendaria a Guerreiros para um amigo?"
+ "O que podemos melhorar?" (texto opcional)
Admin vê: NPS score, distribuição, feedbacks.
Track ao longo do tempo.

L38 — WIZARD DE IMPLANTAÇÃO:
Quando admin cria conta:
Step 1: nome, logo, cores da academia
Step 2: unidades
Step 3: modalidades
Step 4: professores (email convite)
Step 5: planos e preços
Step 6: turmas e horários
Step 7: importar alunos (CSV ou manual)
Step 8: ativar biblioteca
Step 9: configurar automações
Step 10: "Tudo pronto! Sua academia está no ar."
Persist step. Skip possível. Progress bar.

L39 — IMPORTAÇÃO EM MASSA:
Upload CSV de alunos: nome, email, telefone, modalidade, faixa.
Preview antes de importar. Detecta duplicatas. Relatório pós-import.

L40 — SUBSTITUIÇÃO DE PROFESSOR:
Se professor não pode dar aula:
Admin marca substituto. Alunos recebem: "Aula de hoje com Prof. Fernanda."
Histórico de substituições. Impacto na presença.
```

---

# ═══════════════════════════════════════════════════════
# EXECUÇÃO
# ═══════════════════════════════════════════════════════

```
Cole no Claude Code:

"Leia o BLACKBELT_DOCUMENTO_FINAL.md nesta pasta.
Este é O ÚNICO documento. Substitui todos os anteriores.

Execute em sequência:
1. SEED (L00): crie e execute scripts/seed-full-academy.ts
2. CAMADA 1 (L01-L03): loading, login, padrão de dashboard
3. CAMADA 2 (L04-L06): status do dia, ações rápidas, resumo noite
4. CAMADA 3 (L07-L11): admin command center, retenção, CRM, financeiro, relatórios
5. CAMADA 4 (L12-L15): professor dashboard, modo aula, avaliação, plano de aula
6. CAMADA 5 (L16-L21): aluno dashboard, perfil, promoção, conquistas, streaming, metas
7. CAMADA 6 (L22-L23): teen gamificado, kids lúdico
8. CAMADA 7 (L24-L25): responsável dashboard, agenda, relatório
9. CAMADA 8 (L26-L27): mural comunidade, eventos
10. CAMADA 9 (L28-L31): contexto temporal, sugestões, busca, notificações
11. CAMADA 10 (L32): mensagens com contexto
12. CAMADA 11 (L33-L34): celebrações, dark mode
13. CAMADA 12 (L35-L40): detalhes impossíveis, campanhas, NPS, wizard

Crie services/mocks novos conforme necessário (padrão isMock + handleServiceError).
Ao final de cada camada: pnpm build && pnpm typecheck.
Corrija erros sozinho. Não pare entre camadas.
Ao final: commit e push.

REGRA ABSOLUTA: NENHUMA tela vazia. NENHUM 'Sem dados'. Todo perfil funciona."
```

---

# CHECKLIST DO LIMITE ABSOLUTO

```
- [ ] Loading premium (não tela branca)
- [ ] Login glassmorphism com animação
- [ ] Dashboard admin: saudação + KPIs + central atenção + timeline dia + feed
- [ ] Health score: gauge + tabela risco + modal ação + impacto financeiro
- [ ] CRM: pipeline kanban + experimental + conversão + métricas
- [ ] Financeiro: número enorme + inadimplentes + gráfico + projeção
- [ ] Relatórios: 5 tipos PDF bonito
- [ ] Professor: dashboard orientado + modo aula fullscreen + QR real
- [ ] Avaliação: sliders + radar + observações + promoção
- [ ] Aluno: dashboard emocional + faixa visual + streak + conteúdo
- [ ] Perfil: jornada timeline + heatmap + radar + conquistas
- [ ] Promoção: cerimônia digital com confetti + certificado
- [ ] Conquistas: raridade + glow + lendário com partículas
- [ ] Streaming: Netflix-style + trilhas + quiz + certificado
- [ ] Teen: XP + level + ranking + desafios + identidade
- [ ] Kids: estrelas + figurinhas + visual lúdico + tudo positivo
- [ ] Responsável: seletor filhos + agenda + relatório + autorização
- [ ] Mural: posts auto + manual + destaques + moderado
- [ ] Eventos: hub integrado + inscrição + autorização
- [ ] Contexto temporal: muda com hora/dia/mês
- [ ] Sugestões: proativas baseadas em dados
- [ ] Busca: Cmd+K command palette
- [ ] Notificações: inteligentes, não spam
- [ ] Mensagens: contexto + sugestões + automações
- [ ] Celebrações: confetti, glow, vibração, animações
- [ ] Dark mode premium
- [ ] Resumo por voz
- [ ] Tempo no tatame
- [ ] Record board
- [ ] Certificados (faixa + trilha)
- [ ] Campanhas inteligentes
- [ ] NPS
- [ ] Wizard implantação
- [ ] Landing page da academia
- [ ] Indicação + reativação
- [ ] NENHUMA tela vazia em NENHUM perfil

ESTE É O LIMITE. DEPOIS DESTE, NÃO HÁ PRÓXIMO.
```
