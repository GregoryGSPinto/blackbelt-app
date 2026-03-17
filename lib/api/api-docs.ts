// ── OpenAPI / Swagger spec for BlackBelt API v1 ───────────────

export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'BlackBelt API',
    version: '1.0.0',
    description: 'API pública para integração com a plataforma BlackBelt de gestão de academias de artes marciais.',
    contact: { email: 'api@blackbelt.app' },
  },
  servers: [
    { url: '/api/v1', description: 'Production' },
  ],
  security: [{ BearerAuth: [] }],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http' as const,
        scheme: 'bearer',
        bearerFormat: 'API Key',
        description: 'API key obtida no painel admin',
      },
    },
    schemas: {
      Student: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          belt: { type: 'string', enum: ['white', 'gray', 'yellow', 'orange', 'green', 'blue', 'purple', 'brown', 'black'] },
          status: { type: 'string', enum: ['active', 'inactive', 'trial'] },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      Class: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          modality: { type: 'string' },
          day_of_week: { type: 'integer', minimum: 0, maximum: 6 },
          start_time: { type: 'string' },
          end_time: { type: 'string' },
          capacity: { type: 'integer' },
          enrolled: { type: 'integer' },
        },
      },
      Attendance: {
        type: 'object',
        properties: {
          student_id: { type: 'string' },
          class_id: { type: 'string' },
          date: { type: 'string', format: 'date' },
          status: { type: 'string', enum: ['present', 'absent', 'justified'] },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          code: { type: 'integer' },
        },
      },
    },
  },
  paths: {
    '/students': {
      get: {
        summary: 'Listar alunos',
        description: 'Retorna todos os alunos da academia',
        parameters: [
          { name: 'academyId', in: 'query' as const, required: true, schema: { type: 'string' } },
          { name: 'status', in: 'query' as const, required: false, schema: { type: 'string' } },
          { name: 'limit', in: 'query' as const, required: false, schema: { type: 'integer', default: 50 } },
        ],
        responses: {
          '200': { description: 'Lista de alunos', content: { 'application/json': { schema: { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Student' } }, total: { type: 'integer' } } } } } },
          '400': { description: 'Parâmetros inválidos' },
          '401': { description: 'Não autorizado' },
        },
      },
    },
    '/classes': {
      get: {
        summary: 'Listar turmas',
        description: 'Retorna todas as turmas da academia',
        parameters: [
          { name: 'academyId', in: 'query' as const, required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Lista de turmas' },
          '401': { description: 'Não autorizado' },
        },
      },
    },
    '/attendance': {
      get: {
        summary: 'Consultar presença',
        description: 'Retorna registros de presença por turma e data',
        parameters: [
          { name: 'classId', in: 'query' as const, required: true, schema: { type: 'string' } },
          { name: 'date', in: 'query' as const, required: false, schema: { type: 'string', format: 'date' } },
        ],
        responses: {
          '200': { description: 'Dados de presença' },
          '401': { description: 'Não autorizado' },
        },
      },
    },
  },
};
