
export default function middleware(req: Request) {
  // SOMNO TRANSPARENCY PROTOCOL: 让 Vercel 静态层处理所有请求
  return null;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|assets|.*\\..*).*)'],
};
