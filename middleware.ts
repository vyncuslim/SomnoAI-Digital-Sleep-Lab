
/**
 * 针对非 Next.js 项目（如本 Vite SPA）的 Vercel Edge 中间件。
 * 使用标准 Web API (Request/Response) 以确保跨环境兼容性。
 */
export const config = {
  matcher: [
    /*
     * 匹配所有路径，除了：
     * - api (API 路由)
     * - _next/static (静态文件)
     * - _next/image (图像优化文件)
     * - favicon.ico (图标文件)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

export default function middleware(request: Request) {
  // const url = new URL(request.url);

  // 在 Vercel 的标准中间件中，返回带有 'x-middleware-next': '1' 标头的响应
  // 将允许请求继续传递到前端应用（Vite 渲染的 index.html）
  return new Response(null, {
    headers: {
      'x-middleware-next': '1',
    },
  });
}
