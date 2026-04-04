'use client';

import { useEffect, useState } from 'react';
import {
  getCurriculum,
  createCurriculum,
  updateCurriculum,
  addRequirement,
  removeRequirement,
  type CurriculumDTO,
  type CurriculumRequirement,
  type RequirementCategory,
  REQUIREMENT_CATEGORY_LABEL,
} from '@/lib/api/curriculum.service';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';
import { getActiveAcademyId } from '@/lib/hooks/useActiveAcademy';
import { ComingSoon } from '@/components/shared/ComingSoon';

const MODALITIES = [
  { value: 'bjj', label: 'Jiu-Jitsu' },
  { value: 'muay_thai', label: 'Muay Thai' },
  { value: 'judo', label: 'Judô' },
  { value: 'wrestling', label: 'Wrestling' },
];

const BELTS: Record<string, string[]> = {
  bjj: ['branca', 'azul', 'roxa', 'marrom', 'preta'],
  muay_thai: ['branca', 'amarela', 'verde', 'azul', 'vermelha', 'preta'],
  judo: ['branca', 'amarela', 'laranja', 'verde', 'azul', 'marrom', 'preta'],
  wrestling: ['iniciante', 'intermediario', 'avancado'],
};

const CATEGORY_COLOR: Record<RequirementCategory, string> = {
  tecnicas_obrigatorias: 'bg-red-100 text-red-700',
  opcionais: 'bg-blue-100 text-blue-700',
  teoricos: 'bg-purple-100 text-purple-700',
  comportamentais: 'bg-green-100 text-green-700',
};

const CATEGORIES: RequirementCategory[] = ['tecnicas_obrigatorias', 'opcionais', 'teoricos', 'comportamentais'];

