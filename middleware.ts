/**
 * SOMNO LAB ROUTE TRANSPARENCY PROTOCOL
 * Middleware inactive to allow vercel.json rewrite precedence.
 */
export default function middleware(req: Request) {
  return null;
}

export const config = {
  matcher: [],
};