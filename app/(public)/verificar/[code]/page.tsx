'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { verifyCertificate, type Certificate } from '@/lib/api/certificates.service';
import { validarCertificado } from '@/lib/api/academia-teorica.service';
import type { CertificadoTeorico } from '@/lib/api/academia-teorica.service';
import { CertificadoTemplate } from '@/components/certificado/CertificadoTemplate';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';

const TYPE_LABEL: Record<string, string> = { course: 'Curso', belt: 'Graduacao', event: 'Evento' };
const TYPE_COLOR: Record<string, string> = { course: 'bg-blue-100 text-blue-700', belt: 'bg-purple-100 text-purple-700', event: 'bg-green-100 text-green-700' };

export default function VerificarCertificadoPage() {
  const params = useParams();
  const code = params.code as string;

  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [certificadoTeorico, setCertificadoTeorico] = useState<CertificadoTeorico | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        // Try both certificate types in parallel
        const [legacyCert, teoricoCert] = await Promise.allSettled([
          verifyCertificate(code),
          validarCertificado(code),
        ]);

        const legacy = legacyCert.status === 'fulfilled' ? legacyCert.value : null;
        const teorico = teoricoCert.status === 'fulfilled' ? teoricoCert.value : null;

        if (teorico) {
          setCertificadoTeorico(teorico);
        } else if (legacy) {
          setCertificate(legacy);
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [code]);

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bb-depth-1)] p-4">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-3 text-sm text-[var(--bb-ink-60)]">Verificando certificado...</p>
        </div>
      </div>
    );
  }

  // ── Not found ──
  if (notFound) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bb-depth-1)] p-4">
        <Card className="max-w-md p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl text-red-600">
            &#10007;
          </div>
          <h1 className="mt-4 text-xl font-bold text-[var(--bb-ink-100)]">
            Certificado nao encontrado
          </h1>
          <p className="mt-2 text-sm text-[var(--bb-ink-60)]">
            O codigo <strong className="font-mono">{code}</strong> nao corresponde a nenhum certificado valido na plataforma BlackBelt.
          </p>
          <p className="mt-3 text-xs text-[var(--bb-ink-40)]">
            Verifique se o codigo foi digitado corretamente ou entre em contato com a academia emissora.
          </p>
        </Card>
      </div>
    );
  }

  // ── Certificado Teorico (academia-teorica) ──
  if (certificadoTeorico) {
    return (
      <div className="min-h-screen bg-[var(--bb-depth-1)] px-4 py-8">
        <div className="mx-auto max-w-xl">
          {/* Verification badge */}
          <div className="mb-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-500/20 text-2xl text-green-500">
              &#10003;
            </div>
            <h1 className="mt-3 text-xl font-bold text-[var(--bb-ink-100)]">
              Certificado Verificado
            </h1>
            <p className="mt-1 text-sm text-[var(--bb-ink-60)]">
              Este certificado e autentico e foi emitido pela plataforma BlackBelt
            </p>
          </div>

          {/* Certificate template */}
          <CertificadoTemplate certificado={certificadoTeorico} />

          {/* Timestamp */}
          <p className="mt-4 text-center text-xs text-[var(--bb-ink-40)]">
            Verificado em {new Date().toLocaleDateString('pt-BR')} as{' '}
            {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    );
  }

  // ── Legacy certificate (certificates.service) ──
  if (certificate) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bb-depth-1)] p-4">
        <Card className="max-w-lg w-full p-0 overflow-hidden">
          {/* Header */}
          <div className="bg-[var(--bb-depth-2)] p-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-500/20 text-2xl text-green-500">
              &#10003;
            </div>
            <h1 className="mt-3 text-xl font-bold text-[var(--bb-ink-100)]">Certificado Verificado</h1>
            <p className="mt-1 text-sm text-[var(--bb-ink-60)]">
              Este certificado e autentico e foi emitido pela plataforma BlackBelt
            </p>
          </div>

          {/* Certificate Details */}
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${TYPE_COLOR[certificate.type] ?? 'bg-gray-100 text-gray-700'}`}>
                {TYPE_LABEL[certificate.type] ?? certificate.type}
              </span>
              <span className="font-mono text-xs text-[var(--bb-ink-40)]">
                {certificate.verification_code}
              </span>
            </div>

            <div>
              <h2 className="text-lg font-bold text-[var(--bb-ink-100)]">{certificate.title}</h2>
              <p className="mt-1 text-sm text-[var(--bb-ink-60)]">{certificate.description}</p>
            </div>

            <div className="rounded-lg bg-[var(--bb-depth-1)] p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--bb-ink-60)]">Aluno</span>
                <span className="font-medium text-[var(--bb-ink-100)]">{certificate.user_name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--bb-ink-60)]">Academia</span>
                <span className="font-medium text-[var(--bb-ink-100)]">{certificate.academy_name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--bb-ink-60)]">Emitido por</span>
                <span className="font-medium text-[var(--bb-ink-100)]">{certificate.issuer_name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--bb-ink-60)]">Data de Emissao</span>
                <span className="font-medium text-[var(--bb-ink-100)]">
                  {new Date(certificate.issued_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>

            <p className="text-center text-xs text-[var(--bb-ink-40)]">
              Verificado em {new Date().toLocaleDateString('pt-BR')} as{' '}
              {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return null;
}
