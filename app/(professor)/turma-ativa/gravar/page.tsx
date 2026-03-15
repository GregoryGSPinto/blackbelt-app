'use client';

import { useState, useRef, useCallback } from 'react';
import { uploadTrainingVideo, type TrainingVideoDTO } from '@/lib/api/training-video.service';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/lib/hooks/useToast';

const STUDENTS = [
  { id: 'student-1', name: 'João Pedro Mendes' },
  { id: 'student-2', name: 'Maria Clara Santos' },
  { id: 'student-3', name: 'Lucas Ferreira' },
  { id: 'student-4', name: 'Ana Beatriz Costa' },
  { id: 'student-5', name: 'Ricardo Almeida' },
];

const CLASSES = [
  { id: 'class-1', name: 'BJJ Fundamental' },
  { id: 'class-2', name: 'BJJ Avançado' },
  { id: 'class-3', name: 'Muay Thai' },
];

export default function GravarTecnicaPage() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploaded, setUploaded] = useState<TrainingVideoDTO | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith('video/')) {
      toast('Selecione um arquivo de vídeo válido', 'error');
      return;
    }
    setFile(f);
    setUploaded(null);
    const url = URL.createObjectURL(f);
    setPreview(url);
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragActive(false);
  }, []);

  const handleUpload = useCallback(async () => {
    if (!file || !selectedStudent || !selectedClass) {
      toast('Preencha todos os campos', 'error');
      return;
    }
    setUploading(true);
    setProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) { clearInterval(progressInterval); return 90; }
        return prev + 10;
      });
    }, 200);

    try {
      const result = await uploadTrainingVideo({
        student_id: selectedStudent,
        class_id: selectedClass,
        uploaded_by: 'prof-1',
        file,
      });
      clearInterval(progressInterval);
      setProgress(100);
      setUploaded(result);
      toast('Vídeo enviado com sucesso!', 'success');
    } catch {
      clearInterval(progressInterval);
      toast('Erro ao enviar vídeo', 'error');
    } finally {
      setUploading(false);
    }
  }, [file, selectedStudent, selectedClass, toast]);

  const handleReset = useCallback(() => {
    setFile(null);
    setPreview(null);
    setUploaded(null);
    setProgress(0);
    setSelectedStudent('');
    setSelectedClass('');
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen bg-bb-gray-900 text-bb-white">
      {/* Header */}
      <div className="border-b border-bb-gray-700 p-4">
        <h1 className="text-lg font-bold">Gravar Técnica</h1>
        <p className="text-sm text-bb-gray-500">Envie um vídeo de treino para análise</p>
      </div>

      <div className="mx-auto max-w-lg space-y-6 p-4">
        {/* Student selector */}
        <div>
          <label className="mb-1 block text-sm font-medium text-bb-gray-400">Aluno</label>
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="w-full rounded-lg border border-bb-gray-600 bg-bb-gray-800 px-3 py-2.5 text-sm text-white"
          >
            <option value="">Selecione o aluno...</option>
            {STUDENTS.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Class selector */}
        <div>
          <label className="mb-1 block text-sm font-medium text-bb-gray-400">Turma</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full rounded-lg border border-bb-gray-600 bg-bb-gray-800 px-3 py-2.5 text-sm text-white"
          >
            <option value="">Selecione a turma...</option>
            {CLASSES.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Upload area */}
        {!uploaded ? (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !file && fileInputRef.current?.click()}
            className={`relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors ${
              dragActive
                ? 'border-bb-primary bg-bb-primary/10'
                : file
                  ? 'border-bb-gray-600 bg-bb-gray-800'
                  : 'border-bb-gray-600 bg-bb-gray-800 hover:border-bb-gray-500'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />

            {!file ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="mb-3 h-10 w-10 text-bb-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p className="text-sm font-medium text-bb-gray-400">Arraste o vídeo aqui</p>
                <p className="mt-1 text-xs text-bb-gray-500">ou clique para selecionar</p>
                <p className="mt-2 text-xs text-bb-gray-600">MP4, MOV, AVI - Máx 500MB</p>
              </>
            ) : (
              <div className="w-full p-4">
                {preview && (
                  <video src={preview} className="mx-auto mb-3 max-h-40 rounded-lg" controls={false} muted />
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">{file.name}</p>
                    <p className="text-xs text-bb-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); }}
                    className="rounded-full p-1 text-bb-gray-400 hover:bg-bb-gray-700 hover:text-white"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Progress bar */}
                {uploading && (
                  <div className="mt-3">
                    <div className="h-2 w-full rounded-full bg-bb-gray-700">
                      <div
                        className="h-full rounded-full bg-bb-primary transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="mt-1 text-center text-xs text-bb-gray-400">{progress}%</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Upload complete - thumbnail */
          <div className="rounded-xl border border-bb-gray-600 bg-bb-gray-800 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-16 w-24 items-center justify-center rounded-lg bg-bb-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-bb-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">Vídeo enviado!</p>
                <p className="text-xs text-bb-gray-400">
                  Status: {uploaded.status === 'processing' ? 'Processando...' : uploaded.status === 'ready' ? 'Pronto' : 'Falhou'}
                </p>
                <p className="text-xs text-bb-gray-500">{uploaded.id}</p>
              </div>
            </div>
            {uploaded.status === 'processing' && (
              <div className="mt-3 flex items-center gap-2">
                <Spinner size="sm" />
                <span className="text-xs text-bb-gray-400">O vídeo está sendo processado. Você será notificado quando estiver pronto.</span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {!uploaded ? (
            <Button
              className="flex-1"
              onClick={handleUpload}
              disabled={!file || !selectedStudent || !selectedClass || uploading}
              loading={uploading}
            >
              {uploading ? 'Enviando...' : 'Enviar Vídeo'}
            </Button>
          ) : (
            <>
              <Button variant="secondary" className="flex-1" onClick={handleReset}>
                Enviar Outro
              </Button>
              <Button className="flex-1" onClick={() => window.location.href = `/analise-video/${uploaded.id}`}>
                Analisar Vídeo
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
