const delay = () => new Promise((r) => setTimeout(r, 600));

export async function mockGenerateMonthlyNarrative(_academyId: string, month: string): Promise<string> {
  await delay();
  return `Relatório Mensal — ${month}

Em ${month}, a academia teve um crescimento de 12% em novos alunos, totalizando 48 membros ativos. A taxa de retenção foi de 92%, acima da meta de 85%.

Destaques:
• O Professor Silva se destacou com 95% de presença média nas suas turmas, o melhor índice da academia.
• A turma de BJJ Avançado atingiu lotação máxima (30 alunos), sugerindo abertura de nova turma no mesmo horário.
• 3 alunos foram promovidos de faixa este mês.

Pontos de atenção:
• 5 alunos estão em risco de churn (sem presença há 7+ dias). Recomendamos ação de retenção imediata.
• A inadimplência subiu de 8% para 12% — verificar faturas pendentes.
• A turma de Muay Thai Kids tem apenas 4 alunos — avaliar viabilidade ou campanha de captação.

Receita: R$ 6.750 (MRR). Projeção para próximo mês: R$ 7.100 (+5.2%).`;
}

export async function mockGenerateStudentReport(_studentId: string): Promise<string> {
  await delay();
  return `João está na faixa azul há 4 meses. Sua frequência é de 3x/semana, acima da média da turma (2.3x/semana).

Pontos fortes: Técnica (88/100) — excelente desempenho em passagem de guarda e finalizações de braço.

Áreas de melhoria: Disciplina (68/100) — precisa melhorar a pontualidade e a consistência nos drills. Evolução (75/100) — progresso bom mas pode acelerar com treino mais focado.

Recomendação: Focar em disciplina esta quinzena. Assistir os vídeos de retenção de guarda na seção de conteúdo. Considerar participar do desafio semanal de presença para manter a motivação.`;
}

export async function mockGenerateClassReport(_classId: string, month: string): Promise<string> {
  await delay();
  return `Resumo da Turma BJJ Fundamental — ${month}

A turma teve presença média de 18 alunos por aula (capacidade: 25). Frequência estável comparada ao mês anterior.

Perfil dos alunos: 60% faixa branca, 30% faixa azul, 10% faixa roxa+. Idade média: 28 anos.

Técnicas mais trabalhadas: passagem de guarda toreando, triângulo, armlock da montada.

Sugestão para próximo mês: Introduzir mais situacionais de guarda aberta — vários alunos demonstraram dificuldade nesta posição durante sparring.`;
}
