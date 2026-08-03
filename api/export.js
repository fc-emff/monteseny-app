import { supabase } from './_lib/supabase.js';
import { getRoleFromRequest } from './_lib/auth.js';

const TABLES = ['sampling_points', 'reference_points', 'inventory', 'tasks', 'devices', 'study_results'];

export default async function handler(req, res) {
  const role = getRoleFromRequest(req);
  if (!role) return res.status(401).json({ error: 'No autenticado' });

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const result = { exportedAt: new Date().toISOString(), source: 'montseny-control' };
  for (const table of TABLES) {
    if (table === 'tasks' && role !== 'admin') {
      result[table] = []; // guests never see task data, even via export
      continue;
    }
    const { data, error } = await supabase.from(table).select('*');
    if (error) return res.status(500).json({ error: error.message });
    result[table] = data;
  }
  return res.status(200).json(result);
}
