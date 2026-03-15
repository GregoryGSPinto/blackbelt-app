# BLACKBELT v2 — Master Roadmap Part 3

> Do SaaS Competitivo ao Ecossistema Dominante
> Fases 21–30 · 50 Prompts Executáveis · Marketplace · Video IA · Wearables · Franquias
>
> Autor: Gregory Gonçalves Silveira Pinto
> Data: Março 2026 | Pré-requisito: Fases 0–20 concluídas

---

## Contexto

As Fases 0–10 entregaram o MVP funcional. As Fases 11–20 transformaram o MVP num SaaS competitivo com IA, pagamentos reais, escala multi-tenant, comunicação automatizada e features enterprise. Este documento leva o BlackBelt para o nível de ecossistema: marketplace de conteúdo, análise de vídeo por IA, wearables, franquias, e-commerce, programas de treino, e gamificação avançada com seasons. O BlackBelt deixa de ser ferramenta e vira a plataforma onde artes marciais acontecem.

---

## Visão Geral das Fases 21–30

| Fase | Nome | Foco | Prompts | Resultado |
|------|------|------|---------|-----------|
| 21 | Video Intelligence | Análise de técnica por IA, anotações, slow-motion | P103–P107 | Treino com feedback visual |
| 22 | Program Builder | Currículos, planos de treino, periodização | P108–P112 | Metodologia sistematizada |
| 23 | Marketplace | Conteúdo entre academias, professores vendendo cursos | P113–P117 | Economia da plataforma |
| 24 | E-Commerce | Loja da academia, produtos, carrinho, envio | P118–P122 | Receita além mensalidade |
| 25 | Wearables & IoT | Apple Watch, frequência cardíaca, catraca digital | P123–P127 | Academia conectada |
| 26 | Gamificação Pro | Seasons, ligas, battle pass, recompensas reais | P128–P132 | Retenção máxima |
| 27 | Franquias | Gestão de rede, padronização, royalties | P133–P137 | Escala de rede |
| 28 | Competições | Gestão completa de campeonatos, inscrição, arbitragem | P138–P142 | Ecossistema competitivo |
| 29 | IA Avançada | Visão computacional, análise postural, personal IA | P143–P147 | Diferencial imbatível |
| 30 | Plataforma Aberta | SDK, plugins, app store, developer portal | P148–P152 | Ecossistema de terceiros |

---

## FASE 21 — VIDEO INTELLIGENCE

Análise de técnica por IA em vídeos de treino. O professor filma, o sistema analisa. O aluno recebe feedback visual.

---

#### PROMPT P103: Upload de Vídeo de Treino

```
Crie o sistema de upload de vídeos de treino no BlackBelt v2:
lib/api/training-video.service.ts:
- upload(file, studentId, classId, metadata) → TrainingVideo
- list(studentId, filters?) → TrainingVideo[]
- getById(id) → TrainingVideoDetail
- delete(id) → void
- addAnnotation(videoId, timestamp, note, author) → Annotation

TrainingVideo DTO:
- id, student_id, class_id, uploaded_by, file_url, thumbnail_url
- duration, file_size, status (processing/ready/failed)
- annotations[], ai_analysis (nullable)
- created_at, updated_at

app/(professor)/turma-ativa/gravar/page.tsx:
- Botão "Gravar Técnica" durante aula ativa
- Seletor de aluno
- Upload direto (drag-drop no desktop, câmera no mobile)
- Progress bar de upload
- Após upload: thumbnail + link para análise

app/(main)/progresso/videos/page.tsx:
- Galeria de vídeos do aluno
- Filtro por data, turma, professor
- Click abre player com anotações

Supabase Storage para arquivos. Mocks com URLs placeholder.
```

---

#### PROMPT P104: Player de Vídeo com Anotações

```
Crie components/video/AnnotatedPlayer.tsx no BlackBelt v2:
Player de vídeo avançado para análise técnica:
- Controles: play/pause, velocidade (0.25x, 0.5x, 1x, 2x), frame-by-frame (seta)
- Timeline com marcadores de anotação (pontos coloridos clicáveis)
- Painel lateral: lista de anotações por timestamp
- Click na anotação: pula para o momento no vídeo
- Professor pode adicionar anotação: pausa vídeo, clica no frame, digita nota
- Anotação pode ter: texto, tipo (elogio/correção/dica), posição no frame (x,y)
- Overlay no vídeo: setas/círculos desenhados pelo professor sobre o frame
- Aluno vê anotações como sobreposição durante playback

Ferramentas de desenho (simplificadas):
- Círculo (marcar posição do corpo)
- Seta (indicar direção de movimento)
- Texto livre sobre o frame
- Cor: verde (correto) / vermelho (corrigir) / amarelo (atenção)

Salva anotações via training-video.service.ts.
Mobile: player fullscreen com anotações em bottom sheet.
```

---

#### PROMPT P105: Análise de Técnica por IA

```
Crie lib/api/video-analysis.service.ts no BlackBelt v2:
Integração com Claude Vision API para análise de técnica:
- analyzeFrame(imageBase64, context) → FrameAnalysis
  Context inclui: modalidade, técnica esperada, faixa do aluno
  FrameAnalysis: { posture_score, balance_score, technique_notes[], corrections[] }

- analyzeVideo(videoId) → VideoAnalysis
  Extrai frames-chave (1 por segundo), analisa cada um
  VideoAnalysis: {
    overall_score: 0-100,
    highlights: { timestamp, type, description }[],
    corrections: { timestamp, body_part, issue, suggestion }[],
    summary: string (narrativa gerada por IA)
  }

- compareExecution(videoId, referenceVideoId) → ComparisonResult
  Compara execução do aluno com vídeo de referência
  ComparisonResult: { similarity_score, differences[] }

Mock: retorna análises pré-escritas com scores variados.
Rate limiting: 5 análises/hora por professor, 20/dia por academia.
Config: usa ANTHROPIC_API_KEY existente.
```

---

#### PROMPT P106: Dashboard de Análise de Vídeo

```
Crie app/(professor)/analise-video/[id]/page.tsx no BlackBelt v2:
Tela completa de análise de um vídeo de treino:
Left (60%): AnnotatedPlayer com o vídeo
Right (40%): Painel de análise
  Tab 1 — Anotações Manuais: lista do professor
  Tab 2 — Análise IA: scores, correções, highlights
  Tab 3 — Comparativo: se tem vídeo de referência

Ações:
- "Analisar com IA" → loading → mostra resultados
- "Compartilhar com Aluno" → aluno recebe notificação e pode ver
- "Exportar Análise" → PDF com screenshots + notas + scores

Crie também app/(main)/progresso/videos/[id]/page.tsx:
- Visão do aluno: vídeo + anotações do professor + análise IA
- Sem ferramentas de edição (read-only)
- Seção "Minha Evolução": comparativo entre vídeos ao longo do tempo

Mobile: player em cima, painel embaixo (scroll vertical).
```

---

#### PROMPT P107: Biblioteca de Técnicas de Referência

```
Crie app/(admin)/tecnicas/page.tsx no BlackBelt v2:
Biblioteca de vídeos de referência (técnica correta):
- CRUD de técnicas: nome, modalidade, faixa mínima, descrição, vídeo
- Organização por categoria: defesa, ataque, posição, transição, finalização
- Tags: guarda, montada, passagem, armlock, triângulo, etc
- Cada técnica tem: vídeo demonstrativo + pontos-chave em texto

app/(main)/tecnicas/page.tsx:
- Catálogo navegável de técnicas
- Filtro por modalidade, faixa, categoria, busca
- Click abre: vídeo + descrição + pontos-chave
- Botão "Gravar minha execução" → abre câmera para o aluno se filmar
- Após gravar: comparativo automático com o vídeo de referência

lib/api/techniques.service.ts:
- list(academyId, filters?) → Technique[]
- getById(id) → TechniqueDetail
- create(data) → Technique (admin/professor)
- getByModality(modality) → Technique[]

Mocks: 20 técnicas de BJJ com nomes reais (armbar, triangle, sweep, etc).
```

---

## FASE 22 — PROGRAM BUILDER

