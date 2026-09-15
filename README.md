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
- Substituir o formulário `mailto:` por um endpoint real (Worker + Resend).
- Adicionar checkbox de consentimento RGPD + página de política de privacidade.
- Secções Galeria e Parceiros (Fase 1).
- Agenda dinâmica de formações (Fase 2) e área privada (Fase 3+).

Gerado com apoio do Claude — sessão de trabalho, Setembro 2026.
