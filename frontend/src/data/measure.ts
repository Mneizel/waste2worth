// Per-step measurements, computed from the *confirmed* bottle's real dimensions.
// Every measured step names a MeasureId; GuidePage + Blueprint call compute().

import type { Variant } from '../lib/types';

export type MeasureId =
  | 'planter-cut'
  | 'planter-wick'
  | 'planter-fill'
  | 'feeder-perch1'
  | 'feeder-perch2'
  | 'feeder-opening'
  | 'bank-slot'
  | 'pen-height';

export interface Measure {
  /** short label for the blueprint dimension callout, e.g. "٧٫٦ سم" */
  short: string;
  /** full sentence shown under the step instruction */
  sentence: string;
  /** position of the cut/mark line as a fraction from the top of the bottle (0..1) */
  frac?: number;
}

const AR = '٠١٢٣٤٥٦٧٨٩';
const toAr = (s: string) =>
  s.replace(/\d/g, (d) => AR[Number(d)]!).replace('.', '٫');

/** mm -> a tidy cm string (one decimal unless whole) */
function cm(mm: number): string {
  const v = Math.round(mm) / 10;
  return toAr(Number.isInteger(v) ? String(v) : v.toFixed(1));
}

export function compute(id: MeasureId, v: Variant): Measure {
  const H = v.heightMm;
  const D = v.diameterMm;

  switch (id) {
    case 'planter-cut': {
      const at = H * 0.36;
      return {
        short: `${cm(at)} سم`,
        sentence: `علّم خطاً دائرياً على بُعد ${cm(at)} سم من الغطا — أي ثلث ارتفاع قنينتك تقريباً (طولها ${cm(H)} سم).`,
        frac: 0.36,
      };
    }
    case 'planter-wick': {
      const len = H * 1.1;
      return {
        short: `${cm(len)} سم`,
        sentence: `اقصّ شريط قماش قطني عرضه ٢–٣ سم وطوله ${cm(len)} سم (أطول من ارتفاع قنينتك بقليل).`,
      };
    }
    case 'planter-fill': {
      const at = H * 0.22;
      return {
        short: `${cm(at)} سم`,
        sentence: `صبّ الماء في الجزء السفلي حتى ارتفاع ${cm(at)} سم تقريباً — يلمس طرف الفتيل وما يوصل للرقبة.`,
        frac: 1 - 0.22 * 0.5,
      };
    }
    case 'feeder-perch1': {
      const from = Math.max(40, H * 0.16);
      return {
        short: `${cm(from)} سم من القاع`,
        sentence: `علّم نقطتين متقابلتين على ارتفاع ${cm(from)} سم من قاع القنينة.`,
        frac: 1 - Math.max(40, H * 0.16) / H,
      };
    }
    case 'feeder-perch2': {
      const from1 = Math.max(40, H * 0.16);
      const gap = Math.max(25, D * 0.45);
      return {
        short: `${cm(gap)} سم أعلى`,
        sentence: `علّم ثقبين آخرين على ارتفاع ${cm(gap)} سم فوق الأولى وبزاوية ربع دورة (متقاطعة معها).`,
        frac: 1 - (from1 + gap) / H,
      };
    }
    case 'feeder-opening': {
      const dia = Math.max(10, D * 0.16);
      const from1 = Math.max(40, H * 0.16);
      const gap = Math.max(25, D * 0.45);
      return {
        short: `قطر ${cm(dia)} سم`,
        sentence: `فوق رأس كل ملعقة، وسّع الثقب إلى فتحة قطرها ${cm(dia)} سم تقريباً ليخرج منها الحَب.`,
        frac: 1 - (from1 + gap * 0.5) / H,
      };
    }
    case 'bank-slot':
      return {
        short: '٣ سم × ٣ ملّي',
        sentence:
          'علّم شقّاً طوله ٣ سم وعرضه ٣–٤ ملّي (أطول بقليل من أكبر قرش عندك) على الجهة العريضة من القنينة وهي على جنبها. مقاسه حسب القرش مش حسب القنينة.',
        frac: 0.5,
      };
    case 'pen-height': {
      const max = H * 0.62;
      return {
        short: `حتى ${cm(max)} سم`,
        sentence: `الارتفاع = طول أطول قلم عندك ناقص ٢ سم، وبحدّ أقصى ${cm(max)} سم لهاي القنينة. علّم خطاً دائرياً عند هذا الارتفاع.`,
        frac: 1 - 0.62,
      };
    }
  }
}
