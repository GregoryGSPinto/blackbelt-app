'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const STEPS = ['Logo', 'Turma', 'Professor', 'Pronto'] as const;

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  // Form state (not submitted to API in this version)
  const [className, setClassName] = useState('');
  const [modality, setModality] = useState('');
  const [schedule, setSchedule] = useState('');
  const [professorEmail, setProfessorEmail] = useState('');

  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
  const skip = () => next();

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'var(--bb-depth-0, #121212)',
    color: 'var(--bb-ink-100, #fff)',
    fontSize: 16,
    outline: 'none',
  };

  const btnPrimary: React.CSSProperties = {
    width: '100%',
    padding: '14px',
    borderRadius: 8,
    border: 'none',
    background: 'var(--bb-brand, #C62828)',
    color: '#fff',
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
  };

  const btnSkip: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.5)',
    cursor: 'pointer',
    fontSize: 14,
    textDecoration: 'underline',
    marginTop: 8,
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--bb-depth-0, #121212)',
        color: 'var(--bb-ink-100, #fff)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Progress */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 32 }}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                background: i <= step ? 'var(--bb-brand, #C62828)' : 'rgba(255,255,255,0.12)',
                transition: 'background 0.3s',
              }}
            />
          ))}
        </div>

        {/* Step 0: Logo */}
        {step === 0 && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
              Logo da Academia
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 24 }}>
              Envie o logo da sua academia. Voce pode fazer isso depois.
            </p>
            <div
              style={{
                border: '2px dashed rgba(255,255,255,0.2)',
                borderRadius: 12,
                padding: 40,
                textAlign: 'center',
                color: 'rgba(255,255,255,0.4)',
                marginBottom: 24,
              }}
            >
              <p style={{ fontSize: 14 }}>Arraste uma imagem ou clique para selecionar</p>
              <p style={{ fontSize: 12, marginTop: 4 }}>PNG ou JPG, max 2MB</p>
            </div>
            <button style={btnPrimary} onClick={next}>
              Proximo
            </button>
            <div style={{ textAlign: 'center' }}>
              <button style={btnSkip} onClick={skip}>
                Pular por enquanto
              </button>
            </div>
          </div>
        )}

        {/* Step 1: First Class */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
              Crie sua primeira turma
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 24 }}>
              Configure uma turma para comecar. Voce pode adicionar mais depois.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 14, marginBottom: 6, display: 'block' }}>
                  Nome da turma
                </label>
                <input
                  style={inputStyle}
                  placeholder="Ex: Jiu-Jitsu Adulto Iniciante"
                  value={className}
                  onChange={e => setClassName(e.target.value)}
                />
              </div>
              <div>
                <label style={{ fontSize: 14, marginBottom: 6, display: 'block' }}>
                  Modalidade
                </label>
                <input
                  style={inputStyle}
                  placeholder="Ex: Jiu-Jitsu, Muay Thai, MMA"
                  value={modality}
                  onChange={e => setModality(e.target.value)}
                />
              </div>
              <div>
                <label style={{ fontSize: 14, marginBottom: 6, display: 'block' }}>
                  Horario
                </label>
                <input
                  style={inputStyle}
                  placeholder="Ex: Seg/Qua/Sex 19:00-20:30"
                  value={schedule}
                  onChange={e => setSchedule(e.target.value)}
                />
              </div>
            </div>
            <div style={{ marginTop: 24 }}>
              <button style={btnPrimary} onClick={next}>
                Proximo
              </button>
              <div style={{ textAlign: 'center' }}>
                <button style={btnSkip} onClick={skip}>
                  Pular por enquanto
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Invite Professor */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
              Convide um professor
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 24 }}>
              Envie um convite por e-mail para seu professor. Voce pode convidar mais depois.
            </p>
            <div>
              <label style={{ fontSize: 14, marginBottom: 6, display: 'block' }}>
                E-mail do professor
              </label>
              <input
                type="email"
                style={inputStyle}
                placeholder="professor@exemplo.com"
                value={professorEmail}
                onChange={e => setProfessorEmail(e.target.value)}
              />
            </div>
            <div style={{ marginTop: 24 }}>
              <button style={btnPrimary} onClick={next}>
                Proximo
              </button>
              <div style={{ textAlign: 'center' }}>
                <button style={btnSkip} onClick={skip}>
                  Pular por enquanto
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Done */}
        {step === 3 && (
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'var(--bb-brand, #C62828)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                fontSize: 36,
              }}
            >
              &#10003;
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
              Tudo pronto!
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 32 }}>
              Sua academia esta configurada. Vamos comecar!
            </p>
            <button style={btnPrimary} onClick={() => router.push('/admin')}>
              Ir para o painel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
