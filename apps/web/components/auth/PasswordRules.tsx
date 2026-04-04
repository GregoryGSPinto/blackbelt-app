'use client';

import { CheckCircle2, XCircle } from 'lucide-react';

export interface PasswordRule {
  label: string;
  test: (pw: string) => boolean;
}

export const PASSWORD_RULES: PasswordRule[] = [
  { label: 'Minimo 8 caracteres', test: (pw) => pw.length >= 8 },
  { label: 'Uma letra maiuscula', test: (pw) => /[A-Z]/.test(pw) },
  { label: 'Um numero', test: (pw) => /\d/.test(pw) },
  {
    label: 'Um caractere especial (!@#$%&)',
    test: (pw) => /[!@#$%&*()_+\-=[\]{}|;:,.<>?]/.test(pw),
  },
];

export function getPasswordStrength(pw: string): number {
  if (!pw) return 0;
  return PASSWORD_RULES.reduce((score, rule) => score + (rule.test(pw) ? 1 : 0), 0);
}

export interface PasswordRulesProps {
  password: string;
}

export function PasswordRules({ password }: PasswordRulesProps) {
  return (
    <ul className="flex flex-col gap-1.5">
      {PASSWORD_RULES.map((rule) => {
        const passes = password.length > 0 && rule.test(password);
        return (
          <li key={rule.label} className="flex items-center gap-2 text-xs">
            {passes ? (
              <CheckCircle2
                className="h-4 w-4 flex-shrink-0"
                style={{ color: 'var(--bb-success)' }}
              />
            ) : (
              <XCircle
                className="h-4 w-4 flex-shrink-0"
                style={{ color: 'var(--bb-error)' }}
              />
            )}
            <span
              style={{
                color: passes ? 'var(--bb-success)' : 'var(--bb-ink-60)',
              }}
            >
              {rule.label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
PasswordRules.displayName = 'PasswordRules';