export default function CurriculoAdminPage() {
  const { toast } = useToast();
  const [comingSoonTimeout, setComingSoonTimeout] = useState(false);
  const [modality, setModality] = useState('bjj');
  const [belt, setBelt] = useState('azul');
  const [curriculum, setCurriculum] = useState<CurriculumDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAddReq, setShowAddReq] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesVal, setNotesVal] = useState('');
  const [creatingCurriculum, setCreatingCurriculum] = useState(false);
  const [reqForm, setReqForm] = useState<Omit<CurriculumRequirement, 'id'>>({
    category: 'tecnicas_obrigatorias',
    name: '',
    description: '',
    video_ref_id: '',
    required: true,
  });

  async function loadCurriculum() {
    setLoading(true);
    try {
      const data = await getCurriculum(getActiveAcademyId(), modality, belt);
      setCurriculum(data);
      if (data) setNotesVal(data.notes);
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateCurriculum() {
    setCreatingCurriculum(true);
    try {
      const created = await createCurriculum({
        academy_id: getActiveAcademyId(),
        modality,
        target_belt: belt,
        requirements: [],
        min_time_months: 6,
        min_attendance: 75,
        min_evaluation_score: 70,
        notes: '',
      });
      setCurriculum(created);
      setNotesVal(created.notes ?? '');
      toast('Currículo criado com sucesso', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setCreatingCurriculum(false);
    }
  }

  useEffect(() => { const t = setTimeout(() => setComingSoonTimeout(true), 4000); return () => clearTimeout(t); }, []);
  useEffect(() => {
    loadCurriculum();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modality, belt]);

  async function handleAddRequirement() {
    if (!curriculum) return;
    try {
      const req = await addRequirement(curriculum.id, reqForm);
      setCurriculum((prev) => prev ? { ...prev, requirements: [...prev.requirements, req] } : prev);
      setShowAddReq(false);
      setReqForm({ category: 'tecnicas_obrigatorias', name: '', description: '', video_ref_id: '', required: true });
      toast('Requisito adicionado', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }

  async function handleRemoveRequirement(reqId: string) {
    if (!curriculum) return;
    try {
      await removeRequirement(curriculum.id, reqId);
      setCurriculum((prev) => prev ? { ...prev, requirements: prev.requirements.filter((r) => r.id !== reqId) } : prev);
      toast('Requisito removido', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }

  async function handleSaveNotes() {
    if (!curriculum) return;
    try {
      await updateCurriculum(curriculum.id, { notes: notesVal });
      setCurriculum((prev) => prev ? { ...prev, notes: notesVal } : prev);
      setEditingNotes(false);
      toast('Notas salvas', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }

  if (loading && comingSoonTimeout) return <ComingSoon backHref="/admin" backLabel="Voltar ao Dashboard" />;
  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-xl font-bold text-bb-black">Currículo por Faixa</h1>

      {/* Selectors */}
      <div className="flex flex-wrap gap-3">
        <select
          value={modality}
          onChange={(e) => { setModality(e.target.value); setBelt(BELTS[e.target.value]?.[0] ?? ''); }}
          className="rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
        >
          {MODALITIES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
        <select
          value={belt}
          onChange={(e) => setBelt(e.target.value)}
          className="rounded-lg border border-bb-gray-300 px-3 py-2 text-sm capitalize"
        >
          {(BELTS[modality] ?? []).map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      {!curriculum ? (
        <Card className="p-6 text-center">
          <p className="text-sm text-bb-gray-500">Nenhum currículo encontrado para esta combinação.</p>
          <Button className="mt-3" onClick={handleCreateCurriculum} disabled={creatingCurriculum}>
            {creatingCurriculum ? 'Criando...' : 'Criar Currículo'}
          </Button>
        </Card>
      ) : (
        <>
          {/* Summary */}
          <Card className="p-4">
            <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
              <div>
                <p className="text-xs text-bb-gray-500">Tempo mínimo</p>
                <p className="font-bold text-bb-black">{curriculum.min_time_months} meses</p>
              </div>
              <div>
                <p className="text-xs text-bb-gray-500">Frequência mínima</p>
                <p className="font-bold text-bb-black">{curriculum.min_attendance}%</p>
              </div>
              <div>
                <p className="text-xs text-bb-gray-500">Nota mínima</p>
                <p className="font-bold text-bb-black">{curriculum.min_evaluation_score}/100</p>
              </div>
              <div>
                <p className="text-xs text-bb-gray-500">Total requisitos</p>
                <p className="font-bold text-bb-black">{curriculum.requirements.length}</p>
              </div>
            </div>
          </Card>

          {/* Notes */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-bb-black">Notas</h2>
              {editingNotes ? (
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => setEditingNotes(false)}>Cancelar</Button>
                  <Button onClick={handleSaveNotes}>Salvar</Button>
                </div>
              ) : (
                <Button variant="ghost" onClick={() => setEditingNotes(true)}>Editar</Button>
              )}
            </div>
            {editingNotes ? (
              <textarea
                value={notesVal}
                onChange={(e) => setNotesVal(e.target.value)}
                className="mt-2 w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
                rows={3}
              />
            ) : (
              <p className="mt-2 text-sm text-bb-gray-500">{curriculum.notes}</p>
            )}
          </Card>

          {/* Requirements by Category */}
          {CATEGORIES.map((cat) => {
            const items = curriculum.requirements.filter((r) => r.category === cat);
            if (items.length === 0) return null;
            return (
              <Card key={cat} className="p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-bb-black">{REQUIREMENT_CATEGORY_LABEL[cat]}</h2>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_COLOR[cat]}`}>{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.map((req) => (
                    <div key={req.id} className="flex items-start justify-between rounded-lg border border-bb-gray-200 p-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-bb-black">{req.name}</p>
                          {req.required && <span className="rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-red-600">Obrigatório</span>}
                          {req.video_ref_id && <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-600">Video</span>}
                        </div>
                        <p className="mt-0.5 text-xs text-bb-gray-500">{req.description}</p>
                      </div>
                      <Button variant="danger" onClick={() => handleRemoveRequirement(req.id)}>Remover</Button>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}

          {/* Add Requirement */}
          <Button onClick={() => setShowAddReq(true)}>Adicionar Requisito</Button>

          <Modal open={showAddReq} onClose={() => setShowAddReq(false)} title="Novo Requisito">
            <div className="space-y-3">
              <select
                value={reqForm.category}
                onChange={(e) => setReqForm({ ...reqForm, category: e.target.value as RequirementCategory })}
                className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{REQUIREMENT_CATEGORY_LABEL[c]}</option>)}
              </select>
              <input
                placeholder="Nome do requisito"
                value={reqForm.name}
                onChange={(e) => setReqForm({ ...reqForm, name: e.target.value })}
                className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
              />
              <textarea
                placeholder="Descrição"
                value={reqForm.description}
                onChange={(e) => setReqForm({ ...reqForm, description: e.target.value })}
                className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
                rows={2}
              />
              <input
                placeholder="ID do vídeo de referência (opcional)"
                value={reqForm.video_ref_id ?? ''}
                onChange={(e) => setReqForm({ ...reqForm, video_ref_id: e.target.value || undefined })}
                className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
              />
              <label className="flex items-center gap-2 text-sm text-bb-black">
                <input
                  type="checkbox"
                  checked={reqForm.required}
                  onChange={(e) => setReqForm({ ...reqForm, required: e.target.checked })}
                  className="rounded border-bb-gray-300"
                />
                Obrigatório
              </label>
              <Button className="w-full" onClick={handleAddRequirement} disabled={!reqForm.name}>Adicionar</Button>
            </div>
          </Modal>
        </>
      )}
    </div>
  );
}
