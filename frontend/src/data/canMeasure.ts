// Per-step measurements for the can category, computed from the CONFIRMED
// can's real dimensions — same idea as src/data/measure.ts for bottles.

import type { Variant } from '../lib/types';

export type CanMeasureId =
  | 'can-lantern-holes'
  | 'can-planter-drain'
  | 'can-chime-hang'
  | 'can-bank-slot';

export interface CanMeasure {
  short: string;
  sentence: string;
  frac?: number;
}

const AR = '٠١٢٣٤٥٦٧٨٩';
const toAr = (s: string) => s.replace(/\d/g, (d) => AR[Number(d)]!).replace('.', '٫');

function cm(mm: number): string {
  const v = Math.round(mm) / 10;
  return toAr(Number.isInteger(v) ? String(v) : v.toFixed(1));
}

export function compute(id: CanMeasureId, v: Variant): CanMeasure {
  const H = v.heightMm;

  switch (id) {
    case 'can-lantern-holes': {
      const from = H * 0.45;
      return {
        short: `منتصف العلبة`,
        sentence: `علّم صف ثقوب حوالين العلبة عند منتصف الارتفاع تقريباً (${cm(from)} سم من القاع)، وممكن تزيد صف ثاني فوقه أو تحته.`,
        frac: 1 - from / H,
      };
    }
    case 'can-planter-drain': {
      const from = Math.min(10, H * 0.06);
      return {
        short: `${cm(from)} سم من القاع`,
        sentence: `اثقب ٢-٣ ثقوب تصريف صغيرة بقاع العلبة، على بُعد ${cm(from)} سم تقريباً من الحافة السفلية.`,
        frac: 1 - from / H,
      };
    }
    case 'can-chime-hang': {
      const from = Math.min(12, H * 0.08);
      return {
        short: `${cm(from)} سم من الحافة`,
        sentence: `اثقب ثقباً صغيراً على بُعد ${cm(from)} سم تقريباً من حافة العلبة العلوية، لتمرير الخيط منه.`,
        frac: from / H,
      };
    }
    case 'can-bank-slot':
      return {
        short: '٣ سم × ٣ ملّي',
        sentence:
          'علّم شقّاً طوله ٣ سم وعرضه ٣–٤ ملّي (أطول بقليل من أكبر قرش عندك) على غطا العلبة البلاستيكي. مقاسه حسب القرش مش حسب العلبة.',
      };
  }
}
