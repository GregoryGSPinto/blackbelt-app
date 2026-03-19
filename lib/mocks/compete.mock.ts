import type {
  Tournament,
  TournamentCircuit,
  TournamentCategory,
  TournamentRegistration,
  TournamentBracket,
  TournamentMatch,
  AthleteProfile,
  AcademyTournamentStats,
  TournamentFeedItem,
  TournamentPrediction,
  MedalTableEntry,
  TournamentStats,
  TournamentStatus,
  CircuitStatus,
  FeedItemType,
  CreateTournamentPayload,
  UpdateTournamentPayload,
  CreateCategoryPayload,
  RegisterAthletePayload,
  RecordResultPayload,
  SubmitPredictionPayload,
  PredictionLeaderboardEntry,
  CircuitRankingEntry,
  MatchMethodType,
} from '@/lib/api/compete.service';

const T_ID = 'trn-copa-bh-2026';
const T_SLUG = 'copa-blackbelt-bh-2026';
const CIRCUIT_ID = 'circuit-mg-2026';
const NOW = '2026-04-15T18:00:00Z';

interface AcademyDef { id: string; name: string; athletes: number }

const ACADEMIES: AcademyDef[] = [
  { id: 'acad-1', name: 'Guerreiros BJJ', athletes: 12 },
  { id: 'acad-2', name: 'Alliance BH', athletes: 10 },
  { id: 'acad-3', name: 'Gracie Barra BH', athletes: 8 },
  { id: 'acad-4', name: 'Atos BH', athletes: 6 },
  { id: 'acad-5', name: 'Nova União MG', athletes: 6 },
  { id: 'acad-6', name: 'CheckMat BH', athletes: 5 },
  { id: 'acad-7', name: 'GFTeam MG', athletes: 5 },
  { id: 'acad-8', name: 'Dream Art MG', athletes: 4 },
  { id: 'acad-9', name: 'Carlson Gracie BH', athletes: 4 },
  { id: 'acad-10', name: 'Ryan Gracie BH', athletes: 4 },
  { id: 'acad-11', name: 'Ribeiro JJ BH', athletes: 4 },
  { id: 'acad-12', name: 'Soul Fighters MG', athletes: 3 },
  { id: 'acad-13', name: 'ZR Team BH', athletes: 3 },
  { id: 'acad-14', name: 'De La Riva BH', athletes: 3 },
  { id: 'acad-15', name: 'Cicero Costha BH', athletes: 3 },
  { id: 'acad-16', name: 'BTT BH', athletes: 3 },
  { id: 'acad-17', name: 'Infight MG', athletes: 3 },
  { id: 'acad-18', name: 'Caio Terra BH', athletes: 3 },
  { id: 'acad-19', name: 'Unity BH', athletes: 2 },
  { id: 'acad-20', name: 'Ns Brotherhood BH', athletes: 2 },
  { id: 'acad-21', name: 'Fight Sports MG', athletes: 2 },
  { id: 'acad-22', name: 'Barbosa JJ BH', athletes: 2 },
  { id: 'acad-23', name: 'Lotus Club MG', athletes: 2 },
  { id: 'acad-24', name: 'Gordo JJ BH', athletes: 2 },
  { id: 'acad-25', name: 'Kimura BJJ MG', athletes: 2 },
];

export const MOCK_TOURNAMENT: Tournament = {
  id: T_ID, name: 'Copa BlackBelt BH 2026', slug: T_SLUG,
  description: 'O maior campeonato de Jiu-Jitsu de Belo Horizonte. Atletas de todo o estado competindo em diversas categorias.',
  rules: 'Regras CBJJ vigentes. Gi obrigatório nas categorias BJJ.',
  date: '2026-04-15', endDate: '2026-04-16', venue: 'Ginásio Poliesportivo de BH',
  address: 'Av. Augusto de Lima, 2000 - Barro Preto', city: 'Belo Horizonte', state: 'MG',
  organizerId: 'org-1', academyId: null, circuitId: CIRCUIT_ID, circuitStage: 1,
  status: 'completed', modality: 'BJJ', registrationFee: 100, registrationDeadline: '2026-04-10',
  maxRegistrations: 200, totalRegistrations: 120, totalAcademies: 25, totalAreas: 4,
  bannerUrl: '/images/tournaments/copa-blackbelt-bh.jpg', logoUrl: '/images/tournaments/copa-blackbelt-logo.png',
  isFeatured: true, publishedAt: '2026-03-01T12:00:00Z', createdAt: '2026-02-15T10:00:00Z', updatedAt: NOW,
};

const MOCK_TOURNAMENT_UPCOMING: Tournament = {
  ...MOCK_TOURNAMENT, id: 'trn-etapa2-mg', name: 'Copa BlackBelt Uberlândia 2026',
  slug: 'copa-blackbelt-uberlandia-2026', date: '2026-06-20', endDate: '2026-06-21',
  venue: 'Ginásio Sabiazinho', city: 'Uberlândia', circuitStage: 2, status: 'registration_open',
  totalRegistrations: 45, totalAcademies: 12, publishedAt: '2026-05-01T12:00:00Z',
  createdAt: '2026-04-20T10:00:00Z', updatedAt: '2026-05-01T12:00:00Z',
};

export const MOCK_CIRCUIT: TournamentCircuit = {
  id: CIRCUIT_ID, name: 'Circuito BlackBelt MG 2026', slug: 'circuito-blackbelt-mg-2026',
  description: 'Série de 4 etapas de Jiu-Jitsu em Minas Gerais ao longo de 2026.',
  season: '2026', region: 'Minas Gerais', organizerId: 'org-1', totalStages: 4,
  status: 'active', logoUrl: '/images/circuits/circuito-mg.png',
  stages: [MOCK_TOURNAMENT, MOCK_TOURNAMENT_UPCOMING],
  createdAt: '2026-01-10T10:00:00Z', updatedAt: NOW,
};

