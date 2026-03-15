'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { verifyCertificate, type Certificate } from '@/lib/api/certificates.service';
import { Card } from '@/components/ui/Card';

import { Spinner } from '@/components/ui/Spinner';

const TYPE_LABEL: Record<string, string> = { course: 'Curso', belt: 'Graduação', event: 'Evento' };
const TYPE_COLOR: Record<string, string> = { course: 'bg-blue-100 text-blue-700', belt: 'bg-purple-100 text-purple-700', event: 'bg-green-100 text-green-700' };

export default function VerificarCertificadoPage() {
  const params = useParams();
  const code = params.code as string;
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const cert = await verifyCertificate(code);
        if (cert) {
          setCertificate(cert);
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bb-gray-50">
        <div className="text-center">
          <Spinner />
          <p className="mt-3 text-sm text-bb-gray-500">Verificando certificado...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bb-gray-50 p-4">
        <Card className="max-w-md p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl text-red-600">
            &#10007;
          </div>
          <h1 className="mt-4 text-xl font-bold text-bb-black">Certificado Inválido</h1>
          <p className="mt-2 text-sm text-bb-gray-500">
            O código <strong className="font-mono">{code}</strong> não corresponde a nenhum certificado válido na plataforma BlackBelt.
          </p>
          <p className="mt-3 text-xs text-bb-gray-400">
            Verifique se o código foi digitado corretamente ou entre em contato com a academia emissora.
          </p>
        </Card>
      </div>
    );
  }

  if (!certificate) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-bb-gray-50 p-4">
      <Card className="max-w-lg w-full p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-bb-black p-6 text-center text-white">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-2xl">
            &#10003;
          </div>
          <h1 className="mt-3 text-xl font-bold">Certificado Verificado</h1>
          <p className="mt-1 text-sm text-white/70">Este certificado é autêntico e foi emitido pela plataforma BlackBelt</p>
        </div>

        {/* Certificate Details */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${TYPE_COLOR[certificate.type]}`}>
              {TYPE_LABEL[certificate.type]}
            </span>
            <span className="font-mono text-xs text-bb-gray-500">{certificate.verification_code}</span>
          </div>

          <div>
            <h2 className="text-lg font-bold text-bb-black">{certificate.title}</h2>
            <p className="mt-1 text-sm text-bb-gray-500">{certificate.description}</p>
          </div>

          <div className="rounded-lg bg-bb-gray-50 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-bb-gray-500">Aluno</span>
              <span className="font-medium text-bb-black">{certificate.user_name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-bb-gray-500">Academia</span>
              <span className="font-medium text-bb-black">{certificate.academy_name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-bb-gray-500">Emitido por</span>
              <span className="font-medium text-bb-black">{certificate.issuer_name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-bb-gray-500">Data de Emissão</span>
              <span className="font-medium text-bb-black">
                {new Date(certificate.issued_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>

          <p className="text-center text-xs text-bb-gray-400">
            Verificado em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </Card>
    </div>
  );
}
