// Arabic content for the "can" category — same rules as content.ts (bottle):
// every idea follows a real, published method (source named), wording and
// diagrams are ours. Steps carry a CanOp (drives src/components/canSvg.ts)
// and an optional CanMeasureId (src/data/canMeasure.ts) for computed sizes.

import type { CanOp } from '../components/canSvg';
import type { CanMeasureId } from './canMeasure';
import type { ContentIdea } from './content';

/** Arabic labels for the can catalogue (keyed by the seed `key`). */
export const CAN_VARIANT_LABELS_AR: Record<string, string> = {
  'can-energy-250ml': 'علبة مشروب طاقة نحيلة (٢٥٠ مل)',
  'can-soda-330ml': 'علبة مشروب غازي عادية (٣٣٠ مل)',
  'can-soda-355ml': 'علبة مشروب غازي (٣٥٥ مل)',
  'can-beer-440ml': 'علبة مشروب (٤٤٠ مل)',
  'can-tallboy-473ml': 'علبة طويلة (٤٧٣ مل)',
  'can-food-small-155ml': 'علبة معلّبات صغيرة (١٥٥ مل)',
  'can-food-standard-425ml': 'علبة معلّبات عادية (٤٢٥ مل)',
  'can-food-large-850ml': 'علبة معلّبات كبيرة (٨٥٠ مل)',
  'can-coffee-tin-500ml': 'علبة قهوة بغطا بلاستيك (٥٠٠ مل)',
};

