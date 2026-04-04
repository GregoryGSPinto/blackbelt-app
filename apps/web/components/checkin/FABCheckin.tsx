'use client';

import { forwardRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/lib/hooks/useToast';
import { doCheckin } from '@/lib/api/checkin.service';
import { AttendanceMethod } from '@/lib/types';

interface FABCheckinProps {
  studentId: string;
  classId: string | null;
  alreadyCheckedIn?: boolean;
}

const FABCheckin = forwardRef<HTMLDivElement, FABCheckinProps>(
  function FABCheckin({ studentId, classId, alreadyCheckedIn = false }, ref) {
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(alreadyCheckedIn);

    if (!classId) return null;

    async function handleManualCheckin() {
      setLoading(true);
      try {
        await doCheckin(studentId, classId!, AttendanceMethod.Manual);
        setDone(true);
        setOpen(false);
        toast('Check-in realizado com sucesso!', 'success');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao fazer check-in.';
        toast(message, 'error');
      } finally {
        setLoading(false);
      }
    }

    return (
      <div ref={ref}>
        <button
          onClick={() => !done && setOpen(true)}
          disabled={done}
          className={`fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all ${
            done
              ? 'bg-bb-success text-white cursor-default'
              : 'bg-bb-red text-white hover:bg-bb-red-dark active:scale-95'
          }`}
          aria-label={done ? 'Já presente' : 'Fazer check-in'}
        >
          {done ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          )}
        </button>

        <Modal open={open} onClose={() => setOpen(false)} title="Check-in">
          <div className="space-y-4">
            <p className="text-sm text-bb-gray-500">Como deseja registrar sua presença?</p>

            <Button
              variant="secondary"
              className="w-full justify-start gap-3"
              onClick={() => {
                toast('Scanner QR será disponível na versão mobile.', 'info');
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              Escanear QR Code
            </Button>

            <Button
              className="w-full justify-start gap-3"
              loading={loading}
              onClick={handleManualCheckin}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
              </svg>
              Check-in Manual
            </Button>
          </div>
        </Modal>
      </div>
    );
  },
);

FABCheckin.displayName = 'FABCheckin';

export { FABCheckin };