export const MOCK_CATEGORIES: TournamentCategory[] = [
  { id: 'cat-1', tournamentId: T_ID, name: 'Branca Galo Masc', beltRange: 'Branca', weightRange: 'Galo (até 57.5kg)', ageRange: 'Adulto', gender: 'masculino', modality: 'BJJ', matchDurationSeconds: 300, totalRegistrations: 8, status: 'completed', createdAt: '2026-03-01T12:00:00Z' },
  { id: 'cat-2', tournamentId: T_ID, name: 'Branca Leve Masc', beltRange: 'Branca', weightRange: 'Leve (até 76kg)', ageRange: 'Adulto', gender: 'masculino', modality: 'BJJ', matchDurationSeconds: 300, totalRegistrations: 12, status: 'completed', createdAt: '2026-03-01T12:00:00Z' },
  { id: 'cat-3', tournamentId: T_ID, name: 'Azul Pena Masc', beltRange: 'Azul', weightRange: 'Pena (até 70kg)', ageRange: 'Adulto', gender: 'masculino', modality: 'BJJ', matchDurationSeconds: 360, totalRegistrations: 10, status: 'completed', createdAt: '2026-03-01T12:00:00Z' },
  { id: 'cat-4', tournamentId: T_ID, name: 'Azul Médio Masc', beltRange: 'Azul', weightRange: 'Médio (até 82kg)', ageRange: 'Adulto', gender: 'masculino', modality: 'BJJ', matchDurationSeconds: 360, totalRegistrations: 10, status: 'completed', createdAt: '2026-03-01T12:00:00Z' },
  { id: 'cat-5', tournamentId: T_ID, name: 'Roxa Leve Masc', beltRange: 'Roxa', weightRange: 'Leve (até 76kg)', ageRange: 'Adulto', gender: 'masculino', modality: 'BJJ', matchDurationSeconds: 420, totalRegistrations: 8, status: 'completed', createdAt: '2026-03-01T12:00:00Z' },
  { id: 'cat-6', tournamentId: T_ID, name: 'Roxa Pesado Masc', beltRange: 'Roxa', weightRange: 'Pesado (até 94kg)', ageRange: 'Adulto', gender: 'masculino', modality: 'BJJ', matchDurationSeconds: 420, totalRegistrations: 8, status: 'completed', createdAt: '2026-03-01T12:00:00Z' },
  { id: 'cat-7', tournamentId: T_ID, name: 'Marrom/Preta Leve Masc', beltRange: 'Marrom-Preta', weightRange: 'Leve (até 76kg)', ageRange: 'Adulto', gender: 'masculino', modality: 'BJJ', matchDurationSeconds: 480, totalRegistrations: 8, status: 'completed', createdAt: '2026-03-01T12:00:00Z' },
  { id: 'cat-8', tournamentId: T_ID, name: 'Preta Absoluto Masc', beltRange: 'Preta', weightRange: 'Absoluto', ageRange: 'Adulto', gender: 'masculino', modality: 'BJJ', matchDurationSeconds: 600, totalRegistrations: 8, status: 'completed', createdAt: '2026-03-01T12:00:00Z' },
  { id: 'cat-9', tournamentId: T_ID, name: 'Branca Leve Fem', beltRange: 'Branca', weightRange: 'Leve (até 64kg)', ageRange: 'Adulto', gender: 'feminino', modality: 'BJJ', matchDurationSeconds: 300, totalRegistrations: 8, status: 'completed', createdAt: '2026-03-01T12:00:00Z' },
  { id: 'cat-10', tournamentId: T_ID, name: 'Azul Médio Fem', beltRange: 'Azul', weightRange: 'Médio (até 74kg)', ageRange: 'Adulto', gender: 'feminino', modality: 'BJJ', matchDurationSeconds: 360, totalRegistrations: 8, status: 'completed', createdAt: '2026-03-01T12:00:00Z' },
  { id: 'cat-11', tournamentId: T_ID, name: 'Juvenil Branca Leve Masc', beltRange: 'Branca', weightRange: 'Leve (até 66kg)', ageRange: 'Juvenil (16-17)', gender: 'masculino', modality: 'BJJ', matchDurationSeconds: 300, totalRegistrations: 8, status: 'completed', createdAt: '2026-03-01T12:00:00Z' },
  { id: 'cat-12', tournamentId: T_ID, name: 'Master Azul Pesado Masc', beltRange: 'Azul', weightRange: 'Pesado (até 94kg)', ageRange: 'Master (30+)', gender: 'masculino', modality: 'BJJ', matchDurationSeconds: 300, totalRegistrations: 8, status: 'completed', createdAt: '2026-03-01T12:00:00Z' },
];

