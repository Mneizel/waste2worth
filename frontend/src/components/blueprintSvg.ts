// A real per-step technical drawing, rendered at runtime so it can be drawn to
// the CONFIRMED bottle's actual dimensions with real measurements on it.

import type { Variant } from '../lib/types';

export type BlueprintKind =
  | 'clean'
  | 'measure-mark'
  | 'cut-around'
  | 'cut-window'
  | 'edge'
  | 'holes-body'
  | 'holes-cap'
  | 'thread'
  | 'insert-rod'
  | 'invert'
  | 'nest'
  | 'fill-soil'
  | 'fill-water'
  | 'decorate'
  | 'hang'
  | 'stand'
  | 'generic';

export interface BlueprintOpts {
  kind: BlueprintKind;
  stepNumber: number;
  title: string;
  project: string;
  variant: Variant;
  instruction: string;
  measureSentence?: string;
  measureShort?: string;
  /** feature line position as a fraction from the top of the bottle (0..1) */
  frac?: number;
  tip?: string;
  warning?: string;
}

const C = {
  bg: '#0b2a23',
  grid: '#123f34',
  ink: '#a7e8cf',
  ink2: '#5fb499',
  hot: '#ffd98a',
  text: '#dcf4ea',
  warn: '#ff9d7d',
};
const FONT = "font-family=\"'Segoe UI',Tahoma,Arial,sans-serif\"";
const AR = '٠١٢٣٤٥٦٧٨٩';
const toAr = (s: string | number) =>
  String(s).replace(/\d/g, (d) => AR[Number(d)]!).replace('.', '٫');
const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const cm = (mm: number) => {
  const v = Math.round(mm) / 10;
  return toAr(Number.isInteger(v) ? String(v) : v.toFixed(1));
};

function wrap(text: string): string[] {
  const out: string[] = [];
  let line = '';
  for (const w of text.split(/\s+/)) {
    if (line && (line + ' ' + w).length > 30) {
      out.push(line);
      line = w;
    } else {
      line = line ? line + ' ' + w : w;
    }
  }
  if (line) out.push(line);
  return out;
}

/** right-aligned RTL paragraph starting at (xRight, y) */
function para(
  xRight: number,
  y: number,
  text: string,
  fill?: string,
): { svg: string; height: number } {
  const lines = wrap(text);
  const svg = lines
    .map(
      (l, i) =>
        `<text x="${xRight}" y="${y + i * 17}" ${FONT} font-size="12" fill="${
          fill ?? C.text
        }" text-anchor="start" direction="rtl">${esc(l)}</text>`,
    )
    .join('');
  return { svg, height: lines.length * 17 };
}

/** vertical dimension: line x, from y1..y2, value bubble to the `side` */
function vDim(x: number, y1: number, y2: number, value: string, dir = -1) {
  const my = (y1 + y2) / 2;
  const w = Math.max(40, value.length * 8 + 8);
  const bx = dir < 0 ? x - 8 - w : x + 8;
  return `<g stroke="${C.ink2}" stroke-width="1.2" fill="none">
    <line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" marker-start="url(#bd)" marker-end="url(#bd)"/>
    <line x1="${x - 4}" y1="${y1}" x2="${x + 4}" y2="${y1}"/>
    <line x1="${x - 4}" y1="${y2}" x2="${x + 4}" y2="${y2}"/>
  </g>
  <rect x="${bx}" y="${my - 11}" width="${w}" height="22" rx="4" fill="${C.bg}" stroke="${C.ink2}" stroke-width="1"/>
  <text x="${bx + w / 2}" y="${my + 5}" ${FONT} font-size="12" fill="${C.text}" text-anchor="middle" direction="rtl">${esc(value)}</text>`;
}

/** horizontal dimension: line y, from x1..x2, value bubble above */
function hDim(x1: number, x2: number, y: number, value: string) {
  const mx = (x1 + x2) / 2;
  const w = Math.max(40, value.length * 8 + 8);
  return `<g stroke="${C.ink2}" stroke-width="1.2" fill="none">
    <line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" marker-start="url(#bd)" marker-end="url(#bd)"/>
    <line x1="${x1}" y1="${y - 4}" x2="${x1}" y2="${y + 4}"/>
    <line x1="${x2}" y1="${y - 4}" x2="${x2}" y2="${y + 4}"/>
  </g>
  <rect x="${mx - w / 2}" y="${y - 26}" width="${w}" height="22" rx="4" fill="${C.bg}" stroke="${C.ink2}" stroke-width="1"/>
  <text x="${mx}" y="${y - 11}" ${FONT} font-size="12" fill="${C.text}" text-anchor="middle" direction="rtl">${esc(value)}</text>`;
}