Currículos estruturados, planos de treino, periodização. A metodologia da academia sistematizada.

---

#### PROMPT P108: Currículo por Faixa

```
Crie o sistema de currículo no BlackBelt v2:
lib/api/curriculum.service.ts:
- getCurriculum(academyId, modality, belt) → Curriculum
- createCurriculum(data) → Curriculum
- updateCurriculum(id, data) → Curriculum
- addRequirement(curriculumId, requirement) → Requirement
- removeRequirement(curriculumId, requirementId) → void

Curriculum DTO:
- id, academy_id, modality, target_belt
- requirements[]: { id, category, name, description, video_ref_id?, required: boolean }
- min_time_months: number (tempo mínimo na faixa anterior)
- min_attendance: number
- min_evaluation_score: number
- notes: string

Categorias de requisito:
- Técnicas obrigatórias (ex: "Executar 3 variações de armbar")
- Técnicas opcionais (escolher X de Y)
- Conceitos teóricos (ex: "Entender princípios de alavanca")
- Comportamentais (ex: "Demonstrar respeito ao parceiro")

app/(admin)/curriculo/page.tsx:
- Seletor: modalidade × faixa
- Editor visual de requisitos (drag-drop para reordenar)
- Vincular vídeo de referência a cada requisito
- Preview: como o aluno vê

app/(main)/curriculo/page.tsx:
- Visualização do currículo da sua faixa atual
- Checklist de requisitos (completados vs pendentes)
- Progress bar geral
```

---

#### PROMPT P109: Planos de Treino Personalizados

```
Crie lib/api/training-plan.service.ts no BlackBelt v2:
- createPlan(studentId, data) → TrainingPlan
- getActivePlan(studentId) → TrainingPlan | null
- getPlans(studentId) → TrainingPlan[]
- updatePlan(planId, data) → TrainingPlan
- logExercise(planId, exerciseId, result) → ExerciseLog

TrainingPlan DTO:
- id, student_id, created_by (professor), name
- goal: string ("Preparar para faixa azul", "Competição em 3 meses")
- duration_weeks: number
- weeks[]: {
    week_number, focus_area, sessions[]: {
      day, type (treino/descanso/leve),
      exercises[]: { id, name, sets, reps, duration, notes, video_ref_id? }
    }
  }
- status: active, completed, archived

app/(professor)/plano-treino/page.tsx:
- Criar plano para aluno (wizard: goal → duração → montar semanas)
- Templates pré-definidos (iniciante, competição, recuperação)
- Duplicar plano existente para outro aluno
- Acompanhar adesão (% de exercícios logados)

app/(main)/plano-treino/page.tsx:
- Visão do plano ativo (semana atual destacada)
- Checklist de exercícios do dia
- Log de execução (fez / não fez / adaptou)
- Histórico de planos anteriores
```

---

#### PROMPT P110: Periodização e Macrociclos

```
Crie lib/api/periodization.service.ts no BlackBelt v2:
Sistema de periodização para competidores:
- createMacrocycle(studentId, competition, data) → Macrocycle
- getMacrocycle(studentId) → Macrocycle | null
- updatePhase(macrocycleId, phaseId, data) → Phase

Macrocycle DTO:
- id, student_id, competition_name, competition_date
- phases[]: {
    name (base/build/peak/taper/recovery),
    start_date, end_date, weeks,
    intensity (1-10), volume (1-10),
    focus: string[],
    training_plan_id?
  }
- current_phase: computed

app/(professor)/periodizacao/page.tsx:
- Timeline visual do macrociclo (Gantt-like horizontal)
- Arrastar bordas das fases para ajustar duração
- Indicadores de intensidade × volume por fase
- Vincular plano de treino a cada fase
- Marcar competição como milestone na timeline

app/(main)/periodizacao/page.tsx:
- Visão do aluno: "Você está na fase de Build (semana 3/6)"
- Gráfico de intensidade ao longo do tempo
- Próxima competição com countdown

Mocks com periodização de 16 semanas para competição de BJJ.
```

---

#### PROMPT P111: Avaliação Física

```
Crie lib/api/physical-assessment.service.ts no BlackBelt v2:
- createAssessment(studentId, data) → PhysicalAssessment
- getHistory(studentId) → PhysicalAssessment[]
- getLatest(studentId) → PhysicalAssessment | null
- compareAssessments(assessmentId1, assessmentId2) → Comparison

PhysicalAssessment DTO:
- id, student_id, assessed_by, date
- measurements: {
    weight_kg, height_cm, body_fat_pct?,
    arm_circumference_cm?, leg_circumference_cm?,
    flexibility_score (0-10), grip_strength_kg?
  }
- fitness_tests: {
    pushups_1min?, situps_1min?, squats_1min?,
    plank_seconds?, beep_test_level?,
    sprint_20m_seconds?
  }
- notes: string

app/(professor)/avaliacao-fisica/page.tsx:
- Form para registrar avaliação (input por campo)
- Selecionar aluno
- Comparativo com avaliação anterior (setas verde/vermelha)

app/(main)/avaliacao-fisica/page.tsx:
- Histórico em gráficos de evolução (Recharts LineChart por métrica)
- Comparativo entre avaliações (tabela com delta)
- Última avaliação destacada

Mocks com 4 avaliações por aluno (trimestrais, 1 ano).
```

---

#### PROMPT P112: Coach IA para Planos de Treino

```
Evolua lib/api/ai-coach.service.ts no BlackBelt v2:
Novas funções:
- generateTrainingPlan(studentId, goal, weeks) → TrainingPlan
  IA analisa: faixa, avaliações, frequência, avaliação física, currículo
  Gera plano personalizado completo com exercícios por dia

- adjustPlan(planId, feedback) → TrainingPlan
  "Muito difícil" / "Muito fácil" / "Lesão no joelho" / "Foco mais em guarda"
  IA ajusta intensidade, substitui exercícios, adapta

- generatePeriodization(studentId, competitionDate) → Macrocycle
  IA calcula fases ideais baseado no tempo até a competição

- weeklyCheckIn(planId) → WeeklyInsight
  "Você completou 80% dos treinos. Seu foco em técnica está melhorando.
   Sugestão: adicione 1 sessão de drilling esta semana."

Integre no frontend:
- Botão "Gerar plano com IA" no professor e no aluno
- "Ajustar meu plano" com input de feedback
- Insight semanal automático no dashboard

Mock: planos e insights pré-escritos. Rate limiting mantido.
```

---

## FASE 23 — MARKETPLACE

Professores vendendo cursos. Academias compartilhando conteúdo. Economia da plataforma.

---

#### PROMPT P113: Marketplace de Conteúdo

```
Crie o marketplace de conteúdo no BlackBelt v2:
lib/api/marketplace.service.ts:
- listCourses(filters?) → MarketplaceCourse[]
- getCourse(id) → MarketplaceCourseDetail
- purchaseCourse(courseId, userId) → Purchase
- getMyPurchases(userId) → Purchase[]
- getMySales(creatorId) → SalesSummary

MarketplaceCourse DTO:
- id, creator_id, creator_name, creator_academy
- title, description, thumbnail_url, preview_video_url
- modality, belt_level, duration_total
- price (BRL), rating, reviews_count, students_count
- modules[]: { title, videos[], duration }
- status: draft, published, suspended

app/(public)/marketplace/page.tsx:
- Grid de cursos com filtros (modalidade, faixa, preço, rating)
- Search bar
- Categorias: "Mais vendidos", "Novos", "Para sua faixa"
- Card: thumbnail, título, criador, preço, rating, alunos

app/(public)/marketplace/[id]/page.tsx:
- Hero com preview video
- Módulos e aulas (accordion, aulas trancadas se não comprou)
- Reviews
- Botão "Comprar R$ X" → checkout
- Sobre o professor/academia

Mocks: 15 cursos com dados realistas de BJJ/Judô/MMA.
```

---

#### PROMPT P114: Criação de Cursos (Professor)

