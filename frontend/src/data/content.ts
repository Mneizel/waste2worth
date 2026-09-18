// Arabic-first content for the prototype. The generator (scripts/build-data.ts)
// turns this into src/data/catalogue.ts. Step blueprints are drawn at runtime
// (src/components/blueprintSvg.ts) so every measurement is computed from the
// CONFIRMED bottle's real dimensions — see src/data/measure.ts.
//
// Scope: 4 projects whose method is genuinely standard and unambiguous. Steps
// follow the widely-published versions (Instructables, Red Ted Art,
// The Spruce Crafts, library/museum guides). Wording and diagrams are our own.

import type { BpOp } from '../components/blueprintSvg';
import type { MeasureId } from './measure';

export interface ContentTool {
  kind: 'tool' | 'material';
  name: string;
  quantity?: string;
  optional?: boolean;
  note?: string;
}

/** Generic across categories: bottle content uses ContentStep<BpOp, MeasureId>,
 * can content uses ContentStep<CanOp, CanMeasureId>, and so on. */
export interface ContentStep<Op extends string = string, Measure extends string = string> {
  title: string;
  instruction: string;
  /** operation this step performs on the workpiece (drives the runtime blueprint) */
  op: Op;
  /** if set, the exact measurement is computed from the confirmed item */
  measure?: Measure;
  tip?: string;
  warning?: string;
}

export interface ContentIdea<Op extends string = string, Measure extends string = string> {
  slug: string;
  title: string;
  summary: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedMinutes: number;
  minAge: number;
  safetyNotes?: string;
  sortOrder: number;
  source: string;
  variantKeys: string[];
  tools: ContentTool[];
  steps: ContentStep<Op, Measure>[];
}

/** Arabic labels for the bottle catalogue (keyed by the seed `key`). */
export const VARIANT_LABELS_AR: Record<string, string> = {
  'pet-water-200ml': 'قنينة مياه صغيرة جداً (٢٠٠ مل)',
  'pet-water-250ml': 'قنينة مياه صغيرة (٢٥٠ مل)',
  'pet-softdrink-330ml': 'قنينة مشروب غازي (٣٣٠ مل)',
  'pet-softdrink-350ml': 'قنينة مشروب غازي (٣٥٠ مل)',
  'pet-water-500ml': 'قنينة مياه عادية (٥٠٠ مل)',
  'pet-water-600ml': 'قنينة مياه (٦٠٠ مل)',
  'pet-sports-750ml': 'قنينة مياه رياضية (٧٥٠ مل)',
  'pet-water-1000ml': 'قنينة مياه كبيرة (١ لتر)',
  'pet-oil-1000ml': 'قنينة زيت طعام (١ لتر)',
  'pet-water-1250ml': 'قنينة (١٫٢٥ لتر)',
  'pet-water-1500ml': 'قنينة مياه (١٫٥ لتر)',
  'pet-soda-2000ml': 'قنينة مشروب غازي (٢ لتر)',
  'pet-water-3000ml': 'قنينة مياه كبيرة (٣ لتر)',
  'pet-water-5000ml': 'قنينة مياه كبيرة (٥ لتر)',
  'glass-soda-250ml': 'قنينة مشروب زجاجية (٢٥٠ مل)',
  'glass-beer-330ml': 'قنينة زجاجية (٣٣٠ مل)',
  'glass-beer-500ml': 'قنينة زجاجية (٥٠٠ مل)',
  'glass-wine-750ml': 'قنينة زجاجية طويلة (٧٥٠ مل)',
  'glass-spirits-700ml': 'قنينة زجاجية (٧٠٠ مل)',
  'hdpe-milk-1000ml': 'عبوة حليب (١ لتر)',
  'hdpe-milk-2000ml': 'عبوة حليب (٢ لتر)',
  'hdpe-milk-3785ml': 'عبوة حليب كبيرة (غالون)',
  'pet-juice-250ml': 'قنينة عصير (٢٥٠ مل)',
  'pet-juice-1000ml': 'قنينة عصير (١ لتر)',
};

