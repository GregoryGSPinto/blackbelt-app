'use client';

import { useState } from 'react';
import { createLead } from '@/lib/api/leads.service';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';

export default function AulaExperimentalPage() {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', phone: '', interest: 'BJJ', source: 'site', referralCode: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await createLead(form);
      setSubmitted(true);
      toast('Solicitação enviada!', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bb-gray-50 p-4">
        <Card className="max-w-md p-8 text-center">
          <div className="text-4xl">🥋</div>
          <h1 className="mt-4 text-2xl font-bold text-bb-black">Obrigado!</h1>
          <p className="mt-2 text-sm text-bb-gray-500">Recebemos sua solicitação de aula experimental. Entraremos em contato em breve para agendar.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bb-gray-50 p-4">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-bb-black">Aula Experimental Grátis</h1>
        <p className="mt-1 text-sm text-bb-gray-500">Preencha o formulário e agende sua primeira aula.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input placeholder="Nome completo" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm" />
          <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm" />
          <input placeholder="Telefone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm" />
          <select value={form.interest} onChange={(e) => setForm({ ...form, interest: e.target.value })} className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm">
            <option value="BJJ">Jiu-Jitsu</option>
            <option value="Muay Thai">Muay Thai</option>
            <option value="Judo">Judô</option>
            <option value="Outro">Outro</option>
          </select>
          <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm">
            <option value="site">Site</option>
            <option value="Instagram">Instagram</option>
            <option value="Google">Google</option>
            <option value="Indicação">Indicação de amigo</option>
            <option value="Outro">Outro</option>
          </select>
          <Button type="submit" className="w-full" loading={loading}>Solicitar Aula</Button>
        </form>
      </Card>
    </div>
  );
}