function toolIcon(kind: 'scissors' | 'nail' | 'marker' | 'drop', x: number, y: number, rot = 0) {
  const g = (inner: string) =>
    `<g transform="translate(${x} ${y}) rotate(${rot})" fill="none" stroke="${C.hot}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</g>`;
  if (kind === 'scissors')
    return g('<circle cx="-6" cy="-5" r="3.4"/><circle cx="-6" cy="5" r="3.4"/><path d="M-3 -3L12 7M-3 3L12 -7"/>');
  if (kind === 'nail')
    return g('<path d="M-5 -9h10l-2.5 5h-5z"/><path d="M0 -4v16"/>');
  if (kind === 'marker')
    return g('<path d="M-9 9l3 -1L7 -5l-3 -3L-8 6z"/>');
  return g('<path d="M0 -10c5 7 7 10 7 13a7 7 0 0 1 -14 0c0 -3 2 -6 7 -13z"/>');
}

interface Geo {
  cx: number;
  topY: number;
  baseY: number;
  h: number;
  bw: number;
  scale: number;
  path: string;
}

/** bottle outline drawn to the variant's real height:diameter ratio */
function bottleGeo(variant: Variant, box: { cx: number; baseY: number; maxH: number; maxW: number }): Geo {
  const ratio = variant.heightMm / variant.diameterMm;
  let h = box.maxH;
  let bw = h / ratio;
  if (bw > box.maxW) {
    bw = box.maxW;
    h = bw * ratio;
  }
  const scale = h / variant.heightMm;
  const { cx } = box;
  const baseY = box.baseY;
  const topY = baseY - h;
  const nw = bw * 0.36;
  const nh = h * 0.08;
  const shH = h * 0.1;
  const bodyH = h - nh - shH;
  const x = cx - bw / 2;
  const r = Math.min(12, bw * 0.16);
  const capH = nh * 0.55;
  const path = `<g fill="none" stroke="${C.ink}" stroke-width="2.2" stroke-linejoin="round">
    <rect x="${cx - nw / 2}" y="${topY}" width="${nw}" height="${capH}" rx="2"/>
    <path d="M${cx - nw / 2} ${topY + capH} v${nh - capH} L${x} ${topY + nh + shH} v${bodyH} q0 ${r} ${r} ${r} h${bw - 2 * r} q${r} 0 ${r} ${-r} v${-bodyH} L${cx + nw / 2} ${topY + nh} z"/>
  </g>`;
  return { cx, topY, baseY, h, bw, scale, path };
}

