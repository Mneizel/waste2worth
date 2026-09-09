// Arabic-first content for the prototype. The generator (scripts/build-data.ts)
// turns this into src/data/catalogue.ts + the step blueprints in src/data/media.ts.

export type BlueprintKind =
  | 'clean'
  | 'peel-label'
  | 'measure-mark'
  | 'cut-around'
  | 'cut-window'
  | 'holes-cap'
  | 'holes-body'
  | 'thread'
  | 'insert-rod'
  | 'fill-soil'
  | 'fill-water'
  | 'invert'
  | 'nest'
  | 'hang'
  | 'decorate'
  | 'twist-fins'
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

const WATER = [
  'pet-water-250ml',
  'pet-softdrink-330ml',
  'pet-water-500ml',
  'pet-water-600ml',
  'pet-sports-750ml',
  'pet-water-1000ml',
  'pet-water-1500ml',
  'pet-soda-2000ml',
];

export const IDEAS_AR: ContentIdea[] = [
  {
    slug: 'self-watering-planter',
    title: 'مزهرية تسقي نفسها',
    summary:
      'حوّل القنينة لمزهرية فيها خزّان مي بالأسفل، والنبتة تشرب لحالها لمّا تحتاج.',
    difficulty: 'easy',
    estimatedMinutes: 20,
    minAge: 6,
    safetyNotes: 'القصّ يعمله شخص كبير. غطِّ الحواف المقصوصة بشريط لاصق حتى ما تجرح.',
    sortOrder: 10,
    variantKeys: ['pet-water-500ml', 'pet-water-600ml', 'pet-sports-750ml', 'pet-water-1000ml', 'pet-water-1500ml', 'pet-soda-2000ml'],
    tools: [
      { kind: 'tool', name: 'مقص أو سكين ورق', note: 'لقصّ القنينة.' },
      { kind: 'tool', name: 'قلم تحديد' },
      { kind: 'material', name: 'القنينة البلاستيك نظيفة', quantity: '١' },
      { kind: 'material', name: 'خيط قطن أو رباط حذاء قديم', quantity: '١٥ سم' },
      { kind: 'material', name: 'تراب زراعة', quantity: 'حفنتين' },
      { kind: 'material', name: 'نبتة صغيرة أو بذور', quantity: '١' },
      { kind: 'material', name: 'شريط لاصق', optional: true, note: 'لتغطية الحواف.' },
    ],
    steps: [
      { blueprint: 'clean', title: 'نظّف القنينة', instruction: 'شيل الورقة اللاصقة واغسل القنينة بالمي وخلّيها تنشف.' },
      { blueprint: 'measure-mark', title: 'علّم النص', instruction: 'ارسم خط دائري حوالين القنينة بالنص بالقلم.', tip: 'سنّد القلم على كومة كتب ودوّر القنينة حتى يطلع الخط مستقيم.' },
      { blueprint: 'cut-around', title: 'قصّ القنينة لنصّين', instruction: 'شخص كبير يقصّ على الخط، فيصير عندك جزء فوق وجزء تحت.', warning: 'هاي الخطوة للكبار بس.' },
      { blueprint: 'decorate', title: 'غطِّ الحواف', instruction: 'حطّ شريط لاصق على الحواف المقصوصة حتى ما تكون حادّة.' },
      { blueprint: 'thread', title: 'ركّب الفتيل', instruction: 'مرّر الخيط من فتحة الغطا: نصّه ينزل داخل القنينة ونصّه يتدلّى تحت.', tip: 'إذا ما في فتحة، شخص كبير يعمل ثقب صغير بالغطا.' },
      { blueprint: 'invert', title: 'اقلب الجزء العلوي', instruction: 'حطّ الجزء العلوي مقلوب داخل الجزء السفلي، مثل القمع.' },
      { blueprint: 'fill-soil', title: 'حطّ التراب والنبتة', instruction: 'عبّي الجزء العلوي تراب وازرع البذور أو النبتة الصغيرة.' },
      { blueprint: 'fill-water', title: 'عبّي الخزّان', instruction: 'صبّ مي بالجزء السفلي حتى يلمس الخيط المي. صار النبات يشرب لحاله.', tip: 'زوّد المي لمّا تشوف الخزّان فاضي.' },
    ],
  },
  {
    slug: 'bird-feeder',
    title: 'مطعم عصافير معلّق',
    summary: 'مطعم بسيط يتعلّق بشجرة، والعصافير توصل للحَب من فتحتين صغيرتين.',
    difficulty: 'easy',
    estimatedMinutes: 25,
    minAge: 7,
    safetyNotes: 'الثقوب يعملها شخص كبير. علّقه بمكان بعيد عن القطط.',
    sortOrder: 20,
    variantKeys: ['pet-water-500ml', 'pet-water-600ml', 'pet-water-1000ml', 'pet-water-1500ml', 'pet-soda-2000ml'],
    tools: [
      { kind: 'tool', name: 'مقص أو سكين ورق' },
      { kind: 'tool', name: 'قلم رصاص', note: 'لعمل ثقوب المسند.' },
      { kind: 'material', name: 'قنينة نظيفة مع غطاها', quantity: '١' },
      { kind: 'material', name: 'ملعقتين خشب أو عودين', quantity: '٢' },
      { kind: 'material', name: 'خيط', quantity: '٤٠ سم' },
      { kind: 'material', name: 'حَب عصافير', quantity: 'كوب' },
    ],
    steps: [
      { blueprint: 'clean', title: 'نظّف القنينة ونشّفها', instruction: 'اغسل القنينة والغطا، شيل الورقة اللاصقة، وخلّيها تنشف تماماً.' },
      { blueprint: 'holes-body', title: 'علّم ثقبين قرب القاع', instruction: 'ارسم دائرة صغيرة على كل جهة من القنينة، قريب من القاع.' },
      { blueprint: 'holes-body', title: 'اعمل الثقوب', instruction: 'شخص كبير يقصّ الثقبين مكان ما علّمت.', warning: 'القصّ للكبار بس.' },
      { blueprint: 'insert-rod', title: 'مرّر المسند', instruction: 'دخّل ملعقة الخشب من الثقبين حتى تطلع من الجهتين ليقف عليها العصفور.' },
      { blueprint: 'insert-rod', title: 'ضيف مسند ثاني أعلى', instruction: 'اعمل ثقبين آخرين أعلى، بزاوية ربع دورة، ومرّر الملعقة الثانية.' },
      { blueprint: 'cut-window', title: 'افتح منافذ الأكل', instruction: 'فوق كل مسند بقليل، اقصّ فتحة صغيرة بحجم قطعة نقود ليخرج منها الحَب.' },
      { blueprint: 'fill-soil', title: 'عبّي الحَب', instruction: 'صبّ حَب العصافير جوّا القنينة من فوق وسكّر الغطا.' },
      { blueprint: 'hang', title: 'علّقه', instruction: 'اربط الخيط حوالين رقبة القنينة وعلّقه بغصن شجرة.', tip: 'علّقه مكان تقدر تشوفه من الشبّاك.' },
    ],
  },
  {
    slug: 'pen-pot-organizer',
    title: 'علبة أقلام للمكتب',
    summary: 'علبة سريعة للأقلام والمقص، من قاع القنينة.',
    difficulty: 'easy',
    estimatedMinutes: 15,
    minAge: 6,
    safetyNotes: 'القصّ يعمله شخص كبير. غطِّ الحافة بشريط أو اطوِها للخارج.',
    sortOrder: 30,
    variantKeys: ['pet-water-500ml', 'pet-water-600ml', 'pet-sports-750ml', 'pet-water-1000ml'],
    tools: [
      { kind: 'tool', name: 'مقص أو سكين ورق' },
      { kind: 'tool', name: 'قلم تحديد' },
      { kind: 'material', name: 'القنينة البلاستيك نظيفة', quantity: '١' },
      { kind: 'material', name: 'شريط ملوّن أو دهان', quantity: '١', optional: true, note: 'للتزيين.' },
    ],
    steps: [
      { blueprint: 'clean', title: 'نظّف القنينة', instruction: 'اغسل القنينة، شيل الورقة، ونشّفها.' },
      { blueprint: 'measure-mark', title: 'اختَر الارتفاع', instruction: 'قرّر شو ارتفاع العلبة. حوالي ١٠ سم مناسب للأقلام.' },
      { blueprint: 'measure-mark', title: 'ارسم خط القصّ', instruction: 'ارسم خط دائري حوالين القنينة عند هذا الارتفاع.', tip: 'دوّر القنينة على قلم ثابت ليطلع الخط منظّم.' },
      { blueprint: 'cut-around', title: 'اقصّ الجزء العلوي', instruction: 'شخص كبير يقصّ على الخط. احتفظ بالجزء السفلي.', warning: 'القصّ للكبار بس.' },
      { blueprint: 'decorate', title: 'أمّن الحافة', instruction: 'اطوِ الحافة المقصوصة للخارج أو غطّيها بشريط لاصق.' },
      { blueprint: 'decorate', title: 'زيّنها', instruction: 'لفّ العلبة بشريط ملوّن أو ادهنها وخلّيها تنشف.' },
      { blueprint: 'stand', title: 'عبّيها', instruction: 'وقّف أقلامك جوّاها.' },
    ],
  },
  {
    slug: 'coin-bank',
    title: 'حصّالة نقود',
    summary: 'حصّالة شفّافة. تنزّل القروش من شقّ قرب الغطا وتشوفها تتجمّع.',
    difficulty: 'easy',
    estimatedMinutes: 20,
    minAge: 6,
    safetyNotes: 'شقّ النقود يعمله شخص كبير.',
    sortOrder: 40,
    variantKeys: ['pet-water-500ml', 'pet-water-600ml', 'pet-water-1000ml', 'pet-water-1500ml'],
    tools: [
      { kind: 'tool', name: 'سكين ورق', note: 'لشقّ النقود.' },
      { kind: 'tool', name: 'قلم تحديد' },
      { kind: 'material', name: 'قنينة نظيفة مع غطاها', quantity: '١' },
      { kind: 'material', name: 'ورق ولاصق، أو دهان', quantity: '١', optional: true, note: 'للتزيين.' },
    ],
    steps: [
      { blueprint: 'clean', title: 'نظّف القنينة ونشّفها', instruction: 'اغسل القنينة والغطا، شيل الورقة، ونشّفها.' },
      { blueprint: 'generic', title: 'خلّي القنينة كاملة', instruction: 'ما رح تقصّها نصّين. خلّي الغطا مكانه.' },
      { blueprint: 'measure-mark', title: 'علّم شقّ النقود', instruction: 'على كتف القنينة، ارسم مستطيل رفيع أطول شوي من أكبر قرش عندك.' },
      { blueprint: 'cut-window', title: 'اقصّ الشقّ', instruction: 'شخص كبير يقصّ على المستطيل ليصير شقّ.', warning: 'القصّ للكبار بس.' },
      { blueprint: 'generic', title: 'جرّب قرش', instruction: 'جرّب تدخّل قرش. كبّر الشقّ شوي إذا كان ضيّق.' },
      { blueprint: 'decorate', title: 'زيّنها', instruction: 'لفّ القنينة بورق أو ادهنها. خلّي الشقّ مكشوف.' },
      { blueprint: 'stand', title: 'ابدأ توفّر', instruction: 'نزّل القروش من الشقّ. لتفريغها، افتح الغطا بس.' },
    ],
  },
  {
    slug: 'watering-can',
    title: 'رشّاشة نباتات صغيرة',
    summary: 'اثقب الغطا ثقوب صغيرة، وتصير القنينة رشّاشة لطيفة للنباتات.',
    difficulty: 'easy',
    estimatedMinutes: 10,
    minAge: 6,
    safetyNotes: 'الثقوب يعملها شخص كبير بمسمار أو دبّوس سميك.',
    sortOrder: 50,
    variantKeys: ['pet-water-1000ml', 'pet-water-1500ml', 'pet-soda-2000ml', 'pet-juice-1000ml'],
    tools: [
      { kind: 'tool', name: 'مسمار أو دبّوس سميك', note: 'لعمل الثقوب.' },
      { kind: 'tool', name: 'شاكوش', optional: true, note: 'لدقّ المسمار.' },
      { kind: 'material', name: 'قنينة نظيفة مع غطاها', quantity: '١' },
    ],
    steps: [
      { blueprint: 'clean', title: 'نظّف القنينة', instruction: 'اغسل القنينة والغطا منيح، خصوصاً إذا كانت لعصير أو حليب.' },
      { blueprint: 'holes-cap', title: 'شيل الغطا', instruction: 'فكّ الغطا وحطّه على لوح خشب.' },
      { blueprint: 'holes-cap', title: 'اعمل الثقوب', instruction: 'شخص كبير يدقّ المسمار بالغطا من ٨ إلى ١٢ مرة ليعمل ثقوب صغيرة.', warning: 'للكبار بس.' },
      { blueprint: 'fill-water', title: 'عبّي مي', instruction: 'عبّي القنينة مي من الحنفيّة.' },
      { blueprint: 'holes-cap', title: 'رجّع الغطا', instruction: 'سكّر الغطا المثقوب على القنينة المليانة.' },
      { blueprint: 'generic', title: 'اسقِ نباتاتك', instruction: 'اقلب القنينة فوق النبات واعصرها بهدوء. المي يطلع مثل الشتا الخفيف.', tip: 'فكّ الغطا شوي إذا بدك تدفق أسرع.' },
    ],
  },
  {
    slug: 'drip-irrigation-spike',
    title: 'سقّاية تنقيط بطيئة',
    summary: 'قنينة مقلوبة مغروزة بالتراب تسقي نبتة وحدة بالتنقيط لأيام.',
    difficulty: 'easy',
    estimatedMinutes: 10,
    minAge: 7,
    safetyNotes: 'الثقوب يعملها شخص كبير.',
    sortOrder: 60,
    variantKeys: ['pet-water-500ml', 'pet-water-600ml', 'pet-water-1000ml', 'pet-water-1500ml'],
    tools: [
      { kind: 'tool', name: 'مسمار رفيع أو دبّوس' },
      { kind: 'material', name: 'قنينة نظيفة مع غطاها', quantity: '١' },
    ],
    steps: [
      { blueprint: 'clean', title: 'نظّف القنينة', instruction: 'اغسل القنينة والغطا وشيل الورقة اللاصقة.' },
      { blueprint: 'holes-cap', title: 'ثقوب صغيرة بالغطا', instruction: 'شخص كبير يعمل من ٢ إلى ٤ ثقوب صغيرة جداً بالغطا.', warning: 'للكبار بس.' },
      { blueprint: 'holes-body', title: 'ثقب قرب القاع', instruction: 'اعمل ثقب صغير بقاع القنينة ليدخل الهوا.' },
      { blueprint: 'fill-water', title: 'عبّي مي', instruction: 'عبّي القنينة مي وسكّر الغطا.' },
      { blueprint: 'invert', title: 'اغرزها بالتراب', instruction: 'اقلب القنينة وادفع طرف الغطا بالتراب جنب نبتتك.', tip: 'اكبس التراب حوالينها حتى تقف.' },
      { blueprint: 'generic', title: 'خلّيها تشتغل', instruction: 'المي بينقّط ببطء خلال أيام. عبّيها لمّا تفضى.' },
    ],
  },
  {
    slug: 'kids-bowling-set',
    title: 'طقم بولينغ من القناني',
    summary: 'ست قناني تصير قوارير بولينغ. حطّ فيها شوي مي حتى تثبت واضربها بكرة.',
    difficulty: 'easy',
    estimatedMinutes: 30,
    minAge: 5,
    safetyNotes: 'خلّي الأغطية محكمة حتى ما تسكب مي. العب بعيد عن الدرج.',
    sortOrder: 70,
    variantKeys: ['pet-water-500ml', 'pet-water-600ml', 'pet-softdrink-330ml'],
    tools: [
      { kind: 'material', name: 'قناني نظيفة مع أغطية', quantity: '٦' },
      { kind: 'material', name: 'كرة صغيرة طريّة', quantity: '١' },
      { kind: 'material', name: 'شريط ملوّن أو دهان', quantity: '١', optional: true },
      { kind: 'material', name: 'مي أو رمل', quantity: 'شوي', note: 'للثقل.' },
    ],
    steps: [
      { blueprint: 'clean', title: 'نظّف ست قناني', instruction: 'اغسل ست قناني وأغطيتها وشيل الورق اللاصق.' },
      { blueprint: 'fill-water', title: 'ضيف ثقل بسيط', instruction: 'حطّ كم سنتيمتر مي أو رمل ناشف بكل قنينة حتى ما تقع بسهولة.' },
      { blueprint: 'holes-cap', title: 'سكّرها محكم', instruction: 'سكّر كل غطا منيح. تأكّد ما في تسريب.' },
      { blueprint: 'decorate', title: 'زيّن القوارير', instruction: 'لفّ كل قنينة بشريط ملوّن أو اكتب عليها أرقام.' },
      { blueprint: 'stand', title: 'رتّبها مثلث', instruction: 'وقّف القناني بشكل مثلث: وحدة قدّام، بعدين ثنتين، بعدين ثلاثة.' },
      { blueprint: 'generic', title: 'دحرج الكرة', instruction: 'ارجع كم خطوة ودحرج الكرة حتى توقّع القوارير.', tip: 'عُدّ كم قارورة وقّعت كل دور.' },
    ],
  },
  {
    slug: 'wind-spinner',
    title: 'دوّارة رياح للحديقة',
    summary: 'اقصّ زعانف بالقنينة حتى تدور وتلمع لمّا تهبّ الريح.',
    difficulty: 'medium',
    estimatedMinutes: 35,
    minAge: 8,
    safetyNotes: 'كل القصّ يعمله شخص كبير. زوايا الزعانف حادّة — قصّها مدوّرة.',
    sortOrder: 80,
    variantKeys: ['pet-water-500ml', 'pet-water-600ml', 'pet-sports-750ml'],
    tools: [
      { kind: 'tool', name: 'سكين ورق' },
      { kind: 'tool', name: 'مقص' },
      { kind: 'tool', name: 'قلم تحديد' },
      { kind: 'material', name: 'قنينة نظيفة مع غطاها', quantity: '١' },
      { kind: 'material', name: 'خيط', quantity: '٣٠ سم' },
      { kind: 'material', name: 'ملصقات عاكسة أو دهان', quantity: '١', optional: true },
    ],
    steps: [
      { blueprint: 'clean', title: 'نظّف القنينة', instruction: 'اغسل القنينة ونشّفها. خلّي الغطا مكانه.' },
      { blueprint: 'measure-mark', title: 'ارسم خطوط الزعانف', instruction: 'ارسم من ٦ إلى ٨ خطوط مستقيمة بطول الجزء الأوسط من القنينة، متباعدة بالتساوي.' },
      { blueprint: 'twist-fins', title: 'اقصّ الزعانف', instruction: 'شخص كبير يقصّ على كل خط، بالجزء الأوسط بس، مش الطرفين.', warning: 'القصّ للكبار بس.' },
      { blueprint: 'twist-fins', title: 'لوِّ الزعانف', instruction: 'ادفع أعلى وأسفل القنينة لبعض بهدوء ولفّ شوي حتى تنثني الزعانف للخارج.' },
      { blueprint: 'decorate', title: 'دوّر الزوايا', instruction: 'قصّ الزوايا الحادّة من كل زعنفة بالمقص.' },
      { blueprint: 'decorate', title: 'زيّنها', instruction: 'حطّ ملصقات عاكسة أو دهان حتى تعكس الضو.' },
      { blueprint: 'hang', title: 'اعمل معلاقة', instruction: 'شخص كبير يعمل ثقب صغير بالقاع. مرّر الخيط واعمل عروة.' },
      { blueprint: 'hang', title: 'علّقها برّا', instruction: 'علّق الدوّارة بغصن أو خطّاف مكان توصله الريح.' },
    ],
  },
  {
    slug: 'vertical-herb-garden',
    title: 'حديقة أعشاب معلّقة',
    summary: 'قناني ممدّدة على جنبها ومعلّقة بصفّ تصير حديقة حائط صغيرة للأعشاب.',
    difficulty: 'medium',
    estimatedMinutes: 40,
    minAge: 9,
    safetyNotes: 'الفتحات والثقوب يعملها شخص كبير. علّقها على خطّاف قوي.',
    sortOrder: 90,
    variantKeys: ['pet-water-1500ml', 'pet-soda-2000ml', 'pet-juice-1000ml'],
    tools: [
      { kind: 'tool', name: 'سكين ورق' },
      { kind: 'tool', name: 'قلم تحديد' },
      { kind: 'tool', name: 'مسمار', note: 'لثقوب التصريف والحبل.' },
      { kind: 'material', name: 'قناني نظيفة مع أغطية', quantity: '٣' },
      { kind: 'material', name: 'حبل أو دوبارة قوية', quantity: '٢ متر' },
      { kind: 'material', name: 'تراب زراعة', quantity: '٣ حفنات' },
      { kind: 'material', name: 'شتلات أعشاب أو بذور', quantity: '٣' },
    ],
    steps: [
      { blueprint: 'clean', title: 'نظّف القناني', instruction: 'اغسل ثلاث قناني وأغطيتها وشيل الورق اللاصق.' },
      { blueprint: 'generic', title: 'مدّد القنينة على جنبها', instruction: 'حطّ الغطا ومدّد القنينة. جهة الغطا رح تكون للجنب لمّا تتعلّق.' },
      { blueprint: 'measure-mark', title: 'ارسم فتحة طويلة', instruction: 'على الجهة اللي لفوق، ارسم مستطيل كبير، وخلّي طرفي القنينة بدون قصّ.' },
      { blueprint: 'cut-window', title: 'اقصّ الفتحة', instruction: 'شخص كبير يقصّ المستطيل. من هون يدخل التراب والنبتة.', warning: 'القصّ للكبار بس.' },
      { blueprint: 'holes-body', title: 'ثقوب تصريف', instruction: 'اعمل ٣ أو ٤ ثقوب صغيرة على الجهة المقابلة ليخرج المي الزايد.' },
      { blueprint: 'holes-body', title: 'ثقوب الحبل', instruction: 'قرب كل طرف من القنينة، اعمل ثقبين ليمرّ منهم الحبل.' },
      { blueprint: 'thread', title: 'مرّر الحبل', instruction: 'مرّر الحبل من ثقوب أطراف القناني الثلاثة حتى تتعلّق فوق بعض مع فراغات.' },
      { blueprint: 'fill-soil', title: 'عبّي وازرع', instruction: 'ضيف تراب من الفتحة وازرع عشبة وحدة بكل قنينة.' },
      { blueprint: 'hang', title: 'علّق واسقِ', instruction: 'علّق الحبل على خطّاف قوي بمكان مشمس واسقِ برفق.' },
    ],
  },
  {
    slug: 'phone-charging-holder',
    title: 'حامل شحن للجوّال',
    summary: 'رفّ صغير يتعلّق على مقبس الكهربا ويمسك الجوّال وهو يشحن.',
    difficulty: 'medium',
    estimatedMinutes: 25,
    minAge: 9,
    safetyNotes: 'القصّ يعمله شخص كبير. خلّي الحامل بعيد عن المي والحرارة.',
    sortOrder: 100,
    variantKeys: ['pet-water-1000ml', 'pet-oil-1000ml', 'hdpe-milk-1000ml'],
    tools: [
      { kind: 'tool', name: 'سكين ورق' },
      { kind: 'tool', name: 'مقص' },
      { kind: 'tool', name: 'قلم تحديد' },
      { kind: 'material', name: 'القنينة البلاستيك نظيفة', quantity: '١' },
      { kind: 'material', name: 'ورق صنفرة أو مبرد أظافر', quantity: '١', optional: true, note: 'لتنعيم الحواف.' },
      { kind: 'material', name: 'شريط ملوّن', quantity: '١', optional: true },
    ],
    steps: [
      { blueprint: 'clean', title: 'نظّف القنينة ونشّفها', instruction: 'اغسل القنينة منيح ونشّفها. شيل الورقة اللاصقة.' },
      { blueprint: 'measure-mark', title: 'علّم الشكل', instruction: 'ارسم على جنب القنينة شكل له ظهر عالي وجيب أمامي منخفض، مثل صينية الرسائل.' },
      { blueprint: 'cut-window', title: 'اقصّ الحامل', instruction: 'شخص كبير يقصّ على الخط حتى يصير عندك جيب مفتوح مع ظهر عالي.', warning: 'القصّ للكبار بس.' },
      { blueprint: 'decorate', title: 'نعّم الحواف', instruction: 'افرك الحواف المقصوصة بورق الصنفرة أو غطّيها بشريط.' },
      { blueprint: 'holes-body', title: 'اعمل فتحة للقابس', instruction: 'بالظهر العالي، اقصّ فتحة تكفّي ليمرّ منها قابس الشاحن.' },
      { blueprint: 'decorate', title: 'زيّنها', instruction: 'لفّ الحامل بشريط ملوّن أو ارسم عليه.' },
      { blueprint: 'stand', title: 'علّقه على الشاحن', instruction: 'مرّر قابس الشاحن من الفتحة وحطّه بالمقبس. سنّد الجوّال بالجيب.', tip: 'تأكّد إنه الجوّال قاعد بدون ما يشدّ السلك.' },
    ],
  },
];

export const WATER_BOTTLE_KEYS = WATER;
