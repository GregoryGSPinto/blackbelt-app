'use client';

import { useEffect, useState } from 'react';
import {
  createAssessment,
  getHistory,
  compareAssessments,
  type PhysicalAssessmentDTO,
  type AssessmentComparison,
  type Measurements,
  type FitnessTests,
} from '@/lib/api/physical-assessment.service';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/lib/hooks/useToast';
import { EmptyState } from '@/components/ui/EmptyState';
import { PlanGate } from '@/components/plans/PlanGate';
import { translateError } from '@/lib/utils/error-translator';
import { ComingSoon } from '@/components/shared/ComingSoon';

const MEASUREMENT_LABELS: Record<keyof Measurements, string> = {
  weight_kg: 'Peso (kg)',
  height_cm: 'Altura (cm)',
  body_fat_pct: 'Gordura corporal (%)',
  flexibility_score: 'Flexibilidade (0-10)',
  grip_strength_kg: 'Força de grip (kg)',
};

const FITNESS_LABELS: Record<keyof FitnessTests, string> = {
  pushups_1min: 'Flexões (1min)',
  situps_1min: 'Abdominais (1min)',
  plank_seconds: 'Prancha (seg)',
  beep_test_level: 'Teste beep (nível)',
  squat_max_kg: 'Agachamento máx (kg)',
  deadlift_max_kg: 'Levantamento terra (kg)',
  vo2max_estimate: 'VO2max estimado',
};

const emptyMeasurements: Measurements = { weight_kg: 0, height_cm: 0, body_fat_pct: 0, flexibility_score: 0, grip_strength_kg: 0 };
const emptyFitness: FitnessTests = { pushups_1min: 0, situps_1min: 0, plank_seconds: 0, beep_test_level: 0, squat_max_kg: 0, deadlift_max_kg: 0, vo2max_estimate: 0 };

