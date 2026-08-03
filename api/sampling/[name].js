import { supabase } from '../_lib/supabase.js';
import { getRoleFromRequest } from '../_lib/auth.js';

export default async function handler(req, res) {
  const role = getRoleFromRequest(req);
  if (!role) return res.status(401).json({ error: 'No autenticado' });

  if (req.method !== 'PATCH') {
    res.setHeader('Allow', 'PATCH');
    return res.status(405).json({ error: 'Método no permitido' });
  }
  if (role !== 'admin') return res.status(403).json({ error: 'Solo lectura' });

  const { name } = req.query;
  const { estado, fecha, notas } = req.body || {};
  const update = {};
  if (estado !== undefined) update.estado = estado;
  if (fecha !== undefined) update.fecha = fecha;
  if (notas !== undefined) update.notas = notas;

  const { data, error } = await supabase
    .from('sampling_points')
    .update(update)
    .eq('name', decodeURIComponent(name))
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json(data);
}
