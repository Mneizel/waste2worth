// The category roadmap. Waste 2 Worth is designed to cover ANY recyclable
// item, not just bottles — but each category needs its own real, sourced
// content (recognition, sizes, ideas, blueprint drawing), the same way the
// bottle category was built. So we grow this list one fully-real category at
// a time instead of faking coverage for things we haven't built yet.
//
// To add a category: see docs/adding-a-category.md.

export interface CategoryInfo {
  key: string;
  label: string;
  /** one line describing the kinds of items this covers */
  examples: string;
  status: 'available' | 'soon';
}

export const CATEGORIES: CategoryInfo[] = [
  {
    key: 'bottle',
    label: 'قناني (بلاستيك وزجاج)',
    examples: 'قناني مي، مشروبات غازية، عصير، زيت',
    status: 'available',
  },
  {
    key: 'can',
    label: 'علب معدنية',
    examples: 'علب مشروبات، علب طعام',
    status: 'available',
  },
  {
    key: 'jar',
    label: 'برطمانات زجاج',
    examples: 'برطمانات مربى، مخلّل، صلصة',
    status: 'soon',
  },
  {
    key: 'cardboard',
    label: 'كرتون وورق مقوّى',
    examples: 'صناديق، عبوات بيض، أنابيب مناديل',
    status: 'soon',
  },
  {
    key: 'wood',
    label: 'خشب وألواح',
    examples: 'بواقي أثاث، صناديق خشب، عيدان',
    status: 'soon',
  },
  {
    key: 'fabric',
    label: 'قماش وملابس',
    examples: 'تيشيرتات قديمة، جينز، شراشف',
    status: 'soon',
  },
  {
    key: 'shoe',
    label: 'أحذية',
    examples: 'أحذية رياضة وأحذية عادية قديمة',
    status: 'soon',
  },
  {
    key: 'tire',
    label: 'إطارات',
    examples: 'إطارات سيارات ودرّاجات قديمة',
    status: 'soon',
  },
];

export const AVAILABLE_CATEGORIES = CATEGORIES.filter((c) => c.status === 'available');
