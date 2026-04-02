import { Jimp } from 'jimp';

async function createIcon(size, text) {
  const image = new Jimp({ width: size, height: size, color: 0x00f3ffff });
  
  // For a pure JS approach, we will just use a solid cyan square as an icon
  // since we can't easily load fonts synchronously in all environments.
  // The color 0x00f3ffff matches the cyan used in the theme.
  
  await image.write(`public/icon${size}.png`);
  console.log(`Generated public/icon${size}.png`);
}

async function main() {
  await createIcon(16, 'H');
  await createIcon(48, 'H');
  await createIcon(128, 'H');
}

main().catch(console.error);