```
Crie app/(professor)/meus-cursos/page.tsx no BlackBelt v2:
Dashboard do professor como criador:
- Lista de cursos criados (draft, publicados, vendas, receita)
- Botão "Criar novo curso"

app/(professor)/meus-cursos/novo/page.tsx:
Wizard de criação de curso:
Step 1: Informações básicas (título, descrição, modalidade, faixa, preço)
Step 2: Módulos e aulas (drag-drop para organizar)
  - Criar módulo
  - Dentro de cada módulo: adicionar aulas (vídeo upload + título + descrição)
  - Reordenar com drag-drop
Step 3: Preview e configurações
  - Vídeo de preview (gratuito)
  - Thumbnail
  - Tags
Step 4: Publicar

lib/api/course-creator.service.ts:
- createCourse(data) → Course
- addModule(courseId, data) → Module
- addLesson(moduleId, data) → Lesson
- reorderModules(courseId, order) → void
- publishCourse(courseId) → void
- getCourseAnalytics(courseId) → CourseAnalytics (views, vendas, receita, reviews)

Dashboard de receita: gráfico de vendas, revenue mensal, top cursos.
```

---

#### PROMPT P115: Sistema de Reviews e Rating

```
Crie lib/api/reviews.service.ts no BlackBelt v2:
- createReview(courseId, userId, rating, text) → Review
- getReviews(courseId, page?) → Review[]
- getAverageRating(courseId) → { average, count, distribution }
- reportReview(reviewId, reason) → void
- respondToReview(reviewId, creatorResponse) → void

Review DTO:
- id, course_id, user_id, user_name, user_belt
- rating (1-5), text, created_at
- creator_response?: string
- helpful_count: number
- reported: boolean

Regras:
- Só quem comprou pode avaliar
- 1 review por usuário por curso
- Creator pode responder (1 resposta por review)
- Admin pode remover reviews reportadas

components/marketplace/ReviewCard.tsx:
- Stars, texto, data, autor (avatar + nome + faixa)
- Resposta do criador (se houver)
- Botão "Útil" (helpful)

components/marketplace/ReviewForm.tsx:
- Star selector (1-5)
- Textarea
- Submit

Integre nas páginas do marketplace e do curso.
```

---

#### PROMPT P116: Split de Pagamento (Marketplace)

```
Crie lib/api/marketplace-payment.service.ts no BlackBelt v2:
Sistema de split de pagamento para marketplace:
- Na compra de um curso:
  - Plataforma fica com X% (configurável, default 20%)
  - Criador recebe (100-X)%
  - Split automático via gateway (Stripe Connect ou Asaas Split)

- getPlatformRevenue(period) → PlatformRevenueDTO
- getCreatorBalance(creatorId) → BalanceDTO
- requestWithdrawal(creatorId, amount) → WithdrawalRequest
- getWithdrawalHistory(creatorId) → Withdrawal[]

BalanceDTO:
- available: number (pode sacar)
- pending: number (aguardando período de segurança)
- total_earned: number
- total_withdrawn: number

app/(professor)/meus-cursos/financeiro/page.tsx:
- Saldo disponível
- Saldo pendente
- Botão "Solicitar saque"
- Histórico de saques
- Gráfico de receita mensal

Admin: app/(admin)/marketplace/page.tsx:
- Receita da plataforma
- Top criadores
- Cursos pendentes de aprovação (moderação)
- Configurar % de comissão

Mocks: dados de 6 meses de vendas.
```

---

#### PROMPT P117: Certificados Digitais

```
Crie lib/api/certificates.service.ts no BlackBelt v2:
Emissão de certificados para conclusão de cursos e promoção de faixa:
- generateCourseCertificate(userId, courseId) → Certificate
- generateBeltCertificate(studentId, progressionId) → Certificate
- generateEventCertificate(userId, eventId) → Certificate
- verifyCertificate(certificateCode) → CertificateVerification
- getMyCertificates(userId) → Certificate[]

Certificate DTO:
- id, type (course/belt/event), user_name
- title, description, issued_at
- academy_name, issuer_name
- verification_code (único, público)
- pdf_url, thumbnail_url
- blockchain_hash? (futuro)

Geração de PDF do certificado:
- Template visual bonito (jsPDF ou React-PDF)
- Logo da academia (ou BlackBelt default)
- Nome do aluno, curso/faixa, data
- QR code com link de verificação
- Assinatura digital do professor/admin

app/(public)/verificar/[code]/page.tsx:
- Página pública de verificação
- Mostra certificado se código válido
- "Certificado inválido" se não encontrado

app/(main)/certificados/page.tsx:
- Galeria de certificados do aluno
- Download individual (PDF)
- Compartilhar (link público + imagem para redes sociais)

Mocks: 5 certificados por aluno demo.
```

---

## FASE 24 — E-COMMERCE

Loja da academia. Produtos, carrinho, checkout, envio.

---

#### PROMPT P118: Catálogo de Produtos

```
Crie lib/api/store.service.ts no BlackBelt v2:
- listProducts(academyId, filters?) → Product[]
- getProduct(id) → ProductDetail
- createProduct(data) → Product (admin)
- updateProduct(id, data) → Product
- deleteProduct(id) → void

Product DTO:
- id, academy_id, name, description, images[]
- category: quimono, faixa, equipamento, acessorio, vestuario, suplemento
- price, compare_at_price? (preço antigo riscado)
- variants[]: { id, name (ex: "Tamanho M"), sku, stock, price? }
- stock_total, low_stock_alert
- status: active, draft, out_of_stock
- featured: boolean
- created_at, updated_at

app/(main)/loja/page.tsx:
- Grid de produtos com filtro por categoria
- Search
- Cards: imagem, nome, preço, "Comprar"
- Badge "Esgotado" se sem estoque
- Badge "Promoção" se compare_at_price

app/(main)/loja/[id]/page.tsx:
- Galeria de imagens (carousel)
- Nome, descrição, preço
- Seletor de variante (tamanho/cor)
- Quantidade
- Botão "Adicionar ao Carrinho"
- Produtos relacionados

Mocks: 15 produtos (quimonos, faixas, rashguards, caneleiras).
```

---

#### PROMPT P119: Carrinho e Checkout

```
Crie o sistema de carrinho no BlackBelt v2:
lib/hooks/useCart.ts:
- Context + hook com state do carrinho
- addItem(product, variant, quantity)
- removeItem(itemId)
- updateQuantity(itemId, quantity)
- clearCart()
- cartTotal, cartCount, items[]
- Persist em localStorage (carrinho sobrevive refresh)

app/(main)/carrinho/page.tsx:
- Lista de itens (imagem, nome, variante, preço, quantidade +/-)
- Remover item
- Subtotal por item
- Total do carrinho
- Botão "Finalizar Compra"
- Link "Continuar Comprando"

app/(main)/checkout-loja/page.tsx:
- Resumo do pedido
- Endereço de entrega (form ou selecionar salvo)
- Opções de entrega: retirar na academia (grátis) ou envio (calcular frete)
- Pagamento: PIX, boleto, cartão (reutiliza gateway existente)
- Tela de confirmação com número do pedido

lib/api/orders.service.ts:
- createOrder(cartItems, shippingAddress, paymentMethod) → Order
- getMyOrders(userId) → Order[]
- getOrderById(id) → OrderDetail
- cancelOrder(id) → void (se status = pending)

Order DTO: id, items[], total, shipping, status (pending/paid/shipped/delivered/cancelled)
```

---

#### PROMPT P120: Gestão de Pedidos (Admin)

```
Crie app/(admin)/loja/pedidos/page.tsx no BlackBelt v2:
Lista de pedidos:
- Tabela: #pedido, cliente, data, total, status, método pagamento
- Filtros: status, período, método
- Click abre detalhe do pedido

Detalhe do pedido:
- Itens comprados
- Dados do cliente
- Endereço de entrega
- Status com timeline visual (pedido → pago → enviado → entregue)
- Ações: marcar como enviado (input código de rastreio), marcar como entregue, cancelar

app/(admin)/loja/produtos/page.tsx:
- CRUD de produtos (tabela com ações)
- Gestão de estoque (atualizar quantidade)
- Alertas de estoque baixo

Dashboard de vendas:
- KPIs: pedidos do mês, receita, ticket médio
- Gráfico de vendas (últimos 30 dias)
- Top produtos

lib/api/admin-orders.service.ts + mock.
```