function feature(kind: BlueprintKind, g: Geo, o: BlueprintOpts): string {
  const { cx, topY, baseY, h, bw } = g;
  const featureY = o.frac !== undefined ? topY + o.frac * h : baseY - h * 0.4;
  const left = cx - bw / 2;
  const right = cx + bw / 2;
  const fromBaseCm = cm(o.variant.heightMm * (1 - (o.frac ?? 0.6)));

  switch (kind) {
    case 'measure-mark':
    case 'cut-around':
      return `
        <line x1="${left - 14}" y1="${featureY}" x2="${right + 14}" y2="${featureY}" stroke="${C.hot}" stroke-width="2.6" stroke-dasharray="8 5"/>
        <ellipse cx="${cx}" cy="${featureY}" rx="${bw / 2}" ry="${bw * 0.13}" fill="none" stroke="${C.hot}" stroke-width="1.3" stroke-dasharray="4 5"/>
        ${vDim(right + 16, featureY, baseY, `${fromBaseCm} سم`, 1)}
        ${kind === 'cut-around' ? toolIcon('scissors', left - 22, featureY) : toolIcon('marker', right + 4, featureY)}`;
    case 'holes-body':
      return `
        ${[left, right].map((hx) => `<g stroke="${C.hot}" stroke-width="1.7"><circle cx="${hx}" cy="${featureY}" r="4.2" fill="none"/><path d="M${hx - 8} ${featureY}h16M${hx} ${featureY - 8}v16"/></g>`).join('')}
        ${vDim(right + 16, featureY, baseY, `${fromBaseCm} سم`, 1)}
        ${toolIcon('nail', left - 20, featureY - 6, 20)}`;
    case 'cut-window':
      return `
        <rect x="${cx - bw * 0.32}" y="${featureY - 10}" width="${bw * 0.64}" height="20" rx="4" fill="none" stroke="${C.hot}" stroke-width="2.4" stroke-dasharray="7 4"/>
        ${hDim(cx - bw * 0.32, cx + bw * 0.32, featureY - 20, o.measureShort ?? 'الفتحة')}
        ${toolIcon('scissors', cx + bw * 0.32 + 6, featureY, 30)}`;
    case 'fill-water':
      return `
        <path d="M${left} ${featureY} q${bw * 0.12} -6 ${bw * 0.25} 0 t${bw * 0.25} 0 t${bw * 0.25} 0" fill="none" stroke="${C.ink}" stroke-width="1.8"/>
        <path d="M${left} ${featureY} h${bw} v${baseY - featureY - 4} q0 6 -6 6 h${-(bw - 12)} q-6 0 -6 -6 z" fill="url(#bwater)"/>
        ${toolIcon('drop', cx, topY + 6)}
        ${vDim(right + 16, featureY, baseY, `${fromBaseCm} سم`, 1)}`;
    case 'insert-rod':
      return `
        <line x1="${left - 26}" y1="${featureY}" x2="${right + 26}" y2="${featureY}" stroke="${C.hot}" stroke-width="4" stroke-linecap="round"/>
        <circle cx="${left - 26}" cy="${featureY}" r="4.5" fill="none" stroke="${C.hot}" stroke-width="1.8"/>
        <circle cx="${right + 26}" cy="${featureY}" r="4.5" fill="none" stroke="${C.hot}" stroke-width="1.8"/>
        ${vDim(right + 20, featureY, baseY, `${fromBaseCm} سم`, 1)}`;
    case 'thread':
      return `
        <path d="M${cx} ${topY - 6} q18 8 0 20 q-18 12 0 26 q14 12 0 26" fill="none" stroke="${C.hot}" stroke-width="2.4"/>
        <path d="M${cx} ${topY + 14} q-6 20 0 44" fill="none" stroke="${C.ink2}" stroke-width="1.4" stroke-dasharray="4 4"/>
        ${vDim(right + 16, topY - 6, topY + 60, o.measureShort ?? 'الفتيل', 1)}`;
    case 'holes-cap':
      return `
        <circle cx="${cx}" cy="${topY - 2}" r="10" fill="none" stroke="${C.hot}" stroke-width="1.6"/>
        ${[[-4, -2], [4, -2], [0, 3]].map(([dx, dy]) => `<circle cx="${cx + dx}" cy="${topY - 2 + dy}" r="1.6" fill="${C.hot}"/>`).join('')}
        ${toolIcon('nail', right + 16, topY, 25)}`;
    case 'invert':
      return `<path d="M${left - 22} ${baseY - h / 2}a${h / 2 + 14} ${h / 2 + 14} 0 1 1 24 ${h / 2}" fill="none" stroke="${C.hot}" stroke-width="2.4" marker-end="url(#bh)"/>`;
    case 'decorate':
      return `<g stroke="${C.hot}" stroke-width="2"><path d="M${left} ${topY + h * 0.5} L${right} ${topY + h * 0.5 + bw}"/><path d="M${left} ${topY + h * 0.68} L${right} ${topY + h * 0.68 + bw}"/></g>`;
    case 'edge':
      return `<path d="M${left - 4} ${topY + 4} q${bw / 2 + 4} -12 ${bw + 8} 0" fill="none" stroke="${C.hot}" stroke-width="3"/>`;
    case 'hang':
      return `<path d="M${cx} ${topY - 4} c-14 5 -14 20 0 24" fill="none" stroke="${C.hot}" stroke-width="2.4"/><line x1="${cx - 60}" y1="${topY - 4}" x2="${cx + 60}" y2="${topY - 4}" stroke="${C.ink}" stroke-width="2.4"/>`;
    case 'fill-soil':
      return `<path d="M${left + 3} ${topY + h * 0.4} h${bw - 6} v${h * 0.55} q0 6 -6 6 h${-(bw - 18)} q-6 0 -6 -6 z" fill="url(#bsoil)"/><path d="M${cx} ${topY + h * 0.4} v-16 M${cx} ${topY + h * 0.4 - 12} q-10 -2 -13 -12 q11 0 13 12" fill="none" stroke="${C.ink}" stroke-width="1.8"/>`;
    case 'nest':
      return `<path d="M${cx - bw * 0.4} ${topY + 6} L${cx} ${topY + h * 0.42} L${cx + bw * 0.4} ${topY + 6}" fill="url(#bsoil)" stroke="${C.ink}" stroke-width="1.8"/><path d="M${cx} ${topY + h * 0.42} v${h * 0.3}" stroke="${C.hot}" stroke-width="2" stroke-dasharray="4 4"/>`;
    default:
      return '';
  }
}

