'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  getSubstitutions,
  createSubstitution,
  getAvailableTeachers,
  type SubstitutionDTO,
  type AvailableTeacherDTO,
} from '@/lib/api/substituicao.service';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/lib/hooks/useToast';
import { translateError } from '@/lib/utils/error-translator';

const CLASSES = [
  { id: 'class-1', name: 'BJJ Iniciante', time: '19:00-20:30' },
  { id: 'class-2', name: 'BJJ Avançado', time: '18:00-19:30' },
  { id: 'class-3', name: 'Muay Thai Avançado', time: '20:00-21:30' },
  { id: 'class-4', name: 'Judô Kids', time: '16:00-17:00' },
  { id: 'class-5', name: 'MMA Intermediário', time: '20:30-22:00' },
];

const ORIGINAL_TEACHERS = [
  { id: 'teacher-1', name: 'Prof. Ricardo' },
  { id: 'teacher-2', name: 'Prof. Fernanda' },
];

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function getMonthDays(year: number, month: number): { date: string; day: number; weekday: number }[] {
  const days: { date: string; day: number; weekday: number }[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const dt = new Date(year, month, d);
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({ date: dateStr, day: d, weekday: dt.getDay() });
  }
  return days;
}

export default function SubstituicaoPage() {
  const { toast } = useToast();
  const [substitutions, setSubstitutions] = useState<SubstitutionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);

  // Calendar state
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  // Form state
  const [formClassId, setFormClassId] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formOriginalTeacher, setFormOriginalTeacher] = useState('');
  const [formSubstituteTeacher, setFormSubstituteTeacher] = useState('');
  const [formReason, setFormReason] = useState('');
  const [availableTeachers, setAvailableTeachers] = useState<AvailableTeacherDTO[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  const [tab, setTab] = useState<'calendar' | 'history'>('calendar');

  useEffect(() => {
    getSubstitutions('academy-1')
      .then(setSubstitutions)
      .finally(() => setLoading(false));
  }, []);

  const monthDays = useMemo(
    () => getMonthDays(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  const subsByDate = useMemo(() => {
    const map: Record<string, SubstitutionDTO[]> = {};
    substitutions.forEach((s) => {
      if (!map[s.date]) map[s.date] = [];
      map[s.date].push(s);
    });
    return map;
  }, [substitutions]);

  const firstWeekday = monthDays[0]?.weekday ?? 0;

  async function handleDateClick(date: string) {
    setFormDate(date);
    setShowCreate(true);
    setLoadingTeachers(true);
    try {
      const teachers = await getAvailableTeachers(date, '19:00-20:30');
      setAvailableTeachers(teachers);
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setLoadingTeachers(false);
    }
  }

  async function handleCreate() {
    if (!formClassId || !formDate || !formOriginalTeacher || !formSubstituteTeacher) {
      toast('Preencha todos os campos', 'error');
      return;
    }
    setCreating(true);
    try {
      const selectedClass = CLASSES.find((c) => c.id === formClassId);
      const sub = await createSubstitution({
        classId: formClassId,
        date: formDate,
        timeSlot: selectedClass?.time ?? '',
        originalTeacherId: formOriginalTeacher,
        substituteTeacherId: formSubstituteTeacher,
        reason: formReason,
      });
      setSubstitutions((prev) => [...prev, sub]);
      setShowCreate(false);
      resetForm();
      toast('Substituição criada. Alunos notificados!', 'success');
    } catch (err) {
      toast(translateError(err), 'error');
    } finally {
      setCreating(false);
    }
  }

  function resetForm() {
    setFormClassId('');
    setFormDate('');
    setFormOriginalTeacher('');
    setFormSubstituteTeacher('');
    setFormReason('');
    setAvailableTeachers([]);
  }

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  }

  const monthName = new Date(viewYear, viewMonth).toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-bb-black">Substituição de Professores</h1>
          <p className="mt-1 text-sm text-bb-gray-500">Gerencie substituições e notifique alunos automaticamente.</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>Nova Substituição</Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-bb-gray-100 p-1">
        <button
          onClick={() => setTab('calendar')}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            tab === 'calendar'
              ? 'bg-white text-bb-black shadow-sm'
              : 'text-bb-gray-500 hover:text-bb-gray-700'
          }`}
        >
          Calendário
        </button>
        <button
          onClick={() => setTab('history')}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            tab === 'history'
              ? 'bg-white text-bb-black shadow-sm'
              : 'text-bb-gray-500 hover:text-bb-gray-700'
          }`}
        >
          Histórico
        </button>
      </div>

      {/* Calendar View */}
      {tab === 'calendar' && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <button onClick={prevMonth} className="rounded p-2 text-bb-gray-500 hover:bg-bb-gray-100">
              &#8249;
            </button>
            <h3 className="text-sm font-bold capitalize text-bb-black">{monthName}</h3>
            <button onClick={nextMonth} className="rounded p-2 text-bb-gray-500 hover:bg-bb-gray-100">
              &#8250;
            </button>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-px">
            {WEEKDAYS.map((wd) => (
              <div key={wd} className="py-2 text-center text-xs font-medium text-bb-gray-500">
                {wd}
              </div>
            ))}

            {/* Empty cells before first day */}
            {Array.from({ length: firstWeekday }).map((_, i) => (
              <div key={`empty-${i}`} className="h-20" />
            ))}

            {monthDays.map(({ date, day }) => {
              const daySubs = subsByDate[date];
              const isToday = date === now.toISOString().split('T')[0];
              return (
                <button
                  key={date}
                  onClick={() => handleDateClick(date)}
                  className={`h-20 rounded-lg border p-1 text-left transition-colors hover:bg-bb-gray-50 ${
                    isToday ? 'border-bb-red' : 'border-bb-gray-100'
                  }`}
                >
                  <span className={`text-xs font-medium ${isToday ? 'text-bb-red' : 'text-bb-gray-700'}`}>
                    {day}
                  </span>
                  {daySubs && daySubs.length > 0 && (
                    <div className="mt-1 space-y-0.5">
                      {daySubs.slice(0, 2).map((s) => (
                        <div key={s.id} className="truncate rounded bg-amber-100 px-1 py-0.5 text-[10px] text-amber-700">
                          {s.className}
                        </div>
                      ))}
                      {daySubs.length > 2 && (
                        <span className="text-[10px] text-bb-gray-400">+{daySubs.length - 2}</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {/* History View */}
      {tab === 'history' && (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bb-gray-200 bg-bb-gray-50">
                <th className="px-4 py-3 text-left font-medium text-bb-gray-500">Data</th>
                <th className="px-4 py-3 text-left font-medium text-bb-gray-500">Turma</th>
                <th className="px-4 py-3 text-left font-medium text-bb-gray-500">Horário</th>
                <th className="px-4 py-3 text-left font-medium text-bb-gray-500">Professor Original</th>
                <th className="px-4 py-3 text-left font-medium text-bb-gray-500">Substituto</th>
                <th className="px-4 py-3 text-left font-medium text-bb-gray-500">Motivo</th>
                <th className="px-4 py-3 text-left font-medium text-bb-gray-500">Notificados</th>
              </tr>
            </thead>
            <tbody>
              {substitutions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-bb-gray-400">
                    Nenhuma substituição registrada.
                  </td>
                </tr>
              ) : (
                substitutions
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map((sub) => (
                    <tr key={sub.id} className="border-b border-bb-gray-100 hover:bg-bb-gray-50">
                      <td className="px-4 py-3 text-bb-black">
                        {new Date(sub.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 font-medium text-bb-black">{sub.className}</td>
                      <td className="px-4 py-3 text-bb-gray-600">{sub.timeSlot}</td>
                      <td className="px-4 py-3 text-bb-gray-600">{sub.originalTeacherName}</td>
                      <td className="px-4 py-3 text-bb-gray-600">{sub.substituteTeacherName}</td>
                      <td className="px-4 py-3 text-bb-gray-500">{sub.reason}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                          {sub.notifiedStudents} alunos
                        </span>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </Card>
      )}

      {/* Create Substitution Modal */}
      <Modal open={showCreate} onClose={() => { setShowCreate(false); resetForm(); }} title="Nova Substituição">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-bb-black">Turma</label>
            <select
              value={formClassId}
              onChange={(e) => setFormClassId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm focus:border-bb-red focus:outline-none focus:ring-1 focus:ring-bb-red"
            >
              <option value="">Selecione a turma</option>
              {CLASSES.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.time})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-bb-black">Data</label>
            <input
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm focus:border-bb-red focus:outline-none focus:ring-1 focus:ring-bb-red"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-bb-black">Professor Original</label>
            <select
              value={formOriginalTeacher}
              onChange={(e) => setFormOriginalTeacher(e.target.value)}
              className="mt-1 w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm focus:border-bb-red focus:outline-none focus:ring-1 focus:ring-bb-red"
            >
              <option value="">Selecione o professor</option>
              {ORIGINAL_TEACHERS.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-bb-black">Professor Substituto</label>
            {loadingTeachers ? (
              <div className="mt-1 flex items-center gap-2 text-sm text-bb-gray-400">
                <Spinner /> Buscando disponíveis...
              </div>
            ) : (
              <select
                value={formSubstituteTeacher}
                onChange={(e) => setFormSubstituteTeacher(e.target.value)}
                className="mt-1 w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm focus:border-bb-red focus:outline-none focus:ring-1 focus:ring-bb-red"
              >
                <option value="">Selecione o substituto</option>
                {availableTeachers
                  .filter((t) => t.id !== formOriginalTeacher)
                  .map((t) => (
                    <option key={t.id} value={t.id} disabled={!t.available}>
                      {t.name} ({t.specialties.join(', ')})
                      {!t.available ? ' - Indisponível' : ''}
                    </option>
                  ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-bb-black">Motivo</label>
            <input
              value={formReason}
              onChange={(e) => setFormReason(e.target.value)}
              placeholder="Ex: Compromisso pessoal, atestado médico..."
              className="mt-1 w-full rounded-lg border border-bb-gray-300 px-3 py-2 text-sm focus:border-bb-red focus:outline-none focus:ring-1 focus:ring-bb-red"
            />
          </div>

          <div className="rounded-lg bg-blue-50 p-3">
            <p className="text-xs text-blue-700">
              Ao confirmar, todos os alunos matriculados na turma receberão uma notificação informando a substituição.
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1" onClick={() => { setShowCreate(false); resetForm(); }}>
              Cancelar
            </Button>
            <Button
              className="flex-1"
              onClick={handleCreate}
              loading={creating}
              disabled={!formClassId || !formDate || !formOriginalTeacher || !formSubstituteTeacher}
            >
              Confirmar Substituição
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