---

#### PROMPT P121: Lista de Desejos e Recompensas

```
Crie features de engajamento para a loja no BlackBelt v2:
lib/api/wishlist.service.ts:
- addToWishlist(userId, productId) → void
- removeFromWishlist(userId, productId) → void
- getWishlist(userId) → Product[]

lib/api/store-rewards.service.ts:
- getBalance(userId) → { points, value_brl }
- getHistory(userId) → PointTransaction[]
- redeemPoints(userId, amount, orderId) → Redemption

Sistema de pontos:
- Check-in = 10 pontos
- Compra na loja = 5% do valor em pontos
- Conquista = pontos variáveis
- 100 pontos = R$ 1,00 de desconto
- Pontos expiram em 12 meses

Integre no checkout: "Usar X pontos (R$ Y de desconto)"
Integre no dashboard do aluno: "Você tem X pontos (R$ Y)"

app/(main)/loja/desejos/page.tsx:
- Grid de produtos favoritados
- Botão "Mover para carrinho"
- Notificação quando produto da wishlist entra em promoção
```

---

#### PROMPT P122: Cálculo de Frete e Rastreamento

```
Crie lib/api/shipping.service.ts no BlackBelt v2:
Integração com APIs de frete:
- calculateShipping(cep, items) → ShippingOption[]
  ShippingOption: { carrier, service, price, delivery_days, tracking_available }
- createShipment(orderId, carrier) → { tracking_code, label_url }
- trackShipment(trackingCode) → TrackingEvent[]
- getShipmentStatus(orderId) → ShipmentStatus

Carriers suportados:
- Correios (PAC, SEDEX) via API dos Correios
- Jadlog (para regiões)
- Retirada na academia (frete zero)

Mock: simula cálculo de frete baseado no CEP (SP/RJ/MG = D+3, outros = D+7).

Integre no checkout:
- Input de CEP com máscara
- Loading enquanto calcula
- Lista de opções com preço e prazo
- Selecionar opção

app/(main)/pedidos/[id]/page.tsx:
- Timeline de rastreamento
- Mapa do percurso (placeholder)
- Estimativa de entrega

Admin: adicionar código de rastreio ao marcar pedido como enviado.
```

---

## FASE 25 — WEARABLES & IoT

Apple Watch, frequência cardíaca em tempo real, catraca digital.

---

#### PROMPT P123: Integração Apple Watch / WearOS

```
Crie lib/api/wearable.service.ts no BlackBelt v2:
- syncHealthData(userId, data) → void
- getHealthHistory(userId, period) → HealthDataPoint[]
- getRealtimeMetrics(userId) → RealtimeMetrics | null
- getTrainingSession(userId) → WearableSession | null

HealthDataPoint DTO:
- timestamp, heart_rate_bpm, calories_burned
- active_minutes, steps
- heart_rate_zones: { rest, fat_burn, cardio, peak } (minutes in each)

WearableSession DTO (dados durante aula):
- class_id, student_id
- start, end, duration_minutes
- avg_heart_rate, max_heart_rate, calories
- intensity_score (0-100 baseado em HR zones)

Integração via Health Connect (Android) / HealthKit (iOS):
- Capacitor plugin: @nicephil/capacitor-health-connect
- Pedir permissão na primeira vez
- Sync automático após cada aula
- Dados ficam no perfil do aluno

Mock: gera dados de HR simulados (60-180bpm ao longo de 1 hora de aula).
```

---

#### PROMPT P124: Dashboard de Saúde do Aluno

```
Crie app/(main)/saude/page.tsx no BlackBelt v2:
Dashboard pessoal de saúde e performance física:
Seção 1 — Último Treino:
- Duração, calorias, HR médio/máximo
- Gráfico de HR ao longo da aula (Recharts AreaChart)
- Zonas de frequência (barra horizontal: repouso → pico)
- Comparativo com treino anterior

Seção 2 — Tendências (últimos 30 dias):
- Gráfico de calorias por treino
- Gráfico de HR médio por treino
- Intensidade média por semana

Seção 3 — Visão Geral:
- Total de calorias queimadas no mês
- Minutos ativos
- Treinos completados
- Score de consistência

Dados vindos de wearable.service.ts.
Se sem wearable conectado: "Conecte seu relógio para ver seus dados de treino"
Link para configurações de wearable.

Versão professor: ver dados de saúde dos alunos (com permissão).
```

---

#### PROMPT P125: Catraca Digital / Controle de Acesso

```
Crie lib/api/access-control.service.ts no BlackBelt v2:
Sistema de controle de acesso físico à academia:
- validateAccess(studentId, unitId) → AccessResult
  Verifica: membership ativa, pagamento em dia, horário permitido
  AccessResult: { allowed, reason?, student_name, photo_url }

- getAccessLog(unitId, date?) → AccessEvent[]
  Quem entrou/saiu e quando

- configureAccessRules(unitId, rules) → void
  Regras: horário permitido, limite de acessos/dia, bloqueio por inadimplência

Métodos de identificação:
- QR Code pessoal (gerado no app, renova a cada 60s)
- NFC (carteirinha digital no Apple/Google Wallet)
- Biometria (placeholder para leitor de digital)

app/(main)/carteirinha/page.tsx:
- QR Code dinâmico (renova automaticamente)
- Nome, foto, faixa, academia
- Botão "Adicionar ao Wallet" (Apple/Google)
- Válido enquanto membership ativa

app/(admin)/acesso/page.tsx:
- Log de acessos em tempo real
- Configurar regras por unidade
- Alerta: aluno bloqueado tentou entrar

Hardware placeholder: API REST que recebe leitura de QR/NFC e retorna allowed/denied.
Mocks: log de 30 dias de acessos.
```

---

#### PROMPT P126: Check-in Automático por Proximidade

```
Crie lib/api/proximity-checkin.service.ts no BlackBelt v2:
Check-in automático quando aluno chega na academia:
- Bluetooth Low Energy (BLE) beacon detection
- Geofencing como fallback

Fluxo:
1. Academia configura beacon BLE ou coordenadas GPS da unidade
2. App do aluno detecta proximidade (background)
3. Se tem aula no horário → check-in automático
4. Notificação: "Check-in automático realizado para BJJ 19h"
5. Professor vê na chamada: "Chegou via proximidade"

lib/api/beacon.service.ts:
- configureBeacon(unitId, beaconId) → void
- configureGeofence(unitId, lat, lng, radius) → void
- detectProximity(beaconData | locationData) → ProximityResult
- autoCheckin(studentId, classId) → Attendance

app/(admin)/acesso/proximidade/page.tsx:
- Configurar beacon por unidade
- Configurar raio de geofence
- Toggle on/off

Capacitor plugins: @capacitor-community/bluetooth-le (BLE)
Mock: simula detecção com timer de 5 segundos.
```

---

#### PROMPT P127: Painel IoT da Academia

```
Crie app/(admin)/iot/page.tsx no BlackBelt v2:
Dashboard de dispositivos conectados:
Seção 1 — Dispositivos:
- Lista: catracas, beacons, displays, sensores
- Status: online/offline/erro
- Última comunicação

Seção 2 — Acessos em Tempo Real:
- Feed live de entradas/saídas
- Foto do aluno + nome + horário
- Alertas: acesso negado, tentativa fora de horário

Seção 3 — Métricas:
- Pico de movimento por horário (heatmap)
- Ocupação atual vs capacidade
- Acessos por dia da semana

Seção 4 — Configurações:
- Vincular dispositivos
- Configurar alertas
- Horários de funcionamento

lib/api/iot.service.ts:
- getDevices(unitId) → Device[]
- getDeviceStatus(deviceId) → DeviceStatus
- getLiveAccess(unitId) → AccessEvent[] (realtime)
- getOccupancy(unitId) → { current, max }

Mocks: 3 dispositivos (1 catraca, 1 beacon, 1 display) com dados simulados.
```

---

## FASE 26 — GAMIFICAÇÃO PRO

Seasons, ligas, battle pass, recompensas reais. Retenção máxima.

