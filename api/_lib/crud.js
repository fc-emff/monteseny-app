import { supabase } from './supabase.js';
import { getRoleFromRequest } from './auth.js';

// Handles GET (list) and POST (create) for a table.
// requireAdminForRead: true means guests can't even read this resource
// (used for /api/tasks, per the project's access rules).
export function listCreateHandler(table, { requireAdminForRead = false } = {}) {
  return async function handler(req, res) {
    const role = getRoleFromRequest(req);
    if (!role) return res.status(401).json({ error: 'No autenticado' });
    if (requireAdminForRead && role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .order('created_at', { ascending: false });
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      if (role !== 'admin') return res.status(403).json({ error: 'Solo lectura' });
      const { data, error } = await supabase
        .from(table)
        .insert(req.body || {})
        .select()
        .single();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(201).json(data);
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Método no permitido' });
  };
}

// Handles PATCH (update) and DELETE for a single row identified by :id.
export function itemHandler(table, { requireAdminForRead = false } = {}) {
  return async function handler(req, res) {
    const role = getRoleFromRequest(req);
    if (!role) return res.status(401).json({ error: 'No autenticado' });
    if (requireAdminForRead && role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }

    const { id } = req.query;

    if (req.method === 'PATCH' || req.method === 'PUT') {
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

    if (req.method === 'DELETE') {
      if (role !== 'admin') return res.status(403).json({ error: 'Solo lectura' });
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) return res.status(500).json({ error: error.message });
      return res.status(204).end();
    }

    res.setHeader('Allow', 'PATCH, DELETE');
    return res.status(405).json({ error: 'Método no permitido' });
  };
}
