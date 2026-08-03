import { signToken } from './_lib/auth.js';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { key } = req.body || {};
  const ADMIN_KEY = process.env.ACCESS_KEY_ADMIN;
  const GUEST_KEY = process.env.ACCESS_KEY_GUEST;

  let role = null;
  if (key && ADMIN_KEY && key === ADMIN_KEY) role = 'admin';
  else if (key && GUEST_KEY && key === GUEST_KEY) role = 'guest';

  if (!role) {
    return res.status(401).json({ error: 'Clave incorrecta' });
  }

  const token = signToken(role);
  return res.status(200).json({ token, role });
}