---

#### PROMPT P128: Sistema de Seasons

```
Crie lib/api/seasons.service.ts no BlackBelt v2:
Seasons trimestrais com ranking reset:
- getCurrentSeason(academyId) → Season
- getSeasonLeaderboard(seasonId, category?) → RankedStudent[]
- getSeasonRewards(seasonId) → Reward[]
- getMySeasonProgress(studentId, seasonId) → SeasonProgress

Season DTO:
- id, academy_id, name (ex: "Season 3 — Fevereiro/Abril 2026")
- start_date, end_date, status (upcoming/active/ended)
- theme: string (ex: "Guerreiros de Tatame")
- rewards[]: { rank_range, reward_type, reward_value }

SeasonProgress DTO:
- season_points: number (reset a cada season)
- rank: number
- tier: bronze/silver/gold/diamond
- achievements_this_season[]
- streak_this_season
- classes_attended_this_season

Como ganhar pontos:
- Check-in: 10pts
- Desafio completado: 25-100pts
- Conquista nova: 50pts
- Avaliação positiva: 30pts
- Trazer amigo: 100pts

app/(main)/season/page.tsx:
- Banner da season atual (tema, countdown para fim)
- Seu progresso (tier, pontos, rank)
- Leaderboard top 20
- Recompensas por tier
- Histórico de seasons anteriores

Versão teen: visual mais vibrante, animações de subida de tier.
```

---

#### PROMPT P129: Battle Pass

```
Crie lib/api/battle-pass.service.ts no BlackBelt v2:
Battle pass estilo jogos — track de recompensas progressivo:
- getBattlePass(seasonId) → BattlePass
- getMyProgress(userId, seasonId) → BattlePassProgress
- claimReward(userId, levelId) → Reward
- upgradeToPremium(userId, seasonId) → void (compra)

BattlePass DTO:
- season_id
- levels[]: {
    level (1-30), xp_required,
    free_reward: Reward | null,
    premium_reward: Reward | null,
    claimed: boolean
  }

Reward types:
- XP bonus
- Badge exclusivo da season
- Desconto na loja (%, R$)
- Aula particular grátis (premium)
- Quimono/faixa exclusiva (premium)
- Destaque no ranking (avatar brilhante)
- Título especial ("Mestre da Season 3")

app/(main)/battle-pass/page.tsx:
- Track horizontal scrollável com níveis 1-30
- Cada nível: ícone da recompensa (free em cima, premium embaixo)
- Nível atual destacado com brilho
- Botão "Resgatar" quando disponível
- "Upgrade Premium — R$ 29,90" (compra opcional)
- Progress bar do XP atual para próximo nível

Design: visual de jogo, cores vibrantes, animações de unlock.
```

---

#### PROMPT P130: Ligas entre Academias

```
Crie lib/api/leagues.service.ts no BlackBelt v2:
Competição entre academias na plataforma:
- getActiveLeague() → League
- getLeagueStandings() → AcademyRanking[]
- getMyAcademyRank(academyId) → AcademyRank
- contributePoints(studentId, action) → void (automático)

League DTO:
- id, name, season_id
- academies[]: { academy_id, name, logo, total_points, rank }
- rules: como pontos são calculados

Pontuação da academia:
- Soma dos pontos de todos os alunos ativos
- Normalizado por número de alunos (média per capita)
- Evita que academias maiores sempre ganhem

app/(main)/liga/page.tsx:
- Ranking de academias (logo, nome, pontuação, posição)
- Posição da sua academia destacada
- Contribuição pessoal ("Você contribuiu X pontos")
- Prêmio para top 3 academias no fim da season

app/(admin)/liga/page.tsx:
- Opt-in para participar da liga
- Estatísticas da academia na liga
- Ranking dos alunos que mais contribuem

Design: competitivo mas saudável. Foco em comunidade, não rivalidade.
```

---

#### PROMPT P131: Sistema de Títulos e Emblemas

```
Crie lib/api/titles.service.ts no BlackBelt v2:
Títulos desbloqueáveis que aparecem no perfil:
- getAvailableTitles(userId) → Title[]
- getMyTitles(userId) → Title[]
- equipTitle(userId, titleId) → void
- unequipTitle(userId) → void

Title DTO:
- id, name, description, rarity (common/rare/epic/legendary)
- requirement: string (como desbloquear)
- icon_url, color

Títulos disponíveis:
Common: "Iniciante" (primeira aula), "Regular" (30 aulas), "Dedicado" (100 aulas)
Rare: "Faixa de Ferro" (promoção sem falta), "Streak Master" (30 dias)
Epic: "Embaixador" (5 indicações convertidas), "Competidor" (participou de torneio)
Legendary: "Centurião" (365 aulas no ano), "Faixa Preta" (chegou na preta)

Emblemas de academia:
- Cada academia pode ter emblemas customizados
- Admin cria emblemas com critérios
- Alunos que atendem recebem automaticamente

Exibe no perfil do aluno:
- Título ativo ao lado do nome
- Coleção de títulos no perfil (desbloqueados + trancados com dica)
- Raridade indica quão difícil é obter

Integre no Avatar: moldura colorida baseada no título (common=cinza, legendary=dourada).
```

---

#### PROMPT P132: Recompensas Reais

```
Crie lib/api/rewards-store.service.ts no BlackBelt v2:
Loja de recompensas por pontos de season/battle pass:
- getRewardsStore(academyId) → StoreReward[]
- redeemReward(userId, rewardId) → Redemption
- getMyRedemptions(userId) → Redemption[]

StoreReward DTO:
- id, name, description, image_url
- cost_points, category
- stock (null = ilimitado)
- status: available, out_of_stock, expired

Categorias:
- Desconto: X% na mensalidade, R$ na loja
- Experiência: aula particular, treino com faixa preta convidado
- Produto: quimono, rashguard, faixa
- Digital: badge exclusivo, título
- Prioridade: vaga garantida em evento/seminário

app/(main)/recompensas/page.tsx:
- Grid de recompensas disponíveis
- Filtro por categoria
- Saldo de pontos no topo
- "Resgatar" → confirmar → deduzir pontos
- "Meus Resgates" → histórico com status (pendente/entregue)

Admin configura recompensas em app/(admin)/gamificacao/recompensas/page.tsx:
- CRUD de recompensas
- Definir custo em pontos
- Definir estoque
- Ver quem resgatou o quê
```

---

## FASE 27 — FRANQUIAS

Gestão de rede de franquias. Padronização, royalties, expansion.

---

#### PROMPT P133: Dashboard de Franqueador

```
Crie app/(franqueador)/page.tsx no BlackBelt v2:
Novo route group para franqueadores (dono de rede):
Dashboard consolidado:
- KPIs: total academias, total alunos, receita rede, royalties recebidos
- Mapa: distribuição geográfica das franquias (placeholder)
- Ranking de franquias por performance
- Alertas: franquia com churn alto, inadimplência, queda de presença

Gráficos:
- Receita da rede por mês (stackado por franquia)
- Crescimento de alunos por franquia
- NPS por franquia

Ações rápidas:
- Abrir nova franquia (onboarding)
- Enviar comunicado para toda rede
- Agendar reunião de rede

lib/api/franchise.service.ts:
- getNetworkDashboard(franchiseId) → NetworkDashboardDTO
- getAcademies(franchiseId) → FranchiseAcademy[]
- getFinancials(franchiseId) → NetworkFinancials
- sendNetworkMessage(franchiseId, message) → void

Mocks: rede com 5 franquias, dados de 12 meses.
```

---

#### PROMPT P134: Padronização de Rede

