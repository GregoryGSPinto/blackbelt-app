# Integracao com Catraca/Roleta de Entrada

## Status: PESQUISA — Nao implementado

## APIs Pesquisadas

### 1. Henry (henry.com.br)
- **Modelos:** Orion, Primme, Nova
- **Comunicacao:** API REST + TCP/IP
- **Integracao:** Via Henry Cloud API ou SDK local
- **Abordagem:** Webhook de check-in → libera catraca via API
- **Complexidade:** Media — requer servidor local para comunicacao TCP com a catraca

### 2. Topdata (topdata.com.br)
- **Modelos:** Inner Acesso, Top Flex
- **Comunicacao:** API REST + DLL/SDK Windows
- **Integracao:** TopConnect Cloud API
- **Abordagem:** QR Code do aluno lido pela catraca → valida via API BlackBelt
- **Complexidade:** Media — documentacao limitada

### 3. Control iD (controlid.com.br)
- **Modelos:** iDBlock, iDFace, iDUHF
- **Comunicacao:** API REST nativa (melhor documentacao)
- **Integracao:** Control iD Cloud + API local
- **Abordagem:** Biometria/QR na catraca → webhook → BlackBelt valida → libera
- **Complexidade:** Baixa/Media — API REST bem documentada

### 4. Intelbras (intelbras.com.br)
- **Modelos:** SS 3530, SS 5530
- **Comunicacao:** API REST + MQTT
- **Integracao:** Intelbras Cloud API
- **Abordagem:** Similar ao Control iD
- **Complexidade:** Media

## Abordagem Recomendada

1. **Fase 1 (v5.x):** Integracao generica via webhook
   - BlackBelt expoe endpoint `/api/checkin/validate`
   - Catraca envia request com QR code/biometria
   - BlackBelt responde com liberacao ou bloqueio
   - Compativel com qualquer fabricante que suporte webhooks

2. **Fase 2 (v6.x):** SDKs especificos por fabricante
   - Control iD primeiro (melhor API)
   - Henry segundo (mais instalado no Brasil)

## Estimativa: 2-4 semanas de desenvolvimento para Fase 1
