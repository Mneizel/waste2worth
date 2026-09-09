// Arabic-first content for the prototype. The generator (scripts/build-data.ts)
// turns this into src/data/catalogue.ts + the step blueprints in src/data/media.ts.
//
// Scope: 4 projects whose method is genuinely standard and unambiguous. Steps
// and measurements follow the widely-published versions of each craft
// (Instructables, Red Ted Art, The Spruce Crafts, library/museum guides).
// Measurements are the values those sources agree on; where a craft is
// forgiving the step says so ("تقريباً"). Wording and diagrams are our own.

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

export interface ContentTool {
  kind: 'tool' | 'material';
  name: string;
  quantity?: string;
  optional?: boolean;
  note?: string;
}

export interface ContentStep {
  title: string;
  instruction: string;
  blueprint: BlueprintKind;
  /** Short measurement shown on the blueprint's dimension line, e.g. "≈ ٧ سم". */
  dim?: string;
  tip?: string;
  warning?: string;
}

export interface ContentIdea {
  slug: string;
  title: string;
  summary: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedMinutes: number;
  minAge: number;
  safetyNotes?: string;
  sortOrder: number;
  /** Where the method / measurements come from (shown as a small credit). */
  source: string;
  variantKeys: string[];
  tools: ContentTool[];
  steps: ContentStep[];
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

export const IDEAS_AR: ContentIdea[] = [
  {
    slug: 'self-watering-planter',
    title: 'مزهرية تسقي نفسها',
    summary:
      'القنينة تنقصّ نصّين: الجزء العلوي مقلوب يحمل التراب والنبتة، والسفلي خزّان مي، وفتيل قماش يوصل المي للتراب.',
    difficulty: 'easy',
    estimatedMinutes: 20,
    minAge: 6,
    safetyNotes: 'القصّ يعمله شخص كبير. غطِّ الحافة المقصوصة بشريط لاصق.',
    sortOrder: 10,
    source: 'الطريقة الشائعة (Red Ted Art · The Spruce Crafts · أدلة المكتبات)',
    variantKeys: ['pet-water-500ml', 'pet-water-600ml', 'pet-sports-750ml', 'pet-water-1000ml', 'pet-water-1500ml', 'pet-soda-2000ml'],
    tools: [
      { kind: 'tool', name: 'مقص أو سكين ورق', note: 'للقصّ — بيد شخص كبير.' },
      { kind: 'tool', name: 'قلم تحديد' },
      { kind: 'material', name: 'قنينة بلاستيك نظيفة', quantity: '١', note: '٥٠٠ مل حتى ٢ لتر.' },
      { kind: 'material', name: 'شريط قماش قطني (من تيشيرت قديم)', quantity: '٢–٣ سم عرض × ٢٥ سم طول' },
      { kind: 'material', name: 'تراب زراعة', quantity: 'كوب إلى كوبين' },
      { kind: 'material', name: 'نبتة صغيرة أو بذور', quantity: '١' },
      { kind: 'material', name: 'شريط لاصق', optional: true, note: 'لتغطية الحافة.' },
    ],
    steps: [
      { blueprint: 'clean', title: 'نظّف القنينة', instruction: 'انزع الملصق، واغسل القنينة والغطا بالمي، وخلّيها تنشف تماماً.' },
      { blueprint: 'measure-mark', title: 'علّم خط القصّ', dim: '≈ ثلث الارتفاع', instruction: 'علّم خطاً دائرياً حوالين القنينة على بُعد ثلث ارتفاعها من الغطا تقريباً (قنينة ٥٠٠ مل ≈ ٧ سم من الغطا، قنينة ٢ لتر ≈ ١٥ سم).', tip: 'سنّد القلم على كومة كتب ودوّر القنينة ليطلع الخط مستقيم.' },
      { blueprint: 'cut-around', title: 'اقصّ القنينة نصّين', dim: 'على الخط', instruction: 'شخص كبير يقصّ على الخط بالضبط. بيصير عندك جزء علوي (بالغطا) وجزء سفلي.', warning: 'القصّ للكبار بس.' },
      { blueprint: 'edge', title: 'أمّن الحافة', instruction: 'غطِّ حافة القصّ على القطعتين بشريط لاصق حتى ما تجرح.' },
      { blueprint: 'thread', title: 'ركّب الفتيل', dim: 'نصف داخل · نصف خارج', instruction: 'مرّر شريط القماش من فتحة الغطا: نصفه ينزل داخل الجزء العلوي، ونصفه يتدلّى تحت الغطا.', tip: 'إذا الفتحة صغيرة، افتح الغطا واعمل فيه ثقب ٥ ملّي بمسمار.' },
      { blueprint: 'nest', title: 'اقلب الجزء العلوي داخل السفلي', instruction: 'اقلب الجزء العلوي رأساً على عقب (الغطا للتحت) وحطّه داخل الجزء السفلي مثل القمع.' },
      { blueprint: 'fill-soil', title: 'حطّ التراب والنبتة', instruction: 'عبّي الجزء العلوي تراباً، وامسك الفتيل حتى ما ينطمّ تحت التراب، بعدين ازرع البذور أو النبتة.' },
      { blueprint: 'fill-water', title: 'عبّي الخزّان', dim: 'تحت الرقبة', instruction: 'ارفع الجزء العلوي وصبّ مي بالجزء السفلي حتى يلمس المي طرف الفتيل، وبدون ما يوصل لرقبة القنينة. رجّع الجزء العلوي مكانه.', tip: 'زوّد المي كل كم يوم لمّا يقلّ.' },
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
    variantKeys: ['pet-water-1000ml', 'pet-oil-1000ml', 'pet-water-1500ml', 'pet-soda-2000ml', 'pet-juice-1000ml'],
    tools: [
      { kind: 'tool', name: 'سكين ورق', note: 'للثقوب — بيد شخص كبير.' },
      { kind: 'tool', name: 'قلم تحديد' },
      { kind: 'material', name: 'قنينة نظيفة مع غطاها', quantity: '١', note: '١ لتر حتى ٢ لتر.' },
      { kind: 'material', name: 'ملعقتان خشب طويلتان', quantity: '٢' },
      { kind: 'material', name: 'خيط أو دوبارة', quantity: '٤٠ سم' },
      { kind: 'material', name: 'حَب عصافير', quantity: 'كوب' },
    ],
    steps: [
      { blueprint: 'clean', title: 'نظّف القنينة ونشّفها', instruction: 'اغسل القنينة والغطا، انزع الملصق، وخلّيها تنشف تماماً.' },
      { blueprint: 'holes-body', title: 'علّم مكان الملعقة الأولى', dim: '٥ سم من القاع', instruction: 'على جهتين متقابلتين، علّم نقطتين على ارتفاع ٥ سم من قاع القنينة.' },
      { blueprint: 'insert-rod', title: 'مرّر الملعقة الأولى', instruction: 'شخص كبير يعمل ثقبين صغيرين مكان العلامتين، ثم مرّر ملعقة الخشب حتى تطلع من الجهتين بالتساوي.', warning: 'الثقوب للكبار بس.' },
      { blueprint: 'insert-rod', title: 'مرّر الملعقة الثانية', dim: '٣ سم أعلى · زاوية ٩٠°', instruction: 'علّم ثقبين آخرين على ارتفاع ٣ سم فوق الأولى وبزاوية ربع دورة (متقاطعة معها)، ومرّر الملعقة الثانية.' },
      { blueprint: 'cut-window', title: 'افتح منافذ الحَب', dim: '≈ ١ سم', instruction: 'فوق رأس كل ملعقة مباشرة، وسّع الثقب إلى فتحة صغيرة قطرها ١ سم تقريباً ليخرج منها الحَب.' },
      { blueprint: 'hang', title: 'اعمل معلاقة', dim: 'خيط ٤٠ سم', instruction: 'اعمل ثقبين صغيرين على جهتين قرب الغطا، مرّر الخيط، واعمل عروة.' },
      { blueprint: 'fill-soil', title: 'عبّي الحَب', instruction: 'صبّ حَب العصافير جوّا القنينة من فوق، وسكّر الغطا.' },
      { blueprint: 'hang', title: 'علّقه', instruction: 'علّق المطعم بغصن شجرة، بمكان تقدر تشوفه من الشبّاك وبعيد عن القطط.' },
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
    variantKeys: ['pet-water-500ml', 'pet-water-600ml', 'pet-water-1000ml', 'pet-water-1500ml', 'pet-oil-1000ml'],
    tools: [
      { kind: 'tool', name: 'سكين ورق', note: 'للشقّ — بيد شخص كبير.' },
      { kind: 'tool', name: 'قلم تحديد' },
      { kind: 'material', name: 'قنينة نظيفة مع غطاها', quantity: '١' },
      { kind: 'material', name: 'ورق ملوّن ولاصق، أو دهان', quantity: '١', optional: true, note: 'للتزيين.' },
    ],
    steps: [
      { blueprint: 'clean', title: 'نظّف القنينة ونشّفها', instruction: 'اغسل القنينة والغطا، انزع الملصق، ونشّفها. خلّي الغطا مسكّراً.' },
      { blueprint: 'measure-mark', title: 'علّم الشقّ', dim: '٣ سم × ٤ ملّي', instruction: 'ضع القنينة على جنبها. على الجهة اللي لفوق، علّم مستطيلاً رفيعاً: طوله ٣ سم وعرضه ٣–٤ ملّي (أطول شوي من أكبر قرش عندك).' },
      { blueprint: 'cut-window', title: 'اقصّ الشقّ', instruction: 'شخص كبير يقصّ على المستطيل بسكين الورق ليصير شقّاً.', warning: 'القصّ للكبار بس.' },
      { blueprint: 'generic', title: 'جرّب قرشاً', dim: 'وسّع ١–٢ ملّي', instruction: 'جرّب تدخّل أكبر قرش من الشقّ. إذا كان ضيّقاً، وسّعه ١–٢ ملّي فقط.' },
      { blueprint: 'decorate', title: 'زيّنها', instruction: 'لفّ القنينة بورق ملوّن أو ادهنها، وخلّي الشقّ مكشوفاً.' },
      { blueprint: 'stand', title: 'ابدأ توفّر', instruction: 'نزّل القروش من الشقّ. لتفريغها، افتح الغطا فقط.' },
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
    variantKeys: ['pet-water-500ml', 'pet-water-600ml', 'pet-sports-750ml', 'pet-water-1000ml', 'pet-oil-1000ml'],
    tools: [
      { kind: 'tool', name: 'مقص أو سكين ورق', note: 'للقصّ — بيد شخص كبير.' },
      { kind: 'tool', name: 'قلم تحديد' },
      { kind: 'material', name: 'قنينة بلاستيك نظيفة', quantity: '١', note: '٥٠٠ مل حتى ١ لتر.' },
      { kind: 'material', name: 'شريط ملوّن أو دهان', quantity: '١', optional: true },
    ],
    steps: [
      { blueprint: 'clean', title: 'نظّف القنينة', instruction: 'اغسل القنينة، انزع الملصق، ونشّفها.' },
      { blueprint: 'measure-mark', title: 'حدّد الارتفاع', dim: 'طول القلم − ٢ سم', instruction: 'حطّ أطول قلم عندك جنب القنينة، وعلّم خطاً دائرياً على ارتفاع = طول القلم ناقص ٢ سم (عادةً ١٠ إلى ١٣ سم من القاع).', tip: 'دوّر القنينة على قلم ثابت ليطلع الخط منظّماً.' },
      { blueprint: 'cut-around', title: 'اقصّ الجزء العلوي', dim: 'على الخط', instruction: 'شخص كبير يقصّ على الخط بالضبط. احتفظ بالجزء السفلي.', warning: 'القصّ للكبار بس.' },
      { blueprint: 'edge', title: 'أمّن الحافة', instruction: 'اطوِ الحافة المقصوصة للخارج، أو غطّيها بشريط لاصق.' },
      { blueprint: 'holes-body', title: 'ثقب تصريف (اختياري)', instruction: 'إذا رح توقّف فيها فُرَشاً رطبة، اعمل ثقباً صغيراً بالقاع ليخرج المي.' },
      { blueprint: 'decorate', title: 'زيّنها', instruction: 'لفّ العلبة بشريط ملوّن أو ادهنها وخلّيها تنشف.' },
      { blueprint: 'stand', title: 'استعملها', instruction: 'وقّف أقلامك وأدواتك جوّاها على المكتب.' },
    ],
  },
];
