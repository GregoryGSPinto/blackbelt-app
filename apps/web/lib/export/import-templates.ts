// ── BlackBelt Import Templates ─────────────────────────────────
// Field definitions, validation rules, and mapping suggestions
// for enterprise-grade CSV import with preview

// ── Types ─────────────────────────────────────────────────────

export interface ImportField {
  key: string;
  label: string;
  required: boolean;
  /** Aliases for auto-mapping CSV columns */
  aliases: string[];
  /** Validation function — returns error message or null */
  validate?: (value: string) => string | null;
  /** Transform value before insert */
  transform?: (value: string) => string;
}

export interface ImportTemplate {
  id: string;
  name: string;
  description: string;
  fields: ImportField[];
  /** Supabase table to insert into */
  table: string;
}

export interface FieldMapping {
  csvColumn: string;
  systemField: string;
  confidence: number; // 0–1
}

export interface ValidationResult {
  rowNumber: number;
  data: Record<string, string>;
  errors: string[];
  warnings: string[];
  valid: boolean;
}

// ── Validators ────────────────────────────────────────────────

function isValidEmail(v: string): string | null {
  if (!v) return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : 'Email inválido';
}

function isValidCPF(v: string): string | null {
  if (!v) return null;
  const digits = v.replace(/\D/g, '');
  if (digits.length !== 11) return 'CPF deve ter 11 dígitos';
  // Check if all digits are equal
  if (/^(\d)\1+$/.test(digits)) return 'CPF inválido';
  return null;
}

function isValidPhone(v: string): string | null {
  if (!v) return null;
  const digits = v.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 11) return 'Telefone inválido (10-11 dígitos)';
  return null;
}

function isValidDate(v: string): string | null {
  if (!v) return null;
  // Accept dd/mm/yyyy or yyyy-mm-dd
  const dateRegex = /^(\d{2}\/\d{2}\/\d{4}|\d{4}-\d{2}-\d{2})$/;
  if (!dateRegex.test(v)) return 'Data inválida (dd/mm/aaaa ou aaaa-mm-dd)';
  return null;
}

function isValidBelt(v: string): string | null {
  if (!v) return null;
  const valid = ['white', 'gray', 'yellow', 'orange', 'green', 'blue', 'purple', 'brown', 'black',
    'branca', 'cinza', 'amarela', 'laranja', 'verde', 'azul', 'roxa', 'marrom', 'preta'];
  return valid.includes(v.toLowerCase()) ? null : `Faixa inválida: ${v}`;
}

function normalizeDate(v: string): string {
  if (!v) return '';
  // dd/mm/yyyy → yyyy-mm-dd
  const brDate = v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (brDate) return `${brDate[3]}-${brDate[2]}-${brDate[1]}`;
  return v;
}

function normalizeBelt(v: string): string {
  if (!v) return 'white';
  const map: Record<string, string> = {
    branca: 'white', cinza: 'gray', amarela: 'yellow',
    laranja: 'orange', verde: 'green', azul: 'blue',
    roxa: 'purple', marrom: 'brown', preta: 'black',
  };
  return map[v.toLowerCase()] ?? v.toLowerCase();
}

function normalizeCPF(v: string): string {
  return v.replace(/\D/g, '');
}

function normalizePhone(v: string): string {
  return v.replace(/\D/g, '');
}

// ── Templates ─────────────────────────────────────────────────

