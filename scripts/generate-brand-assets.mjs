import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const sourcePath = 'C:\\Users\\bhave\\.gemini\\antigravity-ide\\brain\\52448042-b218-4937-9f34-461d1a9727d5\\.user_uploaded\\media_1791465907388.jpg';
const publicDir = path.resolve('public');
const appDir = path.resolve('src/app');

async function main() {
  console.log('Loading source image from:', sourcePath);
  const image = sharp(sourcePath);
  const metadata = await image.metadata();
  console.log(`Dimensions: ${metadata.width}x${metadata.height}`);

  // Get raw RGBA buffer
  const { data, info } = await sharp(sourcePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;

  // Colors
  const transparentOriginal = Buffer.alloc(width * height * 4);
  const goldVersion = Buffer.alloc(width * height * 4);
  const whiteVersion = Buffer.alloc(width * height * 4);

  // Champagne Gold RGB: #C5A880 -> R: 197, G: 168, B: 128
  const goldR = 197, goldG = 168, goldB = 128;
  // Ivory White RGB: #FAF7F2 -> R: 250, G: 247, B: 242
  const whiteR = 250, whiteG = 247, whiteB = 242;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const darkness = 255 - Math.max(g, b);
    let alpha = 0;
    if (darkness > 8) {
      alpha = Math.min(255, Math.round((darkness / 235) * 255));
    }

    if (alpha > 0) {
      const fgR = Math.max(0, Math.min(255, Math.round((r - (255 * (255 - alpha)) / 255) / (alpha / 255))));
      const fgG = Math.max(0, Math.min(255, Math.round((g - (255 * (255 - alpha)) / 255) / (alpha / 255))));
      const fgB = Math.max(0, Math.min(255, Math.round((b - (255 * (255 - alpha)) / 255) / (alpha / 255))));

      transparentOriginal[i] = fgR;
      transparentOriginal[i + 1] = fgG;
      transparentOriginal[i + 2] = fgB;
      transparentOriginal[i + 3] = alpha;

      goldVersion[i] = goldR;
      goldVersion[i + 1] = goldG;
      goldVersion[i + 2] = goldB;
      goldVersion[i + 3] = alpha;

      whiteVersion[i] = whiteR;
      whiteVersion[i + 1] = whiteG;
      whiteVersion[i + 2] = whiteB;
      whiteVersion[i + 3] = alpha;
    } else {
      transparentOriginal[i] = 0;
      transparentOriginal[i + 1] = 0;
      transparentOriginal[i + 2] = 0;
      transparentOriginal[i + 3] = 0;

      goldVersion[i] = 0;
      goldVersion[i + 1] = 0;
      goldVersion[i + 2] = 0;
      goldVersion[i + 3] = 0;

      whiteVersion[i] = 0;
      whiteVersion[i + 1] = 0;
      whiteVersion[i + 2] = 0;
      whiteVersion[i + 3] = 0;
    }
  }

  // 1. Full Logo (Original Wine Red)
  console.log('Generating full logo transparent PNG...');
  const logoBuffer = await sharp(transparentOriginal, { raw: { width, height, channels: 4 } })
    .trim({ threshold: 10 })
    .extend({ top: 30, bottom: 30, left: 30, right: 30, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ quality: 100, compressionLevel: 9 })
    .toBuffer();

  await sharp(logoBuffer).toFile(path.join(publicDir, 'logo.png'));

  // Full Gold Logo for dark backgrounds
  console.log('Generating gold logo transparent PNG...');
  const goldLogoBuffer = await sharp(goldVersion, { raw: { width, height, channels: 4 } })
    .trim({ threshold: 10 })
    .extend({ top: 30, bottom: 30, left: 30, right: 30, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ quality: 100, compressionLevel: 9 })
    .toBuffer();

  await sharp(goldLogoBuffer).toFile(path.join(publicDir, 'logo-gold.png'));

  // Full White Logo
  console.log('Generating white logo transparent PNG...');
  await sharp(whiteVersion, { raw: { width, height, channels: 4 } })
    .trim({ threshold: 10 })
    .extend({ top: 30, bottom: 30, left: 30, right: 30, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(publicDir, 'logo-white.png'));

  // 2. Extract Monogram (VJ Crest) from logo.png:
  // In logo.png, bounds of crest are left: 290, top: 25, width: 450, height: 450
  console.log('Extracting monogram VJ crest...');
  const monogramCrest = await sharp(logoBuffer)
    .extract({ left: 290, top: 25, width: 450, height: 450 })
    .trim({ threshold: 10 })
    .extend({ top: 24, bottom: 24, left: 24, right: 24, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ quality: 100 })
    .toBuffer();

  const monogramGold = await sharp(goldLogoBuffer)
    .extract({ left: 290, top: 25, width: 450, height: 450 })
    .trim({ threshold: 10 })
    .extend({ top: 24, bottom: 24, left: 24, right: 24, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ quality: 100 })
    .toBuffer();

  await sharp(monogramCrest).toFile(path.join(publicDir, 'logo-monogram.png'));
  await sharp(monogramGold).toFile(path.join(publicDir, 'logo-monogram-gold.png'));

  // 3. Generate App Icons (512x512, 180x180 Apple touch icon, favicon)
  console.log('Generating high-res app icons and favicon...');
  const appIconSquare = await sharp(monogramCrest)
    .resize(380, 380, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({
      top: 66,
      bottom: 66,
      left: 66,
      right: 66,
      background: { r: 250, g: 247, b: 242, alpha: 255 } // #FAF7F2 ivory background
    })
    .png()
    .toBuffer();

  // App icon 512x512
  await sharp(appIconSquare).toFile(path.join(appDir, 'icon.png'));
  await sharp(appIconSquare).toFile(path.join(publicDir, 'icon.png'));

  // Apple touch icon 180x180
  await sharp(appIconSquare)
    .resize(180, 180)
    .png()
    .toFile(path.join(appDir, 'apple-icon.png'));
  await sharp(appIconSquare)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // Favicons 48x48 and 32x32
  await sharp(monogramCrest)
    .resize(48, 48, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));

  await sharp(monogramCrest)
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(appDir, 'favicon.ico'));
  await sharp(monogramCrest)
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));

  // Clean up scratch files
  if (fs.existsSync(path.join(publicDir, 'test-monogram.png'))) {
    fs.unlinkSync(path.join(publicDir, 'test-monogram.png'));
  }

  console.log('Successfully generated all brand logo and favicon assets!');
}

main().catch(console.error);
