import { supabase } from '../_lib/supabase.js';
import { getRoleFromRequest } from '../_lib/auth.js';

export default async function handler(req, res) {
  const role = getRoleFromRequest(req);
  if (!role) return res.status(401).json({ error: 'No autenticado' });

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método no permitido' });
  }
  if (role !== 'admin') return res.status(403).json({ error: 'Solo lectura' });

  const { fecha } = req.body || {};
  const { data, error } = await supabase
    .from('sampling_points')
    .update({ estado: 'muestreado', fecha: fecha || '2026-06-29' })
    .neq('name', '')
    .select();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json(data);
}