export function renderBlueprint(o: BlueprintOpts): string {
  const W = 520;
  const H = 340;
  const drawR = 250; // drawing area right edge
  const g = bottleGeo(o.variant, {
    cx: 132,
    baseY: 268,
    maxH: o.kind === 'holes-cap' ? 150 : 224,
    maxW: 120,
  });

  const spec = `قنينة ${cm(o.variant.volumeMl / 10)} مل تقريباً · ${toAr(o.variant.heightMm)}×${toAr(o.variant.diameterMm)} ملم`;

  const alwaysDims =
    o.kind === 'holes-cap'
      ? ''
      : `${vDim(g.cx - g.bw / 2 - 20, g.topY, g.baseY, `${cm(o.variant.heightMm)} سم`)}
         ${hDim(g.cx - g.bw / 2, g.cx + g.bw / 2, g.baseY + 20, `${cm(o.variant.diameterMm)} سم`)}
         <path d="M${g.cx - g.bw / 2 - 6} ${g.baseY} l6 8 l6 -8 z" fill="${C.ink2}"/>
         <text x="${g.cx - g.bw / 2 - 30}" y="${g.baseY + 24}" ${FONT} font-size="10" fill="${C.ink2}" text-anchor="middle">القاع</text>`;

  // notes column
  let ny = 44;
  const notes: string[] = [];
  const push = (txt: string, badge: string, fill?: string) => {
    notes.push(
      `<circle cx="${drawR + 8}" cy="${ny - 4}" r="8" fill="${fill ?? C.ink}"/><text x="${drawR + 8}" y="${ny}" ${FONT} font-size="10" font-weight="700" fill="${C.bg}" text-anchor="middle">${badge}</text>`,
    );
    const p = para(drawR - 6, ny + 1, txt, fill);
    notes.push(p.svg);
    ny += Math.max(22, p.height) + 8;
  };
  push(o.instruction, toAr(o.stepNumber));
  if (o.measureSentence) push(o.measureSentence, 'م', C.hot);
  if (o.tip) push(o.tip, '★', C.ink);
  if (o.warning) push(o.warning, '!', C.warn);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="مخطط الخطوة ${toAr(o.stepNumber)}: ${esc(o.title)}">
  <defs>
    <marker id="bd" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${C.ink2}"/></marker>
    <marker id="bh" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${C.hot}"/></marker>
    <pattern id="bgrid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="${C.grid}" stroke-width="1"/></pattern>
    <pattern id="bsoil" width="9" height="9" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.1" fill="${C.ink2}"/><circle cx="6.5" cy="6" r="1.1" fill="${C.ink2}"/></pattern>
    <pattern id="bwater" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><line x1="0" y1="0" x2="0" y2="10" stroke="${C.ink2}" stroke-width="1"/></pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="${C.bg}"/>
  <rect width="${W}" height="${H}" fill="url(#bgrid)"/>
  <rect x="8" y="8" width="${W - 16}" height="${H - 16}" fill="none" stroke="${C.ink2}" stroke-width="1.4"/>
  <line x1="${drawR}" y1="8" x2="${drawR}" y2="${H - 42}" stroke="${C.ink2}" stroke-width="1"/>
  <line x1="8" y1="${H - 42}" x2="${W - 8}" y2="${H - 42}" stroke="${C.ink2}" stroke-width="1.4"/>
  <text x="${W - 14}" y="24" ${FONT} font-size="11" fill="${C.ink2}" text-anchor="start" direction="rtl">مخطط عمل — ${esc(o.project)}</text>
  <text x="${drawR - 6}" y="30" ${FONT} font-size="11" fill="${C.ink2}" text-anchor="start" direction="rtl">${esc(spec)}</text>

  ${g.path}
  ${alwaysDims}
  ${feature(o.kind, g, o)}
  ${notes.join('')}

  <rect x="14" y="${H - 36}" width="66" height="22" rx="4" fill="${C.hot}"/>
  <text x="47" y="${H - 21}" ${FONT} font-size="12" font-weight="700" fill="${C.bg}" text-anchor="middle">خطوة ${toAr(o.stepNumber)}</text>
  <text x="${W - 16}" y="${H - 21}" ${FONT} font-size="13" fill="${C.text}" text-anchor="start" direction="rtl">${esc(o.title)}</text>
</svg>`;
}
