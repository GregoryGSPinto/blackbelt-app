'use client';

import { forwardRef, useState, useRef, useCallback, useMemo } from 'react';
import { VideoThumbnailGenerator } from '@/components/video/VideoThumbnailGenerator';
import {
  uploadVideo,
  type VideoUploadResult,
  type UploadProgress,
} from '@/lib/api/video-upload.service';

type VideoModalidade = 'BJJ' | 'Judo' | 'Muay Thai' | 'Wrestling' | 'MMA';
type VideoFaixa = 'Branca' | 'Azul' | 'Roxa' | 'Marrom' | 'Preta';
type VideoDificuldade = 'iniciante' | 'intermediario' | 'avancado' | 'expert';
type VideoCategoria =
  | 'Fundamentos'
  | 'Ataque'
  | 'Defesa'
  | 'Passagem'
  | 'Raspagem'
  | 'Finalização'
  | 'Competição';
type VideoAudience = 'kids' | 'teen' | 'adulto' | 'todos';
type VideoPublishStatus = 'published' | 'draft';

// ── Constants ──────────────────────────────────────────────────────────

const ACCEPTED_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];
const ACCEPTED_EXTENSIONS = '.mp4,.mov,.webm';
const MAX_FILE_SIZE_MB = 500;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const MODALIDADES: VideoModalidade[] = ['BJJ', 'Judo', 'Muay Thai', 'Wrestling', 'MMA'];
const FAIXAS: VideoFaixa[] = ['Branca', 'Azul', 'Roxa', 'Marrom', 'Preta'];
const DIFICULDADES: { value: VideoDificuldade; label: string }[] = [
  { value: 'iniciante', label: 'Iniciante' },
  { value: 'intermediario', label: 'Intermediário' },
  { value: 'avancado', label: 'Avançado' },
  { value: 'expert', label: 'Expert' },
];
const CATEGORIAS: VideoCategoria[] = [
  'Fundamentos',
  'Ataque',
  'Defesa',
  'Passagem',
  'Raspagem',
  'Finalização',
  'Competição',
];
const AUDIENCIAS: { value: VideoAudience; label: string }[] = [
  { value: 'adulto', label: 'Adultos' },
  { value: 'teen', label: 'Teens' },
  { value: 'kids', label: 'Kids' },
  { value: 'todos', label: 'Todos' },
];

// ── Props ──────────────────────────────────────────────────────────────

interface VideoUploaderProps {
  academyId: string;
  professorId: string;
  turmas: { id: string; nome: string; modalidade: string }[];
  onSuccess: (result: VideoUploadResult) => void;
  onCancel: () => void;
}

// ── Types ──────────────────────────────────────────────────────────────

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

interface FormErrors {
  file?: string;
  titulo?: string;
  modalidade?: string;
  faixaMinima?: string;
  dificuldade?: string;
  categoria?: string;
}

// ── Helpers ────────────────────────────────────────────────────────────

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Component ──────────────────────────────────────────────────────────