export const CAN_IDEAS_AR: ContentIdea<CanOp, CanMeasureId>[] = [
  {
    slug: 'can-pencil-organizer',
    title: 'منظّم أقلام ومكتب',
    summary: 'علبة معدنية تنفتح من فوق وتتنضّف حافتها، تصير علبة تنظّم الأقلام وأدوات المكتب.',
    difficulty: 'easy',
    estimatedMinutes: 15,
    minAge: 6,
    safetyNotes: 'فتح الغطا وتنعيم الحافة يعملهم شخص كبير — حافة المعدن حادّة.',
    sortOrder: 10,
    source: 'الطريقة الشائعة (wikiHow · The Spruce Crafts)',
    variantKeys: ['can-food-standard-425ml', 'can-food-large-850ml', 'can-coffee-tin-500ml'],
    tools: [
      { kind: 'tool', name: 'فتّاحة علب', note: 'لفتح الغطا — بيد شخص كبير.' },
      { kind: 'tool', name: 'صنفرة أو شريط لاصق', note: 'لتنعيم الحافة.' },
      { kind: 'material', name: 'علبة معدنية فاضية ونظيفة', quantity: '١' },
      { kind: 'material', name: 'شريط ملوّن أو ورق لاصق', quantity: '١', optional: true },
    ],
    steps: [
      { op: 'clean', title: 'نظّف العلبة', instruction: 'اشطف العلبة منيح واقلع الملصق، وخلّيها تنشف تماماً.' },
      { op: 'open-top', title: 'افتح الغطا بالكامل', instruction: 'شخص كبير يفتح الغطا العلوي بالكامل بفتّاحة العلب حتى يصير فوهة مفتوحة.', warning: 'الفتح للكبار بس — حافة الغطا حادّة.' },
      { op: 'smooth-rim', title: 'نعّم الحافة', instruction: 'غطِّ حافة الفتحة بشريط لاصق سميك حوالين الدوران، أو انعّمها بالصنفرة حتى ما تجرح الإيد.' },
      { op: 'decorate', title: 'زيّنها', instruction: 'لفّ العلبة بشريط ملوّن أو ورق لاصق من برّا.' },
      { op: 'use-pens', title: 'استعملها', instruction: 'وقّف فيها أقلامك ومقصّك وأدواتك على المكتب.' },
    ],
  },
  {
    slug: 'can-punched-lantern',
    title: 'فانوس علبة بثقوب',
    summary: 'صفّ ثقوب صغيرة حوالين العلبة يطلع منها ضو الشمعة بشكل زخرفي جميل بالليل.',
    difficulty: 'medium',
    estimatedMinutes: 30,
    minAge: 8,
    safetyNotes: 'الثقب يعمله شخص كبير بمسمار ومطرقة. استعمل شمعة LED صغيرة بدل شمعة حقيقية إذا ممكن.',
    sortOrder: 20,
    source: 'طريقة الفانوس المثقوب الشائعة (Instructables)',
    variantKeys: ['can-soda-330ml', 'can-soda-355ml', 'can-tallboy-473ml', 'can-food-standard-425ml'],
    tools: [
      { kind: 'tool', name: 'مسمار ومطرقة', note: 'للثقب — بيد شخص كبير.' },
      { kind: 'tool', name: 'قلم تحديد' },
      { kind: 'material', name: 'علبة معدنية فاضية ونظيفة', quantity: '١' },
      { kind: 'material', name: 'شمعة صغيرة أو LED', quantity: '١' },
      { kind: 'material', name: 'شريط ملوّن', quantity: '١', optional: true },
    ],
    steps: [
      { op: 'clean', title: 'نظّف العلبة ونشّفها', instruction: 'اشطف العلبة واقلع الملصق. ممكن تعبّيها ماء وتحطّها بالفريزر ساعتين حتى يصير الثلج يثبّت الشكل ويسهّل الثقب.' },
      { op: 'mark-holes', measure: 'can-lantern-holes', title: 'علّم مكان الثقوب', instruction: 'بالقلم، علّم نقاط الثقوب حوالين العلبة بالمكان المبيّن بالمخطّط — صفّ واحد أو أكتر بأي شكل يعجبك.' },
      { op: 'punch-holes', measure: 'can-lantern-holes', title: 'اثقب النقاط', instruction: 'شخص كبير يثقب كل نقطة بمسمار ومطرقة بلطف.', warning: 'الثقب للكبار بس، ويفضّل والعلبة فيها ثلج حتى ما تتعوّج.' },
      { op: 'decorate', title: 'نعّم ولوّن الحافة', instruction: 'نعّم حافة الفتحة العلوية بشريط لاصق، ولوّن العلبة من برّا إذا حبّيت.' },
      { op: 'fill-candle', title: 'حطّ الشمعة', instruction: 'حطّ شمعة صغيرة أو LED جوّا العلبة واولعها بالليل ليطلع الضو من الثقوب.' },
    ],
  },
  {
    slug: 'can-succulent-planter',
    title: 'إصيص للنباتات الصغيرة',
    summary: 'علبة معدنية فيها ثقوب تصريف بالقاع، تصير إصيص نباتات صغيرة أو صبّار على طاولة المطبخ.',
    difficulty: 'easy',
    estimatedMinutes: 15,
    minAge: 7,
    safetyNotes: 'الثقب بالقاع يعمله شخص كبير.',
    sortOrder: 30,
    source: 'طريقة أواني النباتات من علب معدنية (The Spruce Crafts)',
    variantKeys: ['can-food-small-155ml', 'can-food-standard-425ml', 'can-food-large-850ml'],
    tools: [
      { kind: 'tool', name: 'مسمار ومطرقة', note: 'لثقب القاع — بيد شخص كبير.' },
      { kind: 'material', name: 'علبة معدنية فاضية ونظيفة', quantity: '١' },
      { kind: 'material', name: 'تراب زراعة', quantity: 'حسب حجم العلبة' },
      { kind: 'material', name: 'نبتة صغيرة أو صبّار', quantity: '١' },
      { kind: 'material', name: 'دهان أو شريط ملوّن', quantity: '١', optional: true },
    ],
    steps: [
      { op: 'clean', title: 'نظّف العلبة', instruction: 'اشطف العلبة، اقلع الملصق، وخلّيها تنشف. الغطا العلوي بيكون مفتوح أصلاً من الاستهلاك.' },
      { op: 'mark-holes', measure: 'can-planter-drain', title: 'علّم ثقوب التصريف', instruction: 'اقلب العلبة وعلّم ٢-٣ نقاط بقاعها بالمكان المبيّن بالمخطّط.' },
      { op: 'punch-holes', measure: 'can-planter-drain', title: 'اثقب التصريف', instruction: 'شخص كبير يثقب النقاط بمسمار ومطرقة ليصرف الماء الزايد.', warning: 'الثقب للكبار بس.' },
      { op: 'decorate', title: 'زيّنها', instruction: 'ادهن العلبة من برّا أو لفّها بشريط ملوّن، وخلّيها تنشف.' },
      { op: 'fill-soil', title: 'حطّ التراب والنبتة', instruction: 'عبّي العلبة تراباً لحد قبل الحافة بشوي، وازرع النبتة أو الصبّار.' },
    ],
  },
  {
    slug: 'can-wind-chime',
    title: 'جرس هوا من علب معدنية',
    summary: 'كم علبة معلّقة بأطوال مختلفة، بتصدر رنين خفيف كل ما الهوا يحرّكها.',
    difficulty: 'medium',
    estimatedMinutes: 30,
    minAge: 8,
    safetyNotes: 'الثقب يعمله شخص كبير. حواف الفتحات لازم تتغطّى بشريط.',
    sortOrder: 40,
    source: 'طريقة جرس الهوا من العلب الشائعة (Instructables · All Free Crafts)',
    variantKeys: ['can-soda-330ml', 'can-soda-355ml', 'can-food-standard-425ml'],
    tools: [
      { kind: 'tool', name: 'مسمار ومطرقة', note: 'للثقب — بيد شخص كبير.' },
      { kind: 'material', name: '٤-٦ علب معدنية فاضية ونظيفة', quantity: '٤-٦' },
      { kind: 'material', name: 'خيط أو دوبارة', quantity: 'حسب الطول' },
      { kind: 'material', name: 'عصاية خشب أو دائرة معدن للتعليق', quantity: '١' },
      { kind: 'material', name: 'دهان أو شريط ملوّن', quantity: '١', optional: true },
    ],
    steps: [
      { op: 'clean', title: 'نظّف العلب', instruction: 'اشطف كل العلب واقلع ملصقاتها، وخلّيها تنشف تماماً.' },
      { op: 'mark-holes', measure: 'can-chime-hang', title: 'علّم مكان ثقب التعليق', instruction: 'على كل علبة، علّم نقطة قرب الحافة العلوية بالمكان المبيّن بالمخطّط.' },
      { op: 'punch-holes', measure: 'can-chime-hang', title: 'اثقب كل علبة', instruction: 'شخص كبير يثقب نقطة التعليق بكل علبة بمسمار ومطرقة.', warning: 'الثقب للكبار بس.' },
      { op: 'hanger', title: 'مرّر خيوط التعليق', instruction: 'مرّر خيط بكل ثقب واربطه، بأطوال مختلفة شوي لكل علبة حتى تتلاقى وهي معلّقة.' },
      { op: 'decorate', title: 'زيّنها', instruction: 'لوّن العلب أو زيّنها بشريط ملوّن قبل ما تربطها.' },
      { op: 'use-hang', title: 'علّقه', instruction: 'اربط كل خيوط العلب بعصاية أو دائرة، وعلّقه بمكان يوصله الهوا زي الشرفة أو الحديقة.' },
    ],
  },
  {
    slug: 'can-coin-bank',
    title: 'حصّالة نقود من علبة',
    summary: 'علبة قهوة أو معلّبات بغطا بلاستيك، فيها شقّ بالغطا تنزّل منه القروش، وتفتح الغطا لتفريغها.',
    difficulty: 'easy',
    estimatedMinutes: 15,
    minAge: 6,
    safetyNotes: 'شقّ الغطا يعمله شخص كبير.',
    sortOrder: 50,
    source: 'طريقة حصّالة علبة القهوة الشائعة (All Free Crafts)',
    variantKeys: ['can-coffee-tin-500ml', 'can-food-large-850ml'],
    tools: [
      { kind: 'tool', name: 'سكين حرفي أو مقص قوي', note: 'للشقّ — بيد شخص كبير.' },
      { kind: 'tool', name: 'قلم تحديد ومسطرة' },
      { kind: 'material', name: 'علبة بغطا بلاستيك قابل لإعادة الإغلاق', quantity: '١' },
      { kind: 'material', name: 'ورق ملوّن أو دهان', quantity: '١', optional: true },
    ],
    steps: [
      { op: 'clean', title: 'نظّف العلبة والغطا', instruction: 'اشطف العلبة وغطاها البلاستيك، اقلع الملصق، ونشّفهم منيح.' },
      { op: 'mark-slot', measure: 'can-bank-slot', title: 'علّم الشقّ', instruction: 'على غطا العلبة البلاستيك، علّم مستطيلاً رفيعاً بالمقاس المبيّن بالمخطّط.' },
      { op: 'cut-slot', measure: 'can-bank-slot', title: 'اقصّ الشقّ', instruction: 'شخص كبير يقصّ على المستطيل بسكين حرفي ليصير شقّاً.', warning: 'القصّ للكبار بس.' },
      { op: 'decorate', title: 'زيّنها', instruction: 'لفّ العلبة بورق ملوّن أو ادهنها، وخلّي الشقّ مكشوفاً.' },
      { op: 'use-coins', title: 'ابدأ توفّر', instruction: 'نزّل القروش من الشقّ. لتفريغها، افتح الغطا البلاستيك فقط.' },
    ],
  },
];
