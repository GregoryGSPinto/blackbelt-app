# BlackBelt — Content Rating Guide

Data: 2026-03-29

## Apple App Store (App Store Connect)

### Age Rating Questionnaire Answers:
- Cartoon or Fantasy Violence: None
- Realistic Violence: None (martial arts is educational/sport, not violent content in the app)
- Sexual Content or Nudity: None
- Profanity or Crude Humor: None (profanity filter active on messaging)
- Alcohol, Tobacco, or Drug Use: None
- Simulated Gambling: None
- Horror/Fear Themes: None
- Mature/Suggestive Themes: None
- Medical/Treatment Information: None
- Unrestricted Web Access: No

**Expected Rating: 4+ or 9+**
Note: If Apple considers martial arts training videos as "Mild Realistic Violence", rating may be 12+.

### Made for Kids Declaration:
- App is NOT primarily made for kids
- App has content appropriate for all ages
- Kids mode has additional restrictions (no messaging, simplified UI)
- Parental consent required for kids accounts

### UGC Declaration (Guideline 1.2):
- Report mechanism: YES — `ReportButton` integrated in ChatView (spam, harassment, inappropriate content, hate speech, violence, other)
- Block mechanism: YES — `BlockUserButton` integrated in ChatView (blocks user + hides their messages)
- Profanity filter: YES — `filterProfanity()` applied server-side before message send
- Moderation: Content reports stored in `content_reports` table with status tracking

## Google Play (Play Console)

### IARC Questionnaire Answers:
- Violence: Mild (martial arts educational content — techniques, not combat footage)
- Sexuality: None
- Language: None (profanity filter active)
- Controlled Substance: None
- Gambling: None
- User Interaction: Yes — messaging between users
- Users can share info: Yes — messaging, video sharing within academy
- Users can purchase: No (in-app) — external B2B subscription
- Unrestricted Internet: No
- Location Sharing: No (optional proximity check-in only)

**Expected Rating: Everyone 10+ or Teen**

### Families Policy:
- App has a Kids profile for users under 13
- Kids profile is ISOLATED: no messaging, no social features, no advertising
- Parental consent is collected and verified
- Kids data handling follows COPPA and LGPD guidelines
- Analytics DISABLED for kids profiles (PostHog opted out, Sentry anonymous only)

### Data Safety Form notes:
- See `GOOGLE_DATA_SAFETY_FORM.md` for full data safety declarations
- Kids profile collects minimal data (name, belt, academy)
- No third-party SDKs active for kids profile

## Kids Isolation Verification (COPPA)

### What Kids CAN access:
- `/kids` — Dashboard (motivational messages, progress)
- `/kids/recompensas` — Stars/rewards
- `/kids/academia` — Learning content
- `/kids/conquistas` — Achievements
- `/kids/minha-faixa` — Belt progress
- `/kids/perfil` — Profile (view only)
- `/kids/configuracoes` — Settings

### What Kids CANNOT access:
- NO messaging (no `/kids/mensagens` route exists)
- NO chat (no ChatView component linked)
- NO social features (no user-to-user interaction)
- NO video upload (only professors upload)
- NO external links or web browsing

### How isolation is enforced:
1. **KidsShell.tsx** — Navigation only includes safe routes (Inicio, Estrelas, Aprender, Conquistas, Perfil, Config). No messaging icon, no chat link.
2. **Middleware** — Role `aluno_kids` is mapped to `/kids` prefix only. Attempting to access `/dashboard`, `/teen`, or any other prefix redirects back to `/kids`.
3. **Route structure** — No `/kids/mensagens` route exists. Even if accessed directly, middleware blocks it for non-kids roles and the route simply does not exist for kids.

## Teen Messaging Safety (13+)

### What protections are in place:
1. **Profanity filter** — `filterProfanity()` from `lib/utils/profanity-filter.ts` is applied to all outgoing messages in ChatView before sending
2. **Block user** — `BlockUserButton` from `components/shared/BlockUserButton.tsx` is available on every received message in ChatView
3. **Report user** — `ReportButton` from `components/shared/ReportButton.tsx` is available on every received message with multiple report categories
4. **Content reports** — All reports are stored in `content_reports` table with status tracking (pending/resolved)
5. **Role isolation** — Teen can only access `/teen/*` routes. Middleware enforces this.
6. **Contact scope** — `NewConversationModal` with `Role.AlunoTeen` scopes contacts appropriately within the academy

### Acceptable for 13+:
- COPPA does not apply to users 13+ (applies only to under-13)
- LGPD-equivalent protections still apply for minors under 18 in Brazil
- Messaging with profanity filter + block + report meets Apple Guideline 1.2 for 13+ users
- Teen cannot broadcast messages (canBroadcast={false} in ConversationList)
