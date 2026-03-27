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
  const filePath = path.join(distDir, `${route}.html`);
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  
  const seoContent = `
    <div id="root">
      <div style="padding: 40px; max-width: 800px; margin: 0 auto; font-family: system-ui, sans-serif; color: #e2e8f0; background: #01040a; min-height: 100vh;">
        <h1 style="font-size: 2rem; margin-bottom: 1rem;">${title}</h1>
        <div style="line-height: 1.6;">${content}</div>
      </div>
    </div>
  `;
  
  // Replace the default root div with the specific one
  const newHtml = indexHtml.replace(
    /<div id="root">.*?<\/div>\s*<\/body>/s,
    `${seoContent}\n  </body>`
  );
  
  fs.writeFileSync(filePath, newHtml);
  console.log(`Generated static page for ${route}.html`);
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
