# BlackBelt — Monetization Justification
# Apple App Store Review Guideline 3.1.3(a)

## Business Model: SaaS B2B (Multi-tenant)

BlackBelt is a multi-tenant SaaS platform for martial arts academy management.

### Why In-App Purchase is NOT required:

1. **B2B Service**: The customer is the business (academy), not the consumer.
   Academy owners purchase subscriptions through our website to manage their business operations.

2. **Service consumed outside the app**: Core value is business management —
   classes, billing, student records, reports. These are operational tools, not digital content.

3. **Multi-user per subscription**: One academy subscription serves the owner,
   professors, receptionists, students, and parents. The subscription is tied
   to the business entity, not individual app users.

4. **No digital content delivered**: No ebooks, no streaming video, no downloadable
   content. The app is a management tool.

### Technical Implementation:
- Native app (iOS/Android): Opens to login screen. No pricing displayed.
- Web app (browser): Full landing page with pricing and signup flow.
- `PricingGuard` component wraps all pricing UI, renders nothing on native.
- Platform detection via `Capacitor.isNativePlatform()` + build-time env vars.

### Comparable Approved Apps:
- Mindbody (fitness business management)
- Glofox (gym management)
- Zen Planner (martial arts management)
- Slack (workplace SaaS)
- Salesforce (CRM SaaS)
- Monday.com (work management SaaS)

### App Store Connect Review Notes Template:
"BlackBelt is a B2B SaaS platform for martial arts academy management,
per Guideline 3.1.3(a). Subscriptions are purchased by academy owners
through our website (blackbelts.com.br). The app does not display
pricing or offer in-app purchases.
Demo: roberto@guerreiros.com / BlackBelt@2026 (Admin role)"

### Payment Processing:
- Processed via Asaas (Brazilian payment processor, Central Bank code 461)
- PIX, boleto and credit card
- The academy pays for business management, not content inside the app
- Similar to: Salesforce, HubSpot, Trello, Slack (all use external payment)
