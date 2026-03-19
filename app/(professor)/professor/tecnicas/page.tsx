'use client';

import { useState, useEffect, useMemo, useCallback, type CSSProperties } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { listTecnicas, createTecnica } from '@/lib/api/banco-tecnicas.service';
import type { Tecnica, TecnicaFiltros, CreateTecnicaPayload } from '@/lib/api/banco-tecnicas.service';
import { useToast } from '@/lib/hooks/useToast';
import {
  SearchIcon,
  XIcon,
  PlusIcon,
  FilterIcon,
  BookMarkedIcon,
  CheckIcon,
} from '@/components/shell/icons';

// ── Position/Category maps per modalidade ───────────────────────────
const BJJ_POSITIONS = ['Guarda Fechada', 'Meia Guarda', 'Guarda Aberta', 'Em Pe', 'Montada', 'Costas', 'Side Control', 'Tartaruga'];
const BJJ_CATEGORIES = ['Finalização', 'Passagem', 'Raspagem', 'Defesa/Escape', 'Queda/Projeção', 'Controle'];
const MUAY_THAI_POSITIONS = ['Em Pe'];
const MUAY_THAI_CATEGORIES = ['Soco', 'Chute', 'Joelhada', 'Cotovelada', 'Controle', 'Queda/Projeção'];
const JUDO_POSITIONS = ['Em Pe'];
const JUDO_CATEGORIES = ['Queda/Projeção'];

function getPositions(modalidade: string): string[] {
  if (modalidade === 'BJJ') return BJJ_POSITIONS;
  if (modalidade === 'Muay Thai') return MUAY_THAI_POSITIONS;
  if (modalidade === 'Judô' || modalidade === 'Judo') return JUDO_POSITIONS;
  return [...new Set([...BJJ_POSITIONS, ...MUAY_THAI_POSITIONS, ...JUDO_POSITIONS])];
}

function getCategories(modalidade: string): string[] {
  if (modalidade === 'BJJ') return BJJ_CATEGORIES;
  if (modalidade === 'Muay Thai') return MUAY_THAI_CATEGORIES;
  if (modalidade === 'Judô' || modalidade === 'Judo') return JUDO_CATEGORIES;
  return [...new Set([...BJJ_CATEGORIES, ...MUAY_THAI_CATEGORIES, ...JUDO_CATEGORIES])];
}

// ── Belt colors ─────────────────────────────────────────────────────
const BELT_DISPLAY: Record<string, { bg: string; text: string; label: string }> = {
  branca: { bg: '#f5f5f5', text: '#333', label: 'Branca' },
  white: { bg: '#f5f5f5', text: '#333', label: 'Branca' },
  azul: { bg: '#3b82f6', text: '#fff', label: 'Azul' },
  blue: { bg: '#2563EB', text: '#fff', label: 'Azul' },
  roxa: { bg: '#8b5cf6', text: '#fff', label: 'Roxa' },
  purple: { bg: '#9333EA', text: '#fff', label: 'Roxa' },
  marrom: { bg: '#92400e', text: '#fff', label: 'Marrom' },
  brown: { bg: '#92400E', text: '#fff', label: 'Marrom' },
  preta: { bg: '#1a1a1a', text: '#fff', label: 'Preta' },
  black: { bg: '#18181B', text: '#fff', label: 'Preta' },
};

const MODALIDADES = ['Todas', 'BJJ', 'Muay Thai', 'Judô'] as const;
const FAIXAS_FILTER = ['Todas', 'branca', 'azul', 'roxa', 'marrom', 'preta'] as const;

function beltLabel(key: string): string {
  return BELT_DISPLAY[key]?.label ?? key;
}

// ── Skeleton ────────────────────────────────────────────────────────
function PageSkeleton() {
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Skeleton variant="text" className="h-7 w-1/2" />
      <Skeleton variant="text" className="h-11 w-full" />
      <div style={{ display: 'flex', gap: 8 }}>{[1, 2, 3, 4].map(i => <Skeleton key={i} variant="text" className="h-9 w-20" />)}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>{[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} variant="card" className="h-[140px]" />)}</div>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────
