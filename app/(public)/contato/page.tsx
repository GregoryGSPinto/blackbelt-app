'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { getSupportEmail, getSupportPhone } from '@/lib/config/legal';

export default function ContatoPage() {
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', mensagem: '' });
  const supportEmail = getSupportEmail();
  const supportPhone = getSupportPhone();

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const subject = encodeURIComponent(`Contato BlackBelt - ${form.nome || 'Novo contato'}`);
    const body = encodeURIComponent(
      `Nome: ${form.nome}\nEmail: ${form.email}\nTelefone: ${form.telefone}\n\nMensagem:\n${form.mensagem}`,
    );

    window.location.href = `mailto:${supportEmail}?subject=${subject}&body=${body}`;
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-bb-gray-900">Contato e suporte</h1>
          <p className="mb-8 text-bb-gray-600">
            Página pública de suporte para clientes, responsáveis e revisores de loja. Use o formulário abaixo ou os canais oficiais.
          </p>

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
              <textarea name="mensagem" value={form.mensagem} onChange={handleChange} rows={5} required className="w-full rounded-lg border border-bb-gray-200 px-3 py-2" />
            </div>
            <Button variant="primary" type="submit">Abrir email de contato</Button>
          </form>
        </div>

        <aside className="space-y-4 rounded-2xl border border-bb-gray-200 bg-white/70 p-6">
          <h2 className="text-xl font-semibold text-bb-gray-900">Canais oficiais</h2>
          <div className="rounded-xl border border-bb-gray-200 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bb-gray-500">Email</p>
            <a href={`mailto:${supportEmail}`} className="mt-2 block text-sm font-medium text-bb-red underline">
              {supportEmail}
            </a>
          </div>
          <div className="rounded-xl border border-bb-gray-200 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bb-gray-500">Telefone</p>
            <a href={`tel:${supportPhone.replace(/\s+/g, '')}`} className="mt-2 block text-sm font-medium text-bb-red underline">
              {supportPhone}
            </a>
          </div>
          <div className="rounded-xl border border-bb-gray-200 p-4 text-sm text-bb-gray-600">
            <p className="font-medium text-bb-gray-900">Atendimento para menores e responsáveis</p>
            <p className="mt-2">
              Solicitações envolvendo contas Kids e Teen devem ser feitas pelo responsável legal vinculado à conta, com validação dos dados cadastrais.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
