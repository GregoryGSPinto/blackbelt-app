import createNextIntlPlugin from 'next-intl/plugin';
import { withSentryConfig } from '@sentry/nextjs';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');
const isCapacitorStaticExport = process.env.CAPACITOR_STATIC_EXPORT === 'true';
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://blackbelt.com').replace(/\/$/, '');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  ...(isCapacitorStaticExport
    ? {
        output: 'export',
        trailingSlash: true,
      }
    : {}),
  webpack: (config) => {
    // Capacitor native-only plugins are not available in web builds.
    // They are always behind dynamic import() + isNative() guards,
    // so it's safe to stub them out for webpack.
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'capacitor-native-biometric': false,
    };
    return config;
  },
  images: {
    unoptimized: isCapacitorStaticExport,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.in',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/sobre',
        destination: `${siteUrl}/sobre`,
        permanent: false,
      },
      {
        source: '/blog',
        destination: `${siteUrl}/blog`,
        permanent: false,
      },
      {
        source: '/precos',
        destination: `${siteUrl}/precos`,
        permanent: false,
      },
      {
        source: '/beta-invite',
        destination: `${siteUrl}/beta-invite`,
        permanent: false,
      },
      {
        source: '/landing',
        destination: siteUrl,
        permanent: false,
      },
      {
        source: '/aula-experimental',
        destination: `${siteUrl}/aula-experimental`,
        permanent: false,
      },
    ];
  },
  ...(isCapacitorStaticExport
    ? {}
    : {
        async headers() {
          return [
            {
              source: '/(.*)',
              headers: [
                { key: 'X-Frame-Options', value: 'DENY' },
                { key: 'X-Content-Type-Options', value: 'nosniff' },
                { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                { key: 'X-XSS-Protection', value: '1; mode=block' },
                {
                  key: 'Strict-Transport-Security',
                  value: 'max-age=31536000; includeSubDomains',
                },
                {
                  key: 'Permissions-Policy',
                  value: 'camera=(), microphone=(), geolocation=()',
                },
                {
                  key: 'Content-Security-Policy',
                  value:
                    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.sentry.io https://*.b-cdn.net https://*.bunnycdn.com https://app.posthog.com https://*.posthog.com",
                },
              ],
            },
          ];
        },
      }),
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
