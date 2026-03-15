'use client';

import { useEffect, useState } from 'react';
import {
  getMacrocycle,
  createMacrocycle,
  updatePhase,
  type MacrocycleDTO,
  type Phase,
  type PhaseName,
  PHASE_LABEL,
  PHASE_COLOR,
} from '@/lib/api/periodization.service';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/lib/hooks/useToast';

const PHASE_NAMES: PhaseName[] = ['base', 'build', 'peak', 'taper', 'recovery'];

export default function PeriodizacaoProfessorPage() {
  const { toast } = useToast();
  const [macro, setMacro] = useState<MacrocycleDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingPhase, setEditingPhase] = useState<Phase | null>(null);
  const [phaseForm, setPhaseForm] = useState({ intensity: 5, volume: 5, focus: '' });

  const [createForm, setCreateForm] = useState({
    student_id: 'student-1',
    competition_name: '',
    competition_date: '',
  });

  useEffect(() => {
    getMacrocycle('student-1').then(setMacro).finally(() => setLoading(false));
  }, []);

  async function handleCreate() {
    try {
      const created = await createMacrocycle({
        student_id: createForm.student_id,
        competition_name: createForm.competition_name,
        competition_date: createForm.competition_date,
        phases: [],
        created_by: 'prof-1',
      });
      setMacro(created);
      setShowCreate(false);
      toast('Macrociclo criado', 'success');
    } catch {
      toast('Erro ao criar macrociclo', 'error');
    }
  }

  async function handleUpdatePhase() {
    if (!macro || !editingPhase) return;
    try {
      const updated = await updatePhase(macro.id, editingPhase.id, {
        intensity: phaseForm.intensity,
        volume: phaseForm.volume,
        focus: phaseForm.focus.split(',').map((f) => f.trim()).filter(Boolean),
      });
      setMacro((prev) => {
        if (!prev) return prev;
        return { ...prev, phases: prev.phases.map((p) => (p.id === updated.id ? updated : p)) };
      });
      setEditingPhase(null);
      toast('Fase atualizada', 'success');
    } catch {
      toast('Erro ao atualizar fase', 'error');
    }
  }

  function openPhaseEdit(phase: Phase) {
    setEditingPhase(phase);
    setPhaseForm({ intensity: phase.intensity, volume: phase.volume, focus: phase.focus.join(', ') });
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  if (!macro) {
    return (
      <div className="space-y-6 p-6">
        <h1 className="text-xl font-bold text-bb-black">Periodização</h1>
        <Card className="p-6 text-center">
          <p className="text-sm text-bb-gray-500">Nenhum macrociclo ativo.</p>
          <Button className="mt-3" onClick={() => setShowCreate(true)}>Criar Macrociclo</Button>
        </Card>
        <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Novo Macrociclo">
          <div className="space-y-3">
            <input placeholder="Nome da competição" value={createForm.competition_name} onChange={(e) => setCreateForm({ ...createForm, competition_name: e.target.value })} className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm" />
            <input type="date" value={createForm.competition_date} onChange={(e) => setCreateForm({ ...createForm, competition_date: e.target.value })} className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm" />
            <Button className="w-full" onClick={handleCreate} disabled={!createForm.competition_name || !createForm.competition_date}>Criar</Button>
          </div>
        </Modal>
      </div>
    );
  }

  // Calculate total weeks and timeline
  const totalWeeks = macro.phases.reduce((acc, p) => acc + p.weeks, 0);
  const competitionDate = new Date(macro.competition_date);
  const today = new Date();
  const daysUntil = Math.max(0, Math.ceil((competitionDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-bb-black">Periodização</h1>
        <span className="text-sm text-bb-gray-500">{daysUntil} dias para a competição</span>
      </div>

      {/* Macro header */}
      <Card className="p-4">
        <h2 className="font-bold text-bb-black">{macro.competition_name}</h2>
        <div className="mt-2 flex flex-wrap gap-4 text-xs text-bb-gray-500">
          <span>Competição: {competitionDate.toLocaleDateString('pt-BR')}</span>
          <span>{totalWeeks} semanas totais</span>
          <span>{macro.phases.length} fases</span>
        </div>
      </Card>

      {/* Gantt-like Timeline */}
      <Card className="overflow-x-auto p-4">
        <h3 className="mb-3 text-sm font-semibold text-bb-black">Timeline</h3>
        <div className="flex gap-0.5" style={{ minWidth: `${totalWeeks * 28}px` }}>
          {macro.phases.map((phase) => {
            const widthPct = (phase.weeks / totalWeeks) * 100;
            const isCurrentPhase = today >= new Date(phase.start_date) && today <= new Date(phase.end_date);
            return (
              <button
                key={phase.id}
                onClick={() => openPhaseEdit(phase)}
                className={`relative rounded-lg border-2 px-2 py-3 text-center transition hover:opacity-80 ${PHASE_COLOR[phase.name]} ${isCurrentPhase ? 'ring-2 ring-bb-primary ring-offset-2' : ''}`}
                style={{ width: `${widthPct}%`, minWidth: '80px' }}
              >
                <p className="text-xs font-bold">{PHASE_LABEL[phase.name]}</p>
                <p className="text-[10px]">{phase.weeks}sem</p>
              </button>
            );
          })}
        </div>
        {/* Week markers */}
        <div className="mt-1 flex gap-0.5" style={{ minWidth: `${totalWeeks * 28}px` }}>
          {macro.phases.map((phase) => {
            const widthPct = (phase.weeks / totalWeeks) * 100;
            return (
              <div key={`marker-${phase.id}`} className="text-center text-[9px] text-bb-gray-400" style={{ width: `${widthPct}%`, minWidth: '80px' }}>
                {new Date(phase.start_date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Intensity × Volume Grid */}
      <Card className="p-4">
        <h3 className="mb-3 text-sm font-semibold text-bb-black">Intensidade x Volume</h3>
        <div className="space-y-2">
          {macro.phases.map((phase) => (
            <div key={phase.id} className="flex items-center gap-3">
              <span className={`w-24 rounded-full px-2 py-0.5 text-center text-xs font-medium ${PHASE_COLOR[phase.name]}`}>
                {PHASE_LABEL[phase.name]}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="w-16 text-[10px] text-bb-gray-500">Intensidade</span>
                  <div className="h-2 flex-1 rounded-full bg-bb-gray-200">
                    <div className="h-full rounded-full bg-red-400" style={{ width: `${phase.intensity * 10}%` }} />
                  </div>
                  <span className="w-6 text-right text-xs font-medium text-bb-black">{phase.intensity}</span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="w-16 text-[10px] text-bb-gray-500">Volume</span>
                  <div className="h-2 flex-1 rounded-full bg-bb-gray-200">
                    <div className="h-full rounded-full bg-blue-400" style={{ width: `${phase.volume * 10}%` }} />
                  </div>
                  <span className="w-6 text-right text-xs font-medium text-bb-black">{phase.volume}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Phase Details */}
      {macro.phases.map((phase) => (
        <Card key={phase.id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${PHASE_COLOR[phase.name]}`}>
                {PHASE_LABEL[phase.name]}
              </span>
              <span className="text-xs text-bb-gray-500">
                {new Date(phase.start_date).toLocaleDateString('pt-BR')} — {new Date(phase.end_date).toLocaleDateString('pt-BR')}
              </span>
            </div>
            <Button variant="ghost" onClick={() => openPhaseEdit(phase)}>Editar</Button>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {phase.focus.map((f, i) => (
              <span key={i} className="rounded-full bg-bb-gray-100 px-2 py-0.5 text-[10px] text-bb-gray-600">{f}</span>
            ))}
          </div>
        </Card>
      ))}

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {PHASE_NAMES.map((name) => (
          <div key={name} className="flex items-center gap-1">
            <span className={`inline-block h-3 w-3 rounded ${PHASE_COLOR[name].split(' ')[0]}`} />
            <span className="text-bb-gray-500">{PHASE_LABEL[name]}</span>
          </div>
        ))}
      </div>

      {/* Edit Phase Modal */}
      <Modal open={!!editingPhase} onClose={() => setEditingPhase(null)} title={editingPhase ? `Editar: ${PHASE_LABEL[editingPhase.name]}` : ''}>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-bb-black">Intensidade (1-10)</label>
            <input
              type="range"
              min={1}
              max={10}
              value={phaseForm.intensity}
              onChange={(e) => setPhaseForm({ ...phaseForm, intensity: Number(e.target.value) })}
              className="w-full"
            />
            <span className="text-sm font-medium text-bb-black">{phaseForm.intensity}</span>
          </div>
          <div>
            <label className="mb-1 block text-sm text-bb-black">Volume (1-10)</label>
            <input
              type="range"
              min={1}
              max={10}
              value={phaseForm.volume}
              onChange={(e) => setPhaseForm({ ...phaseForm, volume: Number(e.target.value) })}
              className="w-full"
            />
            <span className="text-sm font-medium text-bb-black">{phaseForm.volume}</span>
          </div>
          <div>
            <label className="mb-1 block text-sm text-bb-black">Focos (separados por vírgula)</label>
            <textarea
              value={phaseForm.focus}
              onChange={(e) => setPhaseForm({ ...phaseForm, focus: e.target.value })}
              className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
              rows={3}
            />
          </div>
          <Button className="w-full" onClick={handleUpdatePhase}>Salvar Alterações</Button>
        </div>
      </Modal>
    </div>
  );
}
