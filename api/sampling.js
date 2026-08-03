import { supabase } from './_lib/supabase.js';
import { getRoleFromRequest } from './_lib/auth.js';

// GET  /api/sampling                    -> list all 15 points
// PATCH /api/sampling?name=UM_1         -> update estado/fecha/notas of one point
// POST  /api/sampling?action=bulk-mark  -> mark all points as sampled on a given date
export default async function handler(req, res) {
  const role = getRoleFromRequest(req);
  if (!role) return res.status(401).json({ error: 'No autenticado' });

  const { name, action } = req.query;

  if (req.method === 'GET' && !name) {
    const { data, error } = await supabase.from('sampling_points').select('*').order('name');
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'PATCH' && name) {
    if (role !== 'admin') return res.status(403).json({ error: 'Solo lectura' });
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

  if (req.method === 'POST' && action === 'bulk-mark') {
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

  res.setHeader('Allow', 'GET, PATCH, POST');
  return res.status(400).json({ error: 'Solicitud inválida' });
}