const VideoUploader = forwardRef<HTMLDivElement, VideoUploaderProps>(
  function VideoUploader({ academyId, professorId: _professorId, turmas, onSuccess, onCancel }, ref) {
    // File state
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [thumbnailBlob, setThumbnailBlob] = useState<Blob | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form state
    const [titulo, setTitulo] = useState('');
    const [descricao, setDescricao] = useState('');
    const [modalidade, setModalidade] = useState<VideoModalidade | ''>('');
    const [faixaMinima, setFaixaMinima] = useState<VideoFaixa | ''>('');
    const [dificuldade, setDificuldade] = useState<VideoDificuldade | ''>('');
    const [categoria, setCategoria] = useState<VideoCategoria | ''>('');
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [audiencia, setAudiencia] = useState<VideoAudience[]>([]);
    const [selectedTurmas, setSelectedTurmas] = useState<string[]>([]);

    // Upload state
    const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
    const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [formErrors, setFormErrors] = useState<FormErrors>({});

    // ── File validation ────────────────────────────────────────────────

    const validateFile = useCallback((file: File): string | null => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        return 'Formato inválido. Use MP4, MOV ou WebM.';
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        return `Arquivo muito grande. Máximo: ${MAX_FILE_SIZE_MB}MB.`;
      }
      return null;
    }, []);

    const handleFileSelect = useCallback(
      (file: File) => {
        const error = validateFile(file);
        if (error) {
          setFormErrors((prev) => ({ ...prev, file: error }));
          return;
        }
        setFormErrors((prev) => {
          const next = { ...prev };
          delete next.file;
          return next;
        });
        setSelectedFile(file);
        setThumbnailBlob(null);
      },
      [validateFile],
    );

    // ── Drag & Drop ────────────────────────────────────────────────────

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
    }, []);

    const handleDrop = useCallback(
      (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);

        const file = e.dataTransfer.files[0];
        if (file) {
          handleFileSelect(file);
        }
      },
      [handleFileSelect],
    );

    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
          handleFileSelect(file);
        }
      },
      [handleFileSelect],
    );

    // ── Tags ───────────────────────────────────────────────────────────

    const handleTagInputKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
          e.preventDefault();
          const newTag = tagInput.trim().replace(/,/g, '');
          if (newTag && !tags.includes(newTag)) {
            setTags((prev) => [...prev, newTag]);
          }
          setTagInput('');
        }
      },
      [tagInput, tags],
    );

    const removeTag = useCallback((tagToRemove: string) => {
      setTags((prev) => prev.filter((t) => t !== tagToRemove));
    }, []);

    // ── Audience toggle ────────────────────────────────────────────────

    const toggleAudiencia = useCallback((value: VideoAudience) => {
      setAudiencia((prev) =>
        prev.includes(value) ? prev.filter((a) => a !== value) : [...prev, value],
      );
    }, []);

    // ── Turma toggle ───────────────────────────────────────────────────

    const toggleTurma = useCallback((turmaId: string) => {
      setSelectedTurmas((prev) =>
        prev.includes(turmaId) ? prev.filter((t) => t !== turmaId) : [...prev, turmaId],
      );
    }, []);

    // ── Thumbnail callback ─────────────────────────────────────────────

    const handleThumbnailGenerated = useCallback((blob: Blob) => {
      setThumbnailBlob(blob);
    }, []);

    // ── Validation ─────────────────────────────────────────────────────

    const validate = useCallback((): boolean => {
      const errors: FormErrors = {};

      if (!selectedFile) errors.file = 'Selecione um vídeo para upload.';
      if (!titulo.trim()) errors.titulo = 'Título é obrigatório.';
      if (!modalidade) errors.modalidade = 'Selecione uma modalidade.';
      if (!faixaMinima) errors.faixaMinima = 'Selecione a faixa mínima.';
      if (!dificuldade) errors.dificuldade = 'Selecione a dificuldade.';
      if (!categoria) errors.categoria = 'Selecione uma categoria.';

      setFormErrors(errors);
      return Object.keys(errors).length === 0;
    }, [selectedFile, titulo, modalidade, faixaMinima, dificuldade, categoria]);

    // ── Submit ─────────────────────────────────────────────────────────

    const handleSubmit = useCallback(
      async (_status: VideoPublishStatus) => {
        if (!validate()) return;
        if (!selectedFile || !modalidade || !faixaMinima || !dificuldade || !categoria) return;

        setUploadStatus('uploading');
        setUploadError(null);
        setUploadProgress(null);

        try {
          const thumbnailFile = thumbnailBlob
            ? new File([thumbnailBlob], 'thumbnail.jpg', { type: 'image/jpeg' })
            : undefined;

          const result = await uploadVideo(
            academyId,
            {
              file: selectedFile,
              thumbnail: thumbnailFile,
              titulo: titulo.trim(),
              descricao: descricao.trim(),
              modalidade,
              faixaMinima,
              dificuldade,
              categoria,
              tags,
              turmaIds: selectedTurmas,
              publicos: audiencia,
            },
            (progress) => {
              setUploadProgress(progress);
            },
          );

          setUploadStatus('success');
          onSuccess(result);
        } catch (err) {
          setUploadStatus('error');
          setUploadError(
            err instanceof Error ? err.message : 'Erro desconhecido durante o upload.',
          );
        }
      },
      [
        validate,
        selectedFile,
        thumbnailBlob,
        titulo,
        descricao,
        modalidade,
        faixaMinima,
        dificuldade,
        categoria,
        tags,
        audiencia,
        selectedTurmas,
        academyId,
        onSuccess,
      ],
    );

    // ── Status message ─────────────────────────────────────────────────

    const statusMessage = useMemo((): string => {
      if (uploadStatus === 'uploading') {
        if (!uploadProgress) return 'Preparando upload...';
        if (uploadProgress.percent < 100) return 'Enviando vídeo...';
        return 'Processando...';
      }
      if (uploadStatus === 'success') return 'Upload concluído!';
      if (uploadStatus === 'error') return uploadError ?? 'Erro no upload.';
      return '';
    }, [uploadStatus, uploadProgress, uploadError]);

    const isUploading = uploadStatus === 'uploading';

    // ── Render ─────────────────────────────────────────────────────────

    return (
      <div
        ref={ref}
        className="mx-auto w-full max-w-2xl"
        style={{
          backgroundColor: 'var(--bb-depth-1)',
          borderRadius: 'var(--bb-radius-lg)',
          boxShadow: 'var(--bb-shadow-lg)',
          border: '1px solid var(--bb-glass-border)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{
            borderBottom: '1px solid var(--bb-glass-border)',
          }}
        >
          <h2
            className="text-lg font-bold"
            style={{ color: 'var(--bb-ink-100)' }}
          >
            Upload de Vídeo
          </h2>
          <button
            type="button"
            onClick={onCancel}
            disabled={isUploading}
            className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:opacity-80 disabled:opacity-40"
            style={{
              backgroundColor: 'var(--bb-depth-3)',
              color: 'var(--bb-ink-60)',
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="space-y-5 p-6">
          {/* Drop zone */}
          {!selectedFile ? (
            <div
              role="button"
              tabIndex={0}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              className="flex cursor-pointer flex-col items-center justify-center gap-3 py-12 transition-all"
              style={{
                borderRadius: 'var(--bb-radius-lg)',
                border: `2px dashed ${dragOver ? 'var(--bb-brand)' : 'var(--bb-glass-border)'}`,
                backgroundColor: dragOver ? 'var(--bb-brand-surface)' : 'var(--bb-depth-2)',
              }}
            >
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full"
                style={{
                  backgroundColor: 'var(--bb-brand-surface)',
                  color: 'var(--bb-brand)',
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium" style={{ color: 'var(--bb-ink-100)' }}>
                  Arraste o vídeo aqui ou clique para selecionar
                </p>
                <p className="mt-1 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                  MP4, MOV ou WebM — até {MAX_FILE_SIZE_MB}MB
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_EXTENSIONS}
                onChange={handleInputChange}
                className="hidden"
              />
            </div>
          ) : (
            /* File selected — show preview + info */
            <div
              className="overflow-hidden"
              style={{
                borderRadius: 'var(--bb-radius-md)',
                border: '1px solid var(--bb-glass-border)',
                backgroundColor: 'var(--bb-depth-2)',
              }}
            >
              <div className="flex gap-4 p-4">
                {/* Thumbnail */}
                <div className="w-40 flex-shrink-0">
                  <VideoThumbnailGenerator
                    videoFile={selectedFile}
                    onThumbnailGenerated={handleThumbnailGenerated}
                    captureTimeSeconds={1}
                  />
                </div>

                {/* File info */}
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <p
                      className="truncate text-sm font-medium"
                      style={{ color: 'var(--bb-ink-100)' }}
                    >
                      {selectedFile.name}
                    </p>
                    <p className="mt-1 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                  {!isUploading && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setThumbnailBlob(null);
                        setFormErrors((prev) => {
                          const next = { ...prev };
                          delete next.file;
                          return next;
                        });
                      }}
                      className="mt-2 self-start text-xs font-medium transition-opacity hover:opacity-80"
                      style={{ color: 'var(--bb-error)' }}
                    >
                      Remover arquivo
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {formErrors.file && (
            <p className="text-xs" style={{ color: 'var(--bb-error)' }}>
              {formErrors.file}
            </p>
          )}

          {/* Form fields */}
          <div className="space-y-4">
            {/* Título */}
            <div>
              <label
                className="mb-1.5 block text-xs font-medium"
                style={{ color: 'var(--bb-ink-80)' }}
              >
                Título *
              </label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                disabled={isUploading}
                placeholder="Ex: Armbar da guarda fechada"
                className="w-full px-3 py-2 text-sm outline-none transition-colors placeholder:opacity-40 disabled:opacity-50"
                style={{
                  backgroundColor: 'var(--bb-depth-2)',
                  color: 'var(--bb-ink-100)',
                  borderRadius: 'var(--bb-radius-sm)',
                  border: `1px solid ${formErrors.titulo ? 'var(--bb-error)' : 'var(--bb-glass-border)'}`,
                }}
              />
              {formErrors.titulo && (
                <p className="mt-1 text-xs" style={{ color: 'var(--bb-error)' }}>
                  {formErrors.titulo}
                </p>
              )}
            </div>

            {/* Descrição */}
            <div>
              <label
                className="mb-1.5 block text-xs font-medium"
                style={{ color: 'var(--bb-ink-80)' }}
              >
                Descrição
              </label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                disabled={isUploading}
                rows={3}
                placeholder="Descreva o conteúdo do vídeo..."
                className="w-full resize-none px-3 py-2 text-sm outline-none transition-colors placeholder:opacity-40 disabled:opacity-50"
                style={{
                  backgroundColor: 'var(--bb-depth-2)',
                  color: 'var(--bb-ink-100)',
                  borderRadius: 'var(--bb-radius-sm)',
                  border: '1px solid var(--bb-glass-border)',
                }}
              />
            </div>

            {/* Selects row 1: Modalidade + Faixa */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  className="mb-1.5 block text-xs font-medium"
                  style={{ color: 'var(--bb-ink-80)' }}
                >
                  Modalidade *
                </label>
                <select
                  value={modalidade}
                  onChange={(e) => setModalidade(e.target.value as VideoModalidade)}
                  disabled={isUploading}
                  className="w-full px-3 py-2 text-sm outline-none disabled:opacity-50"
                  style={{
                    backgroundColor: 'var(--bb-depth-2)',
                    color: 'var(--bb-ink-100)',
                    borderRadius: 'var(--bb-radius-sm)',
                    border: `1px solid ${formErrors.modalidade ? 'var(--bb-error)' : 'var(--bb-glass-border)'}`,
                  }}
                >
                  <option value="">Selecione</option>
                  {MODALIDADES.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                {formErrors.modalidade && (
                  <p className="mt-1 text-xs" style={{ color: 'var(--bb-error)' }}>
                    {formErrors.modalidade}
                  </p>
                )}
              </div>

              <div>
                <label
                  className="mb-1.5 block text-xs font-medium"
                  style={{ color: 'var(--bb-ink-80)' }}
                >
                  Faixa Mínima *
                </label>
                <select
                  value={faixaMinima}
                  onChange={(e) => setFaixaMinima(e.target.value as VideoFaixa)}
                  disabled={isUploading}
                  className="w-full px-3 py-2 text-sm outline-none disabled:opacity-50"
                  style={{
                    backgroundColor: 'var(--bb-depth-2)',
                    color: 'var(--bb-ink-100)',
                    borderRadius: 'var(--bb-radius-sm)',
                    border: `1px solid ${formErrors.faixaMinima ? 'var(--bb-error)' : 'var(--bb-glass-border)'}`,
                  }}
                >
                  <option value="">Selecione</option>
                  {FAIXAS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
                {formErrors.faixaMinima && (
                  <p className="mt-1 text-xs" style={{ color: 'var(--bb-error)' }}>
                    {formErrors.faixaMinima}
                  </p>
                )}
              </div>
            </div>

            {/* Selects row 2: Dificuldade + Categoria */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  className="mb-1.5 block text-xs font-medium"
                  style={{ color: 'var(--bb-ink-80)' }}
                >
                  Dificuldade *
                </label>
                <select
                  value={dificuldade}
                  onChange={(e) => setDificuldade(e.target.value as VideoDificuldade)}
                  disabled={isUploading}
                  className="w-full px-3 py-2 text-sm outline-none disabled:opacity-50"
                  style={{
                    backgroundColor: 'var(--bb-depth-2)',
                    color: 'var(--bb-ink-100)',
                    borderRadius: 'var(--bb-radius-sm)',
                    border: `1px solid ${formErrors.dificuldade ? 'var(--bb-error)' : 'var(--bb-glass-border)'}`,
                  }}
                >
                  <option value="">Selecione</option>
                  {DIFICULDADES.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
                {formErrors.dificuldade && (
                  <p className="mt-1 text-xs" style={{ color: 'var(--bb-error)' }}>
                    {formErrors.dificuldade}
                  </p>
                )}
              </div>

              <div>
                <label
                  className="mb-1.5 block text-xs font-medium"
                  style={{ color: 'var(--bb-ink-80)' }}
                >
                  Categoria *
                </label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value as VideoCategoria)}
                  disabled={isUploading}
                  className="w-full px-3 py-2 text-sm outline-none disabled:opacity-50"
                  style={{
                    backgroundColor: 'var(--bb-depth-2)',
                    color: 'var(--bb-ink-100)',
                    borderRadius: 'var(--bb-radius-sm)',
                    border: `1px solid ${formErrors.categoria ? 'var(--bb-error)' : 'var(--bb-glass-border)'}`,
                  }}
                >
                  <option value="">Selecione</option>
                  {CATEGORIAS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {formErrors.categoria && (
                  <p className="mt-1 text-xs" style={{ color: 'var(--bb-error)' }}>
                    {formErrors.categoria}
                  </p>
                )}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label
                className="mb-1.5 block text-xs font-medium"
                style={{ color: 'var(--bb-ink-80)' }}
              >
                Tags
              </label>
              <div
                className="flex flex-wrap items-center gap-1.5 px-3 py-2"
                style={{
                  backgroundColor: 'var(--bb-depth-2)',
                  borderRadius: 'var(--bb-radius-sm)',
                  border: '1px solid var(--bb-glass-border)',
                  minHeight: '40px',
                }}
              >
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium"
                    style={{
                      backgroundColor: 'var(--bb-brand-surface)',
                      color: 'var(--bb-brand)',
                      borderRadius: 'var(--bb-radius-sm)',
                    }}
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      disabled={isUploading}
                      className="ml-0.5 hover:opacity-70 disabled:opacity-50"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  disabled={isUploading}
                  placeholder={tags.length === 0 ? 'Digite e pressione Enter...' : ''}
                  className="min-w-[100px] flex-1 bg-transparent text-sm outline-none placeholder:opacity-40 disabled:opacity-50"
                  style={{ color: 'var(--bb-ink-100)' }}
                />
              </div>
              <p className="mt-1 text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                Separe as tags com Enter ou vírgula
              </p>
            </div>

            {/* Audiência */}
            <div>
              <label
                className="mb-2 block text-xs font-medium"
                style={{ color: 'var(--bb-ink-80)' }}
              >
                Público-alvo
              </label>
              <div className="flex flex-wrap gap-3">
                {AUDIENCIAS.map(({ value, label }) => (
                  <label
                    key={value}
                    className="flex cursor-pointer items-center gap-2"
                  >
                    <input
                      type="checkbox"
                      checked={audiencia.includes(value)}
                      onChange={() => toggleAudiencia(value)}
                      disabled={isUploading}
                      className="h-4 w-4 rounded accent-current disabled:opacity-50"
                      style={{ accentColor: 'var(--bb-brand)' }}
                    />
                    <span
                      className="text-sm"
                      style={{ color: 'var(--bb-ink-80)' }}
                    >
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Turmas */}
            {turmas.length > 0 && (
              <div>
                <label
                  className="mb-2 block text-xs font-medium"
                  style={{ color: 'var(--bb-ink-80)' }}
                >
                  Turmas
                </label>
                <div
                  className="space-y-2 p-3"
                  style={{
                    backgroundColor: 'var(--bb-depth-2)',
                    borderRadius: 'var(--bb-radius-sm)',
                    border: '1px solid var(--bb-glass-border)',
                    maxHeight: '160px',
                    overflowY: 'auto',
                  }}
                >
                  {turmas.map((turma) => (
                    <label
                      key={turma.id}
                      className="flex cursor-pointer items-center gap-2"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTurmas.includes(turma.id)}
                        onChange={() => toggleTurma(turma.id)}
                        disabled={isUploading}
                        className="h-4 w-4 rounded disabled:opacity-50"
                        style={{ accentColor: 'var(--bb-brand)' }}
                      />
                      <span className="text-sm" style={{ color: 'var(--bb-ink-80)' }}>
                        {turma.nome}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                        ({turma.modalidade})
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Upload progress */}
          {uploadStatus === 'uploading' && uploadProgress && (
            <div
              className="space-y-2 p-4"
              style={{
                backgroundColor: 'var(--bb-depth-2)',
                borderRadius: 'var(--bb-radius-md)',
                border: '1px solid var(--bb-glass-border)',
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium" style={{ color: 'var(--bb-ink-80)' }}>
                  {statusMessage}
                </span>
                <span className="text-xs font-bold" style={{ color: 'var(--bb-brand)' }}>
                  {uploadProgress.percent}%
                </span>
              </div>
              <div
                className="h-2 w-full overflow-hidden"
                style={{
                  backgroundColor: 'var(--bb-depth-4)',
                  borderRadius: 'var(--bb-radius-sm)',
                }}
              >
                <div
                  className="h-full transition-all duration-300 ease-out"
                  style={{
                    width: `${uploadProgress.percent}%`,
                    backgroundColor: 'var(--bb-brand)',
                    borderRadius: 'var(--bb-radius-sm)',
                  }}
                />
              </div>
              <p className="text-xs" style={{ color: 'var(--bb-ink-40)' }}>
                {formatFileSize(uploadProgress.bytesUploaded)} / {formatFileSize(uploadProgress.bytesTotal)}
              </p>
            </div>
          )}

          {/* Upload error */}
          {uploadStatus === 'error' && uploadError && (
            <div
              className="flex items-center gap-2 p-3 text-sm"
              style={{
                backgroundColor: 'var(--bb-depth-2)',
                borderRadius: 'var(--bb-radius-sm)',
                border: '1px solid var(--bb-error)',
                color: 'var(--bb-error)',
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span className="text-xs">{uploadError}</span>
            </div>
          )}

          {/* Uploading spinner status (before progress starts) */}
          {uploadStatus === 'uploading' && !uploadProgress && (
            <div className="flex items-center justify-center gap-2 py-4">
              <div
                className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent"
                style={{ color: 'var(--bb-brand)' }}
              />
              <span className="text-sm" style={{ color: 'var(--bb-ink-60)' }}>
                {statusMessage}
              </span>
            </div>
          )}
        </div>

        {/* Footer with actions */}
        <div
          className="flex items-center justify-between gap-3 px-6 py-4"
          style={{
            borderTop: '1px solid var(--bb-glass-border)',
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            disabled={isUploading}
            className="px-4 py-2 text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-40"
            style={{
              color: 'var(--bb-ink-60)',
              borderRadius: 'var(--bb-radius-sm)',
              border: '1px solid var(--bb-glass-border)',
              backgroundColor: 'var(--bb-depth-2)',
            }}
          >
            Cancelar
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleSubmit('draft')}
              disabled={isUploading}
              className="px-4 py-2 text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-40"
              style={{
                color: 'var(--bb-ink-80)',
                borderRadius: 'var(--bb-radius-sm)',
                border: '1px solid var(--bb-glass-border)',
                backgroundColor: 'var(--bb-depth-2)',
                boxShadow: 'var(--bb-shadow-md)',
              }}
            >
              Salvar como rascunho
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('published')}
              disabled={isUploading}
              className="px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{
                backgroundColor: 'var(--bb-brand)',
                borderRadius: 'var(--bb-radius-sm)',
                boxShadow: 'var(--bb-shadow-md)',
              }}
            >
              Publicar agora
            </button>
          </div>
        </div>
      </div>
    );
  },
);

VideoUploader.displayName = 'VideoUploader';
export { VideoUploader };
export type { VideoUploaderProps };