interface FighterDef { id: string; name: string; academyIdx: number }
const CF: Record<string, FighterDef[]> = {
  'cat-1': [{id:'f-1',name:'Lucas Mendes',academyIdx:0},{id:'f-2',name:'Rafael Gomes',academyIdx:1},{id:'f-3',name:'Pedro Alves',academyIdx:2},{id:'f-4',name:'Matheus Dias',academyIdx:3},{id:'f-5',name:'Bruno Cardoso',academyIdx:4},{id:'f-6',name:'Thiago Reis',academyIdx:5},{id:'f-7',name:'Diego Nunes',academyIdx:6},{id:'f-8',name:'Vitor Prado',academyIdx:7}],
  'cat-2': [{id:'f-9',name:'Gabriel Santos',academyIdx:0},{id:'f-10',name:'André Ribeiro',academyIdx:1},{id:'f-11',name:'Caio Lopes',academyIdx:2},{id:'f-12',name:'Felipe Rocha',academyIdx:3},{id:'f-13',name:'Marcos Vieira',academyIdx:8},{id:'f-14',name:'Luan Costa',academyIdx:9},{id:'f-15',name:'Henrique Melo',academyIdx:10},{id:'f-16',name:'Igor Barros',academyIdx:11}],
  'cat-3': [{id:'f-17',name:'Rodrigo Campos',academyIdx:0},{id:'f-18',name:'Vinícius Rocha',academyIdx:1},{id:'f-19',name:'Gustavo Pereira',academyIdx:2},{id:'f-20',name:'Leandro Silva',academyIdx:4},{id:'f-21',name:'Marcelo Barbosa',academyIdx:5},{id:'f-22',name:'Eduardo Lima',academyIdx:12},{id:'f-23',name:'Fernando Souza',academyIdx:13},{id:'f-24',name:'Ricardo Ramos',academyIdx:14}],
  'cat-4': [{id:'f-25',name:'Paulo Freitas',academyIdx:0},{id:'f-26',name:'Tiago Moreira',academyIdx:1},{id:'f-27',name:'Danilo Oliveira',academyIdx:3},{id:'f-28',name:'Renato Cruz',academyIdx:6},{id:'f-29',name:'Samuel Teixeira',academyIdx:7},{id:'f-30',name:'Otávio Martins',academyIdx:15},{id:'f-31',name:'Alex Cunha',academyIdx:16},{id:'f-32',name:'Fábio Duarte',academyIdx:17}],
  'cat-5': [{id:'f-33',name:'Roberto Cyborg',academyIdx:0},{id:'f-34',name:'Anderson Pires',academyIdx:2},{id:'f-35',name:'Jonas Batista',academyIdx:4},{id:'f-36',name:'William Cardozo',academyIdx:1},{id:'f-37',name:'Cristiano Faria',academyIdx:8},{id:'f-38',name:'Renan Tavares',academyIdx:18},{id:'f-39',name:'Murilo Pinto',academyIdx:19},{id:'f-40',name:'Júlio Araújo',academyIdx:20}],
  'cat-6': [{id:'f-41',name:'Cássio Monteiro',academyIdx:0},{id:'f-42',name:'Douglas Rangel',academyIdx:1},{id:'f-43',name:'Adriano Machado',academyIdx:3},{id:'f-44',name:'Luciano Braga',academyIdx:5},{id:'f-45',name:'Márcio Neves',academyIdx:9},{id:'f-46',name:'Sandro Ferraz',academyIdx:10},{id:'f-47',name:'Nelson Assis',academyIdx:21},{id:'f-48',name:'Elias Moura',academyIdx:22}],
  'cat-7': [{id:'f-49',name:'Wagner Telles',academyIdx:0},{id:'f-50',name:'Carlos Alberto',academyIdx:2},{id:'f-51',name:'Sérgio Maia',academyIdx:1},{id:'f-52',name:'Bernardo Queiroz',academyIdx:6},{id:'f-53',name:'Antônio Lacerda',academyIdx:11},{id:'f-54',name:'Rogério Guedes',academyIdx:14},{id:'f-55',name:'Emerson Vale',academyIdx:23},{id:'f-56',name:'Valter Resende',academyIdx:24}],
  'cat-8': [{id:'f-57',name:'Marcos Souza',academyIdx:0},{id:'f-58',name:'Kleber Nogueira',academyIdx:1},{id:'f-59',name:'Jefferson Brito',academyIdx:2},{id:'f-60',name:'Edson Marques',academyIdx:4},{id:'f-61',name:'Alessandro Fonseca',academyIdx:7},{id:'f-62',name:'Ronaldo Paiva',academyIdx:3},{id:'f-63',name:'Cleber Maciel',academyIdx:12},{id:'f-64',name:'Norberto Leal',academyIdx:15}],
  'cat-9': [{id:'f-65',name:'Ana Paula Soares',academyIdx:0},{id:'f-66',name:'Bruna Oliveira',academyIdx:1},{id:'f-67',name:'Camila Santos',academyIdx:2},{id:'f-68',name:'Daniela Ferreira',academyIdx:3},{id:'f-69',name:'Elaine Rodrigues',academyIdx:5},{id:'f-70',name:'Fernanda Lima',academyIdx:8},{id:'f-71',name:'Gisele Moreira',academyIdx:13},{id:'f-72',name:'Helena Teixeira',academyIdx:16}],
  'cat-10': [{id:'f-73',name:'Isabela Mendes',academyIdx:0},{id:'f-74',name:'Juliana Alves',academyIdx:1},{id:'f-75',name:'Karen Ribeiro',academyIdx:4},{id:'f-76',name:'Larissa Costa',academyIdx:6},{id:'f-77',name:'Marina Lopes',academyIdx:10},{id:'f-78',name:'Natália Gomes',academyIdx:17},{id:'f-79',name:'Olívia Dias',academyIdx:19},{id:'f-80',name:'Patrícia Nunes',academyIdx:22}],
  'cat-11': [{id:'f-81',name:'Cauã Silva',academyIdx:0},{id:'f-82',name:'Davi Martins',academyIdx:1},{id:'f-83',name:'Enzo Pereira',academyIdx:2},{id:'f-84',name:'Guilherme Rocha',academyIdx:4},{id:'f-85',name:'João Pedro Costa',academyIdx:7},{id:'f-86',name:'Lucas Barros',academyIdx:9},{id:'f-87',name:'Miguel Souza',academyIdx:15},{id:'f-88',name:'Nicolas Reis',academyIdx:20}],
  'cat-12': [{id:'f-89',name:'André Fonseca',academyIdx:0},{id:'f-90',name:'Carlos Medeiros',academyIdx:2},{id:'f-91',name:'Fábio Nogueira',academyIdx:3},{id:'f-92',name:'Jorge Lacerda',academyIdx:5},{id:'f-93',name:'Márcio Teixeira',academyIdx:11},{id:'f-94',name:'Paulo Queiroz',academyIdx:14},{id:'f-95',name:'Ricardo Maia',academyIdx:18},{id:'f-96',name:'Sérgio Vale',academyIdx:21}],
};

const METHODS: MatchMethodType[] = ['submission','points','points','submission','points','submission','points'];
const SUBS = ['Triângulo','Armlock','Mata-leão','Kimura','Guilhotina','Ezequiel','Omoplata'];