export const IDEAS_AR: ContentIdea<BpOp, MeasureId>[] = [
  {
    slug: 'self-watering-planter',
    title: 'مزهرية تسقي نفسها',
    summary:
      'القنينة تنقصّ نصّين: الجزء العلوي مقلوب يحمل التراب والنبتة، والسفلي خزّان ماء، وفتيل قماش يوصل الماء للتراب.',
    difficulty: 'easy',
    estimatedMinutes: 20,
    minAge: 6,
    safetyNotes: 'القصّ يعمله شخص كبير. غطِّ الحافة المقصوصة بشريط لاصق.',
    sortOrder: 10,
    source: 'الطريقة الشائعة (Red Ted Art · The Spruce Crafts · أدلة المكتبات)',
    variantKeys: [
      'pet-softdrink-330ml', 'pet-softdrink-350ml', 'pet-water-500ml', 'pet-water-600ml',
      'pet-sports-750ml', 'pet-water-1000ml', 'pet-juice-1000ml', 'pet-water-1250ml',
      'pet-water-1500ml', 'pet-soda-2000ml', 'pet-water-3000ml', 'pet-water-5000ml',
      'hdpe-milk-1000ml', 'hdpe-milk-2000ml', 'hdpe-milk-3785ml',
    ],
    tools: [
      { kind: 'tool', name: 'مقص أو سكين ورق', note: 'للقصّ — بيد شخص كبير.' },
      { kind: 'tool', name: 'قلم تحديد ومسطرة' },
      { kind: 'material', name: 'قنينة بلاستيك نظيفة', quantity: '١', note: '٣٣٠ مل حتى ٥ لتر.' },
      { kind: 'material', name: 'شريط قماش قطني (من تيشيرت قديم)', quantity: 'حسب المخطّط' },
      { kind: 'material', name: 'تراب زراعة', quantity: 'كوب إلى كوبين' },
      { kind: 'material', name: 'نبتة صغيرة أو بذور', quantity: '١' },
      { kind: 'material', name: 'شريط لاصق', optional: true, note: 'لتغطية الحافة.' },
    ],
    steps: [
      { op: 'clean', title: 'نظّف القنينة', instruction: 'انزع الملصق، واغسل القنينة والغطا بالماء، وخلّيها تنشف تماماً.' },
      { op: 'mark-cut', measure: 'planter-cut', title: 'علّم خط القصّ', instruction: 'بالمسطرة، علّم خطاً دائرياً حوالين القنينة عند الارتفاع المبيّن بالمخطّط.', tip: 'سنّد القلم على كومة كتب ودوّر القنينة ليطلع الخط مستقيماً.' },
      { op: 'cut', measure: 'planter-cut', title: 'اقصّ القنينة نصّين', instruction: 'شخص كبير يقصّ على الخط بالضبط. بيصير جزء علوي (بالغطا) وجزء سفلي.', warning: 'القصّ للكبار بس.' },
      { op: 'seal-edge', title: 'أمّن الحافة', instruction: 'غطِّ حافة القصّ على القطعتين بشريط لاصق حتى ما تجرح.' },
      { op: 'wick', measure: 'planter-wick', title: 'ركّب الفتيل', instruction: 'اقصّ شريط القماش بالمقاس المبيّن، ومرّره من فتحة الغطا: نصفه داخل الجزء العلوي، ونصفه متدلٍّ تحت.', tip: 'إذا الفتحة صغيرة، افتح الغطا واعمل فيه ثقب ٥ ملّي بمسمار.' },
      { op: 'nest', title: 'اقلب الجزء العلوي داخل السفلي', instruction: 'اقلب الجزء العلوي رأساً على عقب (الغطا للتحت) وحطّه داخل الجزء السفلي مثل القمع.' },
      { op: 'fill-soil', title: 'حطّ التراب والنبتة', instruction: 'عبّي الجزء العلوي تراباً، وامسك الفتيل حتى ما ينطمّ، بعدين ازرع البذور أو النبتة.' },
      { op: 'fill-water', measure: 'planter-fill', title: 'عبّي الخزّان', instruction: 'ارفع الجزء العلوي وصبّ الماء في الجزء السفلي حتى الارتفاع المبيّن، بعدين رجّع الجزء العلوي مكانه.', tip: 'زوّد الماء كل كم يوم لمّا يقلّ.' },
    ],
  },
  {
    slug: 'bird-feeder',
    title: 'مطعم عصافير بالملاعق',
    summary:
      'قنينة معلّقة، تمرّ فيها ملعقتان خشب كمسند، وفوق كل ملعقة فتحة صغيرة يطلع منها الحَب لمّا يقف العصفور.',
    difficulty: 'easy',
    estimatedMinutes: 25,
    minAge: 7,
    safetyNotes: 'الثقوب يعملها شخص كبير. علّقه بمكان بعيد عن القطط.',
    sortOrder: 20,
    source: 'طريقة الملاعق الخشبية الشائعة (Instructables)',
    variantKeys: [
      'pet-sports-750ml', 'pet-water-1000ml', 'pet-oil-1000ml', 'pet-juice-1000ml',
      'pet-water-1250ml', 'pet-water-1500ml', 'pet-soda-2000ml', 'pet-water-3000ml',
      'pet-water-5000ml', 'hdpe-milk-1000ml', 'hdpe-milk-2000ml', 'hdpe-milk-3785ml',
    ],
    tools: [
      { kind: 'tool', name: 'سكين ورق', note: 'للثقوب — بيد شخص كبير.' },
      { kind: 'tool', name: 'قلم تحديد ومسطرة' },
      { kind: 'material', name: 'قنينة نظيفة مع غطاها', quantity: '١', note: '٧٥٠ مل حتى ٥ لتر.' },
      { kind: 'material', name: 'ملعقتان خشب طويلتان', quantity: '٢' },
      { kind: 'material', name: 'خيط أو دوبارة', quantity: '٤٠ سم' },
      { kind: 'material', name: 'حَب عصافير', quantity: 'كوب' },
    ],
    steps: [
      { op: 'clean', title: 'نظّف القنينة ونشّفها', instruction: 'اغسل القنينة والغطا، انزع الملصق، وخلّيها تنشف تماماً.' },
      { op: 'mark-holes', measure: 'feeder-perch1', title: 'علّم مكان الملعقة الأولى', instruction: 'على جهتين متقابلتين، علّم نقطتين على الارتفاع المبيّن بالمخطّط.' },
      { op: 'rod', measure: 'feeder-perch1', title: 'مرّر الملعقة الأولى', instruction: 'شخص كبير يعمل ثقبين صغيرين مكان العلامتين، ثم مرّر ملعقة الخشب حتى تطلع من الجهتين بالتساوي.', warning: 'الثقوب للكبار بس.' },
      { op: 'rod', measure: 'feeder-perch2', title: 'مرّر الملعقة الثانية', instruction: 'علّم ثقبين آخرين فوق الأولى بالمسافة المبيّنة وبزاوية ربع دورة، ومرّر الملعقة الثانية.' },
      { op: 'window', measure: 'feeder-opening', title: 'افتح منافذ الحَب', instruction: 'فوق رأس كل ملعقة مباشرة، وسّع الثقب إلى فتحة بالقياس المبيّن ليخرج منها الحَب.' },
      { op: 'hanger', title: 'اعمل معلاقة', instruction: 'اعمل ثقبين صغيرين على جهتين قرب الغطا، مرّر خيط ٤٠ سم، واعمل عروة.' },
      { op: 'fill-seed', title: 'عبّي الحَب', instruction: 'صبّ حَب العصافير جوّا القنينة من فوق، وسكّر الغطا.' },
      { op: 'use-hang', title: 'علّقه', instruction: 'علّق المطعم بغصن شجرة، بمكان تقدر تشوفه من الشبّاك وبعيد عن القطط.' },
    ],
  },
  {
    slug: 'coin-bank',
    title: 'حصّالة نقود',
    summary: 'قنينة كاملة فيها شقّ ضيّق على جنبها تنزّل منه القروش، وتفرّغها بفتح الغطا.',
    difficulty: 'easy',
    estimatedMinutes: 15,
    minAge: 6,
    safetyNotes: 'شقّ النقود يعمله شخص كبير.',
    sortOrder: 30,
    source: 'الطريقة الشائعة (NOAA · All Free Crafts)',
    variantKeys: [
      'pet-water-200ml', 'pet-water-250ml', 'pet-softdrink-330ml', 'pet-softdrink-350ml',
      'pet-water-500ml', 'pet-water-600ml', 'pet-sports-750ml', 'pet-water-1000ml',
      'pet-oil-1000ml', 'pet-juice-250ml', 'pet-juice-1000ml', 'pet-water-1250ml',
      'pet-water-1500ml', 'pet-soda-2000ml', 'pet-water-3000ml', 'pet-water-5000ml',
      'hdpe-milk-1000ml', 'hdpe-milk-2000ml', 'hdpe-milk-3785ml',
    ],
    tools: [
      { kind: 'tool', name: 'سكين ورق', note: 'للشقّ — بيد شخص كبير.' },
      { kind: 'tool', name: 'قلم تحديد ومسطرة' },
      { kind: 'material', name: 'قنينة نظيفة مع غطاها', quantity: '١' },
      { kind: 'material', name: 'ورق ملوّن ولاصق، أو دهان', quantity: '١', optional: true, note: 'للتزيين.' },
    ],
    steps: [
      { op: 'clean', title: 'نظّف القنينة ونشّفها', instruction: 'اغسل القنينة والغطا، انزع الملصق، ونشّفها. خلّي الغطا مسكّراً.' },
      { op: 'mark-slot', measure: 'bank-slot', title: 'علّم الشقّ', instruction: 'ضع القنينة على جنبها، وعلّم مستطيلاً رفيعاً على الجهة اللي لفوق بالمقاس المبيّن.' },
      { op: 'slot', measure: 'bank-slot', title: 'اقصّ الشقّ', instruction: 'شخص كبير يقصّ على المستطيل بسكين الورق ليصير شقّاً.', warning: 'القصّ للكبار بس.' },
      { op: 'coin-test', title: 'جرّب قرشاً', instruction: 'جرّب تدخّل أكبر قرش من الشقّ. إذا كان ضيّقاً، وسّعه ١–٢ ملّي فقط.' },
      { op: 'decorate', title: 'زيّنها', instruction: 'لفّ القنينة بورق ملوّن أو ادهنها، وخلّي الشقّ مكشوفاً.' },
      { op: 'use-coins', title: 'ابدأ توفّر', instruction: 'نزّل القروش من الشقّ. لتفريغها، افتح الغطا فقط.' },
    ],
  },
  {
    slug: 'pen-pot-organizer',
    title: 'علبة أقلام للمكتب',
    summary: 'قاع القنينة ينقصّ ليصير علبة تحمل الأقلام والمقص على المكتب.',
    difficulty: 'easy',
    estimatedMinutes: 15,
    minAge: 6,
    safetyNotes: 'القصّ يعمله شخص كبير. أمّن الحافة بطيّها للخارج أو بشريط.',
    sortOrder: 40,
    source: 'الطريقة الشائعة (wikiHow · The Spruce Crafts)',
    variantKeys: [
      'pet-water-250ml', 'pet-softdrink-330ml', 'pet-softdrink-350ml', 'pet-juice-250ml',
      'pet-water-500ml', 'pet-water-600ml', 'pet-sports-750ml', 'pet-water-1000ml',
      'pet-oil-1000ml', 'pet-water-1250ml', 'pet-water-1500ml', 'pet-soda-2000ml',
      'hdpe-milk-1000ml',
    ],
    tools: [
      { kind: 'tool', name: 'مقص أو سكين ورق', note: 'للقصّ — بيد شخص كبير.' },
      { kind: 'tool', name: 'قلم تحديد ومسطرة' },
      { kind: 'material', name: 'قنينة بلاستيك نظيفة', quantity: '١', note: '٢٥٠ مل حتى ٢ لتر.' },
      { kind: 'material', name: 'شريط ملوّن أو دهان', quantity: '١', optional: true },
    ],
    steps: [
      { op: 'clean', title: 'نظّف القنينة', instruction: 'اغسل القنينة، انزع الملصق، ونشّفها.' },
      { op: 'mark-cut', measure: 'pen-height', title: 'حدّد الارتفاع', instruction: 'حطّ أطول قلم عندك جنب القنينة، وعلّم خطاً دائرياً على الارتفاع المبيّن بالمخطّط.', tip: 'دوّر القنينة على قلم ثابت ليطلع الخط منظّماً.' },
      { op: 'cut-bottom', measure: 'pen-height', title: 'اقصّ الجزء العلوي', instruction: 'شخص كبير يقصّ على الخط بالضبط. احتفظ بالجزء السفلي.', warning: 'القصّ للكبار بس.' },
      { op: 'seal-edge', title: 'أمّن الحافة', instruction: 'اطوِ الحافة المقصوصة للخارج، أو غطّيها بشريط لاصق.' },
      { op: 'base-hole', title: 'ثقب تصريف (اختياري)', instruction: 'إذا رح توقّف فيها فُرَشاً رطبة، اعمل ثقباً صغيراً بالقاع ليخرج الماء.' },
      { op: 'decorate', title: 'زيّنها', instruction: 'لفّ العلبة بشريط ملوّن أو ادهنها وخلّيها تنشف.' },
      { op: 'use-pens', title: 'استعملها', instruction: 'وقّف أقلامك وأدواتك جوّاها على المكتب.' },
    ],
  },
];
