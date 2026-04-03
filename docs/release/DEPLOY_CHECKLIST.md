# BlackBelt v2 — Deploy Checklist

## Infraestrutura
- [ ] Variáveis de ambiente configuradas (Vercel + GitHub Secrets)
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `NEXT_PUBLIC_USE_MOCK=false`
  - `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
  - `FCM_SERVER_KEY`
- [ ] Domínio customizado configurado (blackbeltv2.vercel.app)
- [ ] SSL ativo (automático no Vercel)
- [ ] DNS propagado e testado

## Backend (Supabase)
- [ ] Supabase em plano adequado (Pro ou superior)
- [ ] Migrações SQL aplicadas (001-070)
- [ ] Seed data removido (apenas em staging)
- [ ] RLS testado com usuários reais
- [ ] Edge Functions deployed e testadas
- [ ] Realtime habilitado nas tabelas necessárias
- [ ] Backup de banco configurado (automático no Supabase Pro)
- [ ] Point-in-time recovery habilitado

## Monitoramento
- [ ] Sentry conectado e testado
- [ ] Error tracking ativo para frontend e Edge Functions
- [ ] Performance monitoring configurado
- [ ] Alertas configurados (error rate, latency)

## Qualidade
- [ ] Build de produção sem warnings (`pnpm build`)
- [ ] Typecheck passando (`pnpm typecheck`)
- [ ] Testes passando (`pnpm test`)
- [ ] E2E tests passando (Cypress/Playwright)
- [ ] Lighthouse score > 90 em todas as métricas
- [ ] Bundle size < 150KB gzip (initial load)

## Mobile
- [ ] PWA testado em Chrome, Safari, Firefox
- [ ] Service Worker funcionando (offline fallback)
- [ ] Capacitor builds testados em devices reais
- [ ] App Store Connect configurado
- [ ] Google Play Console configurado
- [ ] Screenshots e metadata enviados
- [ ] App review submetido

## Segurança
- [ ] CORS configurado corretamente
- [ ] Rate limiting ativo nas Edge Functions
- [ ] Tokens JWT com expiração adequada
- [ ] Nenhum segredo exposto no frontend
- [ ] Content Security Policy headers configurados

## Go-Live
- [ ] Data de lançamento definida
- [ ] Email de notificação preparado para early adopters
- [ ] Plano de rollback documentado
- [ ] Equipe de suporte pronta
- [ ] Documentação do usuário disponível

---

**GO LIVE** 🚀