const STUDENT_TEMPLATE: ImportTemplate = {
  id: 'students',
  name: 'Alunos',
  description: 'Importar alunos com dados pessoais, faixa e contato',
  table: 'students',
  fields: [
    {
      key: 'name',
      label: 'Nome Completo',
      required: true,
      aliases: ['nome', 'name', 'aluno', 'student', 'nome_completo', 'full_name', 'nome completo'],
    },
    {
      key: 'email',
      label: 'Email',
      required: true,
      aliases: ['email', 'e-mail', 'e_mail', 'correio'],
      validate: isValidEmail,
    },
    {
      key: 'phone',
      label: 'Telefone',
      required: false,
      aliases: ['telefone', 'phone', 'celular', 'tel', 'whatsapp', 'contato'],
      validate: isValidPhone,
      transform: normalizePhone,
    },
    {
      key: 'cpf',
      label: 'CPF',
      required: false,
      aliases: ['cpf', 'documento', 'document', 'doc'],
      validate: isValidCPF,
      transform: normalizeCPF,
    },
    {
      key: 'birth_date',
      label: 'Data de Nascimento',
      required: false,
      aliases: ['nascimento', 'birth', 'data_nascimento', 'birth_date', 'dt_nasc', 'data nascimento', 'aniversario'],
      validate: isValidDate,
      transform: normalizeDate,
    },
    {
      key: 'belt',
      label: 'Faixa',
      required: false,
      aliases: ['faixa', 'belt', 'graduacao', 'graduação', 'grad'],
      validate: isValidBelt,
      transform: normalizeBelt,
    },
    {
      key: 'modality',
      label: 'Modalidade',
      required: false,
      aliases: ['modalidade', 'modality', 'arte_marcial', 'arte marcial', 'estilo'],
    },
    {
      key: 'class_name',
      label: 'Turma',
      required: false,
      aliases: ['turma', 'class', 'classe', 'grupo', 'group'],
    },
    {
      key: 'gender',
      label: 'Gênero',
      required: false,
      aliases: ['genero', 'gênero', 'gender', 'sexo'],
    },
    {
      key: 'address',
      label: 'Endereço',
      required: false,
      aliases: ['endereco', 'endereço', 'address', 'logradouro'],
    },
    {
      key: 'emergency_contact',
      label: 'Contato de Emergência',
      required: false,
      aliases: ['emergencia', 'emergência', 'emergency', 'contato_emergencia'],
    },
    {
      key: 'emergency_phone',
      label: 'Telefone de Emergência',
      required: false,
      aliases: ['tel_emergencia', 'emergency_phone', 'fone_emergencia'],
      validate: isValidPhone,
      transform: normalizePhone,
    },
    {
      key: 'medical_notes',
      label: 'Observações Médicas',
      required: false,
      aliases: ['observacoes_medicas', 'medical', 'saude', 'medical_notes', 'obs_medicas'],
    },
    {
      key: 'notes',
      label: 'Observações',
      required: false,
      aliases: ['observacoes', 'observações', 'notes', 'obs', 'notas'],
    },
  ],
};

const FINANCIAL_TEMPLATE: ImportTemplate = {
  id: 'invoices',
  name: 'Faturas',
  description: 'Importar faturas/cobranças em lote',
  table: 'invoices',
  fields: [
    {
      key: 'student_email',
      label: 'Email do Aluno',
      required: true,
      aliases: ['email', 'aluno_email', 'student_email'],
      validate: isValidEmail,
    },
    {
      key: 'amount',
      label: 'Valor',
      required: true,
      aliases: ['valor', 'amount', 'preco', 'price', 'mensalidade'],
    },
    {
      key: 'due_date',
      label: 'Vencimento',
      required: true,
      aliases: ['vencimento', 'due_date', 'data_vencimento', 'dt_vencimento'],
      validate: isValidDate,
      transform: normalizeDate,
    },
    {
      key: 'description',
      label: 'Descrição',
      required: false,
      aliases: ['descricao', 'descrição', 'description', 'referencia'],
    },
    {
      key: 'status',
      label: 'Status',
      required: false,
      aliases: ['status', 'situacao', 'situação'],
    },
  ],
};

