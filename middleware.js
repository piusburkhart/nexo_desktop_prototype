// Password gate for the whole site (index, prototypes, concepts.json), run by Vercel before any file is served.
// Visitors see a password-only form; a correct password sets a cookie (30 days) and the page loads.
// To change the password, edit PASSWORD (or set a SITE_PASSWORD environment variable in Vercel, which wins).
const PASSWORD = 'above';
const COOKIE = 'nexo_auth';

export const config = { matcher: '/(.*)' };

// The cookie holds a hash of the password, never the password itself.
async function token(password) {
  const data = new TextEncoder().encode('nexo-concepts:' + password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, '0')).join('');
}

const loginPage = error => new Response(`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Nexo</title>
<style>
  :root{color-scheme:light dark;--bg:#fff;--fg:#1a1a1a;--line:#d6d6d6}
  @media (prefers-color-scheme:dark){:root{--bg:#161616;--fg:#f0f0f0;--line:#3a3a3a}}
  body{margin:0;min-height:100vh;display:grid;place-items:center;background:var(--bg);color:var(--fg);font:15px system-ui,sans-serif}
  form{display:flex;flex-direction:column;gap:12px;width:260px}
  h1{font-size:15px;font-weight:600;margin:0}
  input,button{font:inherit;padding:9px 12px;border-radius:8px;border:1px solid var(--line);background:none;color:inherit}
  button{background:var(--fg);color:var(--bg);border-color:var(--fg);cursor:pointer}
  input:focus-visible,button:focus-visible{outline:2px solid #4c8dff;outline-offset:2px}
  p{margin:0;color:#d33;font-size:13px}
</style></head><body>
<form method="post"><h1>Nexo</h1>
<input type="password" name="password" placeholder="Password" autocomplete="current-password" autofocus required>
${error ? '<p>Wrong password</p>' : ''}<button type="submit">Open</button></form>
</body></html>`, { status: 401, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });

export default async function middleware(request) {
  const expected = (typeof process !== 'undefined' && process.env && process.env.SITE_PASSWORD) || PASSWORD;
  const good = await token(expected);

  // Already logged in: let the request through to the static file.
  if ((request.headers.get('cookie') || '').split(/;\s*/).includes(`${COOKIE}=${good}`)) {
    return new Response(null, { headers: { 'x-middleware-next': '1' } });
  }

  // Password submitted: set the cookie and reload the same URL.
  if (request.method === 'POST') {
    const form = await request.formData().catch(() => null);
    if (form && form.get('password') === expected) {
      return new Response(null, {
        status: 303,
        headers: { location: request.url, 'set-cookie': `${COOKIE}=${good}; Path=/; Max-Age=2592000; HttpOnly; Secure; SameSite=Lax` },
      });
    }
    return loginPage(true);
  }
  return loginPage(false);
}
