-- Fase 2: agenda dinâmica de formações (cursos + inscrições)
-- Aplicar com:
--   npx wrangler d1 migrations apply growupbaby --local   (para testar localmente)
--   npx wrangler d1 migrations apply growupbaby --remote  (depois de criar a DB em produção)

CREATE TABLE IF NOT EXISTS cursos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT NOT NULL,
  descricao TEXT,
  data_hora TEXT NOT NULL,                    -- ISO 8601, ex: 2026-11-08T10:00:00
  preco_centimos INTEGER NOT NULL DEFAULT 0,  -- preço em cêntimos (evita erros de vírgula flutuante)
  plazas_totais INTEGER NOT NULL DEFAULT 20,
  plazas_ocupadas INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS inscricoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  curso_id INTEGER NOT NULL REFERENCES cursos(id),
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  consentimento_rgpd INTEGER NOT NULL DEFAULT 0,
  data_inscricao TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_inscricoes_curso_id ON inscricoes(curso_id);

-- Dados de exemplo para testar a agenda em desenvolvimento.
-- IMPORTANTE: datas e preços fictícios — Telma/Filipa devem editá-los ou apagá-los
-- (a gestão via painel privado chega na Fase 3; por agora, editar esta tabela diretamente).
INSERT INTO cursos (titulo, descricao, data_hora, preco_centimos, plazas_totais) VALUES
  ('Curso Cuidados ao Bebé', 'Teoria e prática: banho, muda de fralda, sono e manobra de desengasgamento.', '2026-11-08T10:00:00', 4500, 12),
  ('Workshop Introdução Alimentar', 'Alimentos proibidos, sinais de prontidão alimentar e métodos de introdução.', '2026-11-22T18:30:00', 3000, 20);
