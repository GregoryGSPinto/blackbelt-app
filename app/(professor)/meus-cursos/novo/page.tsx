'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCourse, addModule, publishCourse, type CreateCoursePayload } from '@/lib/api/course-creator.service';
import type { CourseModality, BeltLevel } from '@/lib/api/marketplace.service';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/lib/hooks/useToast';

type Step = 1 | 2 | 3 | 4;

const MODALITIES: { value: CourseModality; label: string }[] = [
  { value: 'bjj', label: 'Jiu-Jitsu' },
  { value: 'judo', label: 'Judô' },
  { value: 'mma', label: 'MMA' },
  { value: 'muay_thai', label: 'Muay Thai' },
  { value: 'wrestling', label: 'Wrestling' },
  { value: 'no_gi', label: 'No-Gi' },
];

const BELTS: { value: BeltLevel; label: string }[] = [
  { value: 'branca', label: 'Branca' },
  { value: 'azul', label: 'Azul' },
  { value: 'roxa', label: 'Roxa' },
  { value: 'marrom', label: 'Marrom' },
  { value: 'preta', label: 'Preta' },
  { value: 'todas', label: 'Todas as faixas' },
];

const STEPS = ['Básico', 'Módulos', 'Preview', 'Publicar'];

export default function NovoCursoPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Basics
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [modality, setModality] = useState<CourseModality>('bjj');
  const [belt, setBelt] = useState<BeltLevel>('branca');
  const [price, setPrice] = useState('');

  // Step 2: Modules
  const [modules, setModules] = useState<{ title: string; lessons: { title: string; duration: string }[] }[]>([]);
  const [newModuleTitle, setNewModuleTitle] = useState('');

  // Course ID (after creation)
  const [courseId, setCourseId] = useState<string | null>(null);

  function handleAddModule() {
    if (!newModuleTitle.trim()) return;
    setModules([...modules, { title: newModuleTitle.trim(), lessons: [] }]);
    setNewModuleTitle('');
  }

  function handleAddLesson(moduleIdx: number) {
    const updated = [...modules];
    updated[moduleIdx].lessons.push({ title: '', duration: '' });
    setModules(updated);
  }

  function handleUpdateLesson(moduleIdx: number, lessonIdx: number, field: 'title' | 'duration', value: string) {
    const updated = [...modules];
    updated[moduleIdx].lessons[lessonIdx][field] = value;
    setModules(updated);
  }

  function handleRemoveModule(idx: number) {
    setModules(modules.filter((_, i) => i !== idx));
  }

  async function handleCreateCourse() {
    setLoading(true);
    try {
      const payload: CreateCoursePayload = {
        title,
        description,
        modality,
        belt_level: belt,
        price: parseFloat(price) || 0,
      };
      const course = await createCourse('prof-1', payload);
      setCourseId(course.id);

      // Add modules
      for (const mod of modules) {
        await addModule({ course_id: course.id, title: mod.title });
      }

      setStep(3);
      toast('Curso criado com sucesso!', 'success');
    } catch {
      toast('Erro ao criar curso', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handlePublish() {
    if (!courseId) return;
    setLoading(true);
    try {
      await publishCourse(courseId);
      setStep(4);
      toast('Curso publicado!', 'success');
      setTimeout(() => router.push('/meus-cursos'), 2000);
    } catch {
      toast('Erro ao publicar', 'error');
    } finally {
      setLoading(false);
    }
  }

  const totalLessons = modules.reduce((s, m) => s + m.lessons.length, 0);

  return (
    <div className="min-h-screen bg-bb-gray-50 p-4">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-xl font-bold text-bb-black">Criar Novo Curso</h1>

        {/* Step Indicator */}
        <div className="flex justify-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                i + 1 <= step ? 'bg-bb-red text-white' : 'bg-bb-gray-200 text-bb-gray-500'
              }`}>{i + 1}</div>
              <span className="hidden text-xs text-bb-gray-500 sm:inline">{s}</span>
              {i < STEPS.length - 1 && <div className={`h-0.5 w-6 sm:w-10 ${i + 1 < step ? 'bg-bb-red' : 'bg-bb-gray-200'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Basics */}
        {step === 1 && (
          <Card className="p-6">
            <h2 className="mb-4 font-semibold text-bb-black">Informações Básicas</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-bb-black">Título do Curso</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Guarda Fechada Completa"
                  className="mt-1 w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-bb-black">Descrição</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva o que o aluno vai aprender..."
                  rows={4}
                  className="mt-1 w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-bb-black">Modalidade</label>
                  <select
                    value={modality}
                    onChange={(e) => setModality(e.target.value as CourseModality)}
                    className="mt-1 w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
                  >
                    {MODALITIES.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-bb-black">Nível de Faixa</label>
                  <select
                    value={belt}
                    onChange={(e) => setBelt(e.target.value as BeltLevel)}
                    className="mt-1 w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
                  >
                    {BELTS.map((b) => (
                      <option key={b.value} value={b.value}>{b.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-bb-black">Preço (R$)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="197.90"
                  step="0.01"
                  min="0"
                  className="mt-1 w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <Button
                className="w-full"
                onClick={() => setStep(2)}
                disabled={!title.trim() || !description.trim() || !price}
              >
                Próximo: Módulos
              </Button>
            </div>
          </Card>
        )}

        {/* Step 2: Modules / Lessons */}
        {step === 2 && (
          <Card className="p-6">
            <h2 className="mb-4 font-semibold text-bb-black">Módulos e Aulas</h2>
            <div className="space-y-4">
              {/* Existing Modules */}
              {modules.map((mod, mIdx) => (
                <div key={mIdx} className="rounded-lg border border-bb-gray-200 p-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-bb-black text-sm">Módulo {mIdx + 1}: {mod.title}</h3>
                    <button onClick={() => handleRemoveModule(mIdx)} className="text-xs text-red-500 hover:underline">
                      Remover
                    </button>
                  </div>
                  {/* Lessons */}
                  <div className="mt-2 space-y-2">
                    {mod.lessons.map((lesson, lIdx) => (
                      <div key={lIdx} className="flex gap-2">
                        <input
                          value={lesson.title}
                          onChange={(e) => handleUpdateLesson(mIdx, lIdx, 'title', e.target.value)}
                          placeholder={`Aula ${lIdx + 1}`}
                          className="flex-1 rounded border border-bb-gray-200 px-2 py-1.5 text-xs"
                        />
                        <input
                          type="number"
                          value={lesson.duration}
                          onChange={(e) => handleUpdateLesson(mIdx, lIdx, 'duration', e.target.value)}
                          placeholder="min"
                          className="w-16 rounded border border-bb-gray-200 px-2 py-1.5 text-xs"
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => handleAddLesson(mIdx)}
                    className="mt-2 text-xs text-bb-red hover:underline"
                  >
                    + Adicionar aula
                  </button>
                </div>
              ))}

              {/* Add Module */}
              <div className="flex gap-2">
                <input
                  value={newModuleTitle}
                  onChange={(e) => setNewModuleTitle(e.target.value)}
                  placeholder="Nome do módulo"
                  className="flex-1 rounded-lg border border-bb-gray-300 px-3 py-2 text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddModule()}
                />
                <Button variant="secondary" onClick={handleAddModule} disabled={!newModuleTitle.trim()}>
                  Adicionar
                </Button>
              </div>

              <div className="flex gap-2">
                <Button variant="ghost" className="flex-1" onClick={() => setStep(1)}>Voltar</Button>
                <Button
                  className="flex-1"
                  onClick={handleCreateCourse}
                  loading={loading}
                  disabled={modules.length === 0}
                >
                  Próximo: Preview
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Step 3: Preview / Config */}
        {step === 3 && (
          <Card className="p-6">
            <h2 className="mb-4 font-semibold text-bb-black">Preview do Curso</h2>
            <div className="space-y-4">
              <div className="rounded-lg bg-bb-gray-50 p-4">
                <h3 className="text-lg font-bold text-bb-black">{title}</h3>
                <p className="mt-1 text-sm text-bb-gray-500">{description}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-bb-gray-500">
                  <span className="rounded bg-bb-gray-200 px-2 py-0.5">{MODALITIES.find((m) => m.value === modality)?.label}</span>
                  <span className="rounded bg-bb-gray-200 px-2 py-0.5">Faixa {BELTS.find((b) => b.value === belt)?.label}</span>
                  <span className="rounded bg-bb-gray-200 px-2 py-0.5">R$ {parseFloat(price || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  <span className="rounded bg-bb-gray-200 px-2 py-0.5">{modules.length} módulos</span>
                  <span className="rounded bg-bb-gray-200 px-2 py-0.5">{totalLessons} aulas</span>
                </div>
              </div>

              <div className="space-y-2">
                {modules.map((mod, idx) => (
                  <div key={idx} className="rounded border border-bb-gray-200 p-3">
                    <p className="font-medium text-bb-black text-sm">{idx + 1}. {mod.title}</p>
                    <p className="text-xs text-bb-gray-500">{mod.lessons.length} aulas</p>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border-l-4 border-yellow-500 bg-yellow-50 p-3">
                <p className="text-sm text-yellow-800">
                  Ao publicar, seu curso ficará visível no marketplace para todos os usuários da plataforma.
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="ghost" className="flex-1" onClick={() => setStep(2)}>Voltar</Button>
                <Button className="flex-1" onClick={handlePublish} loading={loading}>
                  Publicar Curso
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Step 4: Published */}
        {step === 4 && (
          <Card className="p-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-600">
              &#10003;
            </div>
            <h2 className="mt-4 text-lg font-bold text-bb-black">Curso Publicado!</h2>
            <p className="mt-1 text-sm text-bb-gray-500">Seu curso já está disponível no marketplace.</p>
            <p className="mt-1 text-xs text-bb-gray-400">Redirecionando para Meus Cursos...</p>
          </Card>
        )}
      </div>
    </div>
  );
}
