import type { SeedVariant } from './bottleSizes';

/**
 * Standard metal can sizes — both aluminium beverage cans and steel food
 * cans, which have a noticeably different height:diameter ratio (short and
 * wide vs. tall and narrow). `isCommon` marks the everyday ones the app
 * offers as quick "did you mean" alternatives.
 */
export const CAN_VARIANTS: SeedVariant[] = [
  { key: 'can-energy-250ml', label: 'Slim energy-drink can (250 ml)', materialType: 'ALUMINIUM', volumeMl: 250, heightMm: 134, diameterMm: 53, region: 'GLOBAL', typicalContents: 'energy drink', isCommon: true, sortOrder: 10, notes: 'Narrow "slim" can format.' },
  { key: 'can-soda-330ml', label: 'Standard soda can (330 ml)', materialType: 'ALUMINIUM', volumeMl: 330, heightMm: 115, diameterMm: 66, region: 'GLOBAL', typicalContents: 'soft drink', isCommon: true, sortOrder: 20, notes: 'The most common can worldwide.' },
  { key: 'can-soda-355ml', label: 'Soda can (12 fl oz / 355 ml)', materialType: 'ALUMINIUM', volumeMl: 355, heightMm: 122, diameterMm: 66, region: 'AMERICAS', typicalContents: 'soft drink', isCommon: true, sortOrder: 30, notes: 'US standard 12 oz can.' },
  { key: 'can-beer-440ml', label: 'Beer / pint can (440 ml)', materialType: 'ALUMINIUM', volumeMl: 440, heightMm: 150, diameterMm: 65, region: 'EUROPE', typicalContents: 'beer', isCommon: false, sortOrder: 40, notes: 'UK/EU pint-style can.' },
  { key: 'can-tallboy-473ml', label: 'Tallboy can (16 fl oz / 473 ml)', materialType: 'ALUMINIUM', volumeMl: 473, heightMm: 168, diameterMm: 66, region: 'AMERICAS', typicalContents: 'beer', isCommon: false, sortOrder: 50, notes: 'Tall single-serve format.' },
  { key: 'can-food-small-155ml', label: 'Small food tin (155 ml)', materialType: 'STEEL', volumeMl: 155, heightMm: 62, diameterMm: 65, region: 'GLOBAL', typicalContents: 'tomato paste', isCommon: true, sortOrder: 60, notes: 'Short, wide tin — tomato paste / small goods.' },
  { key: 'can-food-standard-425ml', label: 'Standard food tin (425 ml)', materialType: 'STEEL', volumeMl: 425, heightMm: 110, diameterMm: 73, region: 'GLOBAL', typicalContents: 'beans / vegetables', isCommon: true, sortOrder: 70, notes: 'The everyday size — beans, corn, tomatoes.' },
  { key: 'can-food-large-850ml', label: 'Large food tin (850 ml)', materialType: 'STEEL', volumeMl: 850, heightMm: 113, diameterMm: 99, region: 'GLOBAL', typicalContents: 'tomatoes / legumes', isCommon: false, sortOrder: 80, notes: 'Family-size catering tin.' },
  { key: 'can-coffee-tin-500ml', label: 'Coffee tin with plastic lid (~500 ml)', materialType: 'STEEL', volumeMl: 500, heightMm: 127, diameterMm: 100, region: 'GLOBAL', typicalContents: 'coffee / formula', isCommon: false, sortOrder: 90, notes: 'Resealable plastic lid — good for a coin bank.' },
];
