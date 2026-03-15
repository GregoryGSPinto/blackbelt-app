'use client';

import { useEffect, useState } from 'react';
import { getBranding, updateBranding, type BrandingDTO } from '@/lib/api/branding.service';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/lib/hooks/useToast';

export default function MarcaPage() {
  const { toast } = useToast();
  const [branding, setBranding] = useState<BrandingDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getBranding('academy-1').then(setBranding).finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    if (!branding) return;
    setSaving(true);
    try {
      await updateBranding('academy-1', branding);
      toast('Marca atualizada', 'success');
    } catch {
      toast('Erro ao salvar', 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (!branding) return null;

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-xl font-bold text-bb-black">Identidade Visual</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Settings */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="mb-4 font-semibold text-bb-black">Logo</h2>
            <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-bb-gray-300 text-sm text-bb-gray-500">
              {branding.logoUrl ? (
                <span>Logo carregado</span>
              ) : (
                <span>Clique para fazer upload</span>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="mb-4 font-semibold text-bb-black">Cores</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-bb-black">Cor Primária</label>
                <div className="mt-1 flex items-center gap-3">
                  <input
                    type="color"
                    value={branding.primaryColor}
                    onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                    className="h-10 w-10 cursor-pointer rounded border"
                  />
                  <input
                    value={branding.primaryColor}
                    onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                    className="rounded-lg border border-bb-gray-300 px-3 py-2 text-sm font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-bb-black">Cor de Destaque</label>
                <div className="mt-1 flex items-center gap-3">
                  <input
                    type="color"
                    value={branding.accentColor}
                    onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                    className="h-10 w-10 cursor-pointer rounded border"
                  />
                  <input
                    value={branding.accentColor}
                    onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                    className="rounded-lg border border-bb-gray-300 px-3 py-2 text-sm font-mono"
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="mb-4 font-semibold text-bb-black">Domínio Customizado</h2>
            <p className="mb-2 text-xs text-bb-gray-500">Disponível no plano Enterprise</p>
            <input
              value={branding.customDomain ?? ''}
              onChange={(e) => setBranding({ ...branding, customDomain: e.target.value || null })}
              placeholder="app.suaacademia.com.br"
              className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
            />
          </Card>

          <Button onClick={handleSave} loading={saving}>Salvar Alterações</Button>
        </div>

        {/* Preview */}
        <Card className="p-6">
          <h2 className="mb-4 font-semibold text-bb-black">Preview</h2>
          <div className="overflow-hidden rounded-lg border border-bb-gray-200">
            {/* Mini header */}
            <div className="flex items-center gap-3 px-4 py-3" style={{ backgroundColor: branding.primaryColor }}>
              <div className="h-8 w-8 rounded-full bg-white/20" />
              <span className="text-sm font-bold text-white">{branding.academyName}</span>
            </div>
            {/* Mini sidebar */}
            <div className="flex">
              <div className="w-16 space-y-2 p-2" style={{ backgroundColor: branding.primaryColor + '10' }}>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-2 rounded bg-bb-gray-200" />
                ))}
              </div>
              <div className="flex-1 p-4">
                <div className="h-3 w-24 rounded" style={{ backgroundColor: branding.primaryColor }} />
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-12 rounded-lg bg-bb-gray-100" />
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <div className="h-6 w-16 rounded" style={{ backgroundColor: branding.primaryColor }} />
                  <div className="h-6 w-16 rounded" style={{ backgroundColor: branding.accentColor }} />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
