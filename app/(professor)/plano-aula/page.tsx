'use client';

import { useEffect, useState, useCallback, forwardRef, type HTMLAttributes, type TextareaHTMLAttributes } from 'react';
import {
  getLessonPlans,
  createLessonPlan,
  getTemplates,
  getClassNotes,
  saveClassNote,
} from '@/lib/api/plano-aula.service';
import type {
  LessonPlanDTO,
  LessonPlanTemplateDTO,
  ClassNoteDTO,
  TechniqueBlock,
  StudentHighlight,
} from '@/lib/api/plano-aula.service';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';

// ── Constants ────────────────────────────────────────────────────────
const DEFAULT_CLASS_ID = 'class-bjj-noite';
const DEFAULT_ACADEMY_ID = 'acad-1';

// ── Textarea Component with forwardRef ───────────────────────────────

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-bb-gray-700">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={[
            'w-full rounded-md border border-bb-gray-300 p-3 text-sm text-bb-gray-900',
            'placeholder:text-bb-gray-500',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-red focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error ? 'border-bb-error' : '',
            className ?? '',
          ].join(' ')}
          aria-invalid={!!error}
          {...props}
        />
        {error && <p className="text-xs text-bb-error">{error}</p>}
      </div>
    );
  },
);
TextArea.displayName = 'TextArea';

// ── Section Header Component ─────────────────────────────────────────

interface SectionBadgeProps extends HTMLAttributes<HTMLDivElement> {
  number: string;
  label: string;
}

const SectionBadge = forwardRef<HTMLDivElement, SectionBadgeProps>(
  ({ number, label, className, ...props }, ref) => (
    <div ref={ref} className={`flex items-center gap-2 ${className ?? ''}`} {...props}>
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-bb-red text-xs font-bold text-bb-white">
        {number}
      </span>
      <span className="text-sm font-semibold text-bb-gray-700">{label}</span>
    </div>
  ),
);
SectionBadge.displayName = 'SectionBadge';

// ── Tab type ─────────────────────────────────────────────────────────
type TabId = 'plans' | 'create' | 'notes';

// ── Main Page Component ──────────────────────────────────────────────