```
Crie lib/api/franchise-standards.service.ts no BlackBelt v2:
Sistema de padrões da rede que franquias devem seguir:
- getStandards(franchiseId) → Standard[]
- createStandard(data) → Standard
- checkCompliance(academyId) → ComplianceReport
- getComplianceHistory(academyId) → ComplianceReport[]

Standard DTO:
- id, franchise_id, category, name, description, required
- checklist_items[]: { item, required }
- deadline: date | null

Categorias:
- Visual: logo, cores, fachada, uniforme
- Operacional: horários mínimos, turmas obrigatórias, grade padrão
- Pedagógico: currículo padrão por faixa, método de avaliação
- Financeiro: preço mínimo/máximo, planos obrigatórios
- Qualidade: presença mínima, NPS mínimo

app/(franqueador)/padroes/page.tsx:
- CRUD de padrões
- Checklist visual por franquia (quem está em compliance)
- Relatório de compliance da rede
- Alerta automático quando franquia sai de compliance

app/(admin)/ — cada franquia vê seus padrões e status de compliance.
```

---

#### PROMPT P135: Royalties e Financeiro de Rede

```
Crie lib/api/royalties.service.ts no BlackBelt v2:
Gestão de royalties da franquia:
- calculateRoyalties(academyId, month) → RoyaltyCalculation
- getRoyaltyHistory(franchiseId, period) → RoyaltyPayment[]
- generateRoyaltyInvoice(academyId, month) → Invoice
- payRoyalty(invoiceId) → Payment

RoyaltyCalculation DTO:
- academy_id, month
- gross_revenue: number
- royalty_percentage: number (definido no contrato)
- royalty_amount: number
- marketing_fund_pct: number (fundo de marketing coletivo)
- marketing_fund_amount: number
- total_due: number
- status: pending, paid, overdue

Modelos de royalty suportados:
- % fixo sobre receita bruta (padrão)
- Valor fixo mensal
- Escalonado (% muda com faixa de receita)

app/(franqueador)/royalties/page.tsx:
- Tabela: franquia, receita, royalty, status
- Gráfico: royalties recebidos por mês
- Inadimplência por franquia
- Gerar cobranças do mês

app/(admin)/royalties/page.tsx (visão da franquia):
- Meu histórico de royalties
- Próximo vencimento
- Status de pagamento
```

---

#### PROMPT P136: Expansion e Onboarding de Franquia

```
Crie app/(franqueador)/expansao/page.tsx no BlackBelt v2:
Pipeline de novas franquias:
- Kanban: Lead → Análise → Aprovado → Setup → Operando
- Cada card: candidato, cidade, investimento, status

Onboarding de nova franquia (wizard):
Step 1: Dados do franqueado (nome, documento, experiência)
Step 2: Localização (cidade, bairro, estimativa de público)
Step 3: Análise de viabilidade (automática baseada em dados da região)
Step 4: Contrato (template de franquia, assinatura digital)
Step 5: Setup da academia (cria academy com padrões da rede)
Step 6: Treinamento (checklist de treinamento do franqueado)
Step 7: Inauguração (checklist + comunicação)

lib/api/franchise-expansion.service.ts:
- createLead(data) → FranchiseLead
- updateLeadStatus(leadId, status) → void
- analyzeViability(location) → ViabilityReport (mock: score aleatório 60-95)
- setupFranchise(leadId) → Academy (cria academy pré-configurada)

Mocks: pipeline com 8 leads em diferentes estágios.
```

---

#### PROMPT P137: Comunicação de Rede

```
Crie lib/api/franchise-communication.service.ts no BlackBelt v2:
Comunicação centralizada do franqueador para a rede:
- sendBroadcast(franchiseId, message, channels) → Broadcast
- getBroadcasts(franchiseId) → Broadcast[]
- getReceipts(broadcastId) → BroadcastReceipt[]
- scheduleTraining(franchiseId, data) → Training
- getTrainings(franchiseId) → Training[]

Tipos de comunicação:
- Comunicado geral (texto + anexo, push para admins de todas franquias)
- Novo padrão (com prazo de adequação)
- Material de marketing (envio de materiais oficiais)
- Treinamento online (agendar, link de vídeo, presença)
- Pesquisa/feedback (formulário para franqueados)

app/(franqueador)/comunicacao/page.tsx:
- Compose: escrever comunicado + selecionar destinatários
- Histórico de comunicados
- Confirmação de leitura por franquia
- Agendar treinamentos de rede

app/(admin)/ — franquia vê comunicados recebidos na área de notificações.

Mocks: 10 comunicados com receipts variados.
```

---

## FASE 28 — COMPETIÇÕES

Gestão completa de campeonatos. Do regional ao nacional.

---

#### PROMPT P138: Plataforma de Campeonatos

```
Crie lib/api/championships.service.ts no BlackBelt v2:
Evolução dos torneios internos para campeonatos completos:
- createChampionship(data) → Championship
- getChampionships(filters?) → Championship[]
- getById(id) → ChampionshipDetail
- openRegistration(championshipId) → void
- closeRegistration(championshipId) → void

Championship DTO:
- id, organizer_id (academy ou federation)
- name, description, date, location
- modalities[], categories[]
- registration_fee, registration_deadline
- max_participants, current_participants
- rules_pdf_url
- status: draft, registration_open, registration_closed, in_progress, finished
- live_stream_url?

Category DTO:
- modality, belt_range, weight_range, age_range, gender
- participants[], bracket

app/(public)/campeonatos/page.tsx:
- Calendário de campeonatos (timeline)
- Filtro por modalidade, região, data
- Card: nome, data, local, vagas, preço

app/(public)/campeonatos/[id]/page.tsx:
- Info completa + regulamento
- Categorias disponíveis
- Botão "Inscrever-se" (login required)
- Inscritos por categoria (público)
```

---

#### PROMPT P139: Inscrição e Pesagem

```
Crie o fluxo de inscrição em campeonatos no BlackBelt v2:
app/(main)/campeonatos/[id]/inscricao/page.tsx:
- Selecionar categoria (auto-sugestão baseado em faixa/peso/idade)
- Confirmar dados (nome, academia, faixa, peso)
- Pagar taxa de inscrição (reutiliza checkout existente)
- Comprovante de inscrição (PDF)
- Status: inscrito → pesagem confirmada → competindo → resultado

lib/api/championship-registration.service.ts:
- register(championshipId, categoryId, data) → Registration
- getMyRegistrations(userId) → Registration[]
- confirmWeighIn(registrationId, actualWeight) → void
- changeCategory(registrationId, newCategoryId) → void (se prazo permite)

Pesagem digital:
app/(admin)/campeonatos/[id]/pesagem/page.tsx:
- Lista de inscritos por categoria
- Input de peso real
- Auto-categorização se peso difere (sugerir trocar de categoria)
- Confirmação de pesagem
- Export lista de pesagem (PDF)

Mocks: campeonato com 60 inscritos em 8 categorias.
```

---

#### PROMPT P140: Chaveamento e Arbitragem

```
Crie o sistema de arbitragem no BlackBelt v2:
lib/api/brackets.service.ts:
- generateBracket(championshipId, categoryId, method) → Bracket
  Methods: single_elimination, double_elimination, round_robin
- getBracket(categoryId) → Bracket
- submitResult(matchId, result) → Match
- getMatchDetails(matchId) → MatchDetail

Match DTO:
- id, bracket_id, round, position
- fighter_a_id, fighter_b_id
- winner_id, method (submission, points, dq, walkover)
- score_a, score_b
- duration_seconds
- notes
- mat_number, scheduled_time

app/(admin)/campeonatos/[id]/arbitragem/page.tsx:
- Visão de chaveamento (bracket visual interativo)
- Input de resultado por luta (modal: vencedor, método, placar)
- Painel de mats: quais lutas estão acontecendo em cada mat
- Timer por luta
- Próximas lutas por mat
- Resultado em tempo real no bracket

components/championship/BracketView.tsx:
- Bracket visual (SVG) para single/double elimination
- Nomes, resultados, método
- Navegável (zoom em categorias específicas)
- Atualiza em tempo real (realtime subscription)

Mocks: bracket completo com 16 participantes, 15 lutas.
```

---

#### PROMPT P141: Transmissão e Resultados Live

