'use client';

import { useEffect, useState } from 'react';
import { getMyCertificates, type Certificate, type CertificateType } from '@/lib/api/certificates.service';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/lib/hooks/useToast';
import { ComingSoon } from '@/components/shared/ComingSoon';

const TYPE_LABEL: Record<CertificateType, string> = { course: 'Curso', belt: 'Graduação', event: 'Evento' };
const TYPE_ICON: Record<CertificateType, string> = { course: '📜', belt: '🥋', event: '🏆' };
const TYPE_COLOR: Record<CertificateType, string> = { course: 'bg-blue-100 text-blue-700', belt: 'bg-purple-100 text-purple-700', event: 'bg-green-100 text-green-700' };

export default function CertificadosPage() {
  const { toast } = useToast();
  const [comingSoonTimeout, setComingSoonTimeout] = useState(false);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<CertificateType | ''>('');

  useEffect(() => { const t = setTimeout(() => setComingSoonTimeout(true), 4000); return () => clearTimeout(t); }, []);
  useEffect(() => {
    getMyCertificates('student-1')
      .then(setCertificates)
      .finally(() => setLoading(false));
  }, []);

  function handleShare(cert: Certificate) {
    const url = `${window.location.origin}/verificar/${cert.verification_code}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      toast('Link copiado!', 'success');
    }
  }

  const filteredCertificates = filter
    ? certificates.filter((c) => c.type === filter)
    : certificates;

  if (loading && comingSoonTimeout) return <ComingSoon backHref="/dashboard" backLabel="Voltar ao Dashboard" />;
  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-xl font-bold text-bb-black">Meus Certificados</h1>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { value: '' as const, label: 'Todos' },
          { value: 'course' as CertificateType, label: 'Cursos' },
          { value: 'belt' as CertificateType, label: 'Graduações' },
          { value: 'event' as CertificateType, label: 'Eventos' },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              filter === f.value
                ? 'bg-bb-red text-white'
                : 'bg-bb-gray-100 text-bb-gray-500 hover:bg-bb-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {(['course', 'belt', 'event'] as CertificateType[]).map((type) => {
          const count = certificates.filter((c) => c.type === type).length;
          return (
            <Card key={type} className="p-3 text-center">
              <span className="text-2xl">{TYPE_ICON[type]}</span>
              <p className="mt-1 text-lg font-bold text-bb-black">{count}</p>
              <p className="text-xs text-bb-gray-500">{TYPE_LABEL[type]}</p>
            </Card>
          );
        })}
      </div>

      {/* Certificates Grid */}
      {filteredCertificates.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-bb-gray-500">Nenhum certificado encontrado</p>
          <p className="mt-1 text-sm text-bb-gray-400">Complete cursos e participe de eventos para receber certificados</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filteredCertificates.map((cert) => (
            <Card key={cert.id} className="overflow-hidden">
              {/* Certificate Thumbnail */}
              <div className="relative h-32 bg-gradient-to-br from-bb-gray-100 to-bb-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-4xl">{TYPE_ICON[cert.type]}</span>
                  <p className="mt-1 text-xs text-bb-gray-500">Certificado</p>
                </div>
                <span className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-medium ${TYPE_COLOR[cert.type]}`}>
                  {TYPE_LABEL[cert.type]}
                </span>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-semibold text-bb-black text-sm leading-tight">{cert.title}</h3>
                <p className="mt-1 text-xs text-bb-gray-500">{cert.academy_name}</p>
                <p className="text-xs text-bb-gray-500">
                  Emitido em {new Date(cert.issued_at).toLocaleDateString('pt-BR')}
                </p>
                <p className="mt-1 font-mono text-[10px] text-bb-gray-400">{cert.verification_code}</p>

                <div className="mt-3 flex gap-2">
                  <a
                    href={cert.pdf_url}
                    download
                    className="flex-1"
                  >
                    <Button variant="secondary" size="sm" className="w-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      PDF
                    </Button>
                  </a>
                  <Button variant="ghost" size="sm" className="flex-1" onClick={() => handleShare(cert)}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Compartilhar
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
