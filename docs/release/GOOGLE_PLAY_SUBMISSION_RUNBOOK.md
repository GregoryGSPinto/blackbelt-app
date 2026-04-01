# Google Play Submission Runbook

Data: 2026-04-01
Estado atual: `NO-GO`

## O que já está pronto no projeto

- Package: `app.blackbelt.academy`
- Version name/code: `1.0.0` / `1`
- pipeline de `bundleRelease` corrigida
- `assetlinks.json` gerável por script com SHA final
- build AAB de prova gerado com sucesso

## O que foi provado nesta sessão

Falha sem secrets:

```bash
cd android
./gradlew bundleRelease
```

Agora falha com mensagem útil:

```text
Android release signing is not configured. Set RELEASE_STORE_FILE, RELEASE_STORE_PASSWORD, RELEASE_KEY_ALIAS, and RELEASE_KEY_PASSWORD...
```

Build assinado de prova:

```bash
cd android
RELEASE_STORE_FILE=/tmp/blackbelt-store-release.keystore \
RELEASE_STORE_PASSWORD='BlackBeltRelease2026!' \
RELEASE_KEY_ALIAS=blackbelt \
RELEASE_KEY_PASSWORD='BlackBeltRelease2026!' \
./gradlew clean bundleRelease
```

Artefato gerado:

- `android/app/build/outputs/bundle/release/app-release.aab`
- SHA-256 do AAB: `3818a342850789df95e69f4660168aa76ba4f824679e051a3b81e8f0d28d7443`

Fingerprint da keystore de prova:

- `C4:D5:CE:9C:D4:7A:FB:1E:A2:7F:30:74:4C:01:AE:14:D1:26:EA:2D:78:38:E5:21:EB:9E:2D:5E:F7:86:FF:DC`

## Ordem exata

1. Escolher a keystore oficial de produção.
2. Exportar as quatro variáveis de signing:

```bash
export RELEASE_STORE_FILE=/abs/path/to/release.keystore
export RELEASE_STORE_PASSWORD='...'
export RELEASE_KEY_ALIAS='...'
export RELEASE_KEY_PASSWORD='...'
```

3. Rodar `pnpm build:mobile`.
4. Rodar `pnpm cap:sync`.
5. Rodar:

```bash
cd android
./gradlew clean bundleRelease
```

6. Validar:

```bash
ls -la app/build/outputs/bundle/release/
```

7. Gerar `assetlinks.json` final:

```bash
ANDROID_RELEASE_SHA256='<REAL_SHA256>' node scripts/generate-mobile-association-files.mjs
```

8. Preencher review account real e contatos reais.
9. Confirmar no Play Console se a conta exige `closed testing`.
10. Fazer upload do `.aab`.

## Blockers restantes Google

- Keystore oficial final ainda não foi fixada como credencial de produção.
- `assetlinks.json` ainda precisa do SHA-256 final.
- Telefone real de suporte ainda precisa ser informado para o listing.
- Conta/demo credentials reais ainda não existem.
- Gate de produção vs `closed testing` depende do console.

## Veredito

- Google: `NO-GO`
