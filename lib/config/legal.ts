const DEFAULT_APP_URL = 'https://blackbeltv2.vercel.app';
const DEFAULT_SUPPORT_EMAIL = 'suporte@blackbelt.app';
// TODO: Gregory — substituir por número real antes da submissão nas stores
const DEFAULT_SUPPORT_PHONE = '+55 11 99999-0000';

export function getPublicAppUrl(): string {
  const value = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!value) return DEFAULT_APP_URL;
  return value.replace(/\/$/, '');
}

export function getSupportEmail(): string {
  return process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || DEFAULT_SUPPORT_EMAIL;
}

export function getSupportPhone(): string {
  return process.env.NEXT_PUBLIC_SUPPORT_PHONE?.trim() || DEFAULT_SUPPORT_PHONE;
}

export function getPrivacyUrl(): string {
  return `${getPublicAppUrl()}/privacidade`;
}

export function getTermsUrl(): string {
  return `${getPublicAppUrl()}/termos`;
}

export function getSupportUrl(): string {
  return `${getPublicAppUrl()}/contato`;
}

export function getAccountDeletionUrl(): string {
  return `${getPublicAppUrl()}/excluir-conta`;
}
