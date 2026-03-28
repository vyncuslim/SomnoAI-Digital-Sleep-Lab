import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generateLogo() {
  const svg = `
    <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0f172a;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1e293b;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" fill="white" />
      
      <!-- Brain/Moon Motif -->
      <path d="M256 100 C180 100 120 160 120 236 C120 312 180 372 256 372 C332 372 392 312 392 236 C392 160 332 100 256 100 Z" fill="url(#grad1)" />
      
      <!-- Crescent Moon Cutout -->
      <circle cx="280" cy="210" r="100" fill="white" />
      
      <!-- AI/Digital Circuit Motif -->
      <circle cx="256" cy="236" r="40" fill="#f97316" />
      <rect x="250" y="180" width="12" height="112" rx="6" fill="#f97316" />
      <rect x="200" y="230" width="112" height="12" rx="6" fill="#f97316" />
      
      <!-- Text -->
      <text x="256" y="450" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="#0f172a" text-anchor="middle">SomnoAI</text>
      <text x="256" y="490" font-family="Arial, sans-serif" font-size="24" fill="#64748b" text-anchor="middle">Digital Sleep Lab</text>
    </svg>
  `;

  const outputPath = path.join(process.cwd(), 'public', 'logo_512.png');
  
  try {
    await sharp(Buffer.from(svg))
      .png()
      .toFile(outputPath);
    console.log(`Logo generated successfully at ${outputPath}`);
  } catch (error) {
    console.error('Error generating logo:', error);
  }
}

generateLogo();