export default function BancoTecnicasPage() {
  const { toast } = useToast();

  const [tecnicas, setTecnicas] = useState<Tecnica[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalidade, setModalidade] = useState<string>('Todas');
  const [posicao, setPosicao] = useState<string>('');
  const [categoria, setCategoria] = useState<string>('');
  const [faixa, setFaixa] = useState<string>('Todas');

  const [selectedTecnica, setSelectedTecnica] = useState<Tecnica | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Create form state
  const [formNome, setFormNome] = useState('');
  const [formModalidade, setFormModalidade] = useState<string>('BJJ');
  const [formPosicao, setFormPosicao] = useState('');
  const [formCategoria, setFormCategoria] = useState('');
  const [formFaixa, setFormFaixa] = useState('branca');
  const [formDescricao, setFormDescricao] = useState('');
  const [formPassos, setFormPassos] = useState<string[]>(['']);
  const [formDicas, setFormDicas] = useState<string[]>(['']);
  const [formTagInput, setFormTagInput] = useState('');
  const [formTags, setFormTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Load data
  const loadTecnicas = useCallback(async () => {
    setLoading(true);
    const filtros: TecnicaFiltros = {};
    const mod = modalidade === 'Judô' ? 'Judô' : modalidade;
    if (mod !== 'Todas') filtros.modalidade = mod;
    if (posicao) filtros.posicao = posicao;
    if (categoria) filtros.categoria = categoria;
    if (faixa !== 'Todas') filtros.faixaMinima = faixa;
    if (search.trim()) filtros.query = search.trim();
    try {
      const data = await listTecnicas(filtros);
      setTecnicas(data);
    } catch {
      toast('Erro ao carregar tecnicas', 'error');
    } finally {
      setLoading(false);
    }
  }, [modalidade, posicao, categoria, faixa, search, toast]);

  useEffect(() => { loadTecnicas(); }, [loadTecnicas]);

  // Reset position/category when modalidade changes
  useEffect(() => { setPosicao(''); setCategoria(''); }, [modalidade]);

  // Group tecnicas by position
  const grouped = useMemo(() => {
    const map = new Map<string, Tecnica[]>();
    for (const t of tecnicas) {
      const arr = map.get(t.posicao) ?? [];
      arr.push(t);
      map.set(t.posicao, arr);
    }
    return Array.from(map.entries());
  }, [tecnicas]);

  // Create form handlers
  const handleAddPasso = useCallback(() => setFormPassos(prev => [...prev, '']), []);
  const handleRemovePasso = useCallback((idx: number) => setFormPassos(prev => prev.filter((_, i) => i !== idx)), []);
  const handlePassoChange = useCallback((idx: number, val: string) => setFormPassos(prev => prev.map((p, i) => i === idx ? val : p)), []);
  const handleAddDica = useCallback(() => setFormDicas(prev => [...prev, '']), []);
  const handleRemoveDica = useCallback((idx: number) => setFormDicas(prev => prev.filter((_, i) => i !== idx)), []);
  const handleDicaChange = useCallback((idx: number, val: string) => setFormDicas(prev => prev.map((d, i) => i === idx ? val : d)), []);
  const handleAddTag = useCallback(() => {
    const tag = formTagInput.trim();
    if (tag && !formTags.includes(tag)) { setFormTags(prev => [...prev, tag]); setFormTagInput(''); }
  }, [formTagInput, formTags]);
  const handleRemoveTag = useCallback((tag: string) => setFormTags(prev => prev.filter(t => t !== tag)), []);

  const resetForm = useCallback(() => {
    setFormNome(''); setFormModalidade('BJJ'); setFormPosicao(''); setFormCategoria(''); setFormFaixa('branca'); setFormDescricao(''); setFormPassos(['']); setFormDicas(['']); setFormTagInput(''); setFormTags([]);
  }, []);

  const handleSave = useCallback(async () => {
    if (!formNome.trim() || !formPosicao || !formCategoria) { toast('Preencha nome, posicao e categoria', 'error'); return; }
    setSaving(true);
    try {
      const payload: CreateTecnicaPayload = {
        nome: formNome.trim(), modalidade: formModalidade, posicao: formPosicao, categoria: formCategoria, faixaMinima: formFaixa, descricao: formDescricao.trim(),
        passos: formPassos.filter(p => p.trim()), dicas: formDicas.filter(d => d.trim()), tags: formTags,
      };
      await createTecnica(payload);
      toast('Tecnica criada com sucesso', 'success');
      setShowCreateModal(false);
      resetForm();
      await loadTecnicas();
    } catch {
      toast('Erro ao criar tecnica', 'error');
    } finally {
      setSaving(false);
    }
  }, [formNome, formModalidade, formPosicao, formCategoria, formFaixa, formDescricao, formPassos, formDicas, formTags, toast, resetForm, loadTecnicas]);

  const inputStyle: CSSProperties = { width: '100%', minHeight: 44, padding: '0 12px', backgroundColor: 'var(--bb-depth-4)', color: 'var(--bb-ink-100)', border: '1px solid var(--bb-glass-border)', borderRadius: 'var(--bb-radius-md)', fontSize: 14 };

  if (loading && tecnicas.length === 0) return <PageSkeleton />;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bb-depth-1)' }}>
      {/* HEADER */}
      <div style={{ backgroundColor: 'var(--bb-depth-2)', borderBottom: '1px solid var(--bb-glass-border)', padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BookMarkedIcon style={{ width: 24, height: 24, color: 'var(--bb-brand)' }} />
            <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--bb-ink-100)', margin: 0 }}>Banco de Tecnicas</h1>
          </div>
          <button onClick={() => setShowCreateModal(true)} style={{ minHeight: 44, padding: '0 16px', display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bb-brand-gradient, var(--bb-brand))', color: '#fff', border: 'none', borderRadius: 'var(--bb-radius-md)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
            <PlusIcon style={{ width: 16, height: 16 }} /> Nova Tecnica
          </button>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <SearchIcon style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: 'var(--bb-ink-40)' }} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar tecnica..." style={{ ...inputStyle, paddingLeft: 40 }} />
          {search && (
            <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--bb-ink-40)', minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <XIcon style={{ width: 16, height: 16 }} />
            </button>
          )}
        </div>

        {/* Modalidade buttons */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 8, paddingBottom: 4 }}>
          {MODALIDADES.map(mod => (
            <button key={mod} onClick={() => setModalidade(mod)} style={{ flex: '0 0 auto', minHeight: 36, padding: '0 14px', borderRadius: 999, border: '1px solid var(--bb-glass-border)', backgroundColor: modalidade === mod ? 'var(--bb-brand)' : 'var(--bb-depth-3)', color: modalidade === mod ? '#fff' : 'var(--bb-ink-60)', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {mod}
            </button>
          ))}
        </div>

        {/* Filters row */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          <div style={{ flex: '1 1 0', minWidth: 100 }}>
            <select value={posicao} onChange={e => setPosicao(e.target.value)} style={{ ...inputStyle, minHeight: 36, fontSize: 12 }}>
              <option value="">Posicao</option>
              {getPositions(modalidade).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div style={{ flex: '1 1 0', minWidth: 100 }}>
            <select value={categoria} onChange={e => setCategoria(e.target.value)} style={{ ...inputStyle, minHeight: 36, fontSize: 12 }}>
              <option value="">Categoria</option>
              {getCategories(modalidade).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ flex: '1 1 0', minWidth: 80 }}>
            <select value={faixa} onChange={e => setFaixa(e.target.value)} style={{ ...inputStyle, minHeight: 36, fontSize: 12 }}>
              {FAIXAS_FILTER.map(f => <option key={f} value={f}>{f === 'Todas' ? 'Faixa' : beltLabel(f)}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ padding: 16 }}>
        {tecnicas.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--bb-ink-40)' }}>
            <BookMarkedIcon style={{ width: 40, height: 40, margin: '0 auto 12px' }} />
            <p style={{ fontSize: 14 }}>Nenhuma tecnica encontrada com esses filtros</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {grouped.map(([pos, items]) => (
              <div key={pos}>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--bb-ink-80)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FilterIcon style={{ width: 14, height: 14, color: 'var(--bb-ink-40)' }} />
                  {pos} ({items.length})
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
                  {items.map(tec => {
                    const beltCfg = BELT_DISPLAY[tec.faixaMinima];
                    return (
                      <button key={tec.id} onClick={() => setSelectedTecnica(tec)} style={{ textAlign: 'left', backgroundColor: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)', borderRadius: 'var(--bb-radius-lg)', padding: 12, cursor: 'pointer', minHeight: 44, display: 'flex', flexDirection: 'column', gap: 8, transition: 'border-color 0.2s' }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--bb-ink-100)', lineHeight: 1.3 }}>{tec.nome}</span>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <span style={{ padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 600, backgroundColor: 'var(--bb-depth-4)', color: 'var(--bb-ink-60)' }}>{tec.categoria}</span>
                          {beltCfg && (
                            <span style={{ padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 600, backgroundColor: beltCfg.bg, color: beltCfg.text }}>{beltCfg.label}</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
        <div style={{ fontSize: 12, color: 'var(--bb-ink-40)', textAlign: 'center', marginTop: 24 }}>
          {tecnicas.length} tecnica{tecnicas.length !== 1 ? 's' : ''} encontrada{tecnicas.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedTecnica && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={() => setSelectedTecnica(null)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} />
          <div style={{ position: 'relative', zIndex: 51, width: '100%', maxWidth: 520, backgroundColor: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)', borderRadius: 'var(--bb-radius-lg)', boxShadow: 'var(--bb-shadow-lg)', padding: 24, maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setSelectedTecnica(null)} style={{ position: 'absolute', top: 12, right: 12, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--bb-ink-60)' }}>
              <XIcon style={{ width: 20, height: 20 }} />
            </button>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--bb-ink-100)', margin: '0 0 4px', paddingRight: 40 }}>{selectedTecnica.nome}</h2>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              <span style={{ padding: '2px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600, backgroundColor: 'var(--bb-depth-4)', color: 'var(--bb-ink-60)' }}>{selectedTecnica.modalidade}</span>
              <span style={{ padding: '2px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600, backgroundColor: 'var(--bb-depth-4)', color: 'var(--bb-ink-60)' }}>{selectedTecnica.posicao}</span>
              <span style={{ padding: '2px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600, backgroundColor: 'var(--bb-depth-4)', color: 'var(--bb-ink-60)' }}>{selectedTecnica.categoria}</span>
              {BELT_DISPLAY[selectedTecnica.faixaMinima] && (
                <span style={{ padding: '2px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600, backgroundColor: BELT_DISPLAY[selectedTecnica.faixaMinima].bg, color: BELT_DISPLAY[selectedTecnica.faixaMinima].text }}>{BELT_DISPLAY[selectedTecnica.faixaMinima].label}</span>
              )}
            </div>
            {selectedTecnica.descricao && (
              <div style={{ marginBottom: 16 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--bb-ink-80)', marginBottom: 4 }}>Descricao</h3>
                <p style={{ fontSize: 14, color: 'var(--bb-ink-80)', margin: 0, lineHeight: 1.5 }}>{selectedTecnica.descricao}</p>
              </div>
            )}
            {selectedTecnica.passos && selectedTecnica.passos.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--bb-ink-80)', marginBottom: 8 }}>Passos</h3>
                <ol style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {selectedTecnica.passos.map((p, i) => <li key={i} style={{ fontSize: 13, color: 'var(--bb-ink-80)', lineHeight: 1.4 }}>{p}</li>)}
                </ol>
              </div>
            )}
            {selectedTecnica.dicas && selectedTecnica.dicas.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--bb-ink-80)', marginBottom: 8 }}>Dicas</h3>
                <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {selectedTecnica.dicas.map((d, i) => <li key={i} style={{ fontSize: 13, color: 'var(--bb-ink-60)', lineHeight: 1.4 }}>{d}</li>)}
                </ul>
              </div>
            )}
            {selectedTecnica.variacoes && selectedTecnica.variacoes.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--bb-ink-80)', marginBottom: 8 }}>Variacoes</h3>
                <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {selectedTecnica.variacoes.map((v, i) => <li key={i} style={{ fontSize: 13, color: 'var(--bb-ink-60)', lineHeight: 1.4 }}>{v}</li>)}
                </ul>
              </div>
            )}
            <button onClick={() => { toast('Tecnica adicionada ao plano', 'success'); setSelectedTecnica(null); }} style={{ width: '100%', minHeight: 44, background: 'var(--bb-brand-gradient, var(--bb-brand))', color: '#fff', border: 'none', borderRadius: 'var(--bb-radius-md)', fontWeight: 600, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <CheckIcon style={{ width: 16, height: 16 }} /> Usar no Plano
            </button>
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={() => { setShowCreateModal(false); resetForm(); }} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} />
          <div style={{ position: 'relative', zIndex: 51, width: '100%', maxWidth: 520, backgroundColor: 'var(--bb-depth-3)', border: '1px solid var(--bb-glass-border)', borderRadius: 'var(--bb-radius-lg)', boxShadow: 'var(--bb-shadow-lg)', padding: 24, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--bb-ink-100)', margin: 0 }}>Nova Tecnica</h2>
              <button onClick={() => { setShowCreateModal(false); resetForm(); }} style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--bb-ink-60)' }}>
                <XIcon style={{ width: 20, height: 20 }} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <FormField label="Nome"><input value={formNome} onChange={e => setFormNome(e.target.value)} placeholder="Nome da tecnica" style={inputStyle} /></FormField>
              <FormField label="Modalidade">
                <select value={formModalidade} onChange={e => { setFormModalidade(e.target.value); setFormPosicao(''); setFormCategoria(''); }} style={inputStyle}>
                  <option value="BJJ">BJJ</option><option value="Muay Thai">Muay Thai</option><option value="Judô">Judo</option>
                </select>
              </FormField>
              <FormField label="Posicao">
                <select value={formPosicao} onChange={e => setFormPosicao(e.target.value)} style={inputStyle}>
                  <option value="">Selecione...</option>
                  {getPositions(formModalidade).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </FormField>
              <FormField label="Categoria">
                <select value={formCategoria} onChange={e => setFormCategoria(e.target.value)} style={inputStyle}>
                  <option value="">Selecione...</option>
                  {getCategories(formModalidade).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </FormField>
              <FormField label="Faixa Minima">
                <select value={formFaixa} onChange={e => setFormFaixa(e.target.value)} style={inputStyle}>
                  {FAIXAS_FILTER.filter(f => f !== 'Todas').map(f => <option key={f} value={f}>{beltLabel(f)}</option>)}
                </select>
              </FormField>
              <FormField label="Descricao">
                <textarea value={formDescricao} onChange={e => setFormDescricao(e.target.value)} placeholder="Descreva a tecnica..." rows={3} style={{ ...inputStyle, padding: 12, minHeight: 80, resize: 'vertical' }} />
              </FormField>
              <FormField label="Passos">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {formPassos.map((p, i) => (
                    <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: 'var(--bb-ink-40)', width: 20, textAlign: 'right', flexShrink: 0 }}>{i + 1}.</span>
                      <input value={p} onChange={e => handlePassoChange(i, e.target.value)} placeholder={`Passo ${i + 1}`} style={{ ...inputStyle, flex: 1 }} />
                      {formPassos.length > 1 && <button onClick={() => handleRemovePasso(i)} style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--bb-ink-40)', flexShrink: 0 }}><XIcon style={{ width: 14, height: 14 }} /></button>}
                    </div>
                  ))}
                  <button onClick={handleAddPasso} style={{ minHeight: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: 'var(--bb-depth-4)', color: 'var(--bb-ink-60)', border: '1px dashed var(--bb-glass-border)', borderRadius: 'var(--bb-radius-md)', fontSize: 12, cursor: 'pointer' }}>
                    <PlusIcon style={{ width: 14, height: 14 }} /> Adicionar Passo
                  </button>
                </div>
              </FormField>
              <FormField label="Dicas">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {formDicas.map((d, i) => (
                    <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input value={d} onChange={e => handleDicaChange(i, e.target.value)} placeholder={`Dica ${i + 1}`} style={{ ...inputStyle, flex: 1 }} />
                      {formDicas.length > 1 && <button onClick={() => handleRemoveDica(i)} style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--bb-ink-40)', flexShrink: 0 }}><XIcon style={{ width: 14, height: 14 }} /></button>}
                    </div>
                  ))}
                  <button onClick={handleAddDica} style={{ minHeight: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: 'var(--bb-depth-4)', color: 'var(--bb-ink-60)', border: '1px dashed var(--bb-glass-border)', borderRadius: 'var(--bb-radius-md)', fontSize: 12, cursor: 'pointer' }}>
                    <PlusIcon style={{ width: 14, height: 14 }} /> Adicionar Dica
                  </button>
                </div>
              </FormField>
              <FormField label="Tags">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
                  {formTags.map(tag => (
                    <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 999, fontSize: 12, backgroundColor: 'var(--bb-depth-4)', color: 'var(--bb-ink-80)' }}>
                      {tag}
                      <button onClick={() => handleRemoveTag(tag)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--bb-ink-40)', padding: 0, display: 'flex' }}><XIcon style={{ width: 12, height: 12 }} /></button>
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input value={formTagInput} onChange={e => setFormTagInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }} placeholder="Adicionar tag..." style={{ ...inputStyle, flex: 1 }} />
                  <button onClick={handleAddTag} disabled={!formTagInput.trim()} style={{ minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bb-depth-4)', color: 'var(--bb-ink-60)', border: '1px solid var(--bb-glass-border)', borderRadius: 'var(--bb-radius-md)', cursor: formTagInput.trim() ? 'pointer' : 'not-allowed', opacity: formTagInput.trim() ? 1 : 0.5 }}>
                    <PlusIcon style={{ width: 16, height: 16 }} />
                  </button>
                </div>
              </FormField>
              <button onClick={handleSave} disabled={saving || !formNome.trim() || !formPosicao || !formCategoria} style={{ width: '100%', minHeight: 44, background: 'var(--bb-brand-gradient, var(--bb-brand))', color: '#fff', border: 'none', borderRadius: 'var(--bb-radius-md)', fontWeight: 600, fontSize: 14, cursor: saving || !formNome.trim() || !formPosicao || !formCategoria ? 'not-allowed' : 'pointer', opacity: saving || !formNome.trim() || !formPosicao || !formCategoria ? 0.5 : 1, marginTop: 8 }}>
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'block' }}>
      <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--bb-ink-80)', marginBottom: 4 }}>{label}</span>
      {children}
    </label>
  );
}