function buildBracketMatches(catId: string, bracketId: string): TournamentMatch[] {
  const fighters = CF[catId]; if (!fighters) return [];
  const matches: TournamentMatch[] = [];
  const bt = new Date('2026-04-15T09:00:00Z');
  const r1W: FighterDef[] = [];
  for (let i=0;i<4;i++){
    const fa=fighters[i*2],fb=fighters[i*2+1],w=i%2===0?fa:fb; r1W.push(w);
    const m=METHODS[i%METHODS.length],sn=m==='submission'?SUBS[i%SUBS.length]:null;
    const sA=m==='points'?(w.id===fa.id?6:2):0, sB=m==='points'?(w.id===fb.id?6:2):0;
    matches.push({id:`${catId}-r1-${i+1}`,bracketId,tournamentId:T_ID,categoryId:catId,round:1,position:i+1,fighterAId:fa.id,fighterAName:fa.name,fighterBId:fb.id,fighterBName:fb.name,winnerId:w.id,winnerName:w.name,method:m,submissionName:sn,scoreA:sA,scoreB:sB,advantagesA:m==='points'?2:0,advantagesB:m==='points'?1:0,penaltiesA:0,penaltiesB:0,durationSeconds:180+i*30,matNumber:(i%4)+1,areaNumber:(i%4)+1,scheduledTime:new Date(bt.getTime()+i*15*60000).toISOString(),startedAt:new Date(bt.getTime()+i*15*60000).toISOString(),endedAt:new Date(bt.getTime()+i*15*60000+(180+i*30)*1000).toISOString(),status:'completed',notes:null,createdAt:'2026-04-14T12:00:00Z'});
  }
  const r2W: FighterDef[] = [];
  for (let i=0;i<2;i++){
    const fa=r1W[i*2],fb=r1W[i*2+1],w=fa; r2W.push(w);
    const m:MatchMethodType=i===0?'points':'submission', sn=m==='submission'?'Mata-leão':null;
    matches.push({id:`${catId}-r2-${i+1}`,bracketId,tournamentId:T_ID,categoryId:catId,round:2,position:i+1,fighterAId:fa.id,fighterAName:fa.name,fighterBId:fb.id,fighterBName:fb.name,winnerId:w.id,winnerName:w.name,method:m,submissionName:sn,scoreA:m==='points'?4:0,scoreB:m==='points'?2:0,advantagesA:2,advantagesB:0,penaltiesA:0,penaltiesB:0,durationSeconds:240+i*60,matNumber:1,areaNumber:1,scheduledTime:new Date(bt.getTime()+(4+i)*20*60000).toISOString(),startedAt:new Date(bt.getTime()+(4+i)*20*60000).toISOString(),endedAt:new Date(bt.getTime()+(4+i)*20*60000+(240+i*60)*1000).toISOString(),status:'completed',notes:null,createdAt:'2026-04-14T12:00:00Z'});
  }
  const fa=r2W[0],fb=r2W[1];
  matches.push({id:`${catId}-final`,bracketId,tournamentId:T_ID,categoryId:catId,round:3,position:1,fighterAId:fa.id,fighterAName:fa.name,fighterBId:fb.id,fighterBName:fb.name,winnerId:fa.id,winnerName:fa.name,method:'points',submissionName:null,scoreA:8,scoreB:4,advantagesA:3,advantagesB:1,penaltiesA:0,penaltiesB:0,durationSeconds:360,matNumber:1,areaNumber:1,scheduledTime:new Date(bt.getTime()+6*25*60000).toISOString(),startedAt:new Date(bt.getTime()+6*25*60000).toISOString(),endedAt:new Date(bt.getTime()+6*25*60000+360*1000).toISOString(),status:'completed',notes:null,createdAt:'2026-04-14T12:00:00Z'});
  return matches;
}

export const MOCK_BRACKETS: TournamentBracket[] = MOCK_CATEGORIES.map((cat,i)=>{
  const bid=`bracket-${cat.id}`;
  return {id:bid,tournamentId:T_ID,categoryId:cat.id,method:'single_elimination' as const,totalRounds:3,totalAthletes:8,status:'completed' as const,generatedAt:'2026-04-14T12:00:00Z',matches:buildBracketMatches(cat.id,bid),createdAt:'2026-04-14T12:0'+String(i).padStart(2,'0')+':00Z'};
});

const ALL_MATCHES: TournamentMatch[] = MOCK_BRACKETS.flatMap(b=>b.matches);

export const MOCK_REGISTRATIONS: TournamentRegistration[] = Object.entries(CF).flatMap(([catId,fighters])=>
  fighters.map((f,i)=>({id:`reg-${f.id}`,tournamentId:T_ID,categoryId:catId,athleteId:f.id,athleteName:f.name,academyId:ACADEMIES[f.academyIdx].id,academyName:ACADEMIES[f.academyIdx].name,belt:MOCK_CATEGORIES.find(c=>c.id===catId)?.beltRange??'Branca',weight:70+i*2,seed:i+1,status:'weighed_in' as const,paymentStatus:'paid' as const,paymentRef:`PIX-${f.id}`,checkedInAt:'2026-04-15T07:00:00Z',weighedInAt:'2026-04-15T07:30:00Z',weighInValue:70+i*2,createdAt:'2026-03-20T10:00:00Z',updatedAt:'2026-04-15T07:30:00Z'}))
);

export const MOCK_MEDAL_TABLE: MedalTableEntry[] = [
  {position:1,academyId:'acad-1',academyName:'Guerreiros BJJ',gold:4,silver:2,bronze:3,total:9,points:45,totalAthletes:12},
  {position:2,academyId:'acad-2',academyName:'Alliance BH',gold:3,silver:3,bronze:2,total:8,points:38,totalAthletes:10},
  {position:3,academyId:'acad-3',academyName:'Gracie Barra BH',gold:2,silver:2,bronze:4,total:8,points:28,totalAthletes:8},
  {position:4,academyId:'acad-4',academyName:'Atos BH',gold:1,silver:2,bronze:1,total:4,points:17,totalAthletes:6},
  {position:5,academyId:'acad-5',academyName:'Nova União MG',gold:1,silver:1,bronze:2,total:4,points:14,totalAthletes:6},
  {position:6,academyId:'acad-6',academyName:'CheckMat BH',gold:1,silver:1,bronze:0,total:2,points:11,totalAthletes:5},
  {position:7,academyId:'acad-7',academyName:'GFTeam MG',gold:0,silver:1,bronze:2,total:3,points:7,totalAthletes:5},
  {position:8,academyId:'acad-8',academyName:'Dream Art MG',gold:0,silver:0,bronze:2,total:2,points:4,totalAthletes:4},
  {position:9,academyId:'acad-9',academyName:'Carlson Gracie BH',gold:0,silver:0,bronze:1,total:1,points:2,totalAthletes:4},
  {position:10,academyId:'acad-10',academyName:'Ryan Gracie BH',gold:0,silver:0,bronze:1,total:1,points:2,totalAthletes:4},
  {position:11,academyId:'acad-11',academyName:'Ribeiro JJ BH',gold:0,silver:0,bronze:1,total:1,points:2,totalAthletes:4},
  {position:12,academyId:'acad-12',academyName:'Soul Fighters MG',gold:0,silver:0,bronze:1,total:1,points:2,totalAthletes:3},
  {position:13,academyId:'acad-13',academyName:'ZR Team BH',gold:0,silver:0,bronze:0,total:0,points:1,totalAthletes:3},
  {position:14,academyId:'acad-14',academyName:'De La Riva BH',gold:0,silver:0,bronze:0,total:0,points:1,totalAthletes:3},
  {position:15,academyId:'acad-15',academyName:'Cicero Costha BH',gold:0,silver:0,bronze:0,total:0,points:1,totalAthletes:3},
  {position:16,academyId:'acad-16',academyName:'BTT BH',gold:0,silver:0,bronze:0,total:0,points:1,totalAthletes:3},
  {position:17,academyId:'acad-17',academyName:'Infight MG',gold:0,silver:0,bronze:0,total:0,points:1,totalAthletes:3},
  {position:18,academyId:'acad-18',academyName:'Caio Terra BH',gold:0,silver:0,bronze:0,total:0,points:1,totalAthletes:3},
  {position:19,academyId:'acad-19',academyName:'Unity BH',gold:0,silver:0,bronze:0,total:0,points:0,totalAthletes:2},
  {position:20,academyId:'acad-20',academyName:'Ns Brotherhood BH',gold:0,silver:0,bronze:0,total:0,points:0,totalAthletes:2},
  {position:21,academyId:'acad-21',academyName:'Fight Sports MG',gold:0,silver:0,bronze:0,total:0,points:0,totalAthletes:2},
  {position:22,academyId:'acad-22',academyName:'Barbosa JJ BH',gold:0,silver:0,bronze:0,total:0,points:0,totalAthletes:2},
  {position:23,academyId:'acad-23',academyName:'Lotus Club MG',gold:0,silver:0,bronze:0,total:0,points:0,totalAthletes:2},
  {position:24,academyId:'acad-24',academyName:'Gordo JJ BH',gold:0,silver:0,bronze:0,total:0,points:0,totalAthletes:2},
  {position:25,academyId:'acad-25',academyName:'Kimura BJJ MG',gold:0,silver:0,bronze:0,total:0,points:0,totalAthletes:2},
];

