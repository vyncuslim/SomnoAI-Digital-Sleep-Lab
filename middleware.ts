// SOMNO TRANSPARENCY PROTOCOL: 
// 移除中间件以避免对 vercel.json 重写规则的潜在干扰
export default function middleware() {
  return null;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|assets|.*\\..*).*)'],
};