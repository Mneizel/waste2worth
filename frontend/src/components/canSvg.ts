// The metal-can blueprint engine — same stateful pattern as blueprintSvg.ts
// (fold ops -> current shape, draw it, highlight the current action, show an
// "after this step" inset) but with its OWN geometry: a can has no neck, cap
// or funnel-nesting, it's a straight cylinder with a lid. Kept as a separate,
// self-contained module on purpose — see docs/adding-a-category.md.

import type { Variant } from '../lib/types';

export type CanOp =
  | 'clean'
  | 'open-top'
  | 'smooth-rim'
  | 'mark-holes'
  | 'punch-holes'
  | 'mark-slot'
  | 'cut-slot'
  | 'hanger'
  | 'decorate'
  | 'fill-soil'
  | 'fill-candle'
  | 'use-pens'
  | 'use-coins'
  | 'use-hang';

export interface CanBlueprintOpts {
  ops: string[];
  fracs: (number | null)[];
  index: number;
  title: string;
  project: string;
  variant: Variant;
  instruction: string;
  measureSentence?: string;
  measureShort?: string;
  tip?: string;
  warning?: string;
}

export interface CanFinalArtOpts {
  ops: string[];
  fracs: (number | null)[];
  variant: Variant;
  title: string;
}

const C = {
  bg: '#0b2a23',
  grid: '#123f34',
  ink: '#a7e8cf',
  ink2: '#5fb499',
  hot: '#ffd98a',
  text: '#eaf6f0',
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

const W = 640;
const H = 384;
const DIV_X = 386;
const NOTE_R = W - 40;
const NOTE_BADGE = W - 22;
const STRIP_Y = H - 46;

function wrap(text: string, max = 28): string[] {
  const out: string[] = [];
  let line = '';
  for (const w of text.split(/\s+/)) {
    if (line && (line + ' ' + w).length > max) {
      out.push(line);
      line = w;
    } else {
      line = line ? line + ' ' + w : w;
    }
  }
  if (line) out.push(line);
  return out;
}

function para(xRight: number, y: number, text: string, fill?: string): { svg: string; height: number } {
  const lines = wrap(text);
  const svg = lines
    .map(
      (l, i) =>
        `<text x="${xRight}" y="${y + i * 19}" ${FONT} font-size="14" fill="${
          fill ?? C.text
        }" text-anchor="start" direction="rtl">${esc(l)}</text>`,
    )
    .join('');
  return { svg, height: lines.length * 19 };
}

function vDim(x: number, y1: number, y2: number, value: string, dir = -1) {
  const my = (y1 + y2) / 2;
  const w = Math.max(50, value.length * 9 + 14);
  const bx = dir < 0 ? Math.max(13, x - 10 - w) : x + 10;
  return `<g stroke="${C.ink2}" stroke-width="1.3" fill="none">
    <line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" marker-start="url(#cbd)" marker-end="url(#cbd)"/>
    <line x1="${x - 5}" y1="${y1}" x2="${x + 5}" y2="${y1}"/>
    <line x1="${x - 5}" y1="${y2}" x2="${x + 5}" y2="${y2}"/>
  </g>
  <rect x="${bx}" y="${my - 13}" width="${w}" height="26" rx="5" fill="${C.bg}" stroke="${C.ink2}" stroke-width="1.2"/>
  <text x="${bx + w / 2}" y="${my + 5}" ${FONT} font-size="14" font-weight="700" fill="${C.hot}" text-anchor="middle" direction="rtl">${esc(value)}</text>`;
}

function hDim(x1: number, x2: number, y: number, value: string) {
  const mx = (x1 + x2) / 2;
  const w = Math.max(50, value.length * 9 + 14);
  return `<g stroke="${C.ink2}" stroke-width="1.3" fill="none">
    <line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" marker-start="url(#cbd)" marker-end="url(#cbd)"/>
    <line x1="${x1}" y1="${y - 5}" x2="${x1}" y2="${y + 5}"/>
    <line x1="${x2}" y1="${y - 5}" x2="${x2}" y2="${y + 5}"/>
  </g>
  <rect x="${mx - w / 2}" y="${y - 30}" width="${w}" height="26" rx="5" fill="${C.bg}" stroke="${C.ink2}" stroke-width="1.2"/>
  <text x="${mx}" y="${y - 12}" ${FONT} font-size="14" font-weight="700" fill="${C.hot}" text-anchor="middle" direction="rtl">${esc(value)}</text>`;
}

function toolIcon(kind: 'nail' | 'marker' | 'scissors' | 'drop', x: number, y: number, rot = 0) {
  const g = (inner: string) =>
    `<g transform="translate(${x} ${y}) rotate(${rot})" fill="none" stroke="${C.hot}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${inner}</g>`;
  if (kind === 'nail') return g('<path d="M-6 -11h12l-3 6h-6z"/><path d="M0 -5v19"/>');
  if (kind === 'marker') return g('<path d="M-11 11l4 -1L8 -6l-4 -4L-10 7z"/>');
  if (kind === 'scissors')
    return g('<circle cx="-7" cy="-6" r="4"/><circle cx="-7" cy="6" r="4"/><path d="M-3 -3L14 8M-3 3L14 -8"/>');
  return g('<path d="M0 -12c6 8 8 12 8 15a8 8 0 0 1 -16 0c0 -3 2 -7 8 -15z"/>');
}

function star(x: number, y: number, r: number, fill: string) {
  return `<path d="M${x} ${y - r}l${r * 0.28} ${r * 0.6}l${r * 0.62} ${r * 0.1}l-${r * 0.45} ${r * 0.45}l${r * 0.1} ${r * 0.62}l-${r * 0.55} -${r * 0.3}l-${r * 0.55} ${r * 0.3}l${r * 0.1} -${r * 0.62}l-${r * 0.45} -${r * 0.45}l${r * 0.62} -${r * 0.1}z" fill="${fill}"/>`;
}

// ---- can geometry: a straight cylinder, no neck ---------------------------
interface Geo {
  cx: number;
  topY: number;
  baseY: number;
  h: number;
  dia: number;
  wl: number;
  wr: number;
  r: number;
}

function canGeo(v: Variant, box: { cx: number; baseY: number; maxH: number; maxW: number }): Geo {
  const ratio = v.heightMm / v.diameterMm;
  let h = box.maxH;
  let dia = h / ratio;
  if (dia > box.maxW) {
    dia = box.maxW;
    h = dia * ratio;
  }
  const baseY = box.baseY;
  const topY = baseY - h;
  const cx = box.cx;
  const r = Math.min(8, dia * 0.08);
  return { cx, topY, baseY, h, dia, wl: cx - dia / 2, wr: cx + dia / 2, r };
}

const pCan = (g: Geo) =>
  `M${g.wl + g.r} ${g.topY} H${g.wr - g.r} q${g.r} 0 ${g.r} ${g.r} V${g.baseY - g.r} q0 ${g.r} ${-g.r} ${g.r} H${g.wl + g.r} q${-g.r} 0 ${-g.r} ${-g.r} V${g.topY + g.r} q0 ${-g.r} ${g.r} ${-g.r} Z`;

const stroke = (d: string, sw = 2.2, col = C.ink) =>
  `<path d="${d}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linejoin="round"/>`;

function sealedLid(g: Geo) {
  return `<ellipse cx="${g.cx}" cy="${g.topY + g.r * 1.4}" rx="${g.dia * 0.5 - 3}" ry="${g.r * 0.7}" fill="none" stroke="${C.ink}" stroke-width="1.6"/><path d="M${g.cx - 7} ${g.topY + g.r} q7 -7 14 0" fill="none" stroke="${C.ink}" stroke-width="1.8"/>`;
}

function rimHighlight(g: Geo, smoothed: boolean) {
  if (!smoothed) return '';
  return `<line x1="${g.wl - 2}" y1="${g.topY}" x2="${g.wr + 2}" y2="${g.topY}" stroke="${C.ink2}" stroke-width="4" stroke-linecap="round"/>`;
}

function holeRow(g: Geo, y: number, col: string, r = 3.6) {
  return [0.2, 0.5, 0.8]
    .map((f) => `<circle cx="${g.wl + g.dia * f}" cy="${y}" r="${r}" fill="none" stroke="${col}" stroke-width="1.7"/>`)
    .join('');
}

function slotShape(g: Geo, col: string) {
  return `<rect x="${g.cx - g.dia * 0.22}" y="${g.topY + g.r * 1.2}" width="${g.dia * 0.44}" height="4.5" rx="2" fill="${col}"/>`;
}

function hangerLoop(g: Geo, col: string) {
  return `<path d="M${g.cx - 12} ${g.topY} q0 -16 12 -16 q12 0 12 16" fill="none" stroke="${col}" stroke-width="2.4"/>`;
}

function decorBands(g: Geo) {
  return [0.4, 0.6]
    .map((f) => `<rect x="${g.wl}" y="${g.topY + g.h * f}" width="${g.dia}" height="${g.h * 0.1}" fill="url(#cbsoil)" opacity="0.55"/>`)
    .join('');
}

function soilFill(g: Geo, frac: number) {
  const y = g.baseY - g.h * frac;
  return `<path d="M${g.wl + 2} ${y} H${g.wr - 2} V${g.baseY - g.r} q0 ${g.r} ${-g.r} ${g.r} H${g.wl + g.r} q${-g.r} 0 ${-g.r} ${-g.r} Z" fill="url(#cbsoil)"/>`;
}

function plant(g: Geo, topY: number) {
  return `<path d="M${g.cx} ${topY} v-22 M${g.cx} ${topY - 14} q-12 -3 -15 -14 q13 0 15 14 M${g.cx} ${topY - 18} q12 -3 15 -14 q-13 0 -15 14" fill="none" stroke="${C.ink}" stroke-width="1.9"/>`;
}

function candle(g: Geo) {
  return `<rect x="${g.cx - 8}" y="${g.baseY - 20}" width="16" height="16" rx="2" fill="none" stroke="${C.ink}" stroke-width="1.6"/><path d="M${g.cx} ${g.baseY - 22} v-8" stroke="${C.hot}" stroke-width="2"/><path d="M${g.cx} ${g.baseY - 32} q3 -5 0 -8 q-3 3 0 8" fill="${C.hot}"/>`;
}

function pens(g: Geo) {
  return [
    [-0.5, -44],
    [0.05, -56],
    [0.55, -48],
  ]
    .map(([dx, len]) => {
      const x0 = g.cx + dx * g.dia * 0.35;
      const x1 = x0 + dx * 22;
      return `<line x1="${x0}" y1="${g.topY + 6}" x2="${x1}" y2="${g.topY + 6 + len}" stroke="${C.ink}" stroke-width="3" stroke-linecap="round"/><circle cx="${x1}" cy="${g.topY + 6 + len}" r="3.2" fill="${C.ink}"/>`;
    })
    .join('');
}

function coins(g: Geo) {
  return [0, 1, 2, 3]
    .map((i) => `<ellipse cx="${g.cx + (i % 2 ? 5 : -5)}" cy="${g.baseY - 10 - i * 6}" rx="9" ry="4" fill="none" stroke="${C.ink}" stroke-width="1.5"/>`)
    .join('');
}

// ---- workpiece state --------------------------------------------------
interface State {
  lidOpen: boolean;
  rimSmoothed: boolean;
  holes: number[];
  slot: boolean;
  hanger: boolean;
  decorated: boolean;
  soil: number;
  plant: boolean;
  candle: boolean;
  pens: boolean;
  coins: boolean;
}

function fold(ops: CanOp[], fracs: (number | null)[], upto: number): State {
  const s: State = {
    lidOpen: false,
    rimSmoothed: false,
    holes: [],
    slot: false,
    hanger: false,
    decorated: false,
    soil: 0,
    plant: false,
    candle: false,
    pens: false,
    coins: false,
  };
  for (let i = 0; i < upto; i++) {
    const f = fracs[i];
    switch (ops[i]) {
      case 'open-top':
        s.lidOpen = true;
        break;
      case 'smooth-rim':
        s.rimSmoothed = true;
        break;
      case 'punch-holes':
        if (f != null) s.holes.push(f);
        break;
      case 'cut-slot':
        s.slot = true;
        break;
      case 'hanger':
        s.hanger = true;
        break;
      case 'decorate':
        s.decorated = true;
        break;
      case 'fill-soil':
        s.soil = 0.55;
        s.plant = true;
        break;
      case 'fill-candle':
        s.candle = true;
        break;
      case 'use-pens':
        s.pens = true;
        break;
      case 'use-coins':
        s.coins = true;
        break;
      default:
        break; // clean, mark-holes, mark-slot, use-hang
    }
  }
  return s;
}

function drawState(g: Geo, s: State): string {
  let out = '';
  if (s.soil > 0) out += soilFill(g, s.soil);
  out += stroke(pCan(g));
  if (s.lidOpen) out += rimHighlight(g, s.rimSmoothed);
  else out += sealedLid(g);
  if (s.plant) out += plant(g, g.topY);
  if (s.candle) out += candle(g);
  if (s.pens) out += pens(g);
  if (s.coins) out += coins(g);
  for (const f of s.holes) out += holeRow(g, g.topY + f * g.h, C.ink);
  if (s.slot) out += slotShape(g, C.ink);
  if (s.hanger) out += hangerLoop(g, C.ink);
  if (s.decorated) out += decorBands(g);
  return out;
}

function drawAction(g: Geo, op: CanOp, a: { frac: number | null; short?: string }): string {
  const fy = a.frac != null ? g.topY + a.frac * g.h : g.baseY - g.h * 0.4;
  const dim = a.short ? vDim(g.wr + 22, fy, g.baseY, a.short, 1) : '';
  switch (op) {
    case 'clean':
      return `${star(g.wl - 14, g.topY + 20, 7, C.hot)}${star(g.wr + 12, g.baseY - 30, 6, C.hot)}${toolIcon('drop', g.cx, g.topY - 16)}`;
    case 'open-top':
      return `<ellipse cx="${g.cx}" cy="${g.topY}" rx="${g.dia * 0.5 - 2}" ry="${g.r}" fill="none" stroke="${C.hot}" stroke-width="2.4" stroke-dasharray="6 4"/>${toolIcon('scissors', g.wr + 16, g.topY, 20)}`;
    case 'smooth-rim':
      return `<line x1="${g.wl - 2}" y1="${g.topY}" x2="${g.wr + 2}" y2="${g.topY}" stroke="${C.hot}" stroke-width="5" stroke-linecap="round"/>${toolIcon('marker', g.wr + 16, g.topY)}`;
    case 'mark-holes':
      return `${holeRow(g, fy, C.hot, 4.4)}${toolIcon('marker', g.wl - 22, fy)}${dim}`;
    case 'punch-holes':
      return `${holeRow(g, fy, C.hot, 4.4)}${toolIcon('nail', g.wr + 20, fy, 60)}${dim}`;
    case 'mark-slot':
      return `<rect x="${g.cx - g.dia * 0.24}" y="${g.topY + g.r * 1}" width="${g.dia * 0.48}" height="7" rx="2" fill="none" stroke="${C.hot}" stroke-width="2.2" stroke-dasharray="5 3"/>${toolIcon('marker', g.wr + 16, g.topY + g.r)}${a.short ? hDim(g.cx - g.dia * 0.24, g.cx + g.dia * 0.24, g.topY - 8, a.short) : ''}`;
    case 'cut-slot':
      return `${slotShape(g, C.hot)}${toolIcon('scissors', g.wr + 14, g.topY + g.r, 10)}`;
    case 'hanger':
      return `${hangerLoop(g, C.hot)}<line x1="${g.cx - 60}" y1="${g.topY - 16}" x2="${g.cx + 60}" y2="${g.topY - 16}" stroke="${C.ink}" stroke-width="3"/>`;
    case 'decorate':
      return `<path d="M${g.wl - 6} ${g.topY + g.h * 0.4} q${g.dia / 2} -18 ${g.dia + 12} 0" fill="none" stroke="${C.hot}" stroke-width="6" stroke-linecap="round" opacity="0.85"/>`;
    case 'fill-soil':
      return `<path d="M${g.cx - 18} ${g.topY + 6} v18 M${g.cx} ${g.topY} v22 M${g.cx + 18} ${g.topY + 6} v18" stroke="${C.hot}" stroke-width="2.4" marker-end="url(#cbh)"/><text x="${g.cx}" y="${g.topY - 10}" ${FONT} font-size="12" fill="${C.hot}" text-anchor="middle">تراب + نبتة</text>`;
    case 'fill-candle':
      return `${toolIcon('drop', g.cx, g.topY - 12)}<path d="M${g.cx} ${g.baseY - 10} v-14" stroke="${C.hot}" stroke-width="2.4" marker-end="url(#cbh)"/>`;
    case 'use-hang':
      return `<line x1="${g.cx - 80}" y1="${g.topY - 20}" x2="${g.cx + 80}" y2="${g.topY - 20}" stroke="${C.ink}" stroke-width="4"/>${star(g.wr + 20, g.topY + 10, 6, C.hot)}`;
    case 'use-coins':
      return `<ellipse cx="${g.cx}" cy="${g.topY + g.h * 0.24}" rx="9" ry="9" fill="none" stroke="${C.hot}" stroke-width="2.2"/><path d="M${g.cx} ${g.topY + g.h * 0.3} v${g.h * 0.1}" stroke="${C.hot}" stroke-width="2.4" marker-end="url(#cbh)"/>`;
    default: // use-pens
      return `${star(g.cx, g.topY - 20, 6, C.hot)}${star(g.wr + 14, g.topY - 6, 5, C.hot)}`;
  }
}

export function renderBlueprint(o: CanBlueprintOpts): string {
  const ops = o.ops as CanOp[];
  const i = o.index;
  const cur = ops[i];
  const before = fold(ops, o.fracs, i);
  const after = fold(ops, o.fracs, i + 1);
  const stepNo = i + 1;

  const g = canGeo(o.variant, { cx: 196, baseY: 306, maxH: 230, maxW: 160 });
  const spec = `علبة ${toAr(o.variant.volumeMl)} مل · ارتفاع ${toAr(o.variant.heightMm)} ملم · قطر ${toAr(o.variant.diameterMm)} ملم`;

  const dims = `${vDim(g.wl - 24, g.topY, g.baseY, `${cm(o.variant.heightMm)} سم`)}
    ${hDim(g.wl, g.wr, g.baseY + 22, `${cm(o.variant.diameterMm)} سم`)}
    <path d="M${g.wl - 8} ${g.baseY} l8 9 l8 -9 z" fill="${C.ink2}"/>
    <text x="${g.wl - 34}" y="${g.baseY + 28}" ${FONT} font-size="12" fill="${C.ink2}" text-anchor="middle">القاع</text>`;

  const actionFrac = o.fracs[i] ?? null;
  const body = drawState(g, before) + drawAction(g, cur, { frac: actionFrac, short: o.measureShort });

  let ny = 66;
  const notes: string[] = [];
  const push = (txt: string, badge: string, fill?: string) => {
    notes.push(
      `<circle cx="${NOTE_BADGE}" cy="${ny - 5}" r="10" fill="${fill ?? C.ink}"/><text x="${NOTE_BADGE}" y="${ny}" ${FONT} font-size="12" font-weight="700" fill="${C.bg}" text-anchor="middle">${badge}</text>`,
    );
    const p = para(NOTE_R, ny + 3, txt, fill);
    notes.push(p.svg);
    ny += Math.max(28, p.height) + 14;
  };
  push(o.instruction, toAr(stepNo));
  if (o.measureSentence) push(o.measureSentence, 'م', C.hot);

  let inset = '';
  if (JSON.stringify(before) !== JSON.stringify(after)) {
    const iy = ny + 12;
    const ix = DIV_X + 14;
    const iw = W - DIV_X - 26;
    const ih = STRIP_Y - iy - 12;
    const gm = canGeo(o.variant, { cx: ix + iw * 0.44, baseY: iy + ih - 18, maxH: ih - 40, maxW: iw * 0.5 });
    inset = `<rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" rx="8" fill="${C.bg}" stroke="${C.ink2}" stroke-width="1.2"/>
      <text x="${ix + iw - 10}" y="${iy + 18}" ${FONT} font-size="12" fill="${C.ink2}" text-anchor="start" direction="rtl">الشكل بعد هالخطوة ✓</text>
      ${drawState(gm, after)}`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="مخطط الخطوة ${toAr(stepNo)}: ${esc(o.title)}">
  <defs>
    <marker id="cbd" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${C.ink2}"/></marker>
    <marker id="cbh" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${C.hot}"/></marker>
    <pattern id="cbgrid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="${C.grid}" stroke-width="1"/></pattern>
    <pattern id="cbsoil" width="9" height="9" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.1" fill="${C.ink2}"/><circle cx="6.5" cy="6" r="1.1" fill="${C.ink2}"/></pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="${C.bg}"/>
  <rect width="${W}" height="${H}" fill="url(#cbgrid)"/>
  <rect x="10" y="10" width="${W - 20}" height="${H - 20}" fill="none" stroke="${C.ink2}" stroke-width="1.5"/>
  <line x1="${DIV_X}" y1="50" x2="${DIV_X}" y2="${STRIP_Y}" stroke="${C.ink2}" stroke-width="1"/>
  <line x1="10" y1="50" x2="${W - 10}" y2="50" stroke="${C.ink2}" stroke-width="1"/>
  <line x1="10" y1="${STRIP_Y}" x2="${W - 10}" y2="${STRIP_Y}" stroke="${C.ink2}" stroke-width="1.5"/>
  <text x="${W - 16}" y="32" ${FONT} font-size="13" fill="${C.ink2}" text-anchor="start" direction="rtl">مخطط عمل — ${esc(o.project)}</text>
  <text x="${DIV_X - 8}" y="32" ${FONT} font-size="12" fill="${C.ink2}" text-anchor="start" direction="rtl">${esc(spec)}</text>

  ${dims}
  ${body}
  ${notes.join('')}
  ${inset}

  <rect x="16" y="${STRIP_Y + 8}" width="80" height="26" rx="5" fill="${C.hot}"/>
  <text x="56" y="${STRIP_Y + 26}" ${FONT} font-size="13" font-weight="700" fill="${C.bg}" text-anchor="middle">خطوة ${toAr(stepNo)}</text>
  <text x="${W - 18}" y="${STRIP_Y + 26}" ${FONT} font-size="15" font-weight="700" fill="${C.text}" text-anchor="start" direction="rtl">${esc(o.title)}</text>
</svg>`;
}

export function renderFinalArt(o: CanFinalArtOpts): string {
  const FW = 400;
  const FH = 400;
  const state = fold(o.ops as CanOp[], o.fracs, o.ops.length);
  const g = canGeo(o.variant, { cx: FW / 2, baseY: FH - 44, maxH: 300, maxW: 220 });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${FW} ${FH}" width="100%" role="img" aria-label="الشكل النهائي: ${esc(o.title)}">
  <defs>
    <pattern id="cbsoil" width="9" height="9" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.1" fill="${C.ink2}"/><circle cx="6.5" cy="6" r="1.1" fill="${C.ink2}"/></pattern>
  </defs>
  <rect width="${FW}" height="${FH}" fill="${C.bg}"/>
  <ellipse cx="${FW / 2}" cy="${FH - 22}" rx="110" ry="14" fill="rgba(0,0,0,0.28)"/>
  <g stroke-linecap="round">${drawState(g, state)}</g>
</svg>`;
}
