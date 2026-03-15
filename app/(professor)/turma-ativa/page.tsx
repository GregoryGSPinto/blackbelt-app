'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getActiveClass, saveAttendance } from '@/lib/api/turma-ativa.service';
import { generateQR } from '@/lib/api/qrcode.service';
import type { ActiveClassDTO, ActiveClassStudent } from '@/lib/api/turma-ativa.service';
import { useToast } from '@/lib/hooks/useToast';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';

const BELT_COLORS: Record<string, string> = {
  white: 'belt-white', gray: 'belt-gray', yellow: 'belt-yellow', orange: 'belt-orange',
  green: 'belt-green', blue: 'belt-blue', purple: 'belt-purple', brown: 'belt-brown', black: 'belt-black',
};

export default function TurmaAtivaPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [classData, setClassData] = useState<ActiveClassDTO | null>(null);
  const [students, setStudents] = useState<ActiveClassStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [qrData, setQrData] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getActiveClass('prof-1');
        setClassData(data);
        if (data) setStudents(data.students);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function togglePresence(studentId: string) {
    setStudents((prev) =>
      prev.map((s) =>
        s.student_id === studentId ? { ...s, is_present: !s.is_present } : s,
      ),
    );
  }

  async function handleGenerateQR() {
    if (!classData) return;
    try {
      const result = await generateQR(classData.class_id);
      setQrData(result.qrData);
      setShowQR(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao gerar QR.';
      toast(message, 'error');
    }
  }

  async function handleEndClass() {
    if (!classData) return;
    setSaving(true);
    try {
      const presentIds = students.filter((s) => s.is_present).map((s) => s.student_id);
      await saveAttendance({ class_id: classData.class_id, present_student_ids: presentIds });
      toast('Chamada salva com sucesso!', 'success');
      setShowConfirm(false);
      router.push('/professor');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar chamada.';
      toast(message, 'error');
    } finally {
      setSaving(false);
    }
  }

  const presentCount = students.filter((s) => s.is_present).length;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bb-gray-900">
        <Spinner size="lg" className="text-bb-white" />
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bb-gray-900 p-4">
        <EmptyState
          title="Nenhuma aula ativa"
          description="Você não tem aula em andamento no momento."
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bb-gray-900 text-bb-white">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-bb-gray-700 bg-bb-gray-900 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">{classData.modality_name}</h1>
            <p className="text-sm text-bb-gray-500">
              {classData.start_time} - {classData.end_time} · {classData.unit_name}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-bb-red">{presentCount}/{students.length}</p>
            <p className="text-xs text-bb-gray-500">presentes</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 p-4">
        <Button variant="secondary" className="flex-1" onClick={handleGenerateQR}>
          Gerar QR Code
        </Button>
        <Button variant="danger" className="flex-1" onClick={() => setShowConfirm(true)}>
          Encerrar Aula
        </Button>
      </div>

      {/* Student list */}
      <div className="space-y-1 px-4 pb-4">
        {students.map((student) => (
          <button
            key={student.student_id}
            onClick={() => togglePresence(student.student_id)}
            className={`flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors ${
              student.is_present ? 'bg-bb-success/20' : 'bg-bb-gray-700'
            }`}
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg border-2 ${
                student.is_present ? 'border-bb-success bg-bb-success' : 'border-bb-gray-500'
              }`}
            >
              {student.is_present && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>

            <Avatar name={student.display_name} size="md" />

            <div className="flex-1">
              <p className="font-medium text-bb-white">{student.display_name}</p>
              <Badge variant="belt" size="sm" className={`bg-${BELT_COLORS[student.belt]} mt-0.5`}>
                {student.belt}
              </Badge>
            </div>

            {student.checked_in_via_qr && (
              <span className="text-xs text-bb-success">QR</span>
            )}
          </button>
        ))}
      </div>

      {/* QR Modal */}
      <Modal open={showQR} onClose={() => setShowQR(false)} title="QR Code para Check-in">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-48 w-48 items-center justify-center rounded-lg bg-white p-4">
            <p className="text-center text-xs text-bb-gray-500 break-all">
              {qrData ? qrData.substring(0, 60) + '...' : 'Gerando...'}
            </p>
          </div>
          <p className="text-center text-sm text-bb-gray-500">
            Peça aos alunos para escanear este QR Code
          </p>
          <p className="text-xs text-bb-gray-500">Expira em 5 minutos</p>
        </div>
      </Modal>

      {/* Confirm end class */}
      <Modal open={showConfirm} onClose={() => setShowConfirm(false)} title="Encerrar Aula" variant="confirm">
        <div className="space-y-4">
          <p className="text-sm text-bb-gray-500">
            Deseja encerrar a aula e salvar a chamada?
          </p>
          <p className="text-sm">
            <span className="font-bold text-bb-red">{presentCount}</span> de{' '}
            <span className="font-bold">{students.length}</span> alunos presentes.
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1" onClick={() => setShowConfirm(false)}>
              Cancelar
            </Button>
            <Button variant="danger" className="flex-1" loading={saving} onClick={handleEndClass}>
              Encerrar e Salvar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
