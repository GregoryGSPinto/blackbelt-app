import type { ChampionshipDTO, ChampionshipFilters, CategoryDTO } from '@/lib/api/championships.service';

const delay = () => new Promise((r) => setTimeout(r, 350 + Math.random() * 150));

function makeCategories(championshipId: string): CategoryDTO[] {
  return [
    {
      id: `cat-${championshipId}-1`, championship_id: championshipId, modality: 'BJJ', belt_range: 'Branca-Azul', weight_range: 'Leve (até 76kg)', age_range: 'Adulto (18-29)', gender: 'masculino',
      participants: [
        { athlete_id: 'ath-1', athlete_name: 'Lucas Ferreira', academy: 'Academia Tatame Centro' },
        { athlete_id: 'ath-2', athlete_name: 'Rafael Santos', academy: 'Team Kime Norte' },
        { athlete_id: 'ath-3', athlete_name: 'Pedro Oliveira', academy: 'Escola Ippon Sul' },
        { athlete_id: 'ath-4', athlete_name: 'Matheus Costa', academy: 'Equipe Dragão Leste' },
      ],
      bracket: null,
    },
    {
      id: `cat-${championshipId}-2`, championship_id: championshipId, modality: 'BJJ', belt_range: 'Branca-Azul', weight_range: 'Médio (até 82kg)', age_range: 'Adulto (18-29)', gender: 'masculino',
      participants: [
        { athlete_id: 'ath-5', athlete_name: 'Gabriel Almeida', academy: 'Academia Vitória Oeste' },
        { athlete_id: 'ath-6', athlete_name: 'Bruno Lima', academy: 'Team Bushido Moema' },
        { athlete_id: 'ath-7', athlete_name: 'Thiago Nascimento', academy: 'Equipe Samurai Jardins' },
        { athlete_id: 'ath-8', athlete_name: 'Diego Ribeiro', academy: 'Academia Leão Pinheiros' },
      ],
      bracket: null,
    },
    {
      id: `cat-${championshipId}-3`, championship_id: championshipId, modality: 'BJJ', belt_range: 'Roxa-Preta', weight_range: 'Leve (até 76kg)', age_range: 'Adulto (18-29)', gender: 'masculino',
      participants: [
        { athlete_id: 'ath-9', athlete_name: 'Felipe Souza', academy: 'Academia Tatame Centro' },
        { athlete_id: 'ath-10', athlete_name: 'André Martins', academy: 'Team Kime Norte' },
        { athlete_id: 'ath-11', athlete_name: 'Rodrigo Campos', academy: 'Escola Ippon Sul' },
        { athlete_id: 'ath-12', athlete_name: 'Vinícius Rocha', academy: 'Equipe Dragão Leste' },
      ],
      bracket: null,
    },
    {
      id: `cat-${championshipId}-4`, championship_id: championshipId, modality: 'BJJ', belt_range: 'Roxa-Preta', weight_range: 'Pesado (até 94kg)', age_range: 'Adulto (18-29)', gender: 'masculino',
      participants: [
        { athlete_id: 'ath-13', athlete_name: 'Gustavo Pereira', academy: 'Academia Vitória Oeste' },
        { athlete_id: 'ath-14', athlete_name: 'Leandro Silva', academy: 'Team Bushido Moema' },
        { athlete_id: 'ath-15', athlete_name: 'Marcelo Barbosa', academy: 'Equipe Samurai Jardins' },
        { athlete_id: 'ath-16', athlete_name: 'Eduardo Mendes', academy: 'Academia Leão Pinheiros' },
      ],
      bracket: null,
    },
    {
      id: `cat-${championshipId}-5`, championship_id: championshipId, modality: 'BJJ', belt_range: 'Branca-Azul', weight_range: 'Leve (até 64kg)', age_range: 'Adulto (18-29)', gender: 'feminino',
      participants: [
        { athlete_id: 'ath-17', athlete_name: 'Ana Paula Soares', academy: 'Academia Tatame Centro' },
        { athlete_id: 'ath-18', athlete_name: 'Juliana Moreira', academy: 'Team Kime Norte' },
        { athlete_id: 'ath-19', athlete_name: 'Camila Teixeira', academy: 'Escola Ippon Sul' },
        { athlete_id: 'ath-20', athlete_name: 'Bianca Araújo', academy: 'Equipe Dragão Leste' },
      ],
      bracket: null,
    },
    {
      id: `cat-${championshipId}-6`, championship_id: championshipId, modality: 'BJJ', belt_range: 'Branca-Azul', weight_range: 'Médio (até 70kg)', age_range: 'Adulto (18-29)', gender: 'feminino',
      participants: [
        { athlete_id: 'ath-21', athlete_name: 'Fernanda Cardoso', academy: 'Academia Vitória Oeste' },
        { athlete_id: 'ath-22', athlete_name: 'Patrícia Nunes', academy: 'Team Bushido Moema' },
        { athlete_id: 'ath-23', athlete_name: 'Isabela Correia', academy: 'Equipe Samurai Jardins' },
        { athlete_id: 'ath-24', athlete_name: 'Letícia Monteiro', academy: 'Academia Leão Pinheiros' },
      ],
      bracket: null,
    },
    {
      id: `cat-${championshipId}-7`, championship_id: championshipId, modality: 'Judô', belt_range: 'Todas', weight_range: 'Leve (até 73kg)', age_range: 'Adulto (18-29)', gender: 'masculino',
      participants: [
        { athlete_id: 'ath-25', athlete_name: 'Roberto Yamamoto', academy: 'Judô Nippon' },
        { athlete_id: 'ath-26', athlete_name: 'Carlos Tanaka', academy: 'Budokan SP' },
        { athlete_id: 'ath-27', athlete_name: 'Marcos Fujimoto', academy: 'Kodokan Brasil' },
        { athlete_id: 'ath-28', athlete_name: 'Daniel Watanabe', academy: 'Judô Nippon' },
      ],
      bracket: null,
    },
    {
      id: `cat-${championshipId}-8`, championship_id: championshipId, modality: 'Judô', belt_range: 'Todas', weight_range: 'Médio (até 81kg)', age_range: 'Adulto (18-29)', gender: 'masculino',
      participants: [
        { athlete_id: 'ath-29', athlete_name: 'Paulo Takahashi', academy: 'Budokan SP' },
        { athlete_id: 'ath-30', athlete_name: 'Ricardo Morimoto', academy: 'Kodokan Brasil' },
        { athlete_id: 'ath-31', athlete_name: 'Alexandre Nakamura', academy: 'Judô Nippon' },
        { athlete_id: 'ath-32', athlete_name: 'João Sato', academy: 'Budokan SP' },
      ],
      bracket: null,
    },
  ];
}

