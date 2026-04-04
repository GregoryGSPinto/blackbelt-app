# BLACKBELT APP — EXPORTAÇÃO ENTERPRISE: PDF + CSV + IMPORTAÇÃO
## Sistema de exportação nível enterprise com branding BlackBelt
## Data: 03/04/2026 | Repo: GregoryGSPinto/blackbelt-app

---

> **CONTEXTO:**
> O BlackBelt precisa de um sistema de exportação/importação enterprise:
>
> 1. **PDF Branded** — relatórios com header, footer, logo, tabelas estilizadas
> 2. **CSV Enterprise** — PapaParse, BOM, metadata, semicolon para Excel BR
> 3. **ExportButton** — componente reutilizável com dropdown CSV/PDF
> 4. **ImportWizard** — drag-drop, preview, validação, mapeamento automático
> 5. **Templates** — templates de importação para alunos, faturas, presenças
>
> **REGRAS:** NUNCA delete isMock(). CSS var(--bb-*). Toast PT-BR.

---

## BLOCO 01 — PDF EXPORTER COM BRANDING BLACKBELT ✅

**Arquivo:** `lib/export/pdf-exporter.ts`

- jsPDF + jspdf-autotable (já instalados)
- Header com logo BLACK+BELT, academia, data
- Barra vermelha #C62828 no topo
- Tabelas com header vermelho, linhas alternadas
- Footer com paginação, nota, link blackbelts.com.br
- Headers simplificados em páginas subsequentes
- Contagem de registros no final
- `exportToPDF()` — API completa com columns + options
- `quickExportPDF()` — API simplificada (auto-detect columns)

---

## BLOCO 02 — CSV EXPORTER ENTERPRISE ✅

**Arquivo:** `lib/export/csv-exporter.ts`

- PapaParse para geração robusta
- BOM para compatibilidade com Excel UTF-8
- Separador ponto-e-vírgula (padrão PT-BR)
- Metadata header (academia, data, total)
- `exportToCSV()` — API completa
- `quickExportCSV()` — API simplificada
- `parseCSVFile()` — parser robusto para importação

---

## BLOCO 03 — EXPORT BUTTON REUTILIZÁVEL ✅

**Arquivo:** `components/shared/ExportButton.tsx`

- Dropdown com opções CSV e PDF
- Ícones distintos por formato
- Loading state durante exportação
- Suporte a data lazy (function ou Promise)
- Tamanhos sm/md
- Auto-close em click fora ou Escape
- Modo single-format (sem dropdown)
- Segue design system var(--bb-*)

---

## BLOCO 04 — IMPORT WIZARD COM PREVIEW E VALIDAÇÃO ✅

**Arquivo:** `components/shared/ImportWizard.tsx`

### Wizard de 4 passos:
1. **Upload** — seleção de template + drag-drop de CSV
2. **Mapping** — mapeamento de colunas CSV → campos do sistema
3. **Preview** — validação com contadores e tabela de erros
4. **Result** — resultado da importação com detalhes

### Features:
- Drag & drop com visual feedback
- Auto-suggest de mapeamento por aliases
- Validação por campo (email, CPF, telefone, data, faixa)
- Transforms automáticos (dd/mm/yyyy → yyyy-mm-dd, faixa PT→EN)
- Preview de até 50 linhas com status visual
- Contadores de válidos/inválidos
- Detalhes de erros no resultado
- Navegação entre passos

---

## BLOCO 05 — TEMPLATES DE IMPORTAÇÃO ✅

**Arquivo:** `lib/export/import-templates.ts`

### 3 Templates:
1. **Alunos** — 14 campos (nome, email, telefone, CPF, nascimento, faixa, modalidade, turma, gênero, endereço, emergência, obs médicas, obs)
2. **Faturas** — 5 campos (email aluno, valor, vencimento, descrição, status)
3. **Presenças** — 4 campos (email aluno, turma, data, método)

### Validadores:
- Email — formato válido
- CPF — 11 dígitos, não repetidos
- Telefone — 10-11 dígitos
- Data — dd/mm/aaaa ou yyyy-mm-dd
- Faixa — aceita PT-BR e EN

### Auto-mapping:
- Confidence score 0-1
- Aliases em PT-BR e EN
- Evita mapeamento duplicado

---

## INTEGRAÇÃO — lib/utils/export.ts atualizado ✅

O arquivo original agora delega para os exporters enterprise:
- `exportToCSV()` → `csv-exporter.ts`
- `exportToPDF()` → `pdf-exporter.ts`
- `exportToExcel()` → CSV com semicolons (Excel-friendly)
- `exportToJSON()` — mantido como estava

---

## COMO USAR

### ExportButton (em qualquer página):
```tsx
import { ExportButton } from '@/components/shared/ExportButton';

<ExportButton
  data={students}
  columns={[
    { key: 'name', label: 'Nome' },
    { key: 'email', label: 'Email' },
    { key: 'belt', label: 'Faixa' },
  ]}
  title="Alunos"
  academyName="Guerreiros do Tatame"
/>
```

### ImportWizard:
```tsx
import { ImportWizard } from '@/components/shared/ImportWizard';

<ImportWizard
  open={showImport}
  onClose={() => setShowImport(false)}
  templateId="students"
  academyId={academyId}
  onImport={async ({ validRows }) => {
    // Insert into Supabase
    return { imported: validRows.length, skipped: 0, errors: [] };
  }}
/>
```

### Direct PDF export:
```tsx
import { exportToPDF } from '@/lib/export';

exportToPDF(data, columns, {
  title: 'Relatório de Presença',
  academyName: 'Guerreiros do Tatame',
  metadata: [{ label: 'Período', value: 'Março 2026' }],
  footerNote: 'Dados filtrados por turma BJJ Fundamentos',
});
```

---

## COMANDO DE RETOMADA

```
Retome a execução do prompt EXPORTAÇÃO SENIOR do BlackBelt App.
Verifique git log --oneline -5 e continue do próximo BLOCO.
Objetivo: PDF branded + CSV enterprise + ExportButton + ImportWizard.
NUNCA delete isMock().
```

---

## FIM DO PROMPT