const ATTENDANCE_TEMPLATE: ImportTemplate = {
  id: 'attendance',
  name: 'Presenças',
  description: 'Importar registros de presença retroativos',
  table: 'attendance',
  fields: [
    {
      key: 'student_email',
      label: 'Email do Aluno',
      required: true,
      aliases: ['email', 'aluno_email', 'student_email'],
      validate: isValidEmail,
    },
    {
      key: 'class_name',
      label: 'Turma',
      required: true,
      aliases: ['turma', 'class', 'aula'],
    },
    {
      key: 'date',
      label: 'Data',
      required: true,
      aliases: ['data', 'date', 'dia'],
      validate: isValidDate,
      transform: normalizeDate,
    },
    {
      key: 'method',
      label: 'Método',
      required: false,
      aliases: ['metodo', 'método', 'method', 'tipo'],
    },
  ],
};

// ── Public API ─────────────────────────────────────────────────

export const IMPORT_TEMPLATES: ImportTemplate[] = [
  STUDENT_TEMPLATE,
  FINANCIAL_TEMPLATE,
  ATTENDANCE_TEMPLATE,
];

export function getTemplate(id: string): ImportTemplate | undefined {
  return IMPORT_TEMPLATES.find((t) => t.id === id);
}

// ── Auto-mapping ──────────────────────────────────────────────

export function suggestMappings(
  csvHeaders: string[],
  template: ImportTemplate,
): FieldMapping[] {
  const mappings: FieldMapping[] = [];

  for (const header of csvHeaders) {
    const lower = header.toLowerCase().trim();
    let bestMatch: { field: ImportField; confidence: number } | null = null;

    for (const field of template.fields) {
      // Exact match on key or label
      if (lower === field.key || lower === field.label.toLowerCase()) {
        bestMatch = { field, confidence: 1.0 };
        break;
      }

      // Alias match
      for (const alias of field.aliases) {
        if (lower === alias) {
          bestMatch = { field, confidence: 0.95 };
          break;
        }
        if (lower.includes(alias) || alias.includes(lower)) {
          const confidence = 0.7 + (0.2 * (Math.min(lower.length, alias.length) / Math.max(lower.length, alias.length)));
          if (!bestMatch || confidence > bestMatch.confidence) {
            bestMatch = { field, confidence };
          }
        }
      }
    }

    if (bestMatch && bestMatch.confidence >= 0.6) {
      // Avoid duplicate mappings
      if (!mappings.some((m) => m.systemField === bestMatch!.field.key)) {
        mappings.push({
          csvColumn: header,
          systemField: bestMatch.field.key,
          confidence: bestMatch.confidence,
        });
      }
    }
  }

  return mappings;
}

// ── Row Validation ────────────────────────────────────────────

export function validateRow(
  row: Record<string, string>,
  mappings: FieldMapping[],
  template: ImportTemplate,
): ValidationResult & { transformed: Record<string, string> } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const transformed: Record<string, string> = {};

  for (const field of template.fields) {
    const mapping = mappings.find((m) => m.systemField === field.key);
    const rawValue = mapping ? (row[mapping.csvColumn] ?? '').trim() : '';

    // Required check
    if (field.required && !rawValue) {
      errors.push(`${field.label} é obrigatório`);
      continue;
    }

    if (!rawValue) {
      transformed[field.key] = '';
      continue;
    }

    // Validation
    if (field.validate) {
      const error = field.validate(rawValue);
      if (error) {
        errors.push(`${field.label}: ${error}`);
        continue;
      }
    }

    // Transform
    transformed[field.key] = field.transform ? field.transform(rawValue) : rawValue;
  }

  // Low-confidence mapping warnings
  for (const mapping of mappings) {
    if (mapping.confidence < 0.8) {
      const field = template.fields.find((f) => f.key === mapping.systemField);
      if (field) {
        warnings.push(`"${mapping.csvColumn}" → "${field.label}" (confiança: ${Math.round(mapping.confidence * 100)}%)`);
      }
    }
  }

  return {
    rowNumber: 0, // set by caller
    data: row,
    errors,
    warnings,
    valid: errors.length === 0,
    transformed,
  };
}
