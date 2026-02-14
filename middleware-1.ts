/**
 * SOMNO LAB ROUTE TRANSPARENCY PROTOCOL
 * Minimal Edge passthrough.
 */
export default function middleware(req: Request) {
  return new Response(null, {
    status: 200,
    headers: { 'x-middleware-next': '1' }
  });
}

export const config = {
  matcher: [
    '/((?!api|_next|static|favicon\\.ico|sw\\.js|manifest\\.json|favicon.png).*)',
  ],
};