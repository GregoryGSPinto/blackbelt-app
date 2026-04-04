export function emailLayout(content: string, ctaUrl?: string, ctaText?: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
body{margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}
.container{max-width:600px;margin:0 auto;background:#fff}
.header{background:#C62828;padding:24px;text-align:center}
.header h1{color:#fff;margin:0;font-size:24px}
.body{padding:32px 24px}
.body p{color:#333;line-height:1.6;margin:0 0 16px}
.cta{display:inline-block;background:#C62828;color:#fff;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:600;margin:16px 0}
.footer{padding:24px;text-align:center;background:#f5f5f5;font-size:12px;color:#999}
.footer a{color:#999}
</style></head>
<body><div class="container">
<div class="header"><h1>BlackBelt</h1></div>
<div class="body">${content}${ctaUrl ? `<p style="text-align:center"><a href="${ctaUrl}" class="cta">${ctaText ?? 'Acessar'}</a></p>` : ''}</div>
<div class="footer">
<p>BlackBelt — Gestão de Artes Marciais</p>
<p><a href="{{unsubscribeUrl}}">Cancelar inscrição</a></p>
</div>
</div></body></html>`;
}
