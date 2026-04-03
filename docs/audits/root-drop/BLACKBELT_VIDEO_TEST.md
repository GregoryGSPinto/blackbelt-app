# BLACKBELT v2 — TESTE DE USABILIDADE: VÍDEO-AULAS DO PROFESSOR
## Testar TODOS os fluxos reais com a API do Bunny Stream
## Se algo não funcionar → CORRIGIR imediatamente
## Se faltar funcionalidade → CRIAR

> **INSTRUÇÕES:**
> - Teste CADA fluxo descrito abaixo
> - Se falhar → corrigir no código → `pnpm typecheck && pnpm build` → commit → push
> - Se faltar funcionalidade → implementar → testar → commit → push
> - No final, gerar relatório BLACKBELT_VIDEO_TEST_REPORT.md

---

## FASE 1 — VERIFICAR QUE TUDO COMPILA E EXISTE

```bash
echo "=== VERIFICAÇÃO DE ARQUIVOS ==="
test -f lib/services/bunny-stream.ts && echo "✅ bunny-stream.ts" || echo "❌ FALTA"
test -f app/api/videos/create-upload/route.ts && echo "✅ API create-upload" || echo "❌ FALTA"
test -f app/api/videos/route.ts && echo "✅ API list" || echo "❌ FALTA"
test -f app/api/videos/\[id\]/route.ts && echo "✅ API get/delete" || echo "❌ FALTA"
test -f app/api/webhooks/bunny/route.ts && echo "✅ Webhook" || echo "❌ FALTA"
test -f components/video/VideoUploader.tsx && echo "✅ VideoUploader" || echo "❌ FALTA"
test -f components/video/VideoPlayer.tsx && echo "✅ VideoPlayer" || echo "❌ FALTA"
test -f components/video/VideoLibrary.tsx && echo "✅ VideoLibrary" || echo "❌ FALTA"

echo ""
echo "=== ENV VARS ==="
grep -q "BUNNY_STREAM" .env.local 2>/dev/null && echo "✅ .env.local tem BUNNY vars" || echo "❌ FALTA BUNNY vars em .env.local"

echo ""
echo "=== BUILD ==="
pnpm typecheck 2>&1 | tail -3
pnpm build 2>&1 | tail -5
```

Se QUALQUER item faltar → criar/corrigir antes de continuar.

---

## FASE 2 — TESTAR API DO BUNNY DIRETAMENTE

Testar que a API do Bunny responde corretamente com as credenciais configuradas.

```bash
# Teste 1: Listar vídeos (deve retornar JSON com totalItems)
echo "=== TESTE API: Listar vídeos ==="
curl -s "https://video.bunnycdn.com/library/626933/videos?page=1&itemsPerPage=5" \
  -H "AccessKey: fa82c488-cd3b-46cc-a2e107911a85-85bb-4b34" | head -200

# Teste 2: Criar vídeo de teste
echo ""
echo "=== TESTE API: Criar vídeo ==="
RESPONSE=$(curl -s -X POST "https://video.bunnycdn.com/library/626933/videos" \
  -H "AccessKey: fa82c488-cd3b-46cc-a2e107911a85-85bb-4b34" \
  -H "Content-Type: application/json" \
  -d '{"title": "TESTE-BLACKBELT-deletar-depois"}')
echo "$RESPONSE" | head -50
VIDEO_ID=$(echo "$RESPONSE" | grep -o '"guid":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Video ID criado: $VIDEO_ID"

# Teste 3: Buscar vídeo criado
echo ""
echo "=== TESTE API: Buscar vídeo ==="
curl -s "https://video.bunnycdn.com/library/626933/videos/$VIDEO_ID" \
  -H "AccessKey: fa82c488-cd3b-46cc-a2e107911a85-85bb-4b34" | head -100

# Teste 4: Deletar vídeo de teste
echo ""
echo "=== TESTE API: Deletar vídeo ==="
curl -s -X DELETE "https://video.bunnycdn.com/library/626933/videos/$VIDEO_ID" \
  -H "AccessKey: fa82c488-cd3b-46cc-a2e107911a85-85bb-4b34"
echo "Deletado: $VIDEO_ID"
```

Se algum teste falhar → a API key ou Library ID está errado → corrigir.

---

## FASE 3 — TESTAR ROTAS INTERNAS DA API

Rodar o app localmente e testar as rotas:

```bash
# Iniciar o dev server em background
pnpm dev &
DEV_PID=$!
sleep 10

# Teste 1: Criar upload via nossa API
echo "=== TESTE: POST /api/videos/create-upload ==="
UPLOAD_RESPONSE=$(curl -s -X POST "http://localhost:3000/api/videos/create-upload" \
  -H "Content-Type: application/json" \
  -d '{"title": "Teste Upload BlackBelt"}')
echo "$UPLOAD_RESPONSE"

# Verificar que retornou videoId, signature, tusEndpoint
echo "$UPLOAD_RESPONSE" | grep -q "videoId" && echo "✅ create-upload OK" || echo "❌ create-upload FALHOU"

# Teste 2: Listar vídeos via nossa API
echo ""
echo "=== TESTE: GET /api/videos ==="
LIST_RESPONSE=$(curl -s "http://localhost:3000/api/videos")
echo "$LIST_RESPONSE" | head -200
echo "$LIST_RESPONSE" | grep -q "total" && echo "✅ list OK" || echo "❌ list FALHOU"

# Teste 3: Buscar vídeo específico
VIDEO_ID=$(echo "$UPLOAD_RESPONSE" | grep -o '"videoId":"[^"]*"' | cut -d'"' -f4)
if [ -n "$VIDEO_ID" ]; then
  echo ""
  echo "=== TESTE: GET /api/videos/$VIDEO_ID ==="
  curl -s "http://localhost:3000/api/videos/$VIDEO_ID"
  echo ""
  
  # Teste 4: Deletar vídeo
  echo "=== TESTE: DELETE /api/videos/$VIDEO_ID ==="
  curl -s -X DELETE "http://localhost:3000/api/videos/$VIDEO_ID"
  echo ""
fi

# Parar dev server
kill $DEV_PID 2>/dev/null
```

Se algum teste falhar → debugar e corrigir a rota.

---

## FASE 4 — VERIFICAR FUNCIONALIDADES DO PROFESSOR

Verificar que a página do professor tem TODAS as ferramentas necessárias:

```bash
echo "=== FUNCIONALIDADES DO PROFESSOR ==="

# 1. Página de vídeo-aulas existe
find app -path "*professor*video*" -name "page.tsx" | head -5
find app -path "*admin*video*" -name "page.tsx" | head -5

# 2. Upload com TUS
grep -q "tus-js-client\|tus.Upload" components/video/VideoUploader.tsx && echo "✅ TUS upload" || echo "❌ TUS falta"

# 3. Barra de progresso
grep -q "progress" components/video/VideoUploader.tsx && echo "✅ Progress bar" || echo "❌ Progress falta"

# 4. Cancelar upload
grep -q "cancelUpload\|abort" components/video/VideoUploader.tsx && echo "✅ Cancel upload" || echo "❌ Cancel falta"

# 5. Player de vídeo com embed
grep -q "iframe.mediadelivery.net" components/video/VideoPlayer.tsx && echo "✅ Bunny embed player" || echo "❌ Player falta"

# 6. Thumbnail do vídeo
grep -q "thumbnail" components/video/VideoPlayer.tsx && echo "✅ Thumbnail" || echo "❌ Thumbnail falta"

# 7. Biblioteca com busca
grep -q "search\|Search" components/video/VideoLibrary.tsx && echo "✅ Busca" || echo "❌ Busca falta"

# 8. Deletar vídeo
grep -q "delete\|Delete\|Trash" components/video/VideoLibrary.tsx && echo "✅ Delete" || echo "❌ Delete falta"

# 9. Grid de vídeos
grep -q "grid" components/video/VideoLibrary.tsx && echo "✅ Grid layout" || echo "❌ Grid falta"

# 10. Status de processamento
grep -q "processing\|encodeProgress" components/video/VideoLibrary.tsx && echo "✅ Processing status" || echo "❌ Processing falta"
```

---

## FASE 5 — FUNCIONALIDADES QUE FALTAM (IMPLEMENTAR SE NÃO EXISTEM)

Verificar e implementar cada funcionalidade que um professor precisa:

### 5A. Editar título do vídeo

```bash
grep -q "editTitle\|updateTitle\|renameVideo\|editVideo" components/video/ lib/services/bunny-stream.ts app/api/videos/ -r 2>/dev/null
```

Se NÃO existe → criar:

1. No `lib/services/bunny-stream.ts`, adicionar:
```typescript
export async function updateVideo(videoId: string, title: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/videos/${videoId}`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error(`[bunny] Update video failed: ${res.status}`);
}
```

2. No `app/api/videos/[id]/route.ts`, adicionar método PATCH:
```typescript
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { title } = await req.json();
    if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 });
    
    const { updateVideo } = await import('@/lib/services/bunny-stream');
    await updateVideo(params.id, title);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error' }, { status: 500 });
  }
}
```

3. No `components/video/VideoLibrary.tsx`, adicionar botão de editar título (ícone Pencil) ao lado do delete:
- Ao clicar, abre input inline ou modal simples
- Ao confirmar, chama `PATCH /api/videos/{id}` com novo título
- Atualiza o título na lista sem recarregar

### 5B. Ordenar vídeos (mais recentes primeiro, A-Z, mais vistos)

No `components/video/VideoLibrary.tsx`, adicionar select de ordenação:
```tsx
<select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
  <option value="date">Mais recentes</option>
  <option value="title">A-Z</option>
  <option value="views">Mais vistos</option>
