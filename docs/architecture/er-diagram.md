# BlackBelt v2 — Diagrama ER Completo

> 20 Entidades · 6 Módulos · Mermaid erDiagram
> Gerado a partir de BLACKBELT_V2_ROADMAP.md (fonte de verdade)

```mermaid
erDiagram

    %% ============================================================
    %% MÓDULO: IDENTITY
    %% Invariantes:
    %%   - User.email é único globalmente
    %%   - Um User pode ter N Profiles, mas só 1 por role por academy
    %% ============================================================

    User {
        string id PK
        string email UK "Único globalmente"
        string password_hash
        timestamp created_at
        timestamp updated_at
    }

    Profile {
        string id PK
        string user_id FK "→ User.id"
        string role "enum Role"
        string display_name
        string avatar
        timestamp created_at
        timestamp updated_at
    }

    User ||--o{ Profile : "tem N perfis"

    %% ============================================================
    %% MÓDULO: TENANT
    %% Invariantes:
    %%   - Academy.slug é único globalmente
    %%   - Todo dado do sistema pertence a uma Academy (multi-tenant)
    %%   - Uma Academy pode ter N unidades físicas (Unit)
    %% ============================================================

    Academy {
        string id PK
        string name
        string slug UK "Único globalmente"
        string plan_id FK "→ Plan.id"
        string owner_id FK "→ User.id"
        timestamp created_at
        timestamp updated_at
    }

    Unit {
        string id PK
        string academy_id FK "→ Academy.id"
        string name
        string address
        timestamp created_at
        timestamp updated_at
    }

    User ||--o{ Academy : "é owner de"
    Academy ||--o{ Unit : "tem N unidades"

    %% ============================================================
    %% MÓDULO: MEMBERSHIP
    %% Invariantes:
    %%   - Vincula Profile à Academy com role específico
    %%   - Status: active | inactive | suspended | pending
    %% ============================================================

    Membership {
        string id PK
        string profile_id FK "→ Profile.id"
        string academy_id FK "→ Academy.id"
        string role "enum Role"
        string status "enum MembershipStatus"
        timestamp created_at
        timestamp updated_at
    }

    Profile ||--o{ Membership : "vinculado a"
    Academy ||--o{ Membership : "contém"

    %% ============================================================
    %% MÓDULO: ENROLLMENT
    %% Invariantes:
    %%   - Student.belt só pode subir, NUNCA descer
    %%   - Teen/Kids OBRIGATÓRIO ter pelo menos 1 Guardian
    %%   - Guardian vincula guardian_profile (role=responsavel) ao Student
    %% ============================================================

    Student {
        string id PK
        string profile_id FK "→ Profile.id"
        string academy_id FK "→ Academy.id"
        string belt "enum BeltLevel"
        timestamp started_at
        timestamp created_at
        timestamp updated_at
    }

    Guardian {
        string id PK
        string guardian_profile_id FK "→ Profile.id (responsavel)"
        string student_id FK "→ Student.id"
        string relation "pai/mae/tutor/outro"
        timestamp created_at
        timestamp updated_at
    }

    Profile ||--o{ Student : "é aluno em"
    Academy ||--o{ Student : "matriculados"
    Profile ||--o{ Guardian : "é responsável"
    Student ||--o{ Guardian : "tem guardiões"

    %% ============================================================
    %% MÓDULO: CLASSES
    %% Invariantes:
    %%   - Modality.name é único por academy
    %%   - Professor só pode estar em 1 Class por horário (sem conflito)
    %%   - ClassEnrollment: aluno só se matricula se belt >= modality.belt_required
    %% ============================================================

    Modality {
        string id PK
        string academy_id FK "→ Academy.id"
        string name UK "Único por academy"
        string belt_required "enum BeltLevel"
        timestamp created_at
        timestamp updated_at
    }

    Class {
        string id PK
        string modality_id FK "→ Modality.id"
        string unit_id FK "→ Unit.id"
        string professor_id FK "→ Profile.id (professor)"
        json schedule "dias/horários"
        timestamp created_at
        timestamp updated_at
    }

    ClassEnrollment {
        string id PK
        string student_id FK "→ Student.id"
        string class_id FK "→ Class.id"
        string status "active/inactive"
        timestamp enrolled_at
        timestamp created_at
        timestamp updated_at
    }

    Academy ||--o{ Modality : "oferece"
    Modality ||--o{ Class : "tem turmas"
    Unit ||--o{ Class : "sedia"
    Profile ||--o{ Class : "professor leciona"
    Student ||--o{ ClassEnrollment : "se matricula"
    Class ||--o{ ClassEnrollment : "recebe alunos"

    %% ============================================================
    %% MÓDULO: ATTENDANCE
    %% Invariantes:
    %%   - Máximo 1 check-in por aluno por aula por dia
    %%   - Método: qr_code | manual | system
    %% ============================================================

    Attendance {
        string id PK
        string student_id FK "→ Student.id"
        string class_id FK "→ Class.id"
        timestamp checked_at
        string method "enum AttendanceMethod"
        timestamp created_at
        timestamp updated_at
    }

    Student ||--o{ Attendance : "registra presença"
    Class ||--o{ Attendance : "presença na aula"

    %% ============================================================
    %% MÓDULO: PEDAGOGIC
    %% Invariantes:
    %%   - Progression requer minimum attendance count para promoção
    %%   - Evaluation.score entre 0–100
    %%   - Professor só avalia aluno da própria turma
    %% ============================================================

    Progression {
        string id PK
        string student_id FK "→ Student.id"
        string evaluated_by FK "→ Profile.id (professor)"
        string from_belt "enum BeltLevel"
        string to_belt "enum BeltLevel"
        timestamp created_at
        timestamp updated_at
    }

    Evaluation {
        string id PK
        string student_id FK "→ Student.id"
        string class_id FK "→ Class.id"
        string criteria "enum EvaluationCriteria"
        int score "0–100"
        timestamp created_at
        timestamp updated_at
    }

    Student ||--o{ Progression : "evolui faixa"
    Profile ||--o{ Progression : "professor avalia"
    Student ||--o{ Evaluation : "é avaliado"
    Class ||--o{ Evaluation : "avaliação na turma"

    %% ============================================================
    %% MÓDULO: CONTENT
    %% Invariantes:
    %%   - Video.url é única
    %%   - Video.belt_level filtra visibilidade (aluno só vê se belt >= belt_level)
    %%   - Series.video_ids[] mantém ordem explícita
    %% ============================================================

    Video {
        string id PK
        string academy_id FK "→ Academy.id"
        string title
        string url UK "URL única"
        string belt_level "enum BeltLevel"
        int duration "segundos"
        timestamp created_at
        timestamp updated_at
    }

    Series {
        string id PK
        string academy_id FK "→ Academy.id"
        string title
        json video_ids "array ordenado de Video.id"
        timestamp created_at
        timestamp updated_at
    }

    Academy ||--o{ Video : "publica"
    Academy ||--o{ Series : "organiza"
    Series ||--o{ Video : "contém (ordenado)"

    %% ============================================================
    %% MÓDULO: SOCIAL
    %% Invariantes:
    %%   - Achievement: mesma achievement NÃO pode ser concedida 2x ao mesmo aluno
    %%   - Message: apenas professor↔aluno ou admin↔qualquer
    %% ============================================================

    Achievement {
        string id PK
        string student_id FK "→ Student.id"
        string type "enum AchievementType"
        timestamp granted_at
        string granted_by FK "→ Profile.id"
        timestamp created_at
        timestamp updated_at
    }

    Message {
        string id PK
        string from_id FK "→ Profile.id"
        string to_id FK "→ Profile.id"
        string content
        timestamp read_at "null = não lida"
        timestamp created_at
        timestamp updated_at
    }

    Student ||--o{ Achievement : "conquista"
    Profile ||--o{ Achievement : "concede"
    Profile ||--o{ Message : "envia"
    Profile ||--o{ Message : "recebe"

    %% ============================================================
    %% MÓDULO: FINANCIAL
    %% Invariantes:
    %%   - Plan.price > 0
    %%   - Plan.interval: monthly | quarterly | yearly
    %%   - Só 1 Subscription ativa por aluno por academy
    %%   - Invoice.amount é imutável após emissão
    %% ============================================================

    Plan {
        string id PK
        string academy_id FK "→ Academy.id"
        string name
        float price "deve ser maior que 0"
        string interval "monthly/quarterly/yearly"
        json features
        timestamp created_at
        timestamp updated_at
    }

    Subscription {
        string id PK
        string student_id FK "→ Student.id"
        string plan_id FK "→ Plan.id"
        string status "enum SubscriptionStatus"
        timestamp current_period_end
        timestamp created_at
        timestamp updated_at
    }

    Invoice {
        string id PK
        string subscription_id FK "→ Subscription.id"
        float amount "imutável após emissão"
        string status "enum InvoiceStatus"
        date due_date
        timestamp created_at
        timestamp updated_at
    }

    Academy ||--o{ Plan : "define planos"
    Student ||--o{ Subscription : "assina"
    Plan ||--o{ Subscription : "contratado em"
    Subscription ||--o{ Invoice : "gera faturas"
```

