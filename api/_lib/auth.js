import crypto from 'crypto';

const SECRET = process.env.SESSION_SECRET;
const TOKEN_TTL_MS = 12 * 60 * 60 * 1000; // 12 horas

if (!SECRET) {
  console.error(
    'Falta la variable de entorno SESSION_SECRET. Configúrala en Vercel ' +
    '(cualquier cadena larga y aleatoria sirve, ej. generada con `openssl rand -hex 32`).'
  );
}

function sign(payloadB64) {
  return crypto.createHmac('sha256', SECRET || 'fallback-insecure-secret')
    .update(payloadB64)
    .digest('base64url');
}

// Creates a signed, stateless session token. No database or session store
// needed — the role and expiry are encoded in the token itself and verified
// with an HMAC signature, so it can't be forged without SESSION_SECRET.
export function signToken(role) {
  const payload = JSON.stringify({ role, exp: Date.now() + TOKEN_TTL_MS });
  const payloadB64 = Buffer.from(payload).toString('base64url');
  return `${payloadB64}.${sign(payloadB64)}`;
}

export function verifyToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [payloadB64, sig] = token.split('.');
  if (sig !== sign(payloadB64)) return null; // tampered or forged
  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (!payload.exp || Date.now() > payload.exp) return null; // expired
    if (payload.role !== 'admin' && payload.role !== 'guest') return null;
    return payload.role;
  } catch {
    return null;
  }
}

// Reads the "Authorization: Bearer <token>" header and returns 'admin',
// 'guest', or null if missing/invalid/expired.
export function getRoleFromRequest(req) {
  const header = req.headers['authorization'] || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  return verifyToken(token);
}