</select>
```

Aplicar ordenação no client-side (já temos os dados).

### 5C. Contador de vídeos e storage usado

No topo da VideoLibrary, mostrar:
- Total de vídeos
- Estimativa de storage (soma de `video.size`)

### 5D. Empty state melhorado

Se não tem vídeos, mostrar mensagem motivacional + botão "Enviar primeiro vídeo" que troca pra aba de upload.

### 5E. Confirmação de exclusão melhorada

Em vez de `confirm()` nativo, usar modal estilizado com:
- Título do vídeo sendo excluído
- Aviso "Esta ação não pode ser desfeita"
- Botões "Cancelar" e "Excluir permanentemente"

### 5F. Indicador de status do vídeo

Na grid, mostrar badge de status:
- 🟡 "Processando" (com % de progresso)
- 🟢 "Disponível"
- 🔴 "Erro"

### 5G. Navegação na sidebar do professor

Verificar que o link "Vídeo-Aulas" aparece na sidebar com ícone adequado:
```bash
grep -rn "video-aulas\|Video.Aulas\|video.aulas" components/shell/ --include="*.tsx" | head -5
```

Se não aparece → adicionar ao shell do professor.

---

## FASE 6 — FUNCIONALIDADES DO ALUNO

Verificar a experiência do aluno:

```bash
# 1. Página do aluno existe
find app -path "*aluno*video*" -o -path "*dashboard*video*" -o -path "*student*video*" | grep "page.tsx" | head -5

# 2. Aluno NÃO pode fazer upload
grep -q "canDelete.*false\|canUpload.*false" app/ -r --include="*.tsx" | head -5

# 3. Aluno NÃO pode deletar
echo "Verificar que VideoLibrary com canDelete=false não mostra botão de delete"

# 4. Link na sidebar do aluno
grep -rn "video-aulas\|Video.Aulas" components/shell/MainShell.tsx 2>/dev/null | head -3
```

---

## FASE 7 — IMPLEMENTAR TUDO QUE FALTA + BUILD FINAL

Para CADA funcionalidade que falta (5A-5G):
1. Implementar
2. `pnpm typecheck && pnpm build` → ZERO erros
3. Commit com mensagem descritiva

---

## FASE 8 — RELATÓRIO FINAL

Gerar `BLACKBELT_VIDEO_TEST_REPORT.md`:

```markdown
# BLACKBELT v2 — Relatório de Teste: Vídeo-Aulas
## Data: [DATA]

### Testes da API Bunny
| Teste | Resultado |
|-------|-----------|
| Listar vídeos | ✅/❌ |
| Criar vídeo | ✅/❌ |
| Buscar vídeo | ✅/❌ |
| Deletar vídeo | ✅/❌ |

### Testes das Rotas Internas
| Teste | Resultado |
|-------|-----------|
| POST /api/videos/create-upload | ✅/❌ |
| GET /api/videos | ✅/❌ |
| GET /api/videos/[id] | ✅/❌ |
| DELETE /api/videos/[id] | ✅/❌ |
| PATCH /api/videos/[id] | ✅/❌ |

### Funcionalidades do Professor
| Feature | Status |
|---------|--------|
| Upload TUS com progress | ✅/❌ |
| Cancelar upload | ✅/❌ |
| Player embed Bunny | ✅/❌ |
| Thumbnail | ✅/❌ |
| Busca na biblioteca | ✅/❌ |
| Deletar vídeo | ✅/❌ |
| Editar título | ✅/❌ |
| Ordenar vídeos | ✅/❌ |
| Status de processamento | ✅/❌ |
| Empty state | ✅/❌ |
| Link na sidebar | ✅/❌ |

### Funcionalidades do Aluno
| Feature | Status |
|---------|--------|
| Assistir vídeos | ✅/❌ |
| Sem upload | ✅/❌ |
| Sem delete | ✅/❌ |
| Link na sidebar | ✅/❌ |

### Build
- pnpm typecheck: ZERO erros
- pnpm build: ZERO erros
```

**Commit:** `test: video-aulas usability test + missing features implemented`
**Push para main.**
