import { supabase } from './supabase.js';
import { getRoleFromRequest } from './auth.js';

// One function per resource instead of two (list+create AND item), to stay
// under Vercel Hobby's 12-serverless-functions-per-deployment limit.
// GET  /api/<resource>          -> list
// POST /api/<resource>          -> create
// PATCH  /api/<resource>?id=X   -> update
// DELETE /api/<resource>?id=X   -> delete
export function resourceHandler(table, { requireAdminForRead = false } = {}) {
  return async function handler(req, res) {
    const role = getRoleFromRequest(req);
    if (!role) return res.status(401).json({ error: 'No autenticado' });
    if (requireAdminForRead && role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }

    const { id } = req.query;

    if (req.method === 'GET' && !id) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .order('created_at', { ascending: false });
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(data);
    }

    if (req.method === 'POST' && !id) {
      if (role !== 'admin') return res.status(403).json({ error: 'Solo lectura' });
      const { data, error } = await supabase
        .from(table)
        .insert(req.body || {})
        .select()
        .single();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(201).json(data);
    }

    if ((req.method === 'PATCH' || req.method === 'PUT') && id) {
      if (role !== 'admin') return res.status(403).json({ error: 'Solo lectura' });
      const { data, error } = await supabase
        .from(table)
        .update(req.body || {})
        .eq('id', id)
        .select()
        .single();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE' && id) {
      if (role !== 'admin') return res.status(403).json({ error: 'Solo lectura' });
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) return res.status(500).json({ error: error.message });
      return res.status(204).end();
    }

    res.setHeader('Allow', 'GET, POST, PATCH, DELETE');
    return res.status(400).json({ error: 'Solicitud inválida' });
  };
}
