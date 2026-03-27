import fs from 'fs';
import path from 'path';
import { RESEARCH_ARTICLES, BLOG_POSTS } from '../src/data/mockData';

const distDir = path.resolve(process.cwd(), 'dist');
const indexHtmlPath = path.join(distDir, 'index.html');

if (!fs.existsSync(indexHtmlPath)) {
  console.error('index.html not found in dist directory. Run vite build first.');
  process.exit(1);
}

const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

function generatePage(route: string, title: string, content: string) {
  const dir = path.join(distDir, route);
  fs.mkdirSync(dir, { recursive: true });
  
  const seoContent = `
    <div id="seo-content" style="opacity: 0; position: absolute; z-index: -1; pointer-events: none;">
      <h1>${title}</h1>
      <div>${content}</div>
    </div>
  `;
  
  // Replace the default seo-content with the specific one
  const newHtml = indexHtml.replace(
    /<div id="seo-content".*?<\/div>/s,
    seoContent
  );
  
  fs.writeFileSync(path.join(dir, 'index.html'), newHtml);
  console.log(`Generated static page for ${route}`);
}

// Generate pages for research articles
RESEARCH_ARTICLES.forEach(article => {
  generatePage(`en/news/${article.slug}`, article.title, article.content);
  generatePage(`cn/news/${article.slug}`, article.title, article.content);
});

// Generate pages for blog posts
BLOG_POSTS.forEach(post => {
  generatePage(`en/blog/${post.slug}`, post.title, post.content);
  generatePage(`cn/blog/${post.slug}`, post.title, post.content);
});

console.log('Prerendering complete.');
