import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const PUBLIC_DIR = resolve(process.cwd(), 'public');

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Write a labelled placeholder SVG. Real artwork replaces these files later. */
export async function writeSvg(
  relPath: string,
  opts: { title: string; subtitle?: string; bg?: string },
): Promise<void> {
  const bg = opts.bg ?? '#2f7d4f';
  const subtitle = opts.subtitle ?? '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480">
  <rect width="640" height="480" fill="${bg}"/>
  <rect x="16" y="16" width="608" height="448" fill="none" stroke="#ffffff" stroke-width="4" stroke-dasharray="12 10"/>
  <text x="320" y="230" fill="#ffffff" font-family="Arial, sans-serif" font-size="34" font-weight="700" text-anchor="middle">${escapeXml(
    opts.title,
  )}</text>
  <text x="320" y="278" fill="#eaf5ec" font-family="Arial, sans-serif" font-size="20" text-anchor="middle">${escapeXml(
    subtitle,
  )}</text>
</svg>`;
  const target = resolve(PUBLIC_DIR, relPath);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, svg, 'utf8');
}

/**
 * Write a stand-in for a 3D model. Not a valid glTF binary — it is a marker
 * file that real `.glb` assets will overwrite.
 */
export async function writePlaceholderModel(relPath: string): Promise<void> {
  const target = resolve(PUBLIC_DIR, relPath);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(
    target,
    `PLACEHOLDER 3D MODEL\nReplace ${relPath} with a real .glb export.\n`,
    'utf8',
  );
}