const CHAMPIONSHIPS: ChampionshipDTO[] = [
  {
    id: 'champ-1',
    organizer_id: 'org-1',
    name: 'Copa Paulista de Jiu-Jitsu 2026',
    description: 'O maior campeonato estadual de Jiu-Jitsu de São Paulo. Mais de 500 atletas competindo em diversas categorias de faixa e peso. Evento organizado pela Federação Paulista de Jiu-Jitsu.',
    date: '2026-04-18',
    location: 'Ginásio do Ibirapuera, São Paulo - SP',
    modalities: ['BJJ', 'No-Gi'],
    categories: makeCategories('champ-1'),
    registration_fee: 120,
    registration_deadline: '2026-04-10',
    max_participants: 512,
    current_participants: 347,
    rules_pdf_url: '/docs/regras-copa-paulista-2026.pdf',
    status: 'registration_open',
  },
  {
    id: 'champ-2',
    organizer_id: 'org-2',
    name: 'Brasileiro de Judô - Etapa Sul',
    description: 'Etapa classificatória do Campeonato Brasileiro de Judô. Os melhores atletas da região Sul disputam vagas para a final nacional.',
    date: '2026-03-15',
    location: 'Arena Multiuso, Curitiba - PR',
    modalities: ['Judô'],
    categories: makeCategories('champ-2'),
    registration_fee: 80,
    registration_deadline: '2026-03-08',
    max_participants: 256,
    current_participants: 198,
    rules_pdf_url: '/docs/regras-brasileiro-judo-2026.pdf',
    status: 'in_progress',
    live_stream_url: 'https://stream.example.com/brasileiro-judo',
  },
  {
    id: 'champ-3',
    organizer_id: 'org-1',
    name: 'Grand Slam Rio de Janeiro 2026',
    description: 'Campeonato internacional realizado no Rio de Janeiro com atletas de todo o Brasil e convidados internacionais. Premiação total de R$ 50.000.',
    date: '2026-02-20',
    location: 'Maracanãzinho, Rio de Janeiro - RJ',
    modalities: ['BJJ', 'No-Gi', 'Judô'],
    categories: makeCategories('champ-3'),
    registration_fee: 200,
    registration_deadline: '2026-02-10',
    max_participants: 1024,
    current_participants: 892,
    rules_pdf_url: '/docs/regras-grand-slam-2026.pdf',
    status: 'finished',
  },
  {
    id: 'champ-4',
    organizer_id: 'org-3',
    name: 'Open Nordeste de Jiu-Jitsu',
    description: 'Campeonato aberto da região Nordeste. Todas as faixas e idades. Inscrições abertas em breve.',
    date: '2026-06-12',
    location: 'Centro de Convenções, Salvador - BA',
    modalities: ['BJJ'],
    categories: makeCategories('champ-4'),
    registration_fee: 90,
    registration_deadline: '2026-06-05',
    max_participants: 384,
    current_participants: 0,
    rules_pdf_url: null,
    status: 'draft',
  },
];

