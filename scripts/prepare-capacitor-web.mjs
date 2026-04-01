import { access, mkdir, writeFile } from 'node:fs/promises';
import { constants } from 'node:fs';

if (process.env.CAPACITOR_STATIC_EXPORT === 'true') {
  const requiredFiles = ['out/index.html', 'out/404.html'];

  for (const file of requiredFiles) {
    try {
      await access(file, constants.R_OK);
    } catch {
      throw new Error(`Capacitor static export missing required asset: ${file}`);
    }
  }
}

if (process.env.CAPACITOR_REMOTE_RUNTIME === 'true') {
  const publicAppUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://blackbeltv2.vercel.app').replace(/\/$/, '');
  const shell = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="theme-color" content="#0A0A0A" />
    <title>BlackBelt</title>
  </head>
  <body style="margin:0;background:#0A0A0A;color:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;display:grid;min-height:100vh;place-items:center">
    <main style="max-width:28rem;padding:2rem;text-align:center">
      <h1 style="margin:0 0 1rem">BlackBelt</h1>
      <p style="margin:0 0 1rem;color:rgba(255,255,255,.72)">Inicializando runtime web autenticado.</p>
      <p style="margin:0;color:rgba(255,255,255,.55)">Origem configurada: ${publicAppUrl}</p>
    </main>
  </body>
</html>
`;

  await mkdir('out', { recursive: true });
  await writeFile('out/index.html', shell, 'utf8');
  await writeFile('out/404.html', shell, 'utf8');
}