export default function AvaliacaoFisicaProfessorPage() {
  const { toast } = useToast();
  const [comingSoonTimeout, setComingSoonTimeout] = useState(false);
  const [assessments, setAssessments] = useState<PhysicalAssessmentDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [comparison, setComparison] = useState<AssessmentComparison | null>(null);

  const [form, setForm] = useState({
    student_id: 'student-1',
    date: new Date().toISOString().slice(0, 10),
    measurements: { ...emptyMeasurements },
    fitness_tests: { ...emptyFitness },
    notes: '',
  });

  useEffect(() => { const t = setTimeout(() => setComingSoonTimeout(true), 4000); return () => clearTimeout(t); }, []);
  useEffect(() => {
    getHistory('student-1').then(setAssessments).finally(() => setLoading(false));
  }, []);

  async function handleCreate() {
    try {
      const assessment = await createAssessment({
        student_id: form.student_id,
        assessed_by: 'prof-1',
        date: form.date,
        measurements: form.measurements,
        fitness_tests: form.fitness_tests,
        notes: form.notes,
      });
      setAssessments((prev) => [...prev, assessment]);
      setShowForm(false);
      toast('Avaliação registrada', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }

  async function handleCompare(id1: string, id2: string) {
    try {
      const result = await compareAssessments('student-1', id1, id2);
      setComparison(result);
    } catch (err) {
      toast(translateError(err), 'error');
    }
  }

  function updateMeasurement(key: keyof Measurements, val: number) {
    setForm((prev) => ({ ...prev, measurements: { ...prev.measurements, [key]: val } }));
  }

  function updateFitness(key: keyof FitnessTests, val: number) {
    setForm((prev) => ({ ...prev, fitness_tests: { ...prev.fitness_tests, [key]: val } }));
  }

  if (loading && comingSoonTimeout) return <ComingSoon backHref="/professor" backLabel="Voltar ao Painel" />;
  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <PlanGate module="avaliacoes">
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-bb-black">Avaliação Física</h1>
        <Button onClick={() => setShowForm(true)}>Nova Avaliação</Button>
      </div>

      {/* Student selector placeholder */}
      <select className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm md:w-64">
        <option value="student-1">João Silva — Faixa Branca</option>
        <option value="student-2">Maria Santos — Faixa Azul</option>
        <option value="student-3">Pedro Costa — Faixa Roxa</option>
      </select>

      {/* Assessment History */}
      {assessments.length === 0 && (
        <EmptyState
          icon="📊"
          title="Nenhuma avaliação física registrada"
          description="Registre avaliações físicas dos alunos para acompanhar a evolução corporal e de desempenho."
          actionLabel="Nova Avaliação"
          onAction={() => setShowForm(true)}
          variant="first-time"
        />
      )}
      <div className="space-y-3">
        {assessments.map((a, idx) => (
          <Card key={a.id} className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-bold text-bb-black">{new Date(a.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                <p className="mt-1 text-xs text-bb-gray-500">{a.notes}</p>
              </div>
              {idx > 0 && (
                <Button variant="ghost" onClick={() => handleCompare(assessments[idx - 1].id, a.id)}>
                  Comparar
                </Button>
              )}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs md:grid-cols-4">
              <div><span className="text-bb-gray-500">Peso:</span> <span className="font-medium text-bb-black">{a.measurements.weight_kg}kg</span></div>
              <div><span className="text-bb-gray-500">Gordura:</span> <span className="font-medium text-bb-black">{a.measurements.body_fat_pct}%</span></div>
              <div><span className="text-bb-gray-500">Flexibilidade:</span> <span className="font-medium text-bb-black">{a.measurements.flexibility_score}/10</span></div>
              <div><span className="text-bb-gray-500">Grip:</span> <span className="font-medium text-bb-black">{a.measurements.grip_strength_kg}kg</span></div>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs md:grid-cols-4">
              <div><span className="text-bb-gray-500">Flexões:</span> <span className="font-medium text-bb-black">{a.fitness_tests.pushups_1min}</span></div>
              <div><span className="text-bb-gray-500">Abdominais:</span> <span className="font-medium text-bb-black">{a.fitness_tests.situps_1min}</span></div>
              <div><span className="text-bb-gray-500">Prancha:</span> <span className="font-medium text-bb-black">{a.fitness_tests.plank_seconds}s</span></div>
              <div><span className="text-bb-gray-500">VO2max:</span> <span className="font-medium text-bb-black">{a.fitness_tests.vo2max_estimate}</span></div>
            </div>
          </Card>
        ))}
      </div>

      {/* Comparison Modal */}
      <Modal open={!!comparison} onClose={() => setComparison(null)} title="Comparação de Avaliações">
        {comparison && (
          <div className="space-y-4">
            <div className="flex justify-between text-xs text-bb-gray-500">
              <span>{new Date(comparison.previous.date).toLocaleDateString('pt-BR')}</span>
              <span>vs</span>
              <span>{new Date(comparison.current.date).toLocaleDateString('pt-BR')}</span>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-semibold text-bb-black">Medidas</h4>
              {(Object.keys(MEASUREMENT_LABELS) as (keyof Measurements)[]).map((key) => {
                const delta = comparison.deltas.measurements[key];
                const isPositive = key === 'body_fat_pct' || key === 'weight_kg' ? delta < 0 : delta > 0;
                return (
                  <div key={key} className="flex items-center justify-between border-b border-bb-gray-100 py-1 text-xs">
                    <span className="text-bb-gray-500">{MEASUREMENT_LABELS[key]}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-bb-gray-400">{comparison.previous.measurements[key]}</span>
                      <span className="text-bb-gray-300">→</span>
                      <span className="font-medium text-bb-black">{comparison.current.measurements[key]}</span>
                      <span className={`font-bold ${delta === 0 ? 'text-bb-gray-400' : isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {delta > 0 ? '+' : ''}{delta}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div>
              <h4 className="mb-2 text-sm font-semibold text-bb-black">Testes Físicos</h4>
              {(Object.keys(FITNESS_LABELS) as (keyof FitnessTests)[]).map((key) => {
                const delta = comparison.deltas.fitness_tests[key];
                return (
                  <div key={key} className="flex items-center justify-between border-b border-bb-gray-100 py-1 text-xs">
                    <span className="text-bb-gray-500">{FITNESS_LABELS[key]}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-bb-gray-400">{comparison.previous.fitness_tests[key]}</span>
                      <span className="text-bb-gray-300">→</span>
                      <span className="font-medium text-bb-black">{comparison.current.fitness_tests[key]}</span>
                      <span className={`font-bold ${delta === 0 ? 'text-bb-gray-400' : delta > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {delta > 0 ? '+' : ''}{delta}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Modal>

      {/* Create Assessment Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title="Nova Avaliação Física">
        <div className="max-h-[60vh] space-y-4 overflow-y-auto">
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
          />

          <div>
            <h4 className="mb-2 text-sm font-semibold text-bb-black">Medidas Corporais</h4>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(MEASUREMENT_LABELS) as (keyof Measurements)[]).map((key) => (
                <div key={key}>
                  <label className="mb-0.5 block text-[10px] text-bb-gray-500">{MEASUREMENT_LABELS[key]}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.measurements[key] || ''}
                    onChange={(e) => updateMeasurement(key, Number(e.target.value))}
                    className="w-full rounded-lg border border-bb-gray-300 px-2 py-1.5 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold text-bb-black">Testes Físicos</h4>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(FITNESS_LABELS) as (keyof FitnessTests)[]).map((key) => (
                <div key={key}>
                  <label className="mb-0.5 block text-[10px] text-bb-gray-500">{FITNESS_LABELS[key]}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.fitness_tests[key] || ''}
                    onChange={(e) => updateFitness(key, Number(e.target.value))}
                    className="w-full rounded-lg border border-bb-gray-300 px-2 py-1.5 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          <textarea
            placeholder="Observações"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
            rows={2}
          />

          <Button className="w-full" onClick={handleCreate}>Registrar Avaliação</Button>
        </div>
      </Modal>
    </div>
    </PlanGate>
  );
}