## Resumo de Cardinalidades

| Relação | Tipo | Descrição |
|---------|------|-----------|
| User → Profile | 1:N | Um user pode ter múltiplos perfis (1 por role por academy) |
| User → Academy | 1:N | Um user pode ser owner de múltiplas academias |
| Academy → Unit | 1:N | Uma academy pode ter N unidades físicas |
| Profile → Membership | 1:N | Um perfil pode ser membro de N academias |
| Academy → Membership | 1:N | Uma academy tem N membros |
| Profile → Student | 1:N | Um perfil pode ser aluno em N academias |
| Academy → Student | 1:N | Uma academy tem N alunos |
| Profile → Guardian | 1:N | Um perfil (responsável) cuida de N alunos |
| Student → Guardian | 1:N | Um aluno pode ter N guardiões |
| Academy → Modality | 1:N | Uma academy oferece N modalidades |
| Modality → Class | 1:N | Uma modalidade tem N turmas |
| Unit → Class | 1:N | Uma unidade sedia N turmas |
| Profile → Class | 1:N | Um professor leciona N turmas |
| Student → ClassEnrollment | 1:N | Um aluno se matricula em N turmas |
| Class → ClassEnrollment | 1:N | Uma turma recebe N alunos |
| Student → Attendance | 1:N | Um aluno tem N registros de presença |
| Class → Attendance | 1:N | Uma turma tem N registros de presença |
| Student → Progression | 1:N | Um aluno tem N progressões de faixa |
| Student → Evaluation | 1:N | Um aluno tem N avaliações |
| Class → Evaluation | 1:N | Uma turma tem N avaliações |
| Academy → Video | 1:N | Uma academy publica N vídeos |
| Academy → Series | 1:N | Uma academy organiza N séries |
| Series → Video | 1:N | Uma série contém N vídeos (ordem explícita) |
| Student → Achievement | 1:N | Um aluno conquista N achievements |
| Profile → Message | 1:N | Um perfil envia/recebe N mensagens |
| Academy → Plan | 1:N | Uma academy define N planos |
| Student → Subscription | 1:N | Um aluno tem N subscriptions (só 1 ativa) |
| Plan → Subscription | 1:N | Um plano é contratado N vezes |
| Subscription → Invoice | 1:N | Uma subscription gera N faturas |

