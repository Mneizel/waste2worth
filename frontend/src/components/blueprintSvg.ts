// A real per-step technical drawing, rendered at runtime so it can be drawn to
// the CONFIRMED bottle's actual dimensions with real measurements on it.
//
// It is STATEFUL: each project is an ordered list of operations. For step i we
// fold ops[0..i-1] into the workpiece's current shape, draw THAT (cut in two,
// funnel nested in the reservoir, spoons pushed through, filled…), overlay the
// current step's action, and show a small "after this step" inset.

import type { Variant } from '../lib/types';

export type BpOp =
  | 'clean'
  | 'mark-cut'
  | 'cut'
  | 'cut-bottom'
  | 'seal-edge'
  | 'wick'
  | 'nest'
  | 'fill-soil'
  | 'fill-water'
  | 'mark-holes'
  | 'rod'
  | 'window'
  | 'mark-slot'
  | 'slot'
  | 'coin-test'
  | 'base-hole'
  | 'decorate'
  | 'hanger'
  | 'fill-seed'
  | 'use-hang'
  | 'use-coins'
  | 'use-pens';

export interface BlueprintOpts {
  /** the whole ordered op list for the project */
  ops: string[];
  /** feature position per op as a fraction from the top of the bottle (or null) */
  fracs: (number | null)[];
  /** which step this sheet is for (0-based) */
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

// ---- canvas -----------------------------------------------------------------
const W = 640;
const H = 384;
const DIV_X = 386; // vertical divider: drawing left, notes + inset right
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
    <line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" marker-start="url(#bd)" marker-end="url(#bd)"/>
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
    <line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" marker-start="url(#bd)" marker-end="url(#bd)"/>
    <line x1="${x1}" y1="${y - 5}" x2="${x1}" y2="${y + 5}"/>
    <line x1="${x2}" y1="${y - 5}" x2="${x2}" y2="${y + 5}"/>
  </g>
  <rect x="${mx - w / 2}" y="${y - 30}" width="${w}" height="26" rx="5" fill="${C.bg}" stroke="${C.ink2}" stroke-width="1.2"/>
  <text x="${mx}" y="${y - 12}" ${FONT} font-size="14" font-weight="700" fill="${C.hot}" text-anchor="middle" direction="rtl">${esc(value)}</text>`;
}

function toolIcon(kind: 'scissors' | 'nail' | 'marker' | 'drop' | 'tape', x: number, y: number, rot = 0) {
  const g = (inner: string) =>
    `<g transform="translate(${x} ${y}) rotate(${rot})" fill="none" stroke="${C.hot}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${inner}</g>`;
  if (kind === 'scissors')
    return g('<circle cx="-7" cy="-6" r="4"/><circle cx="-7" cy="6" r="4"/><path d="M-3 -3L14 8M-3 3L14 -8"/>');
  if (kind === 'nail')
    return g('<path d="M-6 -11h12l-3 6h-6z"/><path d="M0 -5v19"/>');
  if (kind === 'marker')
    return g('<path d="M-11 11l4 -1L8 -6l-4 -4L-10 7z"/>');
  if (kind === 'tape')
    return g('<circle cx="0" cy="0" r="8"/><circle cx="0" cy="0" r="3"/>');
  return g('<path d="M0 -12c6 8 8 12 8 15a8 8 0 0 1 -16 0c0 -3 2 -7 8 -15z"/>');
}

function star(x: number, y: number, r: number, fill: string) {
  return `<path d="M${x} ${y - r}l${r * 0.28} ${r * 0.6}l${r * 0.62} ${r * 0.1}l-${r * 0.45} ${r * 0.45}l${r * 0.1} ${r * 0.62}l-${r * 0.55} -${r * 0.3}l-${r * 0.55} ${r * 0.3}l${r * 0.1} -${r * 0.62}l-${r * 0.45} -${r * 0.45}l${r * 0.62} -${r * 0.1}z" fill="${fill}"/>`;
}

// ---- bottle geometry ------------------------------------------------------
interface Geo {
  cx: number;
  topY: number;
  baseY: number;
  h: number;
  bw: number;
  nw: number;
  shoulderY: number;
  bodyTopY: number;
  wl: number;
  wr: number;
  nl: number;
  nr: number;
  r: number;
}

function bottleGeo(v: Variant, box: { cx: number; baseY: number; maxH: number; maxW: number }): Geo {
  const ratio = v.heightMm / v.diameterMm;
  let h = box.maxH;
  let bw = h / ratio;
  if (bw > box.maxW) {
    bw = box.maxW;
    h = bw * ratio;
  }
  const baseY = box.baseY;
  const topY = baseY - h;
  const cx = box.cx;
  const nw = Math.max(10, bw * 0.32);
  const shoulderY = topY + h * 0.07;
  const bodyTopY = shoulderY + h * 0.11;
  const r = Math.min(14, bw * 0.16);
  return { cx, topY, baseY, h, bw, nw, shoulderY, bodyTopY, wl: cx - bw / 2, wr: cx + bw / 2, nl: cx - nw / 2, nr: cx + nw / 2, r };
}

const pWhole = (g: Geo) =>
  `M${g.nl} ${g.topY} h${g.nw} V${g.shoulderY} L${g.wr} ${g.bodyTopY} V${g.baseY - g.r} q0 ${g.r} ${-g.r} ${g.r} H${g.wl + g.r} q${-g.r} 0 ${-g.r} ${-g.r} V${g.bodyTopY} L${g.nl} ${g.shoulderY} Z`;

const pCup = (g: Geo, cutY: number) =>
  `M${g.wl} ${cutY} V${g.baseY - g.r} q0 ${g.r} ${g.r} ${g.r} H${g.wr - g.r} q${g.r} 0 ${g.r} ${-g.r} V${cutY}`;

const pTopUpright = (g: Geo, cutY: number) =>
  `M${g.wl} ${cutY} V${g.bodyTopY} L${g.nl} ${g.shoulderY} V${g.topY} h${g.nw} V${g.shoulderY} L${g.wr} ${g.bodyTopY} V${cutY}`;

const pFunnel = (g: Geo, rimY: number, topH: number) => {
  const capY = rimY + topH;
  const seg = Math.min(16, topH * 0.22);
  return `M${g.wl} ${rimY} L${g.nl} ${capY - seg} V${capY} h${g.nw} V${capY - seg} L${g.wr} ${rimY}`;
};

const stroke = (d: string, sw = 2.2, col = C.ink) =>
  `<path d="${d}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linejoin="round"/>`;

function rimTicks(g: Geo, y: number, sealed: boolean) {
  const col = sealed ? C.ink2 : C.ink;
  const sw = sealed ? 4 : 2.2;
  return `<line x1="${g.wl - 4}" y1="${y}" x2="${g.wl + 6}" y2="${y}" stroke="${col}" stroke-width="${sw}"/><line x1="${g.wr - 6}" y1="${y}" x2="${g.wr + 4}" y2="${y}" stroke="${col}" stroke-width="${sw}"/>`;
}

function waterFill(g: Geo, topWaterY: number) {
  const y = Math.max(topWaterY, g.bodyTopY);
  return `<path d="M${g.wl + 1} ${y} H${g.wr - 1} V${g.baseY - g.r} q0 ${g.r} ${-g.r} ${g.r} H${g.wl + g.r} q${-g.r} 0 ${-g.r} ${-g.r} Z" fill="url(#bwater)"/><line x1="${g.wl + 1}" y1="${y}" x2="${g.wr - 1}" y2="${y}" stroke="${C.ink}" stroke-width="1.6"/>`;
}

function soilFill(g: Geo, rimY: number, topH: number, frac: number) {
  const y = rimY + topH * (1 - frac);
  const half = (g.bw / 2) * (1 - (topH * (1 - frac)) / topH) + g.nw / 2;
  return `<path d="M${g.cx - half} ${y} H${g.cx + half} L${g.nr} ${rimY + topH - 2} H${g.nl} Z" fill="url(#bsoil)"/>`;
}

function seedFill(g: Geo) {
  const y = g.topY + g.h * 0.55;
  return `<path d="M${g.wl + 1} ${y} H${g.wr - 1} V${g.baseY - g.r} q0 ${g.r} ${-g.r} ${g.r} H${g.wl + g.r} q${-g.r} 0 ${-g.r} ${-g.r} Z" fill="url(#bsoil)"/>`;
}

function coins(g: Geo) {
  return [0, 1, 2, 3]
    .map((i) => `<ellipse cx="${g.cx + (i % 2 ? 5 : -6)}" cy="${g.baseY - 10 - i * 7}" rx="10" ry="4" fill="none" stroke="${C.ink}" stroke-width="1.5"/>`)
    .join('');
}

function pens(g: Geo, rimY: number) {
  return [
    [-0.55, -46],
    [0.05, -58],
    [0.6, -50],
  ]
    .map(([dx, len]) => {
      const x0 = g.cx + dx * g.bw * 0.3;
      const x1 = x0 + dx * 26;
      return `<line x1="${x0}" y1="${rimY + 8}" x2="${x1}" y2="${rimY + 8 + len}" stroke="${C.ink}" stroke-width="3" stroke-linecap="round"/><circle cx="${x1}" cy="${rimY + 8 + len}" r="3.4" fill="${C.ink}"/>`;
    })
    .join('');
}

function rod(g: Geo, y: number, col: string) {
  return `<line x1="${g.wl - 16}" y1="${y}" x2="${g.wr + 16}" y2="${y}" stroke="${col}" stroke-width="4" stroke-linecap="round"/><ellipse cx="${g.wl - 20}" cy="${y}" rx="7" ry="4.5" fill="none" stroke="${col}" stroke-width="1.8"/>`;
}

function windowNotch(g: Geo, y: number) {
  return `<path d="M${g.wr - 3} ${y - 8} h10 v16 h-10" fill="${C.bg}" stroke="${C.ink}" stroke-width="1.8"/>`;
}

function hanger(g: Geo, col: string) {
  return `<path d="M${g.cx} ${g.topY - 4} c-16 6 -16 24 0 30" fill="none" stroke="${col}" stroke-width="2.2"/><path d="M${g.cx} ${g.topY - 4} c16 6 16 24 0 30" fill="none" stroke="${col}" stroke-width="2.2"/>`;
}

function wickThrough(g: Geo, fromY: number, toY: number) {
  const x = g.cx;
  return `<path d="M${x} ${fromY} q10 ${(toY - fromY) * 0.18} 0 ${(toY - fromY) * 0.36} q-10 ${(toY - fromY) * 0.18} 0 ${(toY - fromY) * 0.36} q10 ${(toY - fromY) * 0.14} 0 ${(toY - fromY) * 0.28}" fill="none" stroke="${C.ink2}" stroke-width="2.4"/>`;
}

function plant(g: Geo, rimY: number) {
  return `<path d="M${g.cx} ${rimY} v-22 M${g.cx} ${rimY - 14} q-12 -3 -15 -14 q13 0 15 14 M${g.cx} ${rimY - 18} q12 -3 15 -14 q-13 0 -15 14" fill="none" stroke="${C.ink}" stroke-width="1.9"/>`;
}

function decorBands(g: Geo) {
  return [0.34, 0.52, 0.7]
    .map((f) => `<rect x="${g.wl}" y="${g.topY + g.h * f}" width="${g.bw}" height="${g.h * 0.09}" fill="url(#bsoil)" opacity="0.55"/>`)
    .join('');
}

// ---- workpiece state ----------------------------------------------------
interface State {
  form: 'whole' | 'cut';
  arrangement: 'intact' | 'separate' | 'bottomOnly' | 'nested';
  cutFrac: number;
  edgeSealed: boolean;
  wick: boolean;
  baseHole: boolean;
  rods: number[];
  windows: number[];
  slot: boolean;
  hanger: boolean;
  decorated: boolean;
  water: number;
  soil: number;
  seed: boolean;
  coins: boolean;
  pens: boolean;
  plant: boolean;
}

function fold(ops: BpOp[], fracs: (number | null)[], upto: number): State {
  const s: State = {
    form: 'whole',
    arrangement: 'intact',
    cutFrac: 0,
    edgeSealed: false,
    wick: false,
    baseHole: false,
    rods: [],
    windows: [],
    slot: false,
    hanger: false,
    decorated: false,
    water: 0,
    soil: 0,
    seed: false,
    coins: false,
    pens: false,
    plant: false,
  };
  for (let i = 0; i < upto; i++) {
    const f = fracs[i];
    switch (ops[i]) {
      case 'cut':
        s.form = 'cut';
        s.arrangement = 'separate';
        s.cutFrac = f ?? 0.36;
        break;
      case 'cut-bottom':
        s.form = 'cut';
        s.arrangement = 'bottomOnly';
        s.cutFrac = f ?? 0.4;
        break;
      case 'seal-edge':
        s.edgeSealed = true;
        break;
      case 'wick':
        s.wick = true;
        break;
      case 'nest':
        s.arrangement = 'nested';
        break;
      case 'fill-soil':
        s.soil = 0.62;
        s.plant = true;
        break;
      case 'fill-water':
        s.water = f ?? 0.85;
        break;
      case 'rod':
        if (f != null) s.rods.push(f);
        break;
      case 'window':
        s.windows = s.rods.length ? s.rods.slice() : f != null ? [f] : [];
        break;
      case 'slot':
        s.slot = true;
        break;
      case 'base-hole':
        s.baseHole = true;
        break;
      case 'hanger':
        s.hanger = true;
        break;
      case 'fill-seed':
        s.seed = true;
        break;
      case 'decorate':
        s.decorated = true;
        break;
      case 'use-coins':
        s.coins = true;
        break;
      case 'use-pens':
        s.pens = true;
        break;
      default:
        break; // clean, mark-*, coin-test, use-hang
    }
  }
  return s;
}

const LIFT = 32;

/** the workpiece in its current cumulative shape (no action highlight) */
function drawState(g: Geo, s: State): string {
  const cutY = g.topY + s.cutFrac * g.h;
  let out = '';

  if (s.form === 'whole') {
    if (s.water > 0) out += waterFill(g, g.topY + s.water * g.h);
    if (s.seed) out += seedFill(g);
    out += stroke(pWhole(g));
    if (s.coins) out += coins(g);
  } else if (s.arrangement === 'bottomOnly') {
    out += stroke(pCup(g, cutY));
    out += rimTicks(g, cutY, s.edgeSealed);
    if (s.pens) out += pens(g, cutY);
  } else if (s.arrangement === 'separate') {
    out += stroke(pCup(g, cutY));
    out += rimTicks(g, cutY, s.edgeSealed);
    out += `<g transform="translate(0 ${-LIFT})">${stroke(pTopUpright(g, cutY))}${rimTicks(g, cutY, s.edgeSealed)}</g>`;
    out += `<line x1="${g.wl}" y1="${cutY - LIFT}" x2="${g.wl}" y2="${cutY}" stroke="${C.ink2}" stroke-width="1" stroke-dasharray="3 3"/><line x1="${g.wr}" y1="${cutY - LIFT}" x2="${g.wr}" y2="${cutY}" stroke="${C.ink2}" stroke-width="1" stroke-dasharray="3 3"/>`;
    if (s.wick) out += wickThrough(g, g.topY - LIFT + 6, cutY - LIFT + s.cutFrac * g.h + 18);
  } else {
    // nested
    const rimY = cutY + 10;
    const topH = s.cutFrac * g.h;
    if (s.water > 0) out += waterFill(g, g.topY + s.water * g.h);
    out += stroke(pCup(g, cutY));
    out += stroke(pFunnel(g, rimY, topH));
    if (s.soil > 0) out += soilFill(g, rimY, topH, s.soil);
    if (s.wick) out += wickThrough(g, rimY + topH, g.baseY - 8);
    if (s.plant) out += plant(g, rimY);
    out += rimTicks(g, cutY, s.edgeSealed);
  }

  if (s.baseHole) out += `<circle cx="${g.cx}" cy="${g.baseY - 6}" r="3.6" fill="${C.bg}" stroke="${C.ink}" stroke-width="1.7"/>`;
  for (const f of s.rods) out += rod(g, g.topY + f * g.h, C.ink);
  for (const f of s.windows) out += windowNotch(g, g.topY + f * g.h - 12);
  if (s.slot) out += `<rect x="${g.cx - g.bw * 0.2}" y="${g.topY + g.h * 0.46}" width="${g.bw * 0.4}" height="4" rx="2" fill="${C.ink}"/>`;
  if (s.hanger) out += hanger(g, C.ink);
  if (s.decorated) out += decorBands(g);
  return out;
}

/** the current step's action, highlighted on top of the "before" shape */
function drawAction(g: Geo, op: BpOp, a: { frac: number | null; short?: string }): string {
  const fy = a.frac != null ? g.topY + a.frac * g.h : g.baseY - g.h * 0.4;
  const dim = a.short ? vDim(g.wr + 22, fy, g.baseY, a.short, 1) : '';
  switch (op) {
    case 'clean':
      return `${star(g.wl - 14, g.topY + 20, 7, C.hot)}${star(g.wr + 12, g.shoulderY + 20, 6, C.hot)}${star(g.cx, g.topY - 8, 5, C.hot)}${toolIcon('drop', g.wr + 18, g.baseY - 30)}`;
    case 'mark-cut':
      return `<line x1="${g.wl - 16}" y1="${fy}" x2="${g.wr + 16}" y2="${fy}" stroke="${C.hot}" stroke-width="2.6" stroke-dasharray="9 5"/><ellipse cx="${g.cx}" cy="${fy}" rx="${g.bw / 2}" ry="${g.bw * 0.13}" fill="none" stroke="${C.hot}" stroke-width="1.3" stroke-dasharray="4 5"/>${toolIcon('marker', g.wr + 6, fy)}${dim}`;
    case 'cut':
    case 'cut-bottom':
      return `<line x1="${g.wl - 18}" y1="${fy}" x2="${g.wr + 18}" y2="${fy}" stroke="${C.hot}" stroke-width="3" stroke-dasharray="8 5"/>${toolIcon('scissors', g.wl - 26, fy)}<path d="M${g.wr + 34} ${fy - 16} a16 16 0 1 1 -4 24" fill="none" stroke="${C.hot}" stroke-width="2" marker-end="url(#bh)"/>${dim}`;
    case 'seal-edge': {
      const cutY = g.topY + (a.frac ?? 0.36) * g.h;
      return `<line x1="${g.wl - 4}" y1="${cutY}" x2="${g.wr + 4}" y2="${cutY}" stroke="${C.hot}" stroke-width="5" stroke-linecap="round"/>${toolIcon('tape', g.wr + 20, cutY, 0)}`;
    }
    case 'wick':
      return `<path d="M${g.cx} ${g.topY - LIFT + 4} q12 26 0 52 q-12 26 0 52 q12 20 0 40" fill="none" stroke="${C.hot}" stroke-width="2.6"/>${a.short ? vDim(g.wr + 22, g.topY - LIFT + 4, g.topY - LIFT + 4 + g.h, a.short, 1) : ''}`;
    case 'nest':
      return `<path d="M${g.cx - g.bw * 0.5} ${g.topY - LIFT} q-24 ${g.h * 0.5} 8 ${g.h * 0.62}" fill="none" stroke="${C.hot}" stroke-width="2.6" marker-end="url(#bh)"/>`;
    case 'fill-soil':
      return `<path d="M${g.cx - 22} ${g.topY + 6} v20 M${g.cx} ${g.topY} v26 M${g.cx + 22} ${g.topY + 6} v20" stroke="${C.hot}" stroke-width="2.4" marker-end="url(#bh)"/><text x="${g.cx}" y="${g.topY - 8}" ${FONT} font-size="12" fill="${C.hot}" text-anchor="middle">تراب + نبتة</text>`;
    case 'fill-water':
      return `${toolIcon('drop', g.cx, g.topY - 12)}<line x1="${g.wl - 12}" y1="${fy}" x2="${g.wr + 12}" y2="${fy}" stroke="${C.hot}" stroke-width="2.4" stroke-dasharray="7 4"/>${dim}`;
    case 'mark-holes':
      return `${[g.wl, g.wr].map((x) => `<g stroke="${C.hot}" stroke-width="1.8"><circle cx="${x}" cy="${fy}" r="4.4" fill="none"/><path d="M${x - 8} ${fy}h16M${x} ${fy - 8}v16"/></g>`).join('')}${toolIcon('marker', g.wl - 22, fy - 4)}${dim}`;
    case 'rod':
      return `${rod(g, fy, C.hot)}<path d="M${g.wl - 40} ${fy} h16" stroke="${C.hot}" stroke-width="2.4" marker-end="url(#bh)"/>${dim}`;
    case 'window':
      return `<rect x="${g.wr - 6}" y="${fy - 22}" width="14" height="20" rx="3" fill="none" stroke="${C.hot}" stroke-width="2.4" stroke-dasharray="6 3"/>${toolIcon('scissors', g.wr + 22, fy - 12, 20)}${a.short ? hDim(g.wr - 6, g.wr + 12, fy - 30, a.short) : ''}`;
    case 'mark-slot':
      return `<rect x="${g.cx - g.bw * 0.22}" y="${g.topY + g.h * 0.44}" width="${g.bw * 0.44}" height="8" rx="2" fill="none" stroke="${C.hot}" stroke-width="2.4" stroke-dasharray="6 3"/>${toolIcon('marker', g.wr + 8, g.topY + g.h * 0.46)}${a.short ? hDim(g.cx - g.bw * 0.22, g.cx + g.bw * 0.22, g.topY + g.h * 0.4, a.short) : ''}`;
    case 'slot':
      return `<rect x="${g.cx - g.bw * 0.2}" y="${g.topY + g.h * 0.46}" width="${g.bw * 0.4}" height="4" rx="2" fill="${C.hot}"/>${toolIcon('scissors', g.wr + 10, g.topY + g.h * 0.46, 10)}`;
    case 'coin-test':
      return `<ellipse cx="${g.cx}" cy="${g.topY + g.h * 0.3}" rx="11" ry="11" fill="none" stroke="${C.hot}" stroke-width="2.2"/><path d="M${g.cx} ${g.topY + g.h * 0.36} v${g.h * 0.06}" stroke="${C.hot}" stroke-width="2.4" marker-end="url(#bh)"/>`;
    case 'base-hole':
      return `<circle cx="${g.cx}" cy="${g.baseY - 6}" r="4" fill="none" stroke="${C.hot}" stroke-width="2"/><path d="M${g.cx} ${g.baseY + 12} v-10" stroke="${C.hot}" stroke-width="2.4" marker-end="url(#bh)"/>${toolIcon('nail', g.cx + 22, g.baseY - 6, 60)}`;
    case 'decorate':
      return `<path d="M${g.wl - 6} ${g.topY + g.h * 0.4} q${g.bw / 2} -20 ${g.bw + 12} 0" fill="none" stroke="${C.hot}" stroke-width="6" stroke-linecap="round" opacity="0.8"/>`;
    case 'hanger':
      return `${hanger(g, C.hot)}<line x1="${g.cx - 60}" y1="${g.topY - 6}" x2="${g.cx + 60}" y2="${g.topY - 6}" stroke="${C.ink}" stroke-width="3"/>`;
    case 'fill-seed':
      return `${toolIcon('drop', g.cx, g.topY - 12)}<path d="M${g.cx - 14} ${g.topY + 4} v18 M${g.cx + 14} ${g.topY + 4} v18" stroke="${C.hot}" stroke-width="2.4" marker-end="url(#bh)"/>`;
    case 'use-hang':
      return `<line x1="${g.cx - 80}" y1="${g.topY - 10}" x2="${g.cx + 80}" y2="${g.topY - 10}" stroke="${C.ink}" stroke-width="4"/>${star(g.wr + 20, g.shoulderY, 6, C.hot)}`;
    case 'use-coins':
      return `<ellipse cx="${g.cx}" cy="${g.topY + g.h * 0.24}" rx="9" ry="9" fill="none" stroke="${C.hot}" stroke-width="2.2"/><path d="M${g.cx} ${g.topY + g.h * 0.3} v${g.h * 0.1}" stroke="${C.hot}" stroke-width="2.4" marker-end="url(#bh)"/>`;
    default: // use-pens
      return `${star(g.cx, g.topY - LIFT - 6, 6, C.hot)}${star(g.wr + 16, g.topY - 10, 5, C.hot)}`;
  }
}

// ---- assemble ----------------------------------------------------------
export function renderBlueprint(o: BlueprintOpts): string {
  const ops = o.ops as BpOp[];
  const i = o.index;
  const cur = ops[i];
  const before = fold(ops, o.fracs, i);
  const after = fold(ops, o.fracs, i + 1);
  const stepNo = i + 1;

  const g = bottleGeo(o.variant, { cx: 196, baseY: 306, maxH: 250, maxW: 132 });
  const spec = `قنينة ${toAr(o.variant.volumeMl)} مل · ارتفاع ${toAr(o.variant.heightMm)} ملم · قطر ${toAr(o.variant.diameterMm)} ملم`;

  const dims = `${vDim(g.wl - 24, g.topY, g.baseY, `${cm(o.variant.heightMm)} سم`)}
    ${hDim(g.wl, g.wr, g.baseY + 22, `${cm(o.variant.diameterMm)} سم`)}
    <path d="M${g.wl - 8} ${g.baseY} l8 9 l8 -9 z" fill="${C.ink2}"/>
    <text x="${g.wl - 34}" y="${g.baseY + 28}" ${FONT} font-size="12" fill="${C.ink2}" text-anchor="middle">القاع</text>`;

  // the action needs a position: its own measure frac, else the standing cut line
  const actionFrac = o.fracs[i] ?? (before.form === 'cut' ? before.cutFrac : null);
  const body = drawState(g, before) + drawAction(g, cur, { frac: actionFrac, short: o.measureShort });

  // notes column
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

  // "after this step" inset — only when the step actually changes the shape
  let inset = '';
  if (JSON.stringify(before) !== JSON.stringify(after)) {
    const iy = ny + 12;
    const ix = DIV_X + 14;
    const iw = W - DIV_X - 26;
    const ih = STRIP_Y - iy - 12;
    const gm = bottleGeo(o.variant, { cx: ix + iw * 0.44, baseY: iy + ih - 18, maxH: ih - 40, maxW: iw * 0.5 });
    inset = `<rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" rx="8" fill="${C.bg}" stroke="${C.ink2}" stroke-width="1.2"/>
      <text x="${ix + iw - 10}" y="${iy + 18}" ${FONT} font-size="12" fill="${C.ink2}" text-anchor="start" direction="rtl">الشكل بعد هالخطوة ✓</text>
      ${drawState(gm, after)}`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="مخطط الخطوة ${toAr(stepNo)}: ${esc(o.title)}">
  <defs>
    <marker id="bd" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${C.ink2}"/></marker>
    <marker id="bh" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${C.hot}"/></marker>
    <pattern id="bgrid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="${C.grid}" stroke-width="1"/></pattern>
    <pattern id="bsoil" width="9" height="9" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.1" fill="${C.ink2}"/><circle cx="6.5" cy="6" r="1.1" fill="${C.ink2}"/></pattern>
    <pattern id="bwater" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><line x1="0" y1="0" x2="0" y2="10" stroke="${C.ink2}" stroke-width="1"/></pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="${C.bg}"/>
  <rect width="${W}" height="${H}" fill="url(#bgrid)"/>
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
