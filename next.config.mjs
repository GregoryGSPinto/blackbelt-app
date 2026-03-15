import createNextIntlPlugin from 'next-intl/plugin';
import { withSentryConfig } from '@sentry/nextjs';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

const intlConfig = withNextIntl(nextConfig);

// Only wrap with Sentry if auth token is available
const sentryConfig = process.env.SENTRY_AUTH_TOKEN
  ? withSentryConfig(intlConfig, {
      org: process.env.SENTRY_ORG || 'blackbelt',
      project: process.env.SENTRY_PROJECT || 'blackbelt',
      silent: true,
      hideSourceMaps: true,
    })
  : intlConfig;

export default sentryConfig;
