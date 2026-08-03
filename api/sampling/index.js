import { supabase } from '../_lib/supabase.js';
import { getRoleFromRequest } from '../_lib/auth.js';

export default async function handler(req, res) {
  const role = getRoleFromRequest(req);
  if (!role) return res.status(401).json({ error: 'No autenticado' });

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { data, error } = await supabase.from('sampling_points').select('*').order('name');
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json(data);
}
