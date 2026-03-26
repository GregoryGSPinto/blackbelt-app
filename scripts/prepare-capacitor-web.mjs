import { mkdir, writeFile } from 'node:fs/promises';

const publicAppUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://blackbeltv2.vercel.app').replace(/\/$/, '');

const shell = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="theme-color" content="#0A0A0A" />
    <title>BlackBelt</title>
    <style>
      :root { color-scheme: dark; }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background:
          radial-gradient(circle at top, rgba(198, 40, 40, 0.18), transparent 40%),
          linear-gradient(180deg, #0a0a0a 0%, #121212 100%);
        color: #f5f5f5;
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif;
      }
      main {
        width: min(420px, calc(100vw - 32px));
        padding: 32px 24px;
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 28px;
        background: rgba(18,18,18,0.86);
        box-shadow: 0 24px 80px rgba(0,0,0,0.45);
        text-align: center;
      }
      .badge {
        display: inline-flex;
        padding: 6px 12px;
        border-radius: 999px;
        background: rgba(198, 40, 40, 0.18);
        color: #ff8a80;
        font-size: 12px;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        font-weight: 700;
      }
      h1 { margin: 18px 0 12px; font-size: 28px; }
      p { margin: 0; color: rgba(255,255,255,0.72); line-height: 1.6; }
      a {
        display: inline-flex;
        justify-content: center;
        margin-top: 20px;
        padding: 12px 18px;
        border-radius: 14px;
        background: linear-gradient(135deg, #c62828 0%, #ef5350 100%);
        color: #fff;
        text-decoration: none;
        font-weight: 700;
      }
    </style>
  </head>
  <body>
    <main>
      <span class="badge">BlackBelt Mobile</span>
      <h1>Abrindo o app</h1>
      <p>Se o carregamento remoto não iniciar automaticamente, toque no botão abaixo para continuar.</p>
      <a id="open-link" href="${publicAppUrl}">Abrir BlackBelt</a>
    </main>
    <script>
      const destination = "${publicAppUrl}" + window.location.pathname.replace(/^\\/index\\.html$/, '') + window.location.search + window.location.hash;
      const link = document.getElementById('open-link');
      if (link) link.href = destination;
      window.location.replace(destination);
    </script>
  </body>
</html>
`;

await mkdir('out', { recursive: true });
await writeFile('out/index.html', shell, 'utf8');
await writeFile('out/404.html', shell, 'utf8');
