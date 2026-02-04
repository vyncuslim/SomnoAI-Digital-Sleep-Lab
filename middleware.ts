/**
 * SOMNO LAB ROUTE TRANSPARENCY PROTOCOL
 * Ensures middleware does not block Vercel rewrites for SPA clean URLs.
 */
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

export default function middleware(request: Request) {
  // Pass-through to ensure vercel.json rewrites are executed correctly
  return new Response(null, {
    headers: {
      'x-middleware-next': '1',
    },
  });
}