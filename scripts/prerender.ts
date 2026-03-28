import fs from 'fs';
import path from 'path';
import { RESEARCH_ARTICLES, BLOG_POSTS } from '../src/data/mockData';
import { INFO_CONTENT } from '../src/data/infoContent';

const distDir = path.resolve(process.cwd(), 'dist');
const indexHtmlPath = path.join(distDir, 'index.html');

if (!fs.existsSync(indexHtmlPath)) {
  console.error('index.html not found in dist directory. Run vite build first.');
  process.exit(1);
}

const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
const template = indexHtml;

function generatePage(route: string, title: string, content: string) {
  // Handle root route
  const relativePath = route === '' ? 'index.html' : `${route}.html`;
  const filePath = path.join(distDir, relativePath);
  const dir = path.dirname(filePath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  const seoContent = `
    <div id="root">
      <div style="padding: 40px; max-width: 800px; margin: 0 auto; font-family: system-ui, sans-serif; color: #e2e8f0; background: #01040a; min-height: 100vh;">
        <h1 style="font-size: 2.5rem; margin-bottom: 1.5rem; font-weight: 700;">${title}</h1>
        <div style="line-height: 1.8; font-size: 1.1rem; color: #94a3b8;">${content.replace(/\n/g, '<br>')}</div>
      </div>
    </div>
  `;
  
  // Replace the default root div with the specific one
  // Also update the title tag if it exists
  // Also remove the seo-content div if it exists to avoid duplication
  let newHtml = template.replace(
    /<div id="root">.*?<\/div>\s*<\/body>/s,
    `${seoContent}\n  </body>`
  );
  
  newHtml = newHtml.replace(/<div id="seo-content".*?<\/div>/s, '');
  
  if (title) {
    newHtml = newHtml.replace(/<title>.*?<\/title>/, `<title>${title} | SomnoAI Digital Sleep Lab</title>`);
  }
  
  fs.writeFileSync(filePath, newHtml);
  console.log(`Generated static page for ${relativePath}`);
}

// 1. Generate core info pages from INFO_CONTENT
const languages = ['en', 'zh'] as const;
const routePrefixes = { en: 'en', zh: 'cn' };

languages.forEach(lang => {
  const prefix = routePrefixes[lang];
  const contentMap = INFO_CONTENT[lang];
  
  Object.entries(contentMap).forEach(([key, data]: [string, any]) => {
    if (data.title && (data.content || data.paragraphs)) {
      const content = data.content || (data.paragraphs ? data.paragraphs.join('\n\n') : '');
      
      // Map keys to routes
      let routeKey = key;
      if (key === 'privacy-policy') routeKey = 'legal/privacy';
      if (key === 'terms-of-service') routeKey = 'legal/terms';
      if (key === 'cookies') routeKey = 'legal/cookies';
      if (key === 'security') routeKey = 'legal/security';
      if (key === 'acceptable-use') routeKey = 'legal/acceptable-use';
      if (key === 'ai-disclaimer') routeKey = 'legal/ai-disclaimer';
      if (key === 'medical-disclaimer') routeKey = 'legal/medical-disclaimer';
      if (key === 'data-handling') routeKey = 'legal/data-handling';
      if (key === 'abuse-policy') routeKey = 'legal/abuse-policy';
      if (key === 'account-blocking') routeKey = 'legal/account-blocking';
      if (key === 'policy-framework') routeKey = 'legal/policy-framework';
      if (key === 'pricing-and-billing') routeKey = 'legal/pricing-and-billing';
      if (key === 'refund-and-cancellation') routeKey = 'legal/refund-and-cancellation';
      if (key === 'vulnerability-disclosure') routeKey = 'legal/vulnerability-disclosure';
      if (key === 'appeals-and-complaints') routeKey = 'legal/appeals-and-complaints';
      if (key === 'intellectual-property') routeKey = 'legal/intellectual-property';
      if (key === 'subprocessors') routeKey = 'legal/subprocessors';
      if (key === 'dpa') routeKey = 'legal/dpa';
      if (key === 'open-source') routeKey = 'legal/open-source';
      if (key === 'children-privacy') routeKey = 'legal/children-privacy';
      
      // Generate language-prefixed version
      generatePage(`${prefix}/${routeKey}`, data.title, content);
      
      // Generate root-level version for English
      if (lang === 'en') {
        generatePage(routeKey, data.title, content);
      }
    }
  });
});

// 2. Generate pages for research articles
RESEARCH_ARTICLES.forEach(article => {
  generatePage(`en/news/${article.slug}`, article.title, article.content);
  generatePage(`cn/news/${article.slug}`, article.title, article.content);
  generatePage(`news/${article.slug}`, article.title, article.content);
});

// 3. Generate pages for blog posts
BLOG_POSTS.forEach(post => {
  generatePage(`en/blog/${post.slug}`, post.title, post.content);
  generatePage(`cn/blog/${post.slug}`, post.title, post.content);
  generatePage(`blog/${post.slug}`, post.title, post.content);
});

// 4. Generate root and landing pages
const homeTitleEn = 'SomnoAI Digital Sleep Lab';
const homeContentEn = 'Advancing Sleep Science Through AI. SomnoAI provides personalized sleep coaching, comprehensive tracking, and actionable insights based on your unique sleep patterns. Whether you struggle with insomnia, sleep apnea symptoms, or just want to optimize your daily energy levels, SomnoAI is your personal digital sleep clinic.';

generatePage('', homeTitleEn, homeContentEn); // index.html
generatePage('en', homeTitleEn, homeContentEn); // en.html
generatePage('cn', 'SomnoAI 数字睡眠实验室', '通过人工智能推进睡眠科学。SomnoAI 根据您独特的睡眠模式提供个性化的睡眠指导、全面的跟踪和可操作的见解。无论您是饱受失眠、睡眠呼吸暂停症状的困扰，还是只想优化日常能量水平，SomnoAI 都是您的个人数字睡眠诊所。');

console.log('Prerendering complete.');