export default function PlanoAulaPage() {
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<TabId>('plans');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Data
  const [plans, setPlans] = useState<LessonPlanDTO[]>([]);
  const [templates, setTemplates] = useState<LessonPlanTemplateDTO[]>([]);
  const [notes, setNotes] = useState<ClassNoteDTO[]>([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);

  // Form state for new lesson plan
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formTheme, setFormTheme] = useState('');
  const [formWarmup, setFormWarmup] = useState('');
  const [formTech1Name, setFormTech1Name] = useState('');
  const [formTech1Desc, setFormTech1Desc] = useState('');
  const [formTech1Duration, setFormTech1Duration] = useState(15);
  const [formTech2Name, setFormTech2Name] = useState('');
  const [formTech2Desc, setFormTech2Desc] = useState('');
  const [formTech2Duration, setFormTech2Duration] = useState(15);
  const [formDrilling, setFormDrilling] = useState('');
  const [formSparring, setFormSparring] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Form state for class note
  const [noteContent, setNoteContent] = useState('');
  const [noteHighlights, setNoteHighlights] = useState<StudentHighlight[]>([]);
  const [noteAttendance, setNoteAttendance] = useState(0);
  const [highlightStudentName, setHighlightStudentName] = useState('');
  const [highlightNote, setHighlightNote] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [plansData, templatesData, notesData] = await Promise.all([
        getLessonPlans(DEFAULT_CLASS_ID),
        getTemplates(),
        getClassNotes(DEFAULT_CLASS_ID),
      ]);
      setPlans(plansData);
      setTemplates(templatesData);
      setNotes(notesData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Template Application ──────────────────────────────────────────

  function applyTemplate(template: LessonPlanTemplateDTO) {
    setFormTheme(template.theme);
    setFormWarmup(template.warmup);
    setFormTech1Name(template.technique_1.name);
    setFormTech1Desc(template.technique_1.description);
    setFormTech1Duration(template.technique_1.duration_minutes);
    setFormTech2Name(template.technique_2.name);
    setFormTech2Desc(template.technique_2.description);
    setFormTech2Duration(template.technique_2.duration_minutes);
    setFormDrilling(template.drilling);
    setFormSparring(template.sparring);
    setFormNotes(template.notes);
    setShowTemplateModal(false);
    toast('Template aplicado', 'success');
  }

  function resetForm() {
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormTheme('');
    setFormWarmup('');
    setFormTech1Name('');
    setFormTech1Desc('');
    setFormTech1Duration(15);
    setFormTech2Name('');
    setFormTech2Desc('');
    setFormTech2Duration(15);
    setFormDrilling('');
    setFormSparring('');
    setFormNotes('');
  }

  // ── Save Handlers ─────────────────────────────────────────────────

  async function handleSavePlan() {
    if (!formTheme.trim()) {
      toast('Informe o tema da aula', 'error');
      return;
    }

    setSaving(true);
    try {
      const technique1: TechniqueBlock = {
        name: formTech1Name,
        description: formTech1Desc,
        duration_minutes: formTech1Duration,
      };
      const technique2: TechniqueBlock = {
        name: formTech2Name,
        description: formTech2Desc,
        duration_minutes: formTech2Duration,
      };

      const newPlan = await createLessonPlan({
        class_id: DEFAULT_CLASS_ID,
        academy_id: DEFAULT_ACADEMY_ID,
        date: formDate,
        theme: formTheme,
        warmup: formWarmup,
        technique_1: technique1,
        technique_2: technique2,
        drilling: formDrilling,
        sparring: formSparring,
        notes: formNotes,
      });

      setPlans((prev) => [newPlan, ...prev]);
      resetForm();
      setActiveTab('plans');
      toast('Plano de aula criado com sucesso!', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveNote() {
    if (!noteContent.trim()) {
      toast('Escreva suas observacoes', 'error');
      return;
    }

    setSaving(true);
    try {
      const newNote = await saveClassNote({
        class_id: DEFAULT_CLASS_ID,
        academy_id: DEFAULT_ACADEMY_ID,
        date: new Date().toISOString().split('T')[0],
        content: noteContent,
        student_highlights: noteHighlights,
        attendance_count: noteAttendance,
      });

      setNotes((prev) => [newNote, ...prev]);
      setNoteContent('');
      setNoteHighlights([]);
      setNoteAttendance(0);
      toast('Observacao salva com sucesso!', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setSaving(false);
    }
  }

  function addHighlight() {
    if (!highlightStudentName.trim() || !highlightNote.trim()) return;
    setNoteHighlights((prev) => [
      ...prev,
      {
        student_id: `stu-${Date.now()}`,
        student_name: highlightStudentName,
        note: highlightNote,
      },
    ]);
    setHighlightStudentName('');
    setHighlightNote('');
  }

  function removeHighlight(idx: number) {
    setNoteHighlights((prev) => prev.filter((_, i) => i !== idx));
  }

  // ── Loading state ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  // ── Tab navigation ────────────────────────────────────────────────
  const tabs: Array<{ id: TabId; label: string }> = [
    { id: 'plans', label: 'Planos de Aula' },
    { id: 'create', label: 'Novo Plano' },
    { id: 'notes', label: 'Observacoes' },
  ];

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-xl font-bold text-bb-black">Plano de Aula</h1>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-bb-gray-100 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={[
              'flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'bg-bb-white text-bb-black shadow-sm'
                : 'text-bb-gray-500 hover:text-bb-gray-700',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Lesson Plans List ──────────────────────────────── */}
      {activeTab === 'plans' && (
        <div className="space-y-4">
          {plans.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-bb-gray-500">Nenhum plano de aula encontrado.</p>
              <Button
                variant="primary"
                size="sm"
                className="mt-4"
                onClick={() => setActiveTab('create')}
              >
                Criar Primeiro Plano
              </Button>
            </Card>
          )}

          {plans.map((plan) => {
            const isExpanded = expandedPlanId === plan.id;
            return (
              <Card key={plan.id} className="overflow-hidden">
                {/* Plan Header */}
                <button
                  type="button"
                  onClick={() => setExpandedPlanId(isExpanded ? null : plan.id)}
                  className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-bb-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-bb-black">{plan.theme}</h3>
                      <Badge variant="active" size="sm">
                        {new Date(plan.date).toLocaleDateString('pt-BR')}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-bb-gray-500">
                      por {plan.professor_name}
                    </p>
                  </div>
                  <svg
                    className={`h-5 w-5 text-bb-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="space-y-4 border-t border-bb-gray-200 p-4">
                    {/* Warmup */}
                    <div>
                      <SectionBadge number="1" label="Aquecimento" />
                      <p className="mt-2 text-sm text-bb-gray-700 pl-8">{plan.warmup}</p>
                    </div>

                    {/* Technique 1 */}
                    <div>
                      <SectionBadge number="2" label={`Tecnica 1: ${plan.technique_1.name}`} />
                      <p className="mt-2 text-sm text-bb-gray-700 pl-8">{plan.technique_1.description}</p>
                      <p className="mt-1 text-xs text-bb-gray-500 pl-8">
                        Duracao: {plan.technique_1.duration_minutes}min
                      </p>
                    </div>

                    {/* Technique 2 */}
                    <div>
                      <SectionBadge number="3" label={`Tecnica 2: ${plan.technique_2.name}`} />
                      <p className="mt-2 text-sm text-bb-gray-700 pl-8">{plan.technique_2.description}</p>
                      <p className="mt-1 text-xs text-bb-gray-500 pl-8">
                        Duracao: {plan.technique_2.duration_minutes}min
                      </p>
                    </div>

                    {/* Drilling */}
                    <div>
                      <SectionBadge number="4" label="Drilling" />
                      <p className="mt-2 text-sm text-bb-gray-700 pl-8">{plan.drilling}</p>
                    </div>

                    {/* Sparring */}
                    <div>
                      <SectionBadge number="5" label="Sparring" />
                      <p className="mt-2 text-sm text-bb-gray-700 pl-8">{plan.sparring}</p>
                    </div>

                    {/* Notes */}
                    {plan.notes && (
                      <div className="rounded-lg bg-bb-gray-50 p-3">
                        <p className="text-xs font-medium text-bb-gray-500">Notas</p>
                        <p className="mt-1 text-sm text-bb-gray-700">{plan.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Tab: Create New Plan ────────────────────────────────── */}
      {activeTab === 'create' && (
        <div className="space-y-6">
          {/* Template Selector */}
          <Card className="flex items-center justify-between p-4">
            <div>
              <h3 className="text-sm font-semibold text-bb-black">Templates</h3>
              <p className="text-xs text-bb-gray-500">Comece a partir de um modelo pre-definido</p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setShowTemplateModal(true)}>
              Selecionar Template
            </Button>
          </Card>

          {/* Form */}
          <Card className="space-y-6 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Data"
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
              />
              <Input
                label="Tema da Aula"
                value={formTheme}
                onChange={(e) => setFormTheme(e.target.value)}
                placeholder="Ex: Passagem de Guarda"
              />
            </div>

            {/* Warmup */}
            <div>
              <SectionBadge number="1" label="Aquecimento" className="mb-2" />
              <TextArea
                value={formWarmup}
                onChange={(e) => setFormWarmup(e.target.value)}
                rows={3}
                placeholder="Descreva o aquecimento..."
              />
            </div>

            {/* Technique 1 */}
            <div>
              <SectionBadge number="2" label="Tecnica 1" className="mb-2" />
              <div className="space-y-3 pl-8">
                <Input
                  label="Nome da Tecnica"
                  value={formTech1Name}
                  onChange={(e) => setFormTech1Name(e.target.value)}
                  placeholder="Ex: Passagem Toreando"
                />
                <TextArea
                  label="Descricao"
                  value={formTech1Desc}
                  onChange={(e) => setFormTech1Desc(e.target.value)}
                  rows={3}
                  placeholder="Detalhes da tecnica, passos, pontos chave..."
                />
                <Input
                  label="Duracao (minutos)"
                  type="number"
                  value={String(formTech1Duration)}
                  onChange={(e) => setFormTech1Duration(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Technique 2 */}
            <div>
              <SectionBadge number="3" label="Tecnica 2" className="mb-2" />
              <div className="space-y-3 pl-8">
                <Input
                  label="Nome da Tecnica"
                  value={formTech2Name}
                  onChange={(e) => setFormTech2Name(e.target.value)}
                  placeholder="Ex: Variacao com grip no colarinho"
                />
                <TextArea
                  label="Descricao"
                  value={formTech2Desc}
                  onChange={(e) => setFormTech2Desc(e.target.value)}
                  rows={3}
                  placeholder="Detalhes da tecnica, passos, pontos chave..."
                />
                <Input
                  label="Duracao (minutos)"
                  type="number"
                  value={String(formTech2Duration)}
                  onChange={(e) => setFormTech2Duration(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Drilling */}
            <div>
              <SectionBadge number="4" label="Drilling" className="mb-2" />
              <TextArea
                value={formDrilling}
                onChange={(e) => setFormDrilling(e.target.value)}
                rows={3}
                placeholder="Descreva o drilling..."
              />
            </div>

            {/* Sparring */}
            <div>
              <SectionBadge number="5" label="Sparring" className="mb-2" />
              <TextArea
                value={formSparring}
                onChange={(e) => setFormSparring(e.target.value)}
                rows={3}
                placeholder="Descreva o sparring..."
              />
            </div>

            {/* Notes */}
            <TextArea
              label="Notas adicionais"
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              rows={2}
              placeholder="Observacoes gerais, dicas para execucao..."
            />

            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={resetForm}>
                Limpar
              </Button>
              <Button
                variant="primary"
                loading={saving}
                onClick={handleSavePlan}
                disabled={saving}
              >
                Salvar Plano
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* ── Tab: Class Notes ────────────────────────────────────── */}
      {activeTab === 'notes' && (
        <div className="space-y-6">
          {/* New Note Form */}
          <Card className="space-y-4 p-6">
            <h2 className="text-lg font-semibold text-bb-black">Nova Observacao</h2>

            <TextArea
              label="Observacoes da Aula"
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              rows={4}
              placeholder="Descreva como foi a aula, pontos de atencao, destaques..."
            />

            <Input
              label="Alunos Presentes"
              type="number"
              value={String(noteAttendance)}
              onChange={(e) => setNoteAttendance(Number(e.target.value))}
            />

            {/* Student Highlights */}
            <div>
              <p className="mb-2 text-sm font-medium text-bb-gray-700">Destaques Individuais</p>
              <div className="flex gap-2">
                <Input
                  placeholder="Nome do aluno"
                  value={highlightStudentName}
                  onChange={(e) => setHighlightStudentName(e.target.value)}
                />
                <Input
                  placeholder="Observacao"
                  value={highlightNote}
                  onChange={(e) => setHighlightNote(e.target.value)}
                />
                <Button variant="secondary" size="sm" onClick={addHighlight}>
                  +
                </Button>
              </div>

              {noteHighlights.length > 0 && (
                <div className="mt-3 space-y-2">
                  {noteHighlights.map((h, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-lg bg-bb-gray-50 px-3 py-2"
                    >
                      <div>
                        <span className="text-sm font-medium text-bb-black">{h.student_name}</span>
                        <span className="mx-2 text-bb-gray-300">|</span>
                        <span className="text-sm text-bb-gray-600">{h.note}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeHighlight(idx)}
                        className="text-bb-gray-400 hover:text-bb-error"
                        aria-label={`Remover destaque de ${h.student_name}`}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button
                variant="primary"
                loading={saving}
                onClick={handleSaveNote}
                disabled={saving}
              >
                Salvar Observacao
              </Button>
            </div>
          </Card>

          {/* Historical Notes */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-bb-black">Historico de Observacoes</h2>

            {notes.length === 0 && (
              <Card className="p-8 text-center">
                <p className="text-bb-gray-500">Nenhuma observacao registrada.</p>
              </Card>
            )}

            {notes.map((note) => (
              <Card key={note.id} className="p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="active" size="sm">
                      {new Date(note.date).toLocaleDateString('pt-BR')}
                    </Badge>
                    <span className="text-xs text-bb-gray-500">
                      {note.professor_name}
                    </span>
                  </div>
                  <span className="text-xs text-bb-gray-500">
                    {note.attendance_count} alunos presentes
                  </span>
                </div>

                <p className="text-sm text-bb-gray-700">{note.content}</p>

                {note.student_highlights.length > 0 && (
                  <div className="mt-3 space-y-1">
                    <p className="text-xs font-medium text-bb-gray-500">Destaques:</p>
                    {note.student_highlights.map((h: StudentHighlight, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 rounded bg-bb-gray-50 px-2 py-1 text-xs"
                      >
                        <span className="font-medium text-bb-black">{h.student_name}</span>
                        <span className="text-bb-gray-400">-</span>
                        <span className="text-bb-gray-600">{h.note}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── Template Selection Modal ──────────────────────────────── */}
      <Modal
        open={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        title="Selecionar Template"
      >
        <div className="max-h-96 space-y-3 overflow-y-auto">
          {templates.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => applyTemplate(tpl)}
              className="w-full rounded-lg border border-bb-gray-200 p-4 text-left transition-colors hover:border-bb-red hover:bg-bb-red/5"
            >
              <h3 className="font-semibold text-bb-black">{tpl.name}</h3>
              {tpl.theme && (
                <p className="mt-1 text-xs text-bb-gray-500">Tema: {tpl.theme}</p>
              )}
              <p className="mt-1 text-xs text-bb-gray-400 line-clamp-2">
                {tpl.warmup}
              </p>
            </button>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="ghost" onClick={() => setShowTemplateModal(false)}>
            Cancelar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
