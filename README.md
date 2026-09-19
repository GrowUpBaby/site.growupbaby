# Grow Up Baby — Site institucional

Site da Grow Up Baby (Enf.ª Filipa Santos & Enf.ª Telma Maravilha): antes uma página estática, agora um
Cloudflare Worker que serve o site e expõe a agenda dinâmica de formações (Fase 2 do roadmap).

## Estrutura
- `public/` — o site (HTML/CSS/JS únicos, sem build step) + `assets/`.
- `src/index.js` — o Worker: serve `public/` e responde à API (`/api/cursos`, `/api/inscricoes`).
- `migrations/` — schema da base de dados D1 (tabelas `cursos` e `inscricoes`).
- `wrangler.jsonc` — configuração do Worker (assets + binding da D1).

## Desenvolvimento local
```
npm install
npm run db:migrate:local   # cria as tabelas na D1 local (com 2 cursos de exemplo)
npm run dev                # wrangler dev em http://localhost:8787
```

## Pôr em produção (falta fazer — próximos passos)
1. `npx wrangler login` (autenticar a CLI com a conta Cloudflare do projeto).
2. `npm run db:create` → copiar o `database_id` devolvido para `wrangler.jsonc` (substitui o placeholder
   `PENDENTE_CRIAR_COM_WRANGLER_D1_CREATE`).
3. `npm run db:migrate:remote` → cria as tabelas na D1 de produção.
4. `wrangler secret put RESEND_API_KEY` (só depois de o domínio `growupbaby.pt` estar verificado no Resend —
   sem isto, a inscrição continua a funcionar, só não envia os emails de confirmação).
5. Push para `main` → o deploy automático via Cloudflare (Connect to Git) passa a usar este `wrangler.jsonc`
   em vez da deteção automática de site estático que usava até agora.
6. Nas definições do projeto Cloudflare (Workers & Pages → Settings → Bindings), confirmar que o binding D1
   ficou associado também no ambiente de produção do deploy automático.

## Pendente (ver roadmap completo no projeto "GROW UP BABY")
- Botão de WhatsApp (falta o número de contacto).
- Substituir o formulário `mailto:` de Contacto por um endpoint próprio (Worker + Resend).
- Área privada de gestão (Fase 3) — CRUD de cursos/parceiros, autenticação via Cloudflare Access.

## Feito
- **Fase 1**: RGPD nos formulários + `privacidade.html`, secções Galeria e Parceiros, correções de fotos/footer.
- **Fase 2 (em curso)**: schema D1 (`cursos`, `inscricoes`), Worker com `GET /api/cursos` e
  `POST /api/inscricoes` (reserva de vaga atómica + email de confirmação via Resend quando o secret existir),
  secção pública "Próximas formações" no site, alimentada pela API (esconde-se sozinha se a API ainda não
  estiver disponível, para não mostrar um site quebrado antes do deploy).

Gerado com apoio do Claude — sessão de trabalho, Setembro 2026.
