const { json, methodNotAllowed, badRequest, serverError } = require('../../lib/http');
const { supabaseRest, hasSupabaseServiceRole } = require('../../lib/supabase');

const MAX_Q_LENGTH = 120;
const MAX_RESULTS  = 24;

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(req, res, ['GET']);

  // ── Guard: Supabase no configurado ─────────────────────────────────────────
  if (!hasSupabaseServiceRole()) {
    return json(res, 503, { ok: false, error: 'floor_plan_library_unavailable', results: [] });
  }

  // ── Validar parámetro q ────────────────────────────────────────────────────
  const raw = String(req.query?.q ?? '').trim();
  if (!raw) return badRequest(res, 'El parámetro q es obligatorio.');
  if (raw.length > MAX_Q_LENGTH) return badRequest(res, `q no puede superar ${MAX_Q_LENGTH} caracteres.`);

  // Sanitizar: quitar caracteres que puedan romper la query REST
  const q = raw.replace(/[%_]/g, '\\$&');   // escapar wildcards reales si los manda el usuario
  const pattern = encodeURIComponent(`*${q}*`);

  try {
    const rows = await supabaseRest('floor_plans', {
      query: [
        `?select=id,venue_name,city,type,thumbnail_url,image_url`,
        `&venue_name=ilike.${pattern}`,
        `&order=venue_name.asc`,
        `&limit=${MAX_RESULTS}`
      ].join('')
    });

    return json(res, 200, { ok: true, results: Array.isArray(rows) ? rows : [] });

  } catch (error) {
    console.error('[plans/search]', error.message);
    return serverError(res, error);
  }
};