```
Crie lib/api/championship-live.service.ts no BlackBelt v2:
Resultados em tempo real para público:
- getLiveMatches(championshipId) → LiveMatch[]
- getResults(championshipId, categoryId?) → Result[]
- getMedalTable(championshipId) → MedalTableEntry[]
- subscribeToUpdates(championshipId, callback) → unsubscribe

app/(public)/campeonatos/[id]/live/page.tsx:
- Placar em tempo real de cada mat
- Bracket atualizado automaticamente
- Próximas lutas com horário estimado
- Notificação: "Seu atleta entra em 5 minutos"

app/(public)/campeonatos/[id]/resultados/page.tsx:
- Resultados por categoria (ouro, prata, bronze)
- Medal table por academia
- Busca por atleta
- Destaque: "Melhor academia", "Melhor atleta"

Quadro de medalhas:
- Ranking de academias
- Total de ouros/pratas/bronzes
- Pontuação por peso de medalha

Integração (futuro): live stream embed (YouTube/Twitch URL configurável).
Mocks: resultados de campeonato completo com 8 categorias.
```

---

#### PROMPT P142: Ranking Federativo

```
Crie lib/api/federation-ranking.service.ts no BlackBelt v2:
Ranking cumulativo de atletas e academias:
- getAthleteRanking(modality, belt?, weight?, region?) → RankedAthlete[]
- getAcademyRanking(modality?, region?) → RankedAcademy[]
- getAthleteProfile(athleteId) → AthleteProfile
- calculatePoints(matchResult) → number

Sistema de pontuação:
- Ouro = 9pts, Prata = 3pts, Bronze = 1pt
- Multiplicador por importância do evento (local=1x, estadual=2x, nacional=3x)
- Pontos expiram em 12 meses (ranking rolling)

AthleteProfile DTO:
- user_id, name, academy, belt, weight_class
- total_points, rank_position
- history[]: { championship, category, result, points, date }
- medals: { gold, silver, bronze }
- win_rate, submission_rate

app/(public)/ranking/page.tsx:
- Filtros: modalidade, faixa, peso, região
- Tabela: posição, atleta, academia, pontos, medalhas
- Click abre perfil do atleta
- Meu ranking destacado

app/(public)/ranking/atleta/[id]/page.tsx:
- Perfil público do atleta
- Histórico de competições
- Estatísticas
- Conquistas

Mocks: ranking com 100 atletas, dados de 12 meses.
```

---

## FASE 29 — IA AVANÇADA

Visão computacional, análise postural, personal IA que evolui com o aluno.

---

#### PROMPT P143: Análise Postural por Câmera

```
Crie lib/api/posture-analysis.service.ts no BlackBelt v2:
Análise de postura em tempo real usando câmera:
- analyzePosture(imageBase64) → PostureResult
  Usa MediaPipe Pose (rodando no browser, sem servidor)
  PostureResult: {
    landmarks: { name, x, y, confidence }[],
    issues: { type, body_part, severity, suggestion }[],
    overall_score: 0-100
  }

- captureAndAnalyze(videoRef) → PostureResult (captura frame do vídeo)

Issues detectáveis:
- Base: pés muito juntos/largos, peso desbalanceado
- Guarda: mãos baixas, cotovelos abertos
- Postura: coluna curvada, ombros tensos
- Posição: quadril alto/baixo demais, joelhos desalinhados

components/ai/PostureCamera.tsx:
- Preview da câmera com overlay de esqueleto (landmarks)
- Cores: verde (correto), amarelo (atenção), vermelho (corrigir)
- Painel lateral com issues em tempo real
- Botão "Capturar" para salvar análise
- Score em tempo real

Integre com treinamento:
- Aluno abre câmera, posiciona-se, recebe feedback instantâneo
- Professor usa durante aula para demonstrar correções

Lib: @mediapipe/pose (roda no browser, sem API externa)
Mock: landmarks pré-calculados para teste sem câmera.
```

---

#### PROMPT P144: Personal IA Evolutivo

```
Crie lib/api/personal-ai.service.ts no BlackBelt v2:
IA que conhece o aluno e evolui ao longo do tempo:
- getPersonalContext(studentId) → PersonalContext
  Agrega: todas avaliações, presença, vídeos analisados, planos de treino,
  avaliações físicas, competições, preferências, feedback dado

- chat(studentId, message, history) → AIResponse
  Conversa contextual com memória de longo prazo
  IA sabe: faixa, tempo de treino, pontos fortes/fracos, lesões,
  objetivos, competições futuras, estilo de jogo preferido

- getDailyBriefing(studentId) → DailyBriefing
  "Bom dia, João! Hoje é dia de BJJ às 19h.
   Foco sugerido: trabalhar passagem de guarda (sua avaliação caiu 5pts).
   Lembrete: campeonato em 23 dias. Seu peso está 1kg acima da categoria."

- getWeeklyPlan(studentId) → WeeklyPlan
  Plano automático baseado em todos os dados

Personalização:
- Tom de voz configurável (motivacional, técnico, casual)
- Frequência de mensagens (diário, só quando relevante)
- Idioma seguindo preferência do usuário

Integre no dashboard: card "Seu Personal IA" com briefing do dia.
Integre no chat: histórico de conversas com o personal.

Mock: briefings e respostas pré-escritas. Claude API quando real.
```

---

#### PROMPT P145: Análise de Luta (Match Analysis)

```
Crie lib/api/match-analysis.service.ts no BlackBelt v2:
Análise detalhada de lutas gravadas:
- analyzeMatch(videoId) → MatchAnalysis
  MatchAnalysis: {
    duration, rounds,
    timeline[]: { timestamp, event_type, description, fighter }
    positions[]: { position_name, time_spent_seconds, transitions }
    submission_attempts[]: { technique, timestamp, success }
    takedowns[]: { technique, timestamp, success }
    points_breakdown: { fighter_a, fighter_b }
    tactical_summary: string (gerado por IA)
    improvement_areas[]: { area, description, drills[] }
  }

Event types: takedown, sweep, pass, mount, back_take, submission_attempt,
  submission, escape, stand_up, penalty

app/(main)/analise-luta/[videoId]/page.tsx:
- Player com timeline de eventos (clicável)
- Gráfico de posições (pie chart: tempo em cada posição)
- Linha do tempo visual (eventos ao longo da luta)
- Resumo tático gerado por IA
- Áreas de melhoria com drills sugeridos

app/(professor)/analise-luta/page.tsx:
- Selecionar aluno e vídeo de luta
- Adicionar anotações manuais sobre a análise
- Compartilhar com aluno

Mock: análise completa de uma luta de 6 minutos.
```

---

#### PROMPT P146: Previsão de Resultados em Competição

```
Crie lib/api/competition-predictor.service.ts no BlackBelt v2:
Previsão de desempenho em competições:
- predictPerformance(studentId, championshipId) → Prediction
- getMatchup(studentId, opponentId) → MatchupAnalysis
- getOptimalCategory(studentId, championshipId) → CategoryRecommendation

Prediction DTO:
- podium_probability: number (% de chance de medalha)
- gold_probability, silver_probability, bronze_probability
- strengths[]: string (vantagens sobre o bracket)
- risks[]: string (pontos de atenção)
- preparation_suggestions[]: string
- similar_athletes[]: { name, style, how_they_won }

MatchupAnalysis DTO (se atletas já competiram na plataforma):
- head_to_head: { wins_a, wins_b, draws }
- style_comparison: { attribute, fighter_a_score, fighter_b_score }[]
- recommendation: string ("Foque em jogo de guarda — oponente é fraco em passagem")

Baseado em:
- Ranking do atleta e dos oponentes prováveis
- Histórico de competições
- Avaliações e dados de treino
- Análises de luta anteriores

Mock: predições com probabilidades fixas. IA real usa Claude para narrativa.
```

---

#### PROMPT P147: Assistente de Voz