## Invariantes por Módulo

### Identity
- `User.email` é único globalmente
- Um `User` pode ter N `Profiles`, mas apenas **1 por role por academy**

### Tenant
- `Academy.slug` é único globalmente — usado em URLs
- **Todo dado do sistema pertence a uma Academy** (isolamento multi-tenant)
- Uma `Academy` pode ter N `Units` (unidades físicas)

### Membership
- `Membership` vincula `Profile` à `Academy` com role específico
- Status: `active | inactive | suspended | pending`

### Enrollment
- `Student.belt` só pode **subir, NUNCA descer**
- Teen/Kids **obrigatório** ter pelo menos 1 `Guardian`
- `Guardian` vincula perfil com role `responsavel` ao `Student`

### Classes
- `Modality.name` é único por academy
- Professor só pode estar em **1 Class por horário** (sem conflito de grade)
- `ClassEnrollment`: aluno só se matricula se `student.belt >= modality.belt_required`

### Attendance
- Máximo **1 check-in por aluno por aula por dia** (unicidade composta)
- Método: `qr_code | manual | system`

### Pedagogic
- `Progression` requer **minimum attendance count** para promoção de faixa
- `Evaluation.score` entre **0–100**
- Professor **só avalia aluno da própria turma**

### Content
- `Video.url` é única
- `Video.belt_level` filtra visibilidade — aluno só vê se `belt >= belt_level`
- `Series.video_ids[]` mantém **ordem explícita** dos vídeos

### Social
- Mesma `Achievement` **NÃO pode ser concedida 2x** ao mesmo aluno (unicidade: student_id + type)
- `Message`: apenas **professor↔aluno** ou **admin↔qualquer** (validado por regra de negócio)

### Financial
- `Plan.price` deve ser **> 0**
- `Plan.interval`: `monthly | quarterly | yearly`
- Só **1 Subscription ativa** por aluno por academy
- `Invoice.amount` é **imutável após emissão**