export const MOCK_ACADEMY_STATS: AcademyTournamentStats[] = MOCK_MEDAL_TABLE.map(m=>({id:`ats-${m.academyId}`,academyId:m.academyId,tournamentId:T_ID,academyName:m.academyName,totalAthletes:m.totalAthletes,gold:m.gold,silver:m.silver,bronze:m.bronze,totalFights:m.totalAthletes*2,wins:m.gold*3+m.silver*2+m.bronze,losses:m.totalAthletes-(m.gold+m.silver+m.bronze),submissions:m.gold,points:m.points,rankingPosition:m.position,createdAt:NOW,updatedAt:NOW}));

export const MOCK_FEED: TournamentFeedItem[] = [
  {id:'feed-1',tournamentId:T_ID,type:'medal_ceremony',title:'Quadro geral de medalhas finalizado!',content:'Guerreiros BJJ lidera com 4 ouros, 2 pratas e 3 bronzes.',imageUrl:null,matchId:null,categoryId:null,authorId:'org-1',authorName:'Organização',pinned:true,createdAt:'2026-04-16T18:00:00Z'},
  {id:'feed-2',tournamentId:T_ID,type:'result',title:'Final Preta Absoluto: Marcos Souza campeão!',content:'Marcos Souza (Guerreiros) vence por 8x4 nos pontos.',imageUrl:null,matchId:'cat-8-final',categoryId:'cat-8',authorId:null,authorName:null,pinned:false,createdAt:'2026-04-16T17:30:00Z'},
  {id:'feed-3',tournamentId:T_ID,type:'result',title:'Final Marrom/Preta Leve: Wagner Telles ouro!',content:'Wagner Telles (Guerreiros) domina a final por pontos.',imageUrl:null,matchId:'cat-7-final',categoryId:'cat-7',authorId:null,authorName:null,pinned:false,createdAt:'2026-04-16T16:45:00Z'},
  {id:'feed-4',tournamentId:T_ID,type:'photo',title:'Pódio Azul Pena Masculino',content:null,imageUrl:'/images/feed/podio-azul-pena.jpg',matchId:null,categoryId:'cat-3',authorId:'org-1',authorName:'Organização',pinned:false,createdAt:'2026-04-16T16:00:00Z'},
  {id:'feed-5',tournamentId:T_ID,type:'result',title:'Final Roxa Pesado: Cássio Monteiro campeão!',content:'Cássio (Guerreiros) finaliza com Triângulo em 3min.',imageUrl:null,matchId:'cat-6-final',categoryId:'cat-6',authorId:null,authorName:null,pinned:false,createdAt:'2026-04-16T15:30:00Z'},
  {id:'feed-6',tournamentId:T_ID,type:'announcement',title:'Intervalo para almoço',content:'Lutas retornam às 13h30. Aproveitem a praça de alimentação.',imageUrl:null,matchId:null,categoryId:null,authorId:'org-1',authorName:'Organização',pinned:false,createdAt:'2026-04-15T12:00:00Z'},
  {id:'feed-7',tournamentId:T_ID,type:'result',title:'Branca Galo: Lucas Mendes ouro!',content:'Lucas Mendes (Guerreiros) vence final por 8x4.',imageUrl:null,matchId:'cat-1-final',categoryId:'cat-1',authorId:null,authorName:null,pinned:false,createdAt:'2026-04-15T11:30:00Z'},
  {id:'feed-8',tournamentId:T_ID,type:'photo',title:'Público lotando o ginásio!',content:null,imageUrl:'/images/feed/publico-ginasio.jpg',matchId:null,categoryId:null,authorId:'org-1',authorName:'Organização',pinned:false,createdAt:'2026-04-15T10:30:00Z'},
  {id:'feed-9',tournamentId:T_ID,type:'result',title:'Branca Leve Fem: Ana Paula ouro!',content:'Ana Paula Soares (Guerreiros) vence por pontos na final.',imageUrl:null,matchId:'cat-9-final',categoryId:'cat-9',authorId:null,authorName:null,pinned:false,createdAt:'2026-04-15T14:00:00Z'},
  {id:'feed-10',tournamentId:T_ID,type:'bracket_update',title:'Chaves atualizadas: semifinais Roxa Leve',content:'Roberto Cyborg vs Jonas Batista na semifinal.',imageUrl:null,matchId:null,categoryId:'cat-5',authorId:null,authorName:null,pinned:false,createdAt:'2026-04-15T13:00:00Z'},
  {id:'feed-11',tournamentId:T_ID,type:'announcement',title:'Copa BlackBelt BH 2026 começou!',content:'Bem-vindos ao Ginásio Poliesportivo de BH. 120 atletas, 25 academias, 12 categorias. Oss!',imageUrl:null,matchId:null,categoryId:null,authorId:'org-1',authorName:'Organização',pinned:false,createdAt:'2026-04-15T08:00:00Z'},
  {id:'feed-12',tournamentId:T_ID,type:'schedule_change',title:'Ajuste de horário: Azul Médio',content:'Quartas-de-final do Azul Médio adiantadas para 9h30.',imageUrl:null,matchId:null,categoryId:'cat-4',authorId:'org-1',authorName:'Organização',pinned:false,createdAt:'2026-04-15T08:30:00Z'},
  {id:'feed-13',tournamentId:T_ID,type:'photo',title:'Aquecimento nas áreas de luta',content:null,imageUrl:'/images/feed/aquecimento.jpg',matchId:null,categoryId:null,authorId:'org-1',authorName:'Organização',pinned:false,createdAt:'2026-04-15T07:45:00Z'},
  {id:'feed-14',tournamentId:T_ID,type:'result',title:'Juvenil Branca Leve: Cauã Silva campeão!',content:'Cauã Silva (Guerreiros) domina a categoria juvenil.',imageUrl:null,matchId:'cat-11-final',categoryId:'cat-11',authorId:null,authorName:null,pinned:false,createdAt:'2026-04-15T15:00:00Z'},
  {id:'feed-15',tournamentId:T_ID,type:'result',title:'Master Azul Pesado: André Fonseca ouro!',content:'André Fonseca (Guerreiros) conquista o master.',imageUrl:null,matchId:'cat-12-final',categoryId:'cat-12',authorId:null,authorName:null,pinned:false,createdAt:'2026-04-15T16:00:00Z'},
];

