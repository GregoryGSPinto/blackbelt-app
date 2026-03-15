import type { RegistrationDTO, RegisterPayload, RegistrationStatus } from '@/lib/api/championship-registration.service';

const delay = () => new Promise((r) => setTimeout(r, 300 + Math.random() * 200));

const ATHLETES = [
  { id: 'ath-1', name: 'Lucas Ferreira', academy: 'Gracie Barra Centro', belt: 'Azul', weight: 76, age: 24, gender: 'masculino' as const },
  { id: 'ath-2', name: 'Rafael Santos', academy: 'Alliance Norte', belt: 'Azul', weight: 74, age: 26, gender: 'masculino' as const },
  { id: 'ath-3', name: 'Pedro Oliveira', academy: 'CheckMat Sul', belt: 'Branca', weight: 80, age: 22, gender: 'masculino' as const },
  { id: 'ath-4', name: 'Matheus Costa', academy: 'Atos JJ Leste', belt: 'Roxa', weight: 82, age: 28, gender: 'masculino' as const },
  { id: 'ath-5', name: 'Gabriel Almeida', academy: 'Nova União Oeste', belt: 'Azul', weight: 70, age: 23, gender: 'masculino' as const },
  { id: 'ath-6', name: 'Bruno Lima', academy: 'GFTeam Moema', belt: 'Marrom', weight: 88, age: 30, gender: 'masculino' as const },
  { id: 'ath-7', name: 'Thiago Nascimento', academy: 'Carlson Gracie Jardins', belt: 'Preta', weight: 94, age: 32, gender: 'masculino' as const },
  { id: 'ath-8', name: 'Diego Ribeiro', academy: 'Ribeiro JJ Pinheiros', belt: 'Roxa', weight: 76, age: 27, gender: 'masculino' as const },
  { id: 'ath-9', name: 'Felipe Souza', academy: 'Gracie Barra Centro', belt: 'Azul', weight: 68, age: 21, gender: 'masculino' as const },
  { id: 'ath-10', name: 'André Martins', academy: 'Alliance Norte', belt: 'Branca', weight: 85, age: 25, gender: 'masculino' as const },
  { id: 'ath-17', name: 'Ana Paula Soares', academy: 'Gracie Barra Centro', belt: 'Azul', weight: 58, age: 24, gender: 'feminino' as const },
  { id: 'ath-18', name: 'Juliana Moreira', academy: 'Alliance Norte', belt: 'Branca', weight: 64, age: 22, gender: 'feminino' as const },
  { id: 'ath-19', name: 'Camila Teixeira', academy: 'CheckMat Sul', belt: 'Azul', weight: 60, age: 26, gender: 'feminino' as const },
  { id: 'ath-20', name: 'Bianca Araújo', academy: 'Atos JJ Leste', belt: 'Roxa', weight: 66, age: 28, gender: 'feminino' as const },
  { id: 'ath-21', name: 'Fernanda Cardoso', academy: 'Nova União Oeste', belt: 'Azul', weight: 62, age: 23, gender: 'feminino' as const },
  { id: 'ath-22', name: 'Patrícia Nunes', academy: 'GFTeam Moema', belt: 'Branca', weight: 56, age: 20, gender: 'feminino' as const },
];

const CATEGORIES = [
  { id: 'cat-champ-1-1', label: 'BJJ Branca-Azul Leve Masc', modality: 'BJJ' },
  { id: 'cat-champ-1-2', label: 'BJJ Branca-Azul Médio Masc', modality: 'BJJ' },
  { id: 'cat-champ-1-3', label: 'BJJ Roxa-Preta Leve Masc', modality: 'BJJ' },
  { id: 'cat-champ-1-4', label: 'BJJ Roxa-Preta Pesado Masc', modality: 'BJJ' },
  { id: 'cat-champ-1-5', label: 'BJJ Branca-Azul Leve Fem', modality: 'BJJ' },
  { id: 'cat-champ-1-6', label: 'BJJ Branca-Azul Médio Fem', modality: 'BJJ' },
  { id: 'cat-champ-1-7', label: 'Judô Leve Masc', modality: 'Judô' },
  { id: 'cat-champ-1-8', label: 'Judô Médio Masc', modality: 'Judô' },
];

