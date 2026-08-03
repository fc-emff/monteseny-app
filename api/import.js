import { supabase } from './_lib/supabase.js';
import { getRoleFromRequest } from './_lib/auth.js';

const REPLACE_TABLES = [
  ['reference_points', 'reference_points'],
  ['inventory', 'inventory'],
  ['tasks', 'tasks'],
  ['devices', 'devices'],
  ['study_results', 'study_results'],
];

export default async function handler(req, res) {
  const role = getRoleFromRequest(req);
  if (!role) return res.status(401).json({ error: 'No autenticado' });

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método no permitido' });
  }
  if (role !== 'admin') return res.status(403).json({ error: 'Solo administrador puede importar' });

  const body = req.body || {};

  try {
    // Sampling points: merge by name (the table is a fixed seeded list, never
    // replaced wholesale).
    if (Array.isArray(body.sampling_points)) {
      for (const p of body.sampling_points) {
        if (!p || !p.name) continue;
        await supabase
          .from('sampling_points')
          .update({ estado: p.estado, fecha: p.fecha, notas: p.notas })
          .eq('name', p.name);
      }
    }

    // Everything else: replace wholesale, same behavior as the previous
    // single-file version's import.
    for (const [table, key] of REPLACE_TABLES) {
      if (!Array.isArray(body[key])) continue;
      const { error: delErr } = await supabase
        .from(table)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      if (delErr) throw delErr;
      if (body[key].length) {
        const rows = body[key].map(({ id, created_at, ...rest }) => rest);
        const { error: insErr } = await supabase.from(table).insert(rows);
        if (insErr) throw insErr;
      }
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