export const MOCK_ATHLETE_PROFILES: AthleteProfile[] = [
  {id:'ap-1',userId:'f-57',fullName:'Marcos Souza',nickname:'Marcão',photoUrl:null,belt:'Preta',weight:82,weightClass:'Médio',ageGroup:'Adulto',academyId:'acad-1',academyName:'Guerreiros BJJ',modality:'BJJ',totalFights:45,wins:38,losses:5,draws:2,submissions:18,submissionsSuffered:2,goldMedals:10,silverMedals:3,bronzeMedals:2,rankingPoints:320,rankingPosition:1,winRate:84.4,createdAt:'2024-01-10T10:00:00Z',updatedAt:NOW},
  {id:'ap-2',userId:'f-33',fullName:'Roberto Cyborg',nickname:'Cyborg',photoUrl:null,belt:'Roxa',weight:76,weightClass:'Leve',ageGroup:'Adulto',academyId:'acad-1',academyName:'Guerreiros BJJ',modality:'BJJ',totalFights:32,wins:28,losses:3,draws:1,submissions:15,submissionsSuffered:1,goldMedals:7,silverMedals:2,bronzeMedals:1,rankingPoints:260,rankingPosition:2,winRate:87.5,createdAt:'2024-03-15T10:00:00Z',updatedAt:NOW},
  {id:'ap-3',userId:'f-58',fullName:'Kleber Nogueira',nickname:'Klebão',photoUrl:null,belt:'Preta',weight:94,weightClass:'Pesado',ageGroup:'Adulto',academyId:'acad-2',academyName:'Alliance BH',modality:'BJJ',totalFights:40,wins:30,losses:8,draws:2,submissions:12,submissionsSuffered:5,goldMedals:6,silverMedals:5,bronzeMedals:3,rankingPoints:220,rankingPosition:3,winRate:75.0,createdAt:'2024-02-01T10:00:00Z',updatedAt:NOW},
  {id:'ap-4',userId:'f-65',fullName:'Ana Paula Soares',nickname:'Paulinha',photoUrl:null,belt:'Branca',weight:58,weightClass:'Leve',ageGroup:'Adulto',academyId:'acad-1',academyName:'Guerreiros BJJ',modality:'BJJ',totalFights:20,wins:16,losses:3,draws:1,submissions:8,submissionsSuffered:1,goldMedals:4,silverMedals:2,bronzeMedals:1,rankingPoints:150,rankingPosition:8,winRate:80.0,createdAt:'2025-01-10T10:00:00Z',updatedAt:NOW},
  {id:'ap-5',userId:'f-49',fullName:'Wagner Telles',nickname:'Wagnão',photoUrl:null,belt:'Marrom',weight:76,weightClass:'Leve',ageGroup:'Adulto',academyId:'acad-1',academyName:'Guerreiros BJJ',modality:'BJJ',totalFights:35,wins:29,losses:4,draws:2,submissions:14,submissionsSuffered:2,goldMedals:8,silverMedals:2,bronzeMedals:3,rankingPoints:280,rankingPosition:4,winRate:82.9,createdAt:'2024-06-01T10:00:00Z',updatedAt:NOW},
];

export const MOCK_PREDICTIONS: TournamentPrediction[] = [
  {id:'pred-1',tournamentId:T_ID,userId:'user-1',matchId:'cat-8-final',categoryId:'cat-8',predictedWinnerId:'f-57',predictedMethod:'points',isCorrect:true,pointsEarned:10,createdAt:'2026-04-15T08:00:00Z'},
  {id:'pred-2',tournamentId:T_ID,userId:'user-1',matchId:'cat-7-final',categoryId:'cat-7',predictedWinnerId:'f-49',predictedMethod:'submission',isCorrect:false,pointsEarned:5,createdAt:'2026-04-15T08:05:00Z'},
  {id:'pred-3',tournamentId:T_ID,userId:'user-2',matchId:'cat-1-final',categoryId:'cat-1',predictedWinnerId:'f-1',predictedMethod:'points',isCorrect:true,pointsEarned:10,createdAt:'2026-04-15T08:10:00Z'},
  {id:'pred-4',tournamentId:T_ID,userId:'user-2',matchId:'cat-6-final',categoryId:'cat-6',predictedWinnerId:'f-42',predictedMethod:'submission',isCorrect:false,pointsEarned:0,createdAt:'2026-04-15T08:15:00Z'},
  {id:'pred-5',tournamentId:T_ID,userId:'user-3',matchId:'cat-9-final',categoryId:'cat-9',predictedWinnerId:'f-65',predictedMethod:'points',isCorrect:true,pointsEarned:10,createdAt:'2026-04-15T08:20:00Z'},
];