export async function mockCreateChampionship(data: Omit<ChampionshipDTO, 'id' | 'current_participants' | 'categories'>): Promise<ChampionshipDTO> {
  await delay();
  const champ: ChampionshipDTO = {
    ...data,
    id: `champ-${Date.now()}`,
    current_participants: 0,
    categories: [],
  };
  CHAMPIONSHIPS.push(champ);
  return { ...champ };
}

export async function mockGetChampionships(filters?: ChampionshipFilters): Promise<ChampionshipDTO[]> {
  await delay();
  let result = CHAMPIONSHIPS.map((c) => ({ ...c, categories: c.categories.map((cat) => ({ ...cat })) }));
  if (filters?.modality) {
    result = result.filter((c) => c.modalities.includes(filters.modality!));
  }
  if (filters?.region) {
    result = result.filter((c) => c.location.toLowerCase().includes(filters.region!.toLowerCase()));
  }
  if (filters?.status) {
    result = result.filter((c) => c.status === filters.status);
  }
  if (filters?.date_from) {
    result = result.filter((c) => c.date >= filters.date_from!);
  }
  if (filters?.date_to) {
    result = result.filter((c) => c.date <= filters.date_to!);
  }
  return result;
}

export async function mockGetChampionshipById(id: string): Promise<ChampionshipDTO> {
  await delay();
  const champ = CHAMPIONSHIPS.find((c) => c.id === id);
  if (!champ) throw new Error('Championship not found');
  return { ...champ, categories: champ.categories.map((cat) => ({ ...cat, participants: cat.participants.map((p) => ({ ...p })) })) };
}

export async function mockOpenRegistration(id: string): Promise<ChampionshipDTO> {
  await delay();
  const champ = CHAMPIONSHIPS.find((c) => c.id === id);
  if (!champ) throw new Error('Championship not found');
  champ.status = 'registration_open';
  return { ...champ, categories: champ.categories.map((cat) => ({ ...cat })) };
}

export async function mockCloseRegistration(id: string): Promise<ChampionshipDTO> {
  await delay();
  const champ = CHAMPIONSHIPS.find((c) => c.id === id);
  if (!champ) throw new Error('Championship not found');
  champ.status = 'closed';
  return { ...champ, categories: champ.categories.map((cat) => ({ ...cat })) };
}
