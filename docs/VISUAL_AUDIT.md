# AUDITORIA VISUAL — BlackBelt App
Data: Fri Apr  3 00:04:41 -03 2026

## 1. FONTES
app/(admin)/admin/campeonatos/[id]/arbitragem/page.tsx:196:          <span className={`font-mono text-2xl font-bold ${timerSeconds <= 30 ? 'text-red-600' : 'text-bb-black'}`}>
app/(admin)/admin/conduta/sancoes/page.tsx:505:                  fontFamily: 'inherit',
app/(admin)/admin/conduta/sancoes/page.tsx:803:                      fontFamily: 'inherit',
app/(admin)/admin/conduta/template/page.tsx:321:                fontFamily: 'inherit',
app/(admin)/admin/conduta/template/page.tsx:397:                fontFamily: 'inherit',
app/(admin)/admin/conduta/template/page.tsx:608:                        fontFamily: 'inherit',
app/(admin)/admin/configuracoes/audit-log/page.tsx:110:                    <div><span className="text-bb-gray-500">IP:</span> <span className="font-mono">{log.ipAddress}</span></div>
app/(admin)/admin/configuracoes/marca/page.tsx:75:                    className="rounded-lg border border-bb-gray-300 px-3 py-2 text-sm font-mono"
app/(admin)/admin/configuracoes/marca/page.tsx:91:                    className="rounded-lg border border-bb-gray-300 px-3 py-2 text-sm font-mono"
app/(admin)/admin/configuracoes/pagamento/page.tsx:351:                  className="w-full px-3 py-2.5 pr-12 text-sm font-mono outline-none transition-colors"
app/(admin)/admin/configuracoes/pagamento/page.tsx:526:              className="mt-2 flex items-center gap-2 overflow-hidden px-3 py-2.5 font-mono text-xs"
app/(admin)/admin/contratos/page.tsx:862:                fontFamily: "Georgia, 'Times New Roman', serif",
app/(admin)/admin/error.tsx:21:          <p className="text-xs font-mono" style={{ color: 'var(--bb-ink-40)' }}>
app/(admin)/admin/estoque/page.tsx:221:                      className="font-mono text-sm font-bold"
app/(admin)/admin/estoque/page.tsx:230:                    <span className="font-mono text-sm" style={{ color: 'var(--bb-ink-60)' }}>{p.estoqueMinimo}</span>
app/(admin)/admin/estoque/page.tsx:360:                  <td className="px-3 py-2 text-right font-mono text-sm font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
app/(admin)/admin/indicar/page.tsx:50:          <code className="rounded-lg bg-white/20 px-4 py-2 font-mono text-lg">{stats.code}</code>
app/(admin)/admin/integracoes/webhooks/page.tsx:135:                        <span className="font-mono text-bb-gray-600">{d.event}</span>
app/(admin)/admin/loja/categorias/page.tsx:395:                className="w-full px-3 py-2 text-sm font-mono outline-none transition-colors"
app/(admin)/admin/loja/pedidos/page.tsx:184:                  <td className="px-4 py-3 font-mono text-xs font-medium text-bb-black">{order.id}</td>
app/(admin)/admin/loja/pedidos/page.tsx:295:                <p className="font-mono text-sm font-bold text-bb-black">{selectedOrder.tracking_code}</p>
app/(admin)/admin/loja/produtos/page.tsx:393:                          className="font-mono text-sm font-bold"
app/(admin)/admin/page.tsx:335:      <span className="w-24 text-right font-mono text-xs" style={{ color: 'var(--bb-ink-80)' }}>
app/(admin)/admin/page.tsx:830:                      <td className="px-4 py-2 font-mono text-sm font-semibold" style={{ color: 'var(--bb-brand)' }}>{aula.horario}</td>
app/(admin)/admin/page.tsx:895:                          <span className="font-mono text-sm font-semibold" style={{ color: '#F59E0B' }}>
app/(admin)/admin/pedagogico/page.tsx:751:                          <span className="w-16 text-right text-xs font-mono" style={{ color: 'var(--bb-ink-60)' }}>{pt.percentualConcluido}%</span>
app/(admin)/admin/perfil/page.tsx:229:            className="mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-xs font-medium uppercase"
app/(admin)/admin/plano/page.tsx:147:        <span className="text-sm font-mono font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
app/(admin)/admin/plano/page.tsx:459:          className="mb-4 font-mono text-xs uppercase tracking-widest"
app/(admin)/admin/plano/page.tsx:610:              className="mb-4 font-mono text-xs uppercase tracking-widest"
app/(admin)/admin/plano/page.tsx:624:                        className="px-3 py-2 text-left font-mono text-xs uppercase"
app/(admin)/admin/plano/page.tsx:642:                      <td className="px-3 py-3 font-mono" style={{ color: 'var(--bb-ink-80)' }}>
app/(admin)/admin/plano/page.tsx:678:                    <span className="text-xs font-mono" style={{ color: 'var(--bb-ink-80)' }}>
app/(admin)/admin/plano/page.tsx:708:          className="mb-4 font-mono text-xs uppercase tracking-widest"
app/(admin)/admin/plano/page.tsx:723:          className="mb-4 font-mono text-xs uppercase tracking-widest"
app/(admin)/admin/plano/page.tsx:737:                    className="px-3 py-2 text-left font-mono text-xs uppercase"
app/(admin)/admin/plano/page.tsx:754:                  <td className="px-3 py-3 font-mono font-semibold" style={{ color: 'var(--bb-ink-100)' }}>
app/(admin)/admin/plano/page.tsx:800:                <span className="text-sm font-mono font-bold" style={{ color: 'var(--bb-ink-100)' }}>
app/(admin)/admin/site/page.tsx:343:                  className="truncate text-sm font-mono font-medium"
app/(admin)/admin/site/page.tsx:425:                    className="flex items-center px-3 text-xs font-mono"
app/(admin)/admin/site/page.tsx:441:                    className="flex-1 px-3 py-2.5 text-sm font-mono outline-none transition-colors"
app/(admin)/admin/site/page.tsx:591:                    className="px-3 py-2.5 text-sm font-mono outline-none transition-colors"
app/(admin)/admin/site/page.tsx:622:                    className="px-3 py-2.5 text-sm font-mono outline-none transition-colors"
app/(auth)/error.tsx:21:          <p className="text-xs font-mono" style={{ color: 'var(--bb-ink-40)' }}>
app/(cockpit)/cockpit/cto/page.tsx:1058:                      className="text-xs font-mono"
app/(cockpit)/cockpit/cto/page.tsx:1361:                      className="text-xs font-mono w-40 sm:w-48 truncate shrink-0"
app/(cockpit)/cockpit/cto/page.tsx:1377:                      className="text-xs font-mono w-12 text-right shrink-0"
app/(cockpit)/cockpit/cto/page.tsx:1428:                    className="text-xs font-mono flex-1"
app/(cockpit)/cockpit/cto/page.tsx:748:                        className="text-xs font-mono"
app/(cockpit)/cockpit/cto/page.tsx:983:              className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none font-mono"
app/(cockpit)/cockpit/error.tsx:29:          <p className="text-xs font-mono" style={{ color: 'var(--bb-ink-3)' }}>
app/(franqueador)/franqueador/error.tsx:21:          <p className="text-xs font-mono" style={{ color: 'var(--bb-ink-40)' }}>
app/(kids)/kids/conteudo/page.tsx:126:      <div className="min-h-screen bg-[var(--bb-depth-1)] text-[var(--bb-ink-100)] pb-28" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
app/(kids)/kids/error.tsx:21:          <p className="text-xs font-mono" style={{ color: 'var(--bb-ink-40)' }}>
app/(main)/academia/[moduloId]/quiz/page.tsx:322:            <p className="mt-1 text-[10px] font-mono" style={{ color: 'var(--bb-ink-40)' }}>
app/(main)/analise-luta/[videoId]/page.tsx:169:                  <span className="flex-shrink-0 text-xs font-mono text-bb-gray-400 w-10">
app/(main)/analise-luta/[videoId]/page.tsx:243:                <span className="text-xs font-mono text-bb-gray-400">{formatTime(sub.timestamp_sec)}</span>
app/(main)/carrinho/page.tsx:104:                      className="w-8 text-center font-mono text-sm font-bold"
app/(main)/carteirinha/page.tsx:305:            <p className="mt-0.5 font-mono text-sm font-medium text-[var(--bb-ink-80)]">
app/(main)/certificados/page.tsx:112:                <p className="mt-1 font-mono text-[10px] text-bb-gray-400">{cert.verification_code}</p>
app/(main)/checkout/[planId]/page.tsx:121:                <p className="mt-1 break-all font-mono text-xs text-bb-black">{paymentLink.qrCode}</p>
app/(main)/checkout/[planId]/page.tsx:133:                <p className="mt-1 font-mono text-xs text-bb-black">{paymentLink.barCode}</p>
app/(main)/dashboard/conduta/page.tsx:278:              fontFamily: 'inherit',
app/(main)/dashboard/conduta/page.tsx:608:                  fontFamily: 'inherit',
app/(main)/dashboard/conduta/page.tsx:728:              fontFamily: 'inherit',
app/(main)/dashboard/conteudo/[id]/page.tsx:637:                  <span className="text-[11px] text-white/80 font-mono">{formatTime(currentTime)} / {formatTime(effectiveDuration)}</span>
app/(main)/dashboard/conteudo/[id]/page.tsx:776:                  <span className="font-mono text-[10px]">{ch.tempoFormatado}</span>
app/(main)/dashboard/contrato/page.tsx:301:              fontFamily: "Georgia, 'Times New Roman', serif",
app/(main)/dashboard/contrato/page.tsx:434:              fontFamily: "Georgia, 'Times New Roman', serif",
app/(main)/dashboard/contrato/page.tsx:545:              fontFamily: 'inherit',
app/(main)/dashboard/contrato/page.tsx:573:              fontFamily: 'inherit',
app/(main)/dashboard/page.tsx:360:                <span className="font-mono text-[var(--bb-ink-40)]">
app/(main)/dashboard/perfil/page.tsx:312:          <p className="text-xs font-semibold uppercase font-mono text-[var(--bb-ink-40)]">Plano Atual</p>
app/(main)/dashboard/perfil/page.tsx:612:        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider font-mono text-[var(--bb-ink-40)]">
app/(main)/error.tsx:21:          <p className="text-xs font-mono" style={{ color: 'var(--bb-ink-40)' }}>
app/(main)/loja/[id]/page.tsx:457:                className="flex h-10 w-12 items-center justify-center rounded-lg font-mono text-sm font-bold"
app/(main)/loja/pedidos/page.tsx:239:                        <span className="font-mono font-bold" style={{ color: 'var(--bb-brand)' }}>
app/(main)/pedidos/[id]/page.tsx:163:            <span className="font-mono text-xs text-bb-gray-500">{shipment.tracking_code}</span>
app/(network)/network/error.tsx:21:          <p className="text-xs font-mono" style={{ color: 'var(--bb-ink-40)' }}>
app/(parent)/parent/checkout/[planId]/page.tsx:130:              <p className="mt-1 break-all font-mono text-xs">{paymentLink.qrCode}</p>
app/(parent)/parent/checkout/[planId]/page.tsx:136:              <p className="mt-1 font-mono text-xs">{paymentLink.barCode}</p>
app/(parent)/parent/error.tsx:21:          <p className="text-xs font-mono" style={{ color: 'var(--bb-ink-40)' }}>
app/(parent)/parent/perfil/page.tsx:100:      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider font-mono text-[var(--bb-ink-40)]">
app/(parent)/parent/perfil/page.tsx:158:      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider font-mono text-[var(--bb-ink-40)]">
app/(parent)/parent/perfil/page.tsx:47:      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider font-mono text-[var(--bb-ink-40)]">
app/(professor)/professor/analise-luta/page.tsx:182:                  <span className="w-10 font-mono text-bb-gray-400">{formatTime(event.timestamp_sec)}</span>
app/(professor)/professor/analise-luta/page.tsx:208:                    <span className="flex-shrink-0 font-mono text-xs text-bb-gray-400">
app/(professor)/professor/conteudo/page.tsx:318:            <p className="mt-1 text-lg font-bold font-mono" style={{ color: 'var(--bb-ink-100)' }}>{s.value.toLocaleString()}</p>
app/(professor)/professor/conteudo/page.tsx:543:                        <span className="w-5 text-center text-xs font-mono font-bold" style={{ color: 'var(--bb-ink-40)' }}>
app/(professor)/professor/conteudo/page.tsx:768:            <p className="mt-1 text-lg font-bold font-mono" style={{ color: 'var(--bb-ink-100)' }}>{c.value}</p>
app/(professor)/professor/conteudo/page.tsx:777:          <h3 className="mb-3 font-mono text-xs uppercase" style={{ letterSpacing: '0.08em', color: 'var(--bb-ink-40)' }}>
app/(professor)/professor/conteudo/page.tsx:787:                <span className="text-xs font-mono" style={{ color: 'var(--bb-ink-60)' }}>
app/(professor)/professor/conteudo/page.tsx:800:            <h3 className="mb-3 font-mono text-xs uppercase" style={{ letterSpacing: '0.08em', color: '#F59E0B' }}>
app/(professor)/professor/duvidas/page.tsx:307:                    className="inline-block rounded-lg px-2 py-0.5 text-xs font-mono font-semibold"
app/(professor)/professor/error.tsx:21:          <p className="text-xs font-mono" style={{ color: 'var(--bb-ink-40)' }}>
app/(professor)/professor/perfil/page.tsx:208:            className="mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-xs font-medium uppercase"
app/(professor)/turma-ativa/page.tsx:209:            <p className="font-mono text-2xl font-bold tracking-wider text-bb-white">
app/(public-operational)/compete/[slug]/live/page.tsx:150:            <p className="text-sm font-mono font-bold" style={{ color: 'var(--bb-brand)' }}>
app/(public-operational)/developers/sandbox/page.tsx:207:                    className="w-full rounded-lg border border-bb-gray-200 bg-bb-gray-50 px-3 py-2 font-mono text-sm"
app/(public-operational)/developers/sandbox/page.tsx:216:                <div className="space-y-1 rounded-lg border border-bb-gray-200 bg-bb-gray-50 p-3 text-xs font-mono text-bb-gray-600">
app/(public-operational)/error.tsx:21:          <p className="text-xs font-mono" style={{ color: 'var(--bb-ink-40)' }}>
app/(public-operational)/g/[slug]/page.tsx:520:                        <td className="px-4 py-3 font-mono text-sm" style={{ color: primary }}>
app/(public-operational)/verificar/[code]/page.tsx:139:              <span className="font-mono text-xs text-[var(--bb-ink-40)]">
app/(public-operational)/verificar/[code]/page.tsx:76:            O codigo <strong className="font-mono">{code}</strong> nao corresponde a nenhum certificado valido na plataforma BlackBelt.
app/(recepcao)/recepcao/cadastro/page.tsx:460:              <p className="text-sm font-mono" style={{ color: 'var(--bb-ink-100)' }}>{result.loginTemporario.email}</p>
app/(recepcao)/recepcao/cadastro/page.tsx:461:              <p className="text-sm font-mono font-bold" style={{ color: '#10b981' }}>{result.loginTemporario.senhaTemporaria}</p>
app/(recepcao)/recepcao/error.tsx:21:          <p className="text-xs font-mono" style={{ color: 'var(--bb-ink-40)' }}>
app/(superadmin)/superadmin/auditoria/page.tsx:248:                      <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--bb-ink-40)' }}>{log.ipAddress}</td>
app/(superadmin)/superadmin/auditoria/page.tsx:341:                <p className="text-sm font-mono" style={{ color: 'var(--bb-ink-60)' }}>{selectedLog.entityId}</p>
app/(superadmin)/superadmin/auditoria/page.tsx:349:                <p className="text-sm font-mono" style={{ color: 'var(--bb-ink-60)' }}>{selectedLog.ipAddress}</p>
app/(superadmin)/superadmin/contratos/page.tsx:534:              fontFamily: 'monospace',
app/(superadmin)/superadmin/contratos/page.tsx:916:            fontFamily: "Georgia, 'Times New Roman', serif",
app/(superadmin)/superadmin/error.tsx:21:          <p className="text-xs font-mono" style={{ color: 'var(--bb-ink-40)' }}>
app/(superadmin)/superadmin/prospeccao/page.tsx:114:  fontFamily: 'var(--font-mono, monospace)',
app/(teen)/teen/conteudo/[id]/page.tsx:202:          <div className="absolute bottom-2 right-3 rounded-md px-2 py-0.5 text-xs font-mono text-white" style={{ background: 'rgba(0,0,0,0.6)' }}>{fmtTime(progress)} / {fmtTime(v.duracaoSegundos)}</div>
app/(teen)/teen/conteudo/[id]/page.tsx:357:          {comment.timestamp != null && <span className="mt-1 inline-block rounded-md px-1.5 py-0.5 text-[10px] font-mono" style={{ background: 'rgba(139,92,246,0.1)', color: '#8b5cf6' }}>[{fmtTime(comment.timestamp)}]</span>}
app/(teen)/teen/conteudo/[id]/page.tsx:378:          {duvida.timestamp != null && <span className="mt-1 inline-block rounded-md px-1.5 py-0.5 text-[10px] font-mono" style={{ background: 'rgba(139,92,246,0.1)', color: '#8b5cf6' }}>[{fmtTime(duvida.timestamp)}]</span>}
app/(teen)/teen/error.tsx:21:          <p className="text-xs font-mono" style={{ color: 'var(--bb-ink-40)' }}>
app/error.tsx:28:          <p className="text-xs font-mono" style={{ color: 'var(--bb-ink-40)' }}>
app/force-logout/page.tsx:76:        fontFamily: 'system-ui, sans-serif',
app/global-error.tsx:19:      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif' }}>
app/layout.tsx:2:import { Instrument_Sans, JetBrains_Mono, Outfit, Playfair_Display } from 'next/font/google';
app/layout.tsx:98:      <body className="min-h-screen bg-[var(--bb-depth-1)] font-sans text-[var(--bb-ink-100)] antialiased">
components/billing/UpsellCard.tsx:70:            className="text-2xl font-bold font-mono"
components/brand/BlackBeltLogo.tsx:38:        <text x="48" y="27" fontFamily="'Playfair Display', Georgia, serif" fontWeight="900" fontSize="22" fill={textColor} letterSpacing="1.5">BLACK</text>
components/brand/BlackBeltLogo.tsx:39:        <text x="122" y="27" fontFamily="'Playfair Display', Georgia, serif" fontWeight="900" fontSize="22" fill="#C62828" letterSpacing="1.5">BELT</text>
components/brand/BlackBeltLogo.tsx:53:      <text x="88" y="52" fontFamily="'Playfair Display', Georgia, serif" fontWeight="900" fontSize="42" fill={textColor} letterSpacing="3">BLACK</text>
components/brand/BlackBeltLogo.tsx:54:      <text x="232" y="52" fontFamily="'Playfair Display', Georgia, serif" fontWeight="900" fontSize="42" fill="#C62828" letterSpacing="3">BELT</text>
components/certificado/CertificadoTemplate.tsx:129:            <p className="mt-1 text-xs font-mono text-[var(--bb-ink-60)] break-all">
components/compete/BracketView.tsx:122:                  fontFamily="inherit"
components/compete/BracketView.tsx:214:                    fontFamily="inherit"
components/compete/BracketView.tsx:230:                    fontFamily="inherit"
components/compete/BracketView.tsx:248:                    fontFamily="inherit"
components/compete/BracketView.tsx:264:                    fontFamily="inherit"
components/compete/LiveScoreboard.tsx:245:              className="text-sm font-mono font-bold"
components/shared/ProfileSwitcher.tsx:82:            className="px-4 pb-1 pt-3 font-mono text-[11px] uppercase tracking-wider"
components/shared/TutorialSettings.tsx:28:        className="font-mono uppercase"
components/streaming/SeriesPlayer.tsx:348:              <span className="text-white/70 text-xs font-mono">
components/video/VideoLibrary.tsx:279:                  <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-xs font-mono text-white" style={{ background: 'rgba(0,0,0,0.7)' }}>
styles/globals.css:270:  font-family: var(--font-outfit), 'Outfit', system-ui, sans-serif;
tailwind.config.ts:38:      fontFamily: {

## 2. CORES HARDCODED (devem ser 0)
Total Tailwind colors hardcoded: 469

Hex colors not using var(--bb-*):
app/(network)/network/error.tsx:13:        <span className="text-2xl" role="img" aria-label="Aviso">&#9888;&#65039;</span>
app/(recepcao)/recepcao/caixa/page.tsx:41:    PIX: '#10b981', 'Cartao Credito': '#3b82f6', Dinheiro: '#eab308', 'Cartao Debito': '#8b5cf6',
app/(recepcao)/recepcao/caixa/page.tsx:43:  return map[metodo] ?? '#6b7280';
app/(recepcao)/recepcao/caixa/page.tsx:147:            <p className="text-[11px] font-medium uppercase tracking-wider" style={{ color: '#059669' }}>Total Recebido</p>
app/(recepcao)/recepcao/caixa/page.tsx:148:            <p className="text-lg font-extrabold" style={{ color: '#10b981' }}>{formatCurrency(data.totalRecebido)}</p>
app/(recepcao)/recepcao/caixa/page.tsx:151:            <p className="text-[11px] font-medium uppercase tracking-wider" style={{ color: '#a16207' }}>Pendente</p>
app/(recepcao)/recepcao/caixa/page.tsx:152:            <p className="text-lg font-extrabold" style={{ color: '#eab308' }}>{formatCurrency(data.totalPendente)}</p>
app/(recepcao)/recepcao/caixa/page.tsx:221:                <span className="text-right font-bold tabular-nums" style={{ color: '#10b981' }}>{formatCurrency(r.valor)}</span>
app/(recepcao)/recepcao/caixa/page.tsx:234:                <Card key={v.id} style={{ borderLeft: '3px solid #eab308' }}>
app/(recepcao)/recepcao/caixa/page.tsx:305:                <span style={{ color: diferenca === 0 ? '#10b981' : '#ef4444' }}>
app/(recepcao)/recepcao/experimentais/page.tsx:20:    agendada: { label: 'Agendada', bg: 'rgba(59,130,246,0.1)', color: '#3b82f6' },
app/(recepcao)/recepcao/experimentais/page.tsx:21:    confirmada: { label: 'Confirmada', bg: 'rgba(16,185,129,0.1)', color: '#10b981' },
app/(recepcao)/recepcao/experimentais/page.tsx:22:    chegou: { label: 'Chegou', bg: 'rgba(16,185,129,0.15)', color: '#059669' },
app/(recepcao)/recepcao/experimentais/page.tsx:23:    nao_veio: { label: 'Nao veio', bg: 'rgba(239,68,68,0.1)', color: '#ef4444' },
app/(recepcao)/recepcao/experimentais/page.tsx:24:    matriculou: { label: 'Matriculou', bg: 'rgba(16,185,129,0.2)', color: '#047857' },
app/(recepcao)/recepcao/experimentais/page.tsx:25:    follow_up: { label: 'Follow-up', bg: 'rgba(234,179,8,0.1)', color: '#a16207' },
app/(recepcao)/recepcao/experimentais/page.tsx:26:    desistiu: { label: 'Desistiu', bg: 'rgba(107,114,128,0.1)', color: '#6b7280' },
app/(recepcao)/recepcao/experimentais/page.tsx:131:        <Button size="sm" style={{ background: '#10b981' }} onClick={() => setAgendarOpen(true)}>
app/(recepcao)/recepcao/experimentais/page.tsx:139:          <span className="text-lg font-extrabold" style={{ color: '#3b82f6' }}>{funnel.agendadas}</span>
app/(recepcao)/recepcao/experimentais/page.tsx:144:          <span className="text-lg font-extrabold" style={{ color: '#10b981' }}>{funnel.vieram}</span>
app/(recepcao)/recepcao/experimentais/page.tsx:149:          <span className="text-lg font-extrabold" style={{ color: '#059669' }}>{funnel.matricularam}</span>
app/(recepcao)/recepcao/experimentais/page.tsx:153:          <span className="text-lg font-extrabold" style={{ color: '#10b981' }}>{funnel.conversao}%</span>
app/(recepcao)/recepcao/experimentais/page.tsx:191:                      <Button size="sm" style={{ background: '#10b981' }} onClick={() => handleChegou(exp.id)}>
app/(recepcao)/recepcao/experimentais/page.tsx:192:                        &#10003; Chegou!
app/(recepcao)/recepcao/experimentais/page.tsx:195:                        &#10007; Nao veio
app/(recepcao)/recepcao/experimentais/page.tsx:204:                      <Button size="sm" style={{ background: '#10b981' }} onClick={() => handleMatriculou(exp.id)}>
app/(recepcao)/recepcao/experimentais/page.tsx:217:                        &#10007; Desistiu
app/(recepcao)/recepcao/experimentais/page.tsx:222:                    <span className="text-xs font-semibold" style={{ color: '#10b981' }}>&#10003; Matriculado!</span>
app/(recepcao)/recepcao/experimentais/page.tsx:244:                <Card key={exp.id} style={{ borderLeft: '3px solid #eab308' }}>
app/(recepcao)/recepcao/experimentais/page.tsx:260:                      <Button size="sm" style={{ background: '#10b981' }} onClick={async () => {

## 3. EMOJIS EM COMPONENTES UI
app/(network)/network/page.tsx:150:                      icon="💰"
app/(recepcao)/recepcao/experimentais/page.tsx:100:      toast('Matricula registrada! 🎉', 'success');
app/(recepcao)/recepcao/experimentais/page.tsx:205:                        🎉 Matricular!
app/(recepcao)/recepcao/agenda/page.tsx:124:          icon="📅"
app/(recepcao)/recepcao/cadastro/page.tsx:20:  { id: 'bjj', label: 'BJJ', emoji: '🥋' },
app/(recepcao)/recepcao/cadastro/page.tsx:22:  { id: 'judo', label: 'Judo', emoji: '🏋️' },
app/(recepcao)/recepcao/cadastro/page.tsx:334:                  icon="🥋"
app/(recepcao)/recepcao/checkin/page.tsx:256:                <span className="text-lg">✅</span>
app/(recepcao)/recepcao/checkin/page.tsx:262:                <span className="text-lg">⚠️</span>
app/(recepcao)/recepcao/checkin/page.tsx:281:            {registrando ? 'Registrando...' : '✅ Registrar Entrada'}
app/(recepcao)/recepcao/page.tsx:240:            icon="📅"
app/(recepcao)/recepcao/page.tsx:309:            icon="✅"
app/(recepcao)/recepcao/cobrancas/page.tsx:122:          <p className="text-2xl">🎉</p>
app/(recepcao)/recepcao/cobrancas/page.tsx:153:                    📱 WhatsApp
app/(recepcao)/recepcao/cobrancas/page.tsx:160:                    💰 Registrar Pagamento
app/(franqueador)/franqueador/royalties/page.tsx:225:                        icon="💰"
app/(franqueador)/franqueador/comunicacao/page.tsx:220:              icon="📢"
app/(franqueador)/franqueador/comunicacao/page.tsx:282:              icon="🎓"
app/(franqueador)/franqueador/page.tsx:68:  if (!dashboard) return <EmptyState icon="📊" title="Nenhuma rede encontrada" description="Nao foi possivel encontrar sua rede de franquias. Verifique se voce tem acesso como franqueador." variant="first-time" />;
app/(franqueador)/franqueador/page.tsx:204:            icon="📊"
app/(kids)/kids/conquistas/page.tsx:27:  { id: 'ka-1', name: 'Primeiro Treino', icon: '🥋', stars_reward: 5, earned: true, earned_at: '2025-09-10', description: 'Fez o primeiro treino na academia!', color: '#22c55e' },
app/(kids)/kids/conquistas/page.tsx:29:  { id: 'ka-3', name: '10 Treinos', icon: '💪', stars_reward: 10, earned: true, earned_at: '2025-11-05', description: 'Participou de 10 treinos!', color: '#f97316' },
app/(kids)/kids/conquistas/page.tsx:30:  { id: 'ka-4', name: 'Estrela da Semana', icon: '🌟', stars_reward: 5, earned: true, earned_at: '2026-01-15', description: 'Ganhou mais estrelas na semana!', color: '#eab308' },
app/(kids)/kids/conquistas/page.tsx:31:  { id: 'ka-5', name: 'Faixa Cinza', icon: '🎯', stars_reward: 15, earned: true, earned_at: '2026-02-01', description: 'Conquistou a faixa cinza!', color: '#6b7280' },
app/(kids)/kids/conquistas/page.tsx:34:  { id: 'ka-8', name: '30 Treinos', icon: '🏋️', stars_reward: 15, earned: false, earned_at: null, description: 'Participe de 30 treinos!', color: '#14b8a6' },
app/(kids)/kids/conquistas/page.tsx:35:  { id: 'ka-9', name: 'Faixa Amarela', icon: '🥇', stars_reward: 20, earned: false, earned_at: null, description: 'Conquiste a faixa amarela!', color: '#facc15' },
app/(kids)/kids/conquistas/page.tsx:123:            <span className="text-3xl">⭐</span>
app/(kids)/kids/conquistas/page.tsx:133:            <span className="text-3xl">🎯</span>
app/(kids)/kids/conquistas/page.tsx:161:            { key: 'earned' as FilterType, label: 'Ganhas', emoji: '⭐' },
app/(kids)/kids/conquistas/page.tsx:208:                  +{ach.stars_reward} ⭐
app/(kids)/kids/conquistas/page.tsx:245:                <span className="text-lg">⭐</span>
app/(kids)/kids/recompensas/page.tsx:100:            Loja de Recompensas! ⭐
app/(kids)/kids/recompensas/page.tsx:103:            <span className="animate-pulse text-2xl">⭐</span>
app/(kids)/kids/recompensas/page.tsx:145:                  ⭐ {item.custoEstrelas} estrelas
app/(kids)/kids/recompensas/page.tsx:150:                    ✅ Você tem!
app/(kids)/kids/recompensas/page.tsx:161:                    Faltam {missing} ⭐
app/(kids)/kids/recompensas/page.tsx:193:                  <span className="text-lg">✅</span>
app/(kids)/kids/recompensas/page.tsx:202:          <span className="text-3xl">🌟</span>
app/(kids)/kids/recompensas/page.tsx:227:                Trocar ⭐ {confirmItem.custoEstrelas} por {confirmItem.nome}?
app/(kids)/kids/recompensas/page.tsx:230:                Você fica com ⭐{' '}
app/(kids)/kids/recompensas/page.tsx:262:                🎉
app/(kids)/kids/recompensas/page.tsx:280:                🌟
app/(kids)/kids/recompensas/page.tsx:290:              Parabéns! 🎉
app/(kids)/kids/conteudo/[id]/page.tsx:111:          <div className="text-5xl animate-bounce">🥋</div>
app/(kids)/kids/conteudo/[id]/page.tsx:161:            <span className="text-xl">⭐</span>
app/(kids)/kids/conteudo/[id]/page.tsx:234:              🎉
app/(kids)/kids/conteudo/[id]/page.tsx:307:                ⭐
app/(kids)/kids/conteudo/[id]/page.tsx:336:            {notaSalva ? '✅ Salvo!' : 'Salvar'}
app/(kids)/kids/conteudo/[id]/page.tsx:345:            { key: 'mais' as const, label: 'Mais aulas', icon: '🎯' },
app/(kids)/kids/conteudo/[id]/page.tsx:460:                      <span className="text-lg">✅</span>
app/(kids)/kids/conteudo/[id]/page.tsx:484:                      {rel.assistido ? '✅' : '▶️'}
app/(kids)/kids/conteudo/page.tsx:137:            <span className="text-4xl" style={{ animation: 'float 2s ease-in-out infinite' }}>⭐</span>
app/(kids)/kids/conteudo/page.tsx:150:            <p className="text-lg font-black">+2 ⭐</p>
app/(kids)/kids/conteudo/page.tsx:155:            <p className="text-lg font-black">+1 ⭐</p>
app/(kids)/kids/conteudo/page.tsx:160:            <p className="text-lg font-black">+5 ⭐</p>
app/(kids)/kids/conteudo/page.tsx:169:          <span className="text-2xl mr-1">🌟</span> Novas Aventuras!
app/(kids)/kids/conteudo/page.tsx:189:                      <span className="text-xs">⭐</span>
app/(kids)/kids/conteudo/page.tsx:213:                          {i < sWatched ? '⭐' : '☆'}
app/(kids)/kids/conteudo/page.tsx:256:                        <span className="text-xs">⭐</span>
app/(kids)/kids/conteudo/page.tsx:266:                          {i < sWatched ? '⭐' : '☆'}
app/(kids)/kids/conteudo/page.tsx:299:                      <span className="text-[10px]">⭐</span>
app/(kids)/kids/conteudo/page.tsx:318:                          {i < sWatched ? '⭐' : '☆'}
app/(kids)/kids/conteudo/page.tsx:352:                      <span className="text-[10px]">⭐</span>
app/(kids)/kids/conteudo/page.tsx:371:                          {i < sWatched ? '⭐' : '☆'}
app/(kids)/kids/figurinhas/page.tsx:101:            Meu Álbum! 🎯
app/(kids)/kids/figurinhas/page.tsx:311:                  Continue treinando! 💪
app/(kids)/kids/page.tsx:127:              <span className="text-5xl">🥋</span>
app/(kids)/kids/page.tsx:147:              <span className="animate-pulse text-2xl">⭐</span>
app/(kids)/kids/page.tsx:161:                <span className="text-3xl">🌟</span>
app/(kids)/kids/page.tsx:204:              <span className="text-2xl" style={{ animation: 'float 3s ease-in-out infinite' }}>🌟</span> Assistir Aventura!
app/(kids)/kids/page.tsx:221:                    <span>⭐</span><span>⭐</span>
app/(kids)/kids/page.tsx:285:              <span>🎯</span> Sua Faixa
app/(kids)/kids/academia/page.tsx:19:  requisitos: '🌟',
app/(kids)/kids/academia/page.tsx:21:  regras: '🎯',
app/(kids)/kids/academia/page.tsx:78:          {i < filledIcons ? '⭐' : '☆'}
app/(kids)/kids/academia/page.tsx:150:            <span className="animate-pulse text-3xl">⭐</span>
app/(kids)/kids/academia/page.tsx:178:              <span className="text-3xl">🏆</span>
app/(kids)/kids/academia/page.tsx:200:              const emoji = KIDS_EMOJI[modulo.categoria] ?? '🌟';
app/(kids)/kids/academia/page.tsx:227:                          {isLocked ? '🔮' : isComplete ? '🎉' : emoji}
app/(kids)/kids/academia/page.tsx:283:                          Vamos la! ⭐
app/(kids)/kids/academia/page.tsx:288:                          <span>🎉</span>
app/(cockpit)/cockpit/cpo/page.tsx:131:  if (status === 'concluido') return '✅';
app/(public-operational)/ranking/page.tsx:159:                        icon="🥋"
app/(public-operational)/ranking/page.tsx:225:                        icon="🏆"
app/(public-operational)/g/[slug]/page.tsx:160:      <div className="text-6xl mb-4">🥋</div>
app/(professor)/meus-cursos/page.tsx:62:          icon="🎓"
app/(professor)/professor/presenca/page.tsx:275:            icon="📝"
app/(professor)/professor/turmas/page.tsx:214:            icon="🥋"
app/(professor)/professor/avaliacao-fisica/page.tsx:121:          icon="📊"
app/(professor)/professor/duvidas/page.tsx:342:                  <span className="text-sm">✅</span>
app/(professor)/professor/analise-luta/page.tsx:34:  submission_attempt: '🎯', submission: '🏆', escape: '🏃', stand_up: '🧍', penalty: '🟡',
app/(teen)/teen/desafios/page.tsx:116:          <span className="text-6xl">🎯</span>
app/(teen)/teen/desafios/page.tsx:205:                      <span className="text-3xl">🎉</span>
app/(teen)/teen/conquistas/page.tsx:51:  { id: 'ach-1', name: 'Streak 7 dias', icon: '🔥', unlocked: true, unlocked_at: '2026-03-10', glow_color: '#f97316', description: 'Treine 7 dias seguidos sem faltar!', xp_reward: 200, category: 'streak' },
app/(teen)/teen/conquistas/page.tsx:52:  { id: 'ach-2', name: 'Faixa Laranja', icon: '🥋', unlocked: true, unlocked_at: '2026-02-15', glow_color: '#f59e0b', description: 'Alcance a graduacao de faixa laranja.', xp_reward: 500, category: 'faixa' },
app/(teen)/teen/conquistas/page.tsx:53:  { id: 'ach-3', name: '50 Aulas', icon: '💪', unlocked: true, unlocked_at: '2026-01-20', glow_color: '#10b981', description: 'Participe de 50 aulas na academia.', xp_reward: 300, category: 'treino' },
app/(teen)/teen/conquistas/page.tsx:54:  { id: 'ach-4', name: 'Top 3 Ranking', icon: '🏆', unlocked: true, unlocked_at: '2026-03-05', glow_color: '#eab308', description: 'Fique entre os 3 primeiros do ranking.', xp_reward: 400, category: 'competicao' },
app/(teen)/teen/conquistas/page.tsx:55:  { id: 'ach-5', name: 'Primeira Competicao', icon: '🥇', unlocked: false, unlocked_at: null, glow_color: '#6366f1', description: 'Participe da sua primeira competicao oficial.', xp_reward: 600, category: 'competicao' },
app/(teen)/teen/conquistas/page.tsx:56:  { id: 'ach-6', name: 'Streak 30 dias', icon: '⚡', unlocked: false, unlocked_at: null, glow_color: '#ef4444', description: 'Mantenha um streak de 30 dias consecutivos.', xp_reward: 800, category: 'streak' },
app/(teen)/teen/conquistas/page.tsx:57:  { id: 'ach-7', name: '100 Aulas', icon: '🎯', unlocked: false, unlocked_at: null, glow_color: '#22c55e', description: 'Participe de 100 aulas na academia.', xp_reward: 500, category: 'treino' },
app/(teen)/teen/conquistas/page.tsx:59:  { id: 'ach-9', name: 'Faixa Verde', icon: '🥋', unlocked: false, unlocked_at: null, glow_color: '#16a34a', description: 'Alcance a graduacao de faixa verde.', xp_reward: 700, category: 'faixa' },
app/(teen)/teen/conquistas/page.tsx:60:  { id: 'ach-10', name: 'Social Star', icon: '⭐', unlocked: true, unlocked_at: '2026-02-28', glow_color: '#a855f7', description: 'Receba 10 curtidas no feed da academia.', xp_reward: 150, category: 'social' },
app/(teen)/teen/ranking/page.tsx:35:const MEDAL_EMOJIS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };
app/(teen)/teen/ranking/page.tsx:97:          <span className="text-6xl">🏆</span>
app/(teen)/teen/ranking/page.tsx:183:                <span className="text-3xl">🥈</span>
app/(teen)/teen/ranking/page.tsx:204:                <span className="text-4xl">🥇</span>
app/(teen)/teen/ranking/page.tsx:222:                <span className="text-3xl">🥉</span>
app/(teen)/teen/turmas/page.tsx:38:    emoji: '🥋',
app/(teen)/teen/turmas/page.tsx:59:    emoji: '🏆',
app/(teen)/teen/conteudo/[id]/page.tsx:48:  { key: 'notas', label: 'Notas', icon: '📝' },
app/(teen)/teen/conteudo/[id]/page.tsx:167:  const handleQuizDone = useCallback(() => { setQuizDone(true); addXp(50, '🎯 Quiz!'); }, [addXp]);
app/(teen)/teen/conteudo/[id]/page.tsx:188:            <span className="text-base">⚡</span><span>{sessionXp} XP</span>
app/(teen)/teen/conteudo/[id]/page.tsx:211:            { onClick: () => setShowQuiz(true), icon: '🎯', label: data.quizCompletado ? 'DONE' : 'QUIZ', color: data.quizCompletado ? '#22c55e' : '#8b5cf6' },
app/(teen)/teen/conteudo/[id]/page.tsx:212:            { onClick: () => document.getElementById('rating-section')?.scrollIntoView({ behavior: 'smooth' }), icon: '⭐', label: soc.mediaAvaliacao.toFixed(1) },
app/(teen)/teen/conteudo/[id]/page.tsx:257:          <div className="mt-2 flex gap-1">{[1, 2, 3, 4, 5].map((s) => <button key={s} onClick={() => handleRate(s)} className="text-2xl active:scale-110">{s <= myRating ? '⭐' : '☆'}</button>)}</div>
app/(teen)/teen/conteudo/[id]/page.tsx:313:                {progress >= ch.tempo && <span className="text-sm">✅</span>}
app/(teen)/teen/conteudo/[id]/page.tsx:320:              <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-lg text-xl" style={{ background: 'linear-gradient(135deg, #1a1a2e, #0f3460)' }}>{rel.assistido ? '✅' : '▶️'}</div>
app/(teen)/teen/conteudo/[id]/page.tsx:329:            <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-bold">🎯 Quiz</h2><button onClick={() => { setShowQuiz(false); setQuizDone(false); }} className="text-xl" style={{ color: 'var(--bb-ink-40)' }}>&#10005;</button></div>
app/(teen)/teen/conteudo/[id]/page.tsx:330:            {quizDone ? (<div className="space-y-4 text-center"><p className="text-5xl">🎉</p><p className="text-xl font-bold" style={{ color: '#22c55e' }}>Mandou bem! +50 XP ganhos!</p><button onClick={() => { setShowQuiz(false); setQuizDone(false); setQuizAnswers([]); }} className="rounded-xl px-6 py-2 text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)' }}>Fechar</button></div>)
app/(teen)/teen/conteudo/[id]/page.tsx:379:          {duvida.respondida && duvida.resposta && (<div className="mt-2 rounded-lg p-2" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)' }}><p className="text-xs font-bold" style={{ color: '#22c55e' }}>✅ {duvida.resposta.professorNome}</p><p className="mt-0.5 text-sm" style={{ color: 'var(--bb-ink-80)' }}>{duvida.resposta.texto}</p></div>)}
app/(teen)/teen/conteudo/page.tsx:87:    { name: 'Sophia', videos: 15, emoji: '🥇' },
app/(teen)/teen/conteudo/page.tsx:88:    { name: 'Valentina', videos: 12, emoji: '🥈' },
app/(teen)/teen/conteudo/page.tsx:89:    { name: 'Lucas', videos: 8, emoji: '🥉' },
app/(teen)/teen/conteudo/page.tsx:94:    { icon: '🎯', label: 'Maratonista', desc: '5 vídeos em 1 dia', unlocked: false },
app/(teen)/teen/conteudo/page.tsx:126:          <span className="text-xl">🏆</span> Desafios da Semana
app/(teen)/teen/conteudo/page.tsx:204:          <span className="text-xl">🔥</span> Ranking da Turma
app/(teen)/teen/conteudo/page.tsx:286:            <span className="text-xl">🥋</span> Por Modalidade
app/(teen)/teen/conteudo/page.tsx:291:              const emoji = mod === 'BJJ' ? '🥋' : mod === 'Judô' ? '🏋️' : '🎯';
app/(teen)/teen/season/page.tsx:32:  bronze: '🥉',
app/(teen)/teen/season/page.tsx:33:  silver: '🥈',
app/(teen)/teen/season/page.tsx:34:  gold: '🥇',
app/(teen)/teen/season/page.tsx:309:              const medal = entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : null;
app/(teen)/teen/page.tsx:154:                <span className="animate-pulse text-4xl">🔥</span>
app/(teen)/teen/page.tsx:205:              <span>🏆</span> Ranking
app/(teen)/teen/page.tsx:210:                const medalEmojis: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };
app/(teen)/teen/page.tsx:252:                    🥋
app/(teen)/teen/academia/page.tsx:25:  saude: '💪',
app/(superadmin)/superadmin/planos/page.tsx:511:        <StatCard label="Ativos" value={String(activePlans)} icon="✅" />
app/(superadmin)/superadmin/planos/page.tsx:512:        <StatCard label="Mais Popular" value={popularPlan?.name ?? '-'} icon="⭐" />
app/(superadmin)/superadmin/planos/page.tsx:513:        <StatCard label="MRR Total" value={fmtBRL(totalMRR)} icon="💰" />
app/(superadmin)/superadmin/planos/page.tsx:544:                      ⭐
app/(superadmin)/superadmin/planos/page.tsx:618:                  {plan.is_popular && <span className="text-xs">⭐</span>}
app/(superadmin)/superadmin/usuarios/page.tsx:191:              <p>👤 {ROLES_LABELS[selectedUser.role]?.label || selectedUser.role}</p>
app/(superadmin)/superadmin/usuarios/page.tsx:192:              <p>📅 Cadastro: {new Date(selectedUser.createdAt).toLocaleDateString('pt-BR')}</p>
app/(superadmin)/superadmin/academias/[id]/page.tsx:157:          { label: 'Professores', value: `${academy.total_professors ?? 0}/${academy.max_professors}`, icon: '🎓', color: '#a855f7' },
app/(superadmin)/superadmin/academias/[id]/page.tsx:158:          { label: 'Turmas', value: String(academy.total_classes ?? 0), icon: '📅', color: '#f59e0b' },
app/(superadmin)/superadmin/academias/[id]/page.tsx:159:          { label: 'MRR', value: formatCurrency(academy.monthly_revenue ?? 0), icon: '💰', color: '#22c55e' },
app/(main)/desafios/page.tsx:11:const TYPE_ICON: Record<string, string> = { presenca: '📍', streak: '🔥', social: '👥', conteudo: '🎬', avaliacao: '📝' };
app/(main)/desafios/page.tsx:32:            icon="🎯"
app/(main)/liga/page.tsx:20:const RANK_EMOJI: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };
app/(main)/planos/page.tsx:66:          icon="💳"
app/(main)/personal-ai/page.tsx:21:  { label: 'Próxima aula', icon: '🥋', message: 'Qual minha próxima aula?' },
app/(main)/personal-ai/page.tsx:22:  { label: 'Dica de técnica', icon: '💡', message: 'Me dê uma dica de técnica' },
app/(main)/personal-ai/page.tsx:27:  { value: 'motivational', label: 'Motivacional', icon: '🔥' },
app/(main)/personal-ai/page.tsx:28:  { value: 'technical', label: 'Técnico', icon: '🎯' },
app/(main)/personal-ai/page.tsx:140:                <span className="text-xl">🥋</span>
app/(main)/personal-ai/page.tsx:150:              <span className="text-xl">🎯</span>
app/(main)/personal-ai/page.tsx:160:                <span className="text-xl">🏆</span>
app/(main)/personal-ai/page.tsx:184:              <span className="text-xl">🔥</span>
app/(main)/comunidade/page.tsx:27:  achievement: '🏆',
app/(main)/comunidade/page.tsx:28:  milestone: '🎯',
app/(main)/comunidade/page.tsx:30:  event: '📅',
app/(main)/comunidade/page.tsx:31:  coach_tip: '💡',
app/(main)/checkout/[planId]/page.tsx:94:                {opt.id === 'pix' ? '⚡' : opt.id === 'boleto' ? '📄' : '💳'}
app/(main)/recompensas/page.tsx:28:  experiencia: '🎯',
app/(main)/recompensas/page.tsx:31:  prioridade: '⚡',
app/(main)/torneios/page.tsx:43:          icon="🏆"
app/(main)/dashboard/conteudo/page.tsx:57:            🥋
app/(main)/dashboard/conteudo/page.tsx:352:        <span className="text-5xl mb-4">🥋</span>
app/(main)/dashboard/conteudo/page.tsx:526:            <span className="text-7xl opacity-20 select-none">🥋</span>
app/(main)/dashboard/page.tsx:455:                🥋
app/(main)/feed/page.tsx:11:const TYPE_ICON: Record<PostType, string> = { achievement: '🏆', class_photo: '📸', event: '📅', milestone: '🎯', coach_tip: '💡', promotion: '🥋' };
app/(main)/eventos/page.tsx:22:  graduacao: { icon: '🥋', label: 'Graduacao' },
app/(main)/eventos/page.tsx:23:  campeonato: { icon: '🏆', label: 'Campeonato' },
app/(main)/eventos/page.tsx:26:  social: { icon: '🎉', label: 'Social' },
app/(main)/eventos/page.tsx:27:  open_mat: { icon: '🥋', label: 'Open Mat' },
app/(main)/eventos/page.tsx:171:                        <span>📅 {formatEventDate(evento.date)}</span>
app/(main)/hall-da-fama/page.tsx:13:  streak: { icon: '🔥', color: 'text-orange-700', bgColor: 'bg-orange-50' },
app/(main)/hall-da-fama/page.tsx:14:  frequency: { icon: '📅', color: 'text-blue-700', bgColor: 'bg-blue-50' },
app/(main)/hall-da-fama/page.tsx:15:  promotion: { icon: '🥋', color: 'text-purple-700', bgColor: 'bg-purple-50' },
app/(main)/hall-da-fama/page.tsx:16:  xp: { icon: '⭐', color: 'text-yellow-700', bgColor: 'bg-yellow-50' },
app/(main)/hall-da-fama/page.tsx:18:  versatility: { icon: '🎯', color: 'text-green-700', bgColor: 'bg-green-50' },
app/(main)/hall-da-fama/page.tsx:19:  veteran: { icon: '🏛️', color: 'text-gray-700', bgColor: 'bg-gray-50' },
app/(main)/hall-da-fama/page.tsx:33:  const config = CATEGORY_CONFIG[record.category] ?? { icon: '🏆', color: 'text-bb-gray-700', bgColor: 'bg-bb-gray-50' };
app/(main)/hall-da-fama/page.tsx:51:              {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
app/(main)/hall-da-fama/page.tsx:125:        <span className="text-4xl">🏆</span>
app/(main)/hall-da-fama/page.tsx:136:            const config = CATEGORY_CONFIG[record.category] ?? { icon: '🏆', color: 'text-bb-gray-700', bgColor: 'bg-bb-gray-50' };
app/(main)/hall-da-fama/page.tsx:137:            const medals = ['🥇', '🥈', '🥉'];
app/(main)/hall-da-fama/page.tsx:178:          icon="🏆"
app/(main)/season/page.tsx:27:const RANK_EMOJI: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };
app/(main)/season/page.tsx:181:                    {i === 0 ? '🏆' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🎖️'}
app/(main)/analise-luta/[videoId]/page.tsx:20:  submission_attempt: '🎯',
app/(main)/analise-luta/[videoId]/page.tsx:21:  submission: '🏆',
app/(main)/certificados/page.tsx:12:const TYPE_ICON: Record<CertificateType, string> = { course: '📜', belt: '🥋', event: '🏆' };
app/(auth)/welcome/page.tsx:6:  { icon: '🥋', title: 'Sou Academia', desc: 'Criar minha academia no BlackBelt', href: '/cadastro' },
app/(auth)/welcome/page.tsx:7:  { icon: '👤', title: 'Sou Aluno', desc: 'Buscar minha academia e me matricular', href: '/buscar-academia' },
app/(auth)/cadastro/[token]/page.tsx:285:          <span className="text-3xl">🥋</span>
app/(parent)/parent/relatorios/page.tsx:395:          <p className="text-4xl">📊</p>
app/onboarding/page.tsx:185:          <span className="text-5xl">⚠️</span>
app/onboarding/page.tsx:205:          <span className="text-5xl">🎉</span>
app/(admin)/admin/convites/page.tsx:333:            { label: 'Ativos', value: stats.active, icon: '✅' },
app/(admin)/admin/convites/page.tsx:335:            { label: 'Este mes', value: stats.uses_this_month, icon: '📈' },
app/(admin)/admin/alunos/page.tsx:379:            <span className="text-4xl">🥋</span>
app/(admin)/admin/liga/page.tsx:124:                        ? ['🥇', '🥈', '🥉'][academy.rank - 1]
app/(admin)/admin/liga/page.tsx:170:              <span className="font-medium text-bb-black">{['🥇', '🥈', '🥉'][i]}</span> {prize}
app/(admin)/admin/comunicados/page.tsx:359:            <span className="text-4xl">📢</span>
app/(admin)/admin/pendencias/page.tsx:44:        <span className="text-4xl">🎉</span>
app/(admin)/admin/experimental/[id]/page.tsx:35:  registered: '📝', first_visit: '🏠', class_attended: '🥋', checkin: '✅',
app/(admin)/admin/experimental/[id]/page.tsx:36:  viewed_schedule: '📅', viewed_modality: '👁️', opened_app: '📱', watched_video: '🎬',
app/(admin)/admin/experimental/[id]/page.tsx:37:  met_professor: '🤝', received_belt: '🥋', feedback_given: '⭐', plan_viewed: '💰',
app/(admin)/admin/experimental/[id]/page.tsx:38:  conversion_started: '🚀', converted: '🎉', expired: '⏰', follow_up_call: '📞',
app/(admin)/admin/experimental/[id]/page.tsx:365:            {student.follow_up_done ? '✅ Follow-up realizado' : `📅 Agendado para ${student.follow_up_date}`}
app/(admin)/admin/presenca/page.tsx:217:            icon="📝"
app/(admin)/admin/royalties/page.tsx:142:                    icon="💰"
app/(admin)/admin/automacoes/page.tsx:17:  push: '📱',
app/(admin)/admin/automacoes/page.tsx:21:  in_app: '🔔',
app/(admin)/admin/automacoes/page.tsx:62:          icon="⚡"
app/(admin)/admin/leads/page.tsx:60:          icon="🎯"
app/(admin)/admin/crm/page.tsx:223:              {selectedLead.phone && <p>📱 {selectedLead.phone}</p>}
app/(admin)/admin/crm/page.tsx:225:              {selectedLead.modality && <p>🥋 {selectedLead.modality}</p>}
app/(admin)/admin/crm/page.tsx:227:              {selectedLead.experimental_date && <p>📅 Experimental: {selectedLead.experimental_date}</p>}
app/(admin)/admin/wizard/page.tsx:29:  { title: 'Modalidades', subtitle: 'Selecione as artes marciais oferecidas.', icon: '🥋' },
app/(admin)/admin/wizard/page.tsx:31:  { title: 'Planos e preços', subtitle: 'Configure os planos de mensalidade.', icon: '💰' },
app/(admin)/admin/wizard/page.tsx:32:  { title: 'Turmas e horários', subtitle: 'Crie turmas e defina a grade horária.', icon: '📅' },
app/(admin)/admin/torneios/page.tsx:41:          icon="🏆"
app/(admin)/admin/loja/categorias/page.tsx:406:                  placeholder="🥋"
app/(admin)/admin/gamificacao/page.tsx:32:  { id: 'b1', nome: 'Primeira Aula', descricao: 'Completou sua primeira aula', icone: '🥋', criterio: 'Registrar primeira presença', xp: 10, ativo: true },
app/(admin)/admin/gamificacao/page.tsx:33:  { id: 'b2', nome: 'Semana Completa', descricao: 'Treinou todos os dias da semana', icone: '🔥', criterio: '5+ presenças em 7 dias', xp: 50, ativo: true },
app/(admin)/admin/gamificacao/page.tsx:34:  { id: 'b3', nome: 'Mês de Ferro', descricao: 'Não faltou nenhum treino no mês', icone: '💪', criterio: '20+ presenças no mês', xp: 100, ativo: true },
app/(admin)/admin/gamificacao/page.tsx:35:  { id: 'b4', nome: 'Centurião', descricao: 'Completou 100 treinos', icone: '⚡', criterio: '100 presenças totais', xp: 200, ativo: true },
app/(admin)/admin/gamificacao/page.tsx:36:  { id: 'b5', nome: 'Embaixador', descricao: 'Indicou 3 amigos que matricularam', icone: '🌟', criterio: '3 indicações convertidas', xp: 150, ativo: true },
app/(admin)/admin/gamificacao/page.tsx:39:  { id: 'b8', nome: 'Social', descricao: 'Participou de 3 eventos da academia', icone: '🎉', criterio: '3 participações em eventos', xp: 60, ativo: false },
app/(admin)/admin/gamificacao/page.tsx:68:  const [novoIcone, setNovoIcone] = useState('🏆');
app/(admin)/admin/gamificacao/page.tsx:183:                {aluno.posicao <= 3 ? ['🥇', '🥈', '🥉'][aluno.posicao - 1] : `#${aluno.posicao}`}
app/(admin)/admin/analytics/page.tsx:90:                <td className="px-4 py-3 text-center">{s.frequency_trend === 'declining' ? '📉' : s.frequency_trend === 'improving' ? '📈' : '➡️'}</td>
components/settings/ProfileSettingsPage.tsx:35:const KIDS_EMOJI_OPTIONS = ['🥋', '🐉', '🦁', '🐯', '🦊', '🐼', '🦸', '🏆', '⭐', '🔥', '💪', '🎯', '🛡️', '🌟', '🎨', '🚀'];
components/settings/ProfileSettingsPage.tsx:98:            {data.favorite_emoji ?? '🥋'}
components/settings/ProfileSettingsPage.tsx:198:          <p className="text-3xl">{data.favorite_emoji ?? '⭐'}</p>
components/landing/DashboardMockup.tsx:22:        <KPICard label="Receita" value="R$ 15.800" trend="+12% vs anterior" icon="💰" />
components/landing/DashboardMockup.tsx:23:        <KPICard label="Presença" value="87%" trend="Acima da média" icon="📊" />
components/landing/DashboardMockup.tsx:24:        <KPICard label="Turmas Hoje" value="3" trend="Próxima às 19h" icon="🥋" />
components/tutorial/TutorialComplete.tsx:79:            <span className="text-5xl">🎉</span>
components/tutorial/TutorialComplete.tsx:132:              💡 Pode refazer o tutorial em Configurações
components/shell/KidsShell.tsx:187:                  🥋 BlackBelt Kids
components/trial/TrialBanner.tsx:54:        <span className="text-lg">{isUrgent ? '⚠️' : '⏳'}</span>
components/admin/StudentTimeline.tsx:28:  matricula: { icon: '📝', color: 'var(--bb-brand)' },
components/admin/StudentTimeline.tsx:29:  presenca: { icon: '✅', color: '#16a34a' },
components/admin/StudentTimeline.tsx:30:  graduacao: { icon: '🥋', color: '#9333ea' },
components/admin/StudentTimeline.tsx:31:  pagamento: { icon: '💰', color: '#eab308' },
components/admin/StudentTimeline.tsx:32:  competicao: { icon: '🏆', color: '#ea580c' },
components/admin/StudentTimeline.tsx:33:  comunicado: { icon: '📢', color: '#2563eb' },
components/admin/StudentTimeline.tsx:51:    { id: 't-1', type: 'matricula' as const, date: '2025-01-15', title: 'Matricula realizada', description: 'BJJ Kids — Turma Seg/Qua 16h', icon: '📝', color: 'var(--bb-brand)' },
components/admin/StudentTimeline.tsx:52:    { id: 't-2', type: 'presenca' as const, date: '2025-02-01', title: '8 presencas em Fevereiro', description: 'Frequencia: 80%', icon: '✅', color: '#16a34a' },
components/admin/StudentTimeline.tsx:53:    { id: 't-3', type: 'graduacao' as const, date: '2025-03-10', title: 'Graduacao: Faixa Cinza', description: 'Promovido pelo Prof. Carlos', icon: '🥋', color: '#9333ea' },
components/admin/StudentTimeline.tsx:54:    { id: 't-4', type: 'pagamento' as const, date: '2025-03-08', title: 'Pagamento recebido — R$ 149', description: 'Ref: Marco/2025', icon: '💰', color: '#eab308' },
components/admin/StudentTimeline.tsx:55:    { id: 't-5', type: 'presenca' as const, date: '2025-03-31', title: '10 presencas em Marco', description: 'Frequencia: 100%', icon: '✅', color: '#16a34a' },
components/admin/StudentTimeline.tsx:57:    { id: 't-7', type: 'competicao' as const, date: '2025-04-20', title: 'Campeonato Regional Kids', description: 'Medalha de ouro — categoria -30kg', icon: '🏆', color: '#ea580c' },
components/admin/StudentTimeline.tsx:58:    { id: 't-8', type: 'pagamento' as const, date: '2025-04-10', title: 'Pagamento recebido — R$ 149', description: 'Ref: Abril/2025', icon: '💰', color: '#eab308' },
components/admin/StudentTimeline.tsx:60:    { id: 't-10', type: 'graduacao' as const, date: '2025-06-15', title: 'Graduacao: Faixa Amarela', description: 'Promovido pelo Prof. Carlos', icon: '🥋', color: '#9333ea' },
components/shared/NotificationsDropdown.tsx:135:                      <span className="text-sm">{'🔔'}</span>
components/shared/DayRecap.tsx:73:      return `✅ Presente no ${d.className}! 🔥 Streak ${d.streak}. ${d.beltProgress}% para faixa ${d.nextBelt}.`;
components/shared/DayRecap.tsx:77:      return `+${d.xpGained} XP. Streak ${d.streak}. Desafio ${d.progress}/${d.target}. Subiu p/ #${d.rank}! 🎉`;
components/shared/DayRecap.tsx:81:      return `${d.childName} treinou ✅. ${d.otherChild} sem aula. Amanhã: ${d.tomorrow}.`;
components/shared/QuickActions.tsx:23:    { key: 'riscos', icon: '📊', label: 'Riscos' },
components/shared/QuickActions.tsx:24:    { key: 'cobrancas', icon: '💰', label: 'Cobranças' },
components/shared/QuickActions.tsx:25:    { key: 'leads', icon: '📱', label: 'Leads' },
components/shared/QuickActions.tsx:26:    { key: 'comunicado', icon: '📢', label: 'Comunicado' },
components/shared/QuickActions.tsx:29:    { key: 'aula', icon: '🥋', label: 'Aula' },
components/shared/QuickActions.tsx:30:    { key: 'avaliar', icon: '📝', label: 'Avaliar' },
components/shared/QuickActions.tsx:32:    { key: 'turma', icon: '📊', label: 'Turma' },
components/shared/QuickActions.tsx:35:    { key: 'checkin', icon: '✅', label: 'Check-in' },
components/shared/QuickActions.tsx:37:    { key: 'ranking', icon: '🏆', label: 'Ranking' },
components/shared/QuickActions.tsx:38:    { key: 'agenda', icon: '📅', label: 'Agenda' },
components/shared/QuickActions.tsx:41:    { key: 'checkin', icon: '✅', label: 'Check-in' },
components/shared/QuickActions.tsx:42:    { key: 'desafio', icon: '🏆', label: 'Desafio' },
components/shared/QuickActions.tsx:47:    { key: 'estrelas', icon: '⭐', label: 'Estrelas' },
components/shared/QuickActions.tsx:48:    { key: 'aula', icon: '🥋', label: 'Aula' },
components/shared/QuickActions.tsx:54:    { key: 'pagamentos', icon: '💰', label: 'Pagamentos' },
components/shared/QuickActions.tsx:55:    { key: 'agenda', icon: '📅', label: 'Agenda' },
components/shared/StatusDoDia.tsx:77:      return `🟢 Academia saudável · ${d.classesToday} aulas hoje · ${d.expectedStudents} esperados · ⚠️ ${d.risks} risco(s)`;
components/shared/StatusDoDia.tsx:81:      return `🥋 Hoje: ${d.classesToday} aulas · ${d.totalStudents} alunos · Primeira às ${d.nextClassTime} · 💬 ${d.unreadMessages} não lidas`;
components/shared/StatusDoDia.tsx:85:      return `🥋 ${d.nextClass} às ${d.nextTime} (em ${d.timeLeft}) · 🔥 ${d.streak} dias · 📺 ${d.newVideos} vídeos`;
components/shared/StatusDoDia.tsx:89:      return `🎮 Level ${d.level} · #${d.rank} ranking · 🏆 ${d.challengeProgress} desafio · 🔥 ${d.streak} dias`;
components/shared/StatusDoDia.tsx:93:      return `⭐ ${d.stars} estrelas! · 🥋 Aula ${d.nextDay} ${d.nextTime} · 🎁 ${d.starsToNext} p/ próximo prêmio`;
components/streaming/SeriesPlayer.tsx:295:          <span className="text-7xl mb-6 select-none">🥋</span>
components/streaming/SeriesPlayer.tsx:520:                    <span className="text-lg">📝</span>
components/streaming/SeriesPlayer.tsx:592:                      ? '🏆'
components/streaming/SeriesPlayer.tsx:665:            <div className="text-6xl mb-4">🎉</div>
components/ai/VoiceAssistant.tsx:15:  next_exercise: '🏋️',
components/ai/VoiceAssistant.tsx:18:  register_attendance: '✅',
components/ai/VoiceAssistant.tsx:19:  next_training: '📅',
components/ai/VoiceAssistant.tsx:20:  match_result: '🥋',

## 4. LOADING STATES
app/(network)/network/loading.tsx:3:export default function NetworkLoading() {
app/(network)/network/page.tsx:5:import { Spinner } from '@/components/ui/Spinner';
app/(network)/network/page.tsx:15:  const [loading, setLoading] = useState(true);
app/(network)/network/page.tsx:30:      setLoading(false);
app/(network)/network/page.tsx:41:  if (loading || !dashboard || !financials) return <div className="flex justify-center py-20"><Spinner /></div>;
app/(recepcao)/recepcao/caixa/page.tsx:52:  const [loading, setLoading] = useState(true);
app/(recepcao)/recepcao/caixa/page.tsx:61:  const [novoLoading, setNovoLoading] = useState(false);
app/(recepcao)/recepcao/caixa/page.tsx:76:        if (!cancelled) setLoading(false);
app/(recepcao)/recepcao/caixa/page.tsx:84:    setNovoLoading(true);
app/(recepcao)/recepcao/caixa/page.tsx:99:      setNovoLoading(false);
app/(recepcao)/recepcao/caixa/page.tsx:108:  // ── Loading ───────────────────────────────────────────────────────
app/(recepcao)/recepcao/caixa/page.tsx:284:              <Button style={{ background: 'var(--bb-success)' }} onClick={handleNovoRecebimento} loading={novoLoading} disabled={!novoAluno || !novoValor || novoLoading}>
app/(recepcao)/recepcao/experimentais/page.tsx:37:  const [loading, setLoading] = useState(true);
app/(recepcao)/recepcao/experimentais/page.tsx:69:        if (!cancelled) setLoading(false);
app/(recepcao)/recepcao/experimentais/page.tsx:113:  // ── Loading ───────────────────────────────────────────────────────
app/(recepcao)/recepcao/layout.tsx:4:import { RoleRouteLoadingState } from '@/components/ui/RoleRouteLoadingState';
app/(recepcao)/recepcao/layout.tsx:11:      <Suspense fallback={<RoleRouteLoadingState roleLabel="Recepcao" title="Carregando operacao do dia" description="Atendimento, check-in e atalhos rapidos estao sendo preparados." />}>
app/(recepcao)/recepcao/agenda/page.tsx:51:  const [loading, setLoading] = useState(true);
app/(recepcao)/recepcao/agenda/page.tsx:62:        setLoading(false);
app/(recepcao)/recepcao/loading.tsx:3:export default function RecepcaoLoading() {
app/(recepcao)/recepcao/cadastro/page.tsx:56:  const [loading, setLoading] = useState(true);
app/(recepcao)/recepcao/cadastro/page.tsx:101:        if (!cancelled) setLoading(false);
app/(recepcao)/recepcao/cadastro/page.tsx:176:  // ── Loading ───────────────────────────────────────────────────────
app/(recepcao)/recepcao/acesso/page.tsx:52:  const [loading, setLoading] = useState(true);
app/(recepcao)/recepcao/acesso/page.tsx:59:  const [entradaLoading, setEntradaLoading] = useState(false);
app/(recepcao)/recepcao/acesso/page.tsx:75:        if (!cancelled) setLoading(false);
app/(recepcao)/recepcao/acesso/page.tsx:97:    setEntradaLoading(true);
app/(recepcao)/recepcao/acesso/page.tsx:109:      setEntradaLoading(false);
app/(recepcao)/recepcao/acesso/page.tsx:120:  // ── Loading ───────────────────────────────────────────────────────
app/(recepcao)/recepcao/acesso/page.tsx:282:            <Button style={{ background: '#10b981' }} onClick={handleEntrada} loading={entradaLoading} disabled={!entradaNome || entradaLoading}>

## 5. TEXTOS DEMO/PLACEHOLDER
app/(recepcao)/recepcao/caixa/page.tsx:160:        {/* ── POR METODO ────────────────────────────────────── */}
app/(kids)/kids/academia/page.tsx:234:                          {isLocked ? 'Em breve!' : friendlyTitle}
app/(kids)/kids/academia/page.tsx:277:                            Em breve!
app/(public-operational)/campeonatos/[id]/page.tsx:16:  draft: { label: 'Em breve', color: 'bg-gray-100 text-gray-600' },
app/(public-operational)/campeonatos/page.tsx:16:  draft: { label: 'Em breve', color: 'bg-gray-100 text-gray-600' },
app/(admin)/admin/plano/page.tsx:368:                  {'\uD83C\uDF81'} Bonus ativo: TODOS os {modulos.length} modulos liberados ate{' '}
components/shared/ComingSoon.tsx:14:  title = 'Em breve',

## 6. VARIAÇÃO DE BOTÕES
Total de <button + <Button: 1824
Usando componente Button: 543
Usando <button direto: 1273

## 7. CLASSES DE ESPAÇAMENTO MAIS USADAS
1436 py-2
1352 px-4
1315 px-3
1235 gap-2
1206 p-4
1073 gap-3
 874 py-3
 573 p-6
 561 gap-1
 560 px-2
 499 py-1
 469 py-0
 463 p-3
 437 gap-4
 385 space-y-4
 349 space-y-2
 302 space-y-3
 301 space-y-6
 218 px-6
 173 p-2

## 8. BORDER RADIUS VARIAÇÃO
1731 rounded-lg
1299 rounded-full
 652 rounded-xl
 151 rounded-2xl
 105 rounded-md
  43 rounded-3xl
  27 rounded-t
  19 rounded-sm
   2 rounded-none
   2 rounded-l
   2 rounded-bl
   1 rounded-tr
   1 rounded-tl
   1 rounded-r
   1 rounded-pill

## 9. SOMBRAS
 123 shadow-lg
  63 shadow-md
  56 shadow-sm
  49 shadow-xl
  21 shadow-2xl
   6 shadow-bb
   2 shadow-yellow
   2 shadow-inner
   1 shadow-xs
   1 shadow-purple

## 10. ANIMAÇÕES/TRANSIÇÕES
Total: 1706

## 11. DESIGN SYSTEM (components/ui/)
Avatar.tsx
Badge.tsx
BeltBadge.tsx
BeltProgress.tsx
BeltPromotionCeremony.tsx
BeltStripe.tsx
Button.tsx
Card.tsx
EmptyState.tsx
ErrorBoundary.tsx
ErrorState.tsx
index.ts
Input.tsx
Modal.tsx
PageError.tsx
PageSkeleton.tsx
RoleRouteLoadingState.tsx
Skeleton.tsx
Spinner.tsx
Toast.tsx
Toggle.tsx

## 12. LANDING PAGE
Arquivo: features/site/pages/landing-page.tsx
     573 features/site/pages/landing-page.tsx

## 13. LOGIN PAGE
Arquivo: features/auth/pages/login-page.tsx
     526 features/auth/pages/login-page.tsx

## 14. SHELLS
components/shell/AdminShell.tsx
components/shell/LegalFooter.tsx
components/shell/NotificationCenter.tsx
components/shell/BottomNav.tsx
components/shell/NotificationBell.tsx
components/shell/ProfessorShell.tsx
components/shell/MainShell.tsx
components/shell/HelpSection.tsx
components/shell/SuperAdminShell.tsx
components/shell/KidsShell.tsx
components/shell/icons.tsx
components/shell/ParentShell.tsx
components/shell/RecepcaoShell.tsx
components/shell/TeenShell.tsx
components/shell/ShellHeader.tsx

## 15. DASHBOARD ADMIN
app/(superadmin)/superadmin/page.tsx
app/(admin)/admin/page.tsx

## RESUMO EXECUTIVO

### Prioridades de correção:
1. **Emojis em UI**: ~80+ ocorrências em componentes. Substituir por Lucide icons.
2. **Cores hardcoded**: Tailwind colors hardcoded presentes. Hex colors (#) em muitos componentes.
3. **Botões inconsistentes**: 1273 <button direto vs 543 <Button componente. Ratio 2.3:1.
4. **Border radius**: rounded-lg (1731) domina, mas rounded-xl (652) e rounded-2xl (151) também usados. Inconsistente.
5. **Sombras**: shadow-lg (123) mais usado, variação entre sm/md/lg/xl/2xl.
6. **Loading text**: Instâncias de "Carregando...", "Preparando..." ainda presentes.
7. **Landing page**: 573 linhas — robusta mas precisa polish.
8. **Login page**: 526 linhas — funcional mas com dados fake no preview.
9. **Design System**: 21 componentes em components/ui/ — boa base.
10. **Shells**: 15 arquivos — precisam padronização de sidebar/header/bottom nav.