function makeTournament(p: CreateTournamentPayload): Tournament {
  return {id:`trn-${Date.now()}`,name:p.name,slug:p.slug,description:p.description,rules:p.rules??'',date:p.date,endDate:p.endDate??p.date,venue:p.venue,address:p.address??'',city:p.city??'',state:p.state??'',organizerId:'org-1',academyId:null,circuitId:p.circuitId??null,circuitStage:p.circuitStage??null,status:'draft',modality:p.modality??'BJJ',registrationFee:p.registrationFee??0,registrationDeadline:p.registrationDeadline??p.date,maxRegistrations:p.maxRegistrations??null,totalRegistrations:0,totalAcademies:0,totalAreas:p.totalAreas??3,bannerUrl:p.bannerUrl??null,logoUrl:p.logoUrl??null,isFeatured:false,publishedAt:null,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
}

function makeReg(p: RegisterAthletePayload): TournamentRegistration {
  return {id:`reg-${Date.now()}`,tournamentId:p.tournamentId,categoryId:p.categoryId,athleteId:p.athleteId,athleteName:p.athleteName,academyId:p.academyId??null,academyName:p.academyName??null,belt:p.belt,weight:p.weight??null,seed:null,status:'pending',paymentStatus:'pending',paymentRef:null,checkedInAt:null,weighedInAt:null,weighInValue:null,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
}

function makeMatch(matchId: string): TournamentMatch {
  return {id:matchId,bracketId:'',tournamentId:T_ID,categoryId:'',round:1,position:1,fighterAId:null,fighterAName:null,fighterBId:null,fighterBName:null,winnerId:null,winnerName:null,method:null,submissionName:null,scoreA:0,scoreB:0,advantagesA:0,advantagesB:0,penaltiesA:0,penaltiesB:0,durationSeconds:null,matNumber:null,areaNumber:null,scheduledTime:null,startedAt:null,endedAt:null,status:'pending',notes:null,createdAt:new Date().toISOString()};
}

const defReg: RegisterAthletePayload = {tournamentId:T_ID,categoryId:'cat-1',athleteId:'f-1',athleteName:'Atleta',belt:'Branca'};

// ── Exported Mock Functions ─────────────────────────────────

export function mockGetTournaments(filters?:{status?:TournamentStatus;modality?:string;featured?:boolean}): Tournament[] {
  let r=[MOCK_TOURNAMENT,MOCK_TOURNAMENT_UPCOMING];
  if(filters?.status) r=r.filter(t=>t.status===filters.status);
  if(filters?.modality) r=r.filter(t=>t.modality===filters.modality);
  if(filters?.featured!==undefined) r=r.filter(t=>t.isFeatured===filters.featured);
  return r;
}
export function mockGetTournament(slug:string):Tournament{if(slug===T_SLUG)return MOCK_TOURNAMENT;if(slug===MOCK_TOURNAMENT_UPCOMING.slug)return MOCK_TOURNAMENT_UPCOMING;return{...MOCK_TOURNAMENT,slug};}
export function mockCreateTournament(p:CreateTournamentPayload):Tournament{return makeTournament(p);}
export function mockUpdateTournament(p:UpdateTournamentPayload):Tournament{return{...MOCK_TOURNAMENT,...p,updatedAt:new Date().toISOString()};}
export function mockPublishTournament(_id:string):Tournament{return{...MOCK_TOURNAMENT,status:'published',publishedAt:new Date().toISOString()};}
export function mockOpenRegistration(_id:string):Tournament{return{...MOCK_TOURNAMENT,status:'registration_open'};}
export function mockCloseRegistration(_id:string):Tournament{return{...MOCK_TOURNAMENT,status:'registration_closed'};}
export function mockStartTournament(_id:string):Tournament{return{...MOCK_TOURNAMENT,status:'in_progress'};}
export function mockCompleteTournament(_id:string):Tournament{return{...MOCK_TOURNAMENT,status:'completed'};}
export function mockGetTournamentStats(_id:string):TournamentStats{return{totalRegistrations:120,totalAcademies:25,totalCategories:12,totalMatches:ALL_MATCHES.length,completedMatches:ALL_MATCHES.filter(m=>m.status==='completed').length,totalSubmissions:ALL_MATCHES.filter(m=>m.method==='submission').length,averageMatchDuration:270,registrationsByStatus:{pending:0,confirmed:0,paid:0,checked_in:0,weighed_in:120,cancelled:0,no_show:0}};}
export function mockGetCircuits(_f?:{season?:string;status?:CircuitStatus}):TournamentCircuit[]{return[MOCK_CIRCUIT];}
export function mockGetCircuit(_slug:string):TournamentCircuit{return MOCK_CIRCUIT;}
export function mockGetCircuitRanking(_id:string):CircuitRankingEntry[]{return MOCK_ATHLETE_PROFILES.map((a,i)=>({position:i+1,athleteId:a.userId,athleteName:a.fullName,academyName:a.academyName??'',totalPoints:a.rankingPoints,stagesParticipated:1,gold:a.goldMedals,silver:a.silverMedals,bronze:a.bronzeMedals}));}
export function mockGetCategories(_id:string):TournamentCategory[]{return MOCK_CATEGORIES;}
export function mockCreateCategory(p:CreateCategoryPayload):TournamentCategory{return{id:`cat-${Date.now()}`,tournamentId:p.tournamentId,name:p.name,beltRange:p.beltRange,weightRange:p.weightRange,ageRange:p.ageRange,gender:p.gender??'masculino',modality:p.modality??'BJJ',matchDurationSeconds:p.matchDurationSeconds??300,totalRegistrations:0,status:'open',createdAt:new Date().toISOString()};}
export function mockGenerateStandardCategories(_id:string):TournamentCategory[]{return MOCK_CATEGORIES;}
export function mockRegisterAthlete(p:RegisterAthletePayload):TournamentRegistration{return makeReg(p);}
export function mockRegisterBatch(_id:string,athletes:RegisterAthletePayload[]):TournamentRegistration[]{return athletes.map(a=>makeReg(a));}
export function mockGetRegistrations(_id:string,categoryId?:string):TournamentRegistration[]{if(categoryId)return MOCK_REGISTRATIONS.filter(r=>r.categoryId===categoryId);return MOCK_REGISTRATIONS;}
export function mockGetMyRegistrations(_userId:string):TournamentRegistration[]{return MOCK_REGISTRATIONS.slice(0,2);}
export function mockConfirmPayment(regId:string,paymentRef:string):TournamentRegistration{const r=MOCK_REGISTRATIONS.find(r=>r.id===regId);return{...(r??makeReg(defReg)),paymentStatus:'paid',paymentRef,status:'paid'};}
export function mockCancelRegistration(regId:string):TournamentRegistration{const r=MOCK_REGISTRATIONS.find(r=>r.id===regId);return{...(r??makeReg(defReg)),status:'cancelled'};}
export function mockCheckInAthlete(regId:string):TournamentRegistration{const r=MOCK_REGISTRATIONS.find(r=>r.id===regId);return{...(r??makeReg(defReg)),status:'checked_in',checkedInAt:new Date().toISOString()};}
export function mockWeighInAthlete(regId:string,weight:number):TournamentRegistration{const r=MOCK_REGISTRATIONS.find(r=>r.id===regId);return{...(r??makeReg(defReg)),status:'weighed_in',weighedInAt:new Date().toISOString(),weighInValue:weight};}
export function mockGenerateBracket(catId:string):TournamentBracket{return MOCK_BRACKETS.find(b=>b.categoryId===catId)??MOCK_BRACKETS[0];}
export function mockGetBracket(catId:string):TournamentBracket{return MOCK_BRACKETS.find(b=>b.categoryId===catId)??MOCK_BRACKETS[0];}
export function mockGetAllBrackets(_id:string):TournamentBracket[]{return MOCK_BRACKETS;}
export function mockGetMatchesByArea(_id:string,area:number):TournamentMatch[]{return ALL_MATCHES.filter(m=>m.areaNumber===area);}
export function mockGetNextMatches(_id:string,limit?:number):TournamentMatch[]{return ALL_MATCHES.filter(m=>m.status==='pending').slice(0,limit??10);}
export function mockCallMatch(matchId:string):TournamentMatch{const m=ALL_MATCHES.find(m=>m.id===matchId);return{...(m??makeMatch(matchId)),status:'called'};}
export function mockStartMatch(matchId:string):TournamentMatch{const m=ALL_MATCHES.find(m=>m.id===matchId);return{...(m??makeMatch(matchId)),status:'in_progress',startedAt:new Date().toISOString()};}
export function mockRecordResult(matchId:string,result:RecordResultPayload):TournamentMatch{const m=ALL_MATCHES.find(m=>m.id===matchId);return{...(m??makeMatch(matchId)),winnerId:result.winnerId,winnerName:result.winnerName,method:result.method,submissionName:result.submissionName??null,scoreA:result.scoreA,scoreB:result.scoreB,advantagesA:result.advantagesA??0,advantagesB:result.advantagesB??0,penaltiesA:result.penaltiesA??0,penaltiesB:result.penaltiesB??0,durationSeconds:result.durationSeconds,status:'completed',endedAt:new Date().toISOString()};}
export function mockGetLiveMatches(_id:string):TournamentMatch[]{return ALL_MATCHES.filter(m=>m.status==='in_progress').slice(0,4);}
export function mockGetCompletedMatches(_id:string):TournamentMatch[]{return ALL_MATCHES.filter(m=>m.status==='completed');}
export function mockGetFeed(_id:string,type?:FeedItemType):TournamentFeedItem[]{if(type)return MOCK_FEED.filter(f=>f.type===type);return MOCK_FEED;}
export function mockPostAnnouncement(tid:string,title:string,content:string):TournamentFeedItem{return{id:`feed-${Date.now()}`,tournamentId:tid,type:'announcement',title,content,imageUrl:null,matchId:null,categoryId:null,authorId:'org-1',authorName:'Organização',pinned:false,createdAt:new Date().toISOString()};}
export function mockPostPhoto(tid:string,title:string,imageUrl:string):TournamentFeedItem{return{id:`feed-${Date.now()}`,tournamentId:tid,type:'photo',title,content:null,imageUrl,matchId:null,categoryId:null,authorId:'org-1',authorName:'Organização',pinned:false,createdAt:new Date().toISOString()};}
export function mockGetResults(_id:string):AcademyTournamentStats[]{return MOCK_ACADEMY_STATS;}
export function mockGetMedalTable(_id:string):MedalTableEntry[]{return MOCK_MEDAL_TABLE;}
export function mockGetAthleteResults(athleteId:string):TournamentMatch[]{return ALL_MATCHES.filter(m=>m.fighterAId===athleteId||m.fighterBId===athleteId);}
export function mockGetAthleteProfile(userId:string):AthleteProfile{return MOCK_ATHLETE_PROFILES.find(a=>a.userId===userId)??MOCK_ATHLETE_PROFILES[0];}
export function mockGetAthleteRanking(_modality?:string):AthleteProfile[]{return[...MOCK_ATHLETE_PROFILES].sort((a,b)=>b.rankingPoints-a.rankingPoints);}
export function mockGetAcademyRanking(_id?:string):AcademyTournamentStats[]{return MOCK_ACADEMY_STATS;}
export function mockGetAthleteRankingList(f?:{belt?:string;weightClass?:string}):AthleteProfile[]{let r=[...MOCK_ATHLETE_PROFILES];if(f?.belt)r=r.filter(a=>a.belt===f.belt);if(f?.weightClass)r=r.filter(a=>a.weightClass===f.weightClass);return r.sort((a,b)=>b.rankingPoints-a.rankingPoints);}
export function mockSubmitPrediction(p:SubmitPredictionPayload):TournamentPrediction{return{id:`pred-${Date.now()}`,tournamentId:p.tournamentId,userId:'user-current',matchId:p.matchId,categoryId:p.categoryId??null,predictedWinnerId:p.predictedWinnerId,predictedMethod:p.predictedMethod??null,isCorrect:null,pointsEarned:0,createdAt:new Date().toISOString()};}
export function mockGetMyPredictions(_id:string,userId:string):TournamentPrediction[]{return MOCK_PREDICTIONS.filter(p=>p.userId===userId);}
export function mockGetPredictionLeaderboard(_id:string):PredictionLeaderboardEntry[]{return[{userId:'user-1',userName:'João Apostador',totalPredictions:12,correctPredictions:8,accuracy:66.7,totalPoints:80,position:1},{userId:'user-3',userName:'Maria Palpiteira',totalPredictions:10,correctPredictions:7,accuracy:70.0,totalPoints:70,position:2},{userId:'user-2',userName:'Pedro Chutador',totalPredictions:12,correctPredictions:6,accuracy:50.0,totalPoints:60,position:3},{userId:'user-4',userName:'Ana Previsão',totalPredictions:8,correctPredictions:5,accuracy:62.5,totalPoints:50,position:4},{userId:'user-5',userName:'Carlos Bolão',totalPredictions:6,correctPredictions:3,accuracy:50.0,totalPoints:30,position:5}];}
