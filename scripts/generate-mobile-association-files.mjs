import { mkdir, writeFile } from 'node:fs/promises';

const appleTeamId = process.env.APPLE_DEVELOPMENT_TEAM?.trim() || 'APPLE_TEAM_ID_REQUIRED';
const androidSha256 = process.env.ANDROID_RELEASE_SHA256?.trim() || 'ANDROID_RELEASE_SHA256_REQUIRED';
const bundleId = process.env.IOS_BUNDLE_ID?.trim() || 'app.blackbelt.academy';
const packageName = process.env.ANDROID_APPLICATION_ID?.trim() || 'app.blackbelt.academy';

const aasa = {
  applinks: {
    apps: [],
    details: [
      {
        appIDs: [`${appleTeamId}.${bundleId}`],
        paths: ['/auth/callback', '/redefinir-senha', '/convite/*', '/cadastro/*', '/verificar/*'],
      },
    ],
  },
  webcredentials: {
    apps: [`${appleTeamId}.${bundleId}`],
  },
};

const assetLinks = [
  {
    relation: ['delegate_permission/common.handle_all_urls'],
    target: {
      namespace: 'android_app',
      package_name: packageName,
      sha256_cert_fingerprints: [androidSha256],
    },
  },
];

await mkdir('public/.well-known', { recursive: true });
await writeFile('public/.well-known/apple-app-site-association', `${JSON.stringify(aasa, null, 2)}\n`, 'utf8');
await writeFile('public/.well-known/assetlinks.json', `${JSON.stringify(assetLinks, null, 2)}\n`, 'utf8');
