/**
 * Worker da Grow Up Baby.
 * - Serve o site estático (pasta /public) para tudo o que não seja /api/*.
 * - Expõe a agenda dinâmica de formações (Fase 2 do roadmap):
 *     GET  /api/cursos       -> lista os próximos cursos com vagas
 *     POST /api/inscricoes   -> inscreve alguém num curso, validando vagas
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/api/cursos' && request.method === 'GET') {
      return handleListCursos(env);
    }

    if (url.pathname === '/api/inscricoes' && request.method === 'POST') {
      return handleInscricao(request, env, ctx);
    }

    if (url.pathname.startsWith('/api/')) {
      return json({ error: 'Rota não encontrada.' }, 404);
    }

    return env.ASSETS.fetch(request);
  },
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

async function handleListCursos(env) {
  const { results } = await env.DB.prepare(
    `SELECT id, titulo, descricao, data_hora, preco_centimos, plazas_totais, plazas_ocupadas
     FROM cursos
     WHERE datetime(data_hora) >= datetime('now')
     ORDER BY data_hora ASC`
  ).all();

  const cursos = results.map((c) => ({
    id: c.id,
    titulo: c.titulo,
    descricao: c.descricao,
    data_hora: c.data_hora,
    preco_eur: c.preco_centimos / 100,
    plazas_disponiveis: Math.max(0, c.plazas_totais - c.plazas_ocupadas),
  }));

  return json({ cursos });
}

async function handleInscricao(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Pedido inválido.' }, 400);
  }

  const { curso_id, nome, email, telefone, consentimento } = body || {};

  if (!curso_id || !nome || !email || !consentimento) {
    return json(
      { error: 'Faltam campos obrigatórios (curso, nome, email, consentimento RGPD).' },
      400
    );
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return json({ error: 'Email inválido.' }, 400);
  }

  // Reserva a vaga de forma atómica: o UPDATE só acontece se ainda houver espaço,
  // evitando que duas inscrições em simultâneo ultrapassem o limite de vagas.
  const reserva = await env.DB.prepare(
    `UPDATE cursos SET plazas_ocupadas = plazas_ocupadas + 1
     WHERE id = ? AND plazas_ocupadas < plazas_totais`
  )
    .bind(curso_id)
    .run();

  if (reserva.meta.changes === 0) {
    return json({ error: 'Já não há vagas disponíveis para este curso.' }, 409);
  }

  let inscricaoId;
  try {
    const insercao = await env.DB.prepare(
      `INSERT INTO inscricoes (curso_id, nome, email, telefone, consentimento_rgpd)
       VALUES (?, ?, ?, ?, 1)`
    )
      .bind(curso_id, nome, email, telefone || null)
      .run();
    inscricaoId = insercao.meta.last_row_id;
  } catch (err) {
    // A inscrição falhou depois de reservada a vaga — liberta-a outra vez.
    await env.DB.prepare(`UPDATE cursos SET plazas_ocupadas = plazas_ocupadas - 1 WHERE id = ?`)
      .bind(curso_id)
      .run();
    return json({ error: 'Não foi possível concluir a inscrição. Tentem novamente.' }, 500);
  }

  const curso = await env.DB.prepare(`SELECT titulo, data_hora FROM cursos WHERE id = ?`)
    .bind(curso_id)
    .first();

  // Os emails não bloqueiam a resposta: a inscrição já está confirmada na BD.
  ctx.waitUntil(sendConfirmationEmails(env, { nome, email, curso }));

  return json({ ok: true, inscricao_id: inscricaoId });
}

async function sendConfirmationEmails(env, { nome, email, curso }) {
  if (!env.RESEND_API_KEY) return; // Secret ainda não configurado (ver README) — ignora em silêncio.

  const dataFormatada = curso?.data_hora
    ? new Date(curso.data_hora).toLocaleString('pt-PT', { dateStyle: 'long', timeStyle: 'short' })
    : '';

  const send = (payload) =>
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

  try {
    // TODO: ajustar o remetente quando o domínio growupbaby.pt estiver verificado no Resend.
    await send({
      from: 'Grow Up Baby <inscricoes@growupbaby.pt>',
      to: email,
      subject: `Inscrição confirmada — ${curso?.titulo ?? 'o vosso curso'}`,
      html: `<p>Olá ${nome},</p><p>A vossa inscrição em <strong>${curso?.titulo ?? ''}</strong> (${dataFormatada}) está confirmada. Até já!</p><p>Equipa Grow Up Baby</p>`,
    });
    await send({
      from: 'Grow Up Baby <inscricoes@growupbaby.pt>',
      to: 'geral@growupbaby.pt',
      subject: `Nova inscrição — ${curso?.titulo ?? 'curso'}`,
      html: `<p>Nova inscrição de <strong>${nome}</strong> (${email}) em ${curso?.titulo ?? ''} (${dataFormatada}).</p>`,
    });
  } catch (err) {
    console.error('Falha ao enviar emails via Resend', err);
  }
}
