'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

export default function ContatoPage() {
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', mensagem: '' });
  const [sent, setSent] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // In production: POST to /api/leads
    setSent(true);
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-xl px-6 py-20 text-center">
        <h1 className="text-2xl font-bold text-bb-gray-900">Mensagem enviada!</h1>
        <p className="mt-2 text-bb-gray-600">Entraremos em contato em até 24 horas.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-12">
      <h1 className="mb-2 text-3xl font-bold text-bb-gray-900">Contato</h1>
      <p className="mb-8 text-bb-gray-600">Tem dúvidas? Quer uma demonstração? Fale conosco.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-bb-gray-700">Nome</label>
          <input name="nome" value={form.nome} onChange={handleChange} required className="w-full rounded-lg border border-bb-gray-200 px-3 py-2" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-bb-gray-700">Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} required className="w-full rounded-lg border border-bb-gray-200 px-3 py-2" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-bb-gray-700">Telefone</label>
          <input name="telefone" value={form.telefone} onChange={handleChange} className="w-full rounded-lg border border-bb-gray-200 px-3 py-2" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-bb-gray-700">Mensagem</label>
          <textarea name="mensagem" value={form.mensagem} onChange={handleChange} rows={4} required className="w-full rounded-lg border border-bb-gray-200 px-3 py-2" />
        </div>
        <Button variant="primary" type="submit">Enviar</Button>
      </form>
    </div>
  );
}
