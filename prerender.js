import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';
import express from 'express';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.resolve(__dirname, 'dist');

const routesToPrerender = [
  '/',
  '/en',
  '/cn',
  '/en/about',
  '/cn/about',
  '/en/features',
  '/cn/features',
  '/en/product',
  '/cn/product',
  '/en/how-it-works',
  '/cn/how-it-works',
  '/en/research',
  '/cn/research',
  '/en/science',
  '/cn/science',
  '/en/founder',
  '/cn/founder',
  '/en/contact',
  '/cn/contact',
  '/en/faq',
  '/cn/faq',
  '/en/status',
  '/cn/status',
  '/en/blog',
  '/cn/blog',
  '/en/news',
  '/cn/news',
  '/en/legal',
  '/cn/legal',
  '/en/media',
  '/cn/media'
];

async function prerender() {
  console.log('Starting prerendering...');
  
  // Rename index.html to app.html to preserve the empty shell
  const indexHtmlPath = path.resolve(distPath, 'index.html');
  const appHtmlPath = path.resolve(distPath, 'app.html');
  if (fs.existsSync(indexHtmlPath)) {
    fs.renameSync(indexHtmlPath, appHtmlPath);
  }

  // Start a local server to serve the dist folder
  const app = express();
  app.use(express.static(distPath));
  
  // Fallback to app.html for client-side routing
  app.use((req, res) => {
    res.sendFile(appHtmlPath);
  });
  
  const server = app.listen(3001, async () => {
    console.log('Local server started on port 3001');
    
    try {
      const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
      
      for (const route of routesToPrerender) {
        console.log(`Prerendering ${route}...`);
        const page = await browser.newPage();
        
        // Go to the route and wait for network to be idle
        await page.goto(`http://localhost:3001${route}`, { waitUntil: 'networkidle0' });
        
        // Wait for the root element to have content
        await page.waitForSelector('#root > *', { timeout: 10000 }).catch(() => console.log('Timeout waiting for content'));
        
        // Get the HTML content
        const html = await page.content();
        
        // Determine file path
        const routePath = route === '/' ? '/index' : route;
        const filePath = path.join(distPath, `${routePath}.html`);
        
        // Ensure directory exists
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        // Write the file
        fs.writeFileSync(filePath, html);
        console.log(`Saved ${filePath}`);
        
        await page.close();
      }
      
      await browser.close();
      console.log('Prerendering complete!');
    } catch (error) {
      console.error('Prerendering failed:', error);
    } finally {
      server.close();
    }
  });
}

prerender();