```
Crie lib/api/voice-assistant.service.ts no BlackBelt v2:
Assistente de voz para uso durante treino (hands-free):
- startListening() → void
- stopListening() → void
- processCommand(audioTranscript) → VoiceResponse

Comandos suportados:
- "Iniciar cronômetro" / "Parar cronômetro"
- "Próximo exercício" (avança no plano de treino)
- "Quanto tempo falta?" (para o round/descanso)
- "Como está minha postura?" (ativa câmera + análise)
- "Registrar presença" (auto check-in)
- "Qual meu próximo treino?" (lê plano do dia)
- "Resultado da luta" (durante torneio, input de voz)

Implementação:
- Web Speech API (nativo do browser, sem custo)
- Reconhecimento em PT-BR
- Feedback por áudio (Web Speech Synthesis)
- Visual: indicador de "ouvindo" na tela

components/ai/VoiceAssistant.tsx:
- Floating mic button
- Indicador visual de listening (pulsating ring)
- Transcript em tempo real
- Resposta em texto + áudio

Integre em:
- Plano de treino (modo hands-free)
- Turma ativa do professor (chamada por voz)
- Timer de treino

Mock: transcrição simulada com respostas fixas.
```

---

## FASE 30 — PLATAFORMA ABERTA

SDK, plugins, app store, developer portal. O ecossistema cresce além da equipe core.

---

#### PROMPT P148: SDK e API Avançada

```
Crie o SDK JavaScript do BlackBelt v2:
lib/sdk/blackbelt-sdk.ts:
- Wrapper tipado para toda a API pública v1
- Autenticação com API key
- Rate limiting client-side
- Retry automático com backoff
- TypeScript first (exporta todos os types)

Publicável como pacote npm: @blackbelt/sdk

Uso:
  import { BlackBeltClient } from '@blackbelt/sdk';
  const client = new BlackBeltClient({ apiKey: 'xxx' });
  const students = await client.students.list({ status: 'active' });
  const attendance = await client.attendance.create({ studentId, classId });

Crie docs/SDK.md com:
- Instalação
- Autenticação
- Exemplos por recurso
- Tratamento de erros
- Types disponíveis

Crie também lib/sdk/webhooks-validator.ts:
- Utilitário para validar assinatura HMAC de webhooks
- Exemplo de uso com Express/Next.js
```

---

#### PROMPT P149: Sistema de Plugins

```
Crie lib/api/plugins.service.ts no BlackBelt v2:
Infraestrutura para plugins de terceiros:
- listPlugins(academyId) → InstalledPlugin[]
- installPlugin(academyId, pluginId) → void
- uninstallPlugin(academyId, pluginId) → void
- getPluginConfig(academyId, pluginId) → PluginConfig
- updatePluginConfig(academyId, pluginId, config) → void

Plugin DTO:
- id, name, description, author, version
- icon_url, screenshots[]
- category: analytics, communication, payment, content, integration
- permissions_required: string[] (quais APIs o plugin acessa)
- price: free | number (monthly)
- rating, installs

Plugin lifecycle:
- onInstall(academyId, config) → setup inicial
- onEvent(eventType, data) → reage a eventos do sistema
- getWidget() → React component para embed no dashboard
- onUninstall(academyId) → cleanup

app/(admin)/plugins/page.tsx:
- Loja de plugins (grid com filtros)
- Meus plugins instalados (toggle on/off)
- Configuração por plugin

Plugins de exemplo (mock):
- "WhatsApp Automator" — mensagens automáticas avançadas
- "Stripe Advanced" — dashboard financeiro expandido
- "Google Calendar Sync" — sincronização bidirecional
- "Relatório CONFEF" — relatórios no formato do conselho
```

---

#### PROMPT P150: App Store do BlackBelt

```
Crie app/(public)/app-store/page.tsx no BlackBelt v2:
Marketplace de plugins e integrações:
- Grid de plugins disponíveis
- Filtro por categoria, preço (grátis/pago), rating
- Search
- Destaque: "Mais populares", "Novos", "Para você"
- Card: ícone, nome, descrição curta, rating, preço, installs

app/(public)/app-store/[id]/page.tsx:
- Descrição completa
- Screenshots carousel
- Reviews
- Permissões requeridas
- Botão "Instalar" (precisa estar logado como admin)
- Changelog (versões)
- Documentação do plugin

app/(public)/app-store/developer/page.tsx:
- "Publique seu plugin"
- Guidelines de desenvolvimento
- Link para documentação do SDK
- Submeter plugin para review

lib/api/app-store.service.ts:
- listApps(filters?) → AppStoreItem[]
- getApp(id) → AppStoreItemDetail
- submitApp(data) → SubmissionResult (review pendente)
- getMyApps(developerId) → AppStoreItem[] (meus plugins publicados)

Mocks: 12 plugins de exemplo em 4 categorias.
```

---

#### PROMPT P151: Developer Portal

```
Crie app/(public)/developers/page.tsx no BlackBelt v2:
Portal para desenvolvedores de plugins:
Seções:
1. Getting Started — quick start com SDK
2. API Reference — documentação completa dos endpoints
3. Webhooks — eventos disponíveis + payload examples
4. Plugin SDK — como criar um plugin
5. Guidelines — regras de publicação
6. Sandbox — ambiente de teste

app/(public)/developers/api-reference/page.tsx:
- Documentação interativa (estilo Swagger)
- Cada endpoint: método, URL, params, body, response, exemplo
- "Try it" com input e resposta real (sandbox)

app/(public)/developers/sandbox/page.tsx:
- API key de teste automática
- Console interativo para testar requests
- Dados mock na sandbox
- Log de requests/responses

lib/api/developer.service.ts:
- createSandboxKey(developerId) → ApiKey
- getSandboxData() → dados mock para teste
- submitPlugin(data) → SubmissionResult
- getSubmissionStatus(submissionId) → Status

Design: clean, técnico, com code blocks e syntax highlighting.
```

---

#### PROMPT P152: Documentação Final do Ecossistema

```
Crie documentação completa do ecossistema BlackBelt v2:
docs/ECOSYSTEM.md:
- Visão geral: plataforma + marketplace + app store
- Diagrama do ecossistema (mermaid)
- Como cada parte se conecta
- Revenue streams (assinaturas, marketplace, plugins, campeonatos)

docs/ARCHITECTURE_V3.md:
- Arquitetura completa atualizada (Fases 0-30)
- Diagrama de módulos
- Stack completa
- Integrações externas
- Decisões arquiteturais (ADRs adicionais)

docs/BUSINESS_MODEL.md:
- Modelo de negócio canvas
- Revenue streams detalhados
- Unit economics (CAC, LTV, Churn target)
- Pricing strategy (Free/Pro/Enterprise + marketplace + campeonatos)
- Go-to-market para cada segmento

Atualize CLAUDE.md com todos os novos padrões e services.
Atualize README.md com overview completo do ecossistema.

Rode: pnpm build && pnpm test && pnpm typecheck

FIM DO ROADMAP COMPLETO.
O BlackBelt v2 é agora um ecossistema completo de artes marciais:
152 prompts. 30 fases. Do zero ao ecossistema.
```

---

## Resumo Executivo — Fases 21-30

| Fase | Prompts | Deliverables | Dependência |
|------|---------|-------------|-------------|
| 21 - Video Intelligence | P103–P107 | Upload, player anotado, análise IA, biblioteca de técnicas | Fases 0–20 |
| 22 - Program Builder | P108–P112 | Currículo, planos de treino, periodização, avaliação física, coach IA | Fase 21 |
| 23 - Marketplace | P113–P117 | Loja de cursos, criação, reviews, split pagamento, certificados | Fase 22 |
| 24 - E-Commerce | P118–P122 | Loja, carrinho, checkout, pedidos, frete, recompensas | Fase 23 |
| 25 - Wearables & IoT | P123–P127 | Watch, saúde, catraca, proximidade, painel IoT | Fase 24 |
| 26 - Gamificação Pro | P128–P132 | Seasons, battle pass, ligas, títulos, recompensas reais | Fase 25 |
| 27 - Franquias | P133–P137 | Dashboard franqueador, padrões, royalties, expansão | Fase 26 |
| 28 - Competições | P138–P142 | Campeonatos, inscrição, arbitragem, live, ranking federativo | Fase 27 |
| 29 - IA Avançada | P143–P147 | Postura, personal IA, análise de luta, predição, voz | Fase 28 |
| 30 - Plataforma Aberta | P148–P152 | SDK, plugins, app store, developer portal, docs | Fase 29 |

---

> **152 prompts totais. 30 fases. Do zero ao ecossistema.**
> O BlackBelt não é mais um app. É onde artes marciais acontecem.
