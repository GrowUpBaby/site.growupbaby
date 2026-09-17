# Grow Up Baby — Site institucional

Site da Grow Up Baby (Enf.ª Filipa Santos & Enf.ª Telma Maravilha), construído como página estática (HTML/CSS/JS único, sem build step).

## Estrutura
- `index.html` — o site completo (todas as secções + estilos + scripts).
- `assets/` — fotografias e logótipos usados no site.

## Deploy (Cloudflare Pages)
1. Criar o repositório no GitHub e fazer push deste conteúdo.
2. Em Cloudflare → Workers & Pages → Create → Pages → Connect to Git, escolher este repositório.
3. Build settings: **nenhum build command**, output directory: `/` (raiz).
4. Depois do domínio `growupbaby.pt` estar com os nameservers apontados para a Cloudflare, associar o domínio custom ao projeto Pages.

## Pendente (ver roadmap completo no projeto "GROW UP BABY")
- Substituir o formulário `mailto:` por um endpoint real (Worker + Resend) — planeado para a migração Cloudflare.
- Agenda dinâmica de formações (Fase 2) e área privada (Fase 3+).

## Feito (Fase 1)
- Checkbox de consentimento RGPD nos dois formulários + página `privacidade.html`.
- Secções Galeria e Parceiros, com navegação atualizada (desktop, mobile, footer).
- Correção da foto de fundo da secção CTA (crop com QR code residual).

Gerado com apoio do Claude — sessão de trabalho, Setembro 2026.
