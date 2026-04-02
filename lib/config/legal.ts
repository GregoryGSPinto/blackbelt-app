import { getAppUrl } from '@/lib/config/domains';

const DEFAULT_SUPPORT_EMAIL = 'suporte@blackbelt.app';
const DEFAULT_SUPPORT_PHONE = '';

export function getPublicAppUrl(): string {
  return getAppUrl();
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
  return `${getPublicAppUrl()}/suporte`;
}

export function getAccountDeletionUrl(): string {
  return `${getPublicAppUrl()}/excluir-conta`;
}

export function getHelpUrl(): string {
  return `${getPublicAppUrl()}/ajuda`;
}

export function getStatusUrl(): string {
  return `${getPublicAppUrl()}/status`;
}