const STATUSES: RegistrationStatus[] = ['inscrito', 'pesagem', 'competindo', 'resultado'];

const REGISTRATIONS: RegistrationDTO[] = [];

// Generate 60 registrations spread across 8 categories
for (let i = 0; i < 60; i++) {
  const ath = ATHLETES[i % ATHLETES.length];
  const cat = CATEGORIES[i % CATEGORIES.length];
  const statusIdx = Math.min(Math.floor(i / 15), 3);
  const status = STATUSES[statusIdx];
  const hasPaid = status !== 'inscrito' || Math.random() > 0.3;
  const hasWeighIn = status === 'pesagem' || status === 'competindo' || status === 'resultado';
  const actualWeight = hasWeighIn ? ath.weight + (Math.random() * 2 - 1) : null;

  REGISTRATIONS.push({
    id: `reg-${i + 1}`,
    championship_id: 'champ-1',
    championship_name: 'Copa Paulista de Jiu-Jitsu 2026',
    athlete_id: `${ath.id}-${i}`,
    athlete_name: ath.name,
    academy: ath.academy,
    category_id: cat.id,
    category_label: cat.label,
    modality: cat.modality,
    belt: ath.belt,
    weight_declared: ath.weight,
    weight_actual: actualWeight ? Math.round(actualWeight * 10) / 10 : null,
    age: ath.age,
    gender: ath.gender,
    status,
    paid: hasPaid,
    paid_at: hasPaid ? '2026-03-01T10:00:00Z' : null,
    receipt_url: hasPaid ? `/receipts/reg-${i + 1}.pdf` : null,
    weigh_in_at: hasWeighIn ? '2026-04-18T07:30:00Z' : null,
    weigh_in_by: hasWeighIn ? 'admin-1' : null,
    created_at: '2026-03-01T10:00:00Z',
  });
}

export async function mockRegister(championshipId: string, categoryId: string, data: RegisterPayload): Promise<RegistrationDTO> {
  await delay();
  const cat = CATEGORIES.find((c) => c.id === categoryId) ?? CATEGORIES[0];
  const reg: RegistrationDTO = {
    id: `reg-${Date.now()}`,
    championship_id: championshipId,
    championship_name: 'Copa Paulista de Jiu-Jitsu 2026',
    athlete_id: data.athlete_id,
    athlete_name: data.athlete_name,
    academy: data.academy,
    category_id: categoryId,
    category_label: cat.label,
    modality: cat.modality,
    belt: data.belt,
    weight_declared: data.weight_declared,
    weight_actual: null,
    age: data.age,
    gender: data.gender,
    status: 'inscrito',
    paid: false,
    paid_at: null,
    receipt_url: null,
    weigh_in_at: null,
    weigh_in_by: null,
    created_at: new Date().toISOString(),
  };
  REGISTRATIONS.push(reg);
  return { ...reg };
}

export async function mockGetMyRegistrations(_userId: string): Promise<RegistrationDTO[]> {
  await delay();
  return REGISTRATIONS.filter((r) => r.athlete_id.startsWith('ath-1')).map((r) => ({ ...r }));
}

export async function mockConfirmWeighIn(registrationId: string, actualWeight: number): Promise<RegistrationDTO> {
  await delay();
  const reg = REGISTRATIONS.find((r) => r.id === registrationId);
  if (!reg) throw new Error('Registration not found');
  reg.weight_actual = actualWeight;
  reg.status = 'pesagem';
  reg.weigh_in_at = new Date().toISOString();
  reg.weigh_in_by = 'admin-1';
  return { ...reg };
}

export async function mockChangeCategory(registrationId: string, newCategoryId: string): Promise<RegistrationDTO> {
  await delay();
  const reg = REGISTRATIONS.find((r) => r.id === registrationId);
  if (!reg) throw new Error('Registration not found');
  const cat = CATEGORIES.find((c) => c.id === newCategoryId) ?? CATEGORIES[0];
  reg.category_id = newCategoryId;
  reg.category_label = cat.label;
  return { ...reg };
}

export async function mockGetRegistrationsByChampionship(_championshipId: string): Promise<RegistrationDTO[]> {
  await delay();
  return REGISTRATIONS.map((r) => ({ ...r }));
}
