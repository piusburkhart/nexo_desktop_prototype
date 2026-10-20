// Password gate for the whole site (index, prototypes, concepts.json), run by Vercel before any file is served.
// Browsers show a login prompt: any username, password below. Credentials are then reused for the iframes.
// To change the password, edit PASSWORD (or set a SITE_PASSWORD environment variable in Vercel, which wins).
const PASSWORD = 'above';

export const config = { matcher: '/(.*)' };

export default function middleware(request) {
  const expected = (typeof process !== 'undefined' && process.env && process.env.SITE_PASSWORD) || PASSWORD;
  const auth = request.headers.get('authorization') || '';
  if (auth.startsWith('Basic ')) {
    const decoded = atob(auth.slice(6));
    if (decoded.slice(decoded.indexOf(':') + 1) === expected) {
      return new Response(null, { headers: { 'x-middleware-next': '1' } }); // let the request through
    }
  }
  return new Response('Password required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Nexo concepts", charset="UTF-8"' },
  });
}
