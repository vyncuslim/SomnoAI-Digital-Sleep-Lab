
/**
 * Minimal middleware for Vite/SPA environment on Vercel.
 * Ensures routes like /admin and /login are served by index.html.
 */
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

export default function middleware(request: Request) {
  return new Response(null, {
    headers: {
      'x-middleware-next': '1',
    },
  });
}
