export interface SeedVariant {
  key: string;
  label: string;
  materialType: string;
  volumeMl: number;
  heightMm: number;
  diameterMm: number;
  region: string;
  typicalContents: string;
  isCommon: boolean;
  sortOrder: number;
  notes: string;
}

/**
 * Standard bottle sizes seen around the world. `isCommon` marks the everyday
 * ones the app offers as quick "did you mean" alternatives.
 */
export const BOTTLE_VARIANTS: SeedVariant[] = [
  { key: 'pet-water-200ml', label: 'Mini water bottle (200 ml)', materialType: 'PET', volumeMl: 200, heightMm: 120, diameterMm: 50, region: 'GLOBAL', typicalContents: 'water', isCommon: true, sortOrder: 10, notes: 'Kids / on-the-go size.' },
  { key: 'pet-water-250ml', label: 'Small water bottle (250 ml)', materialType: 'PET', volumeMl: 250, heightMm: 140, diameterMm: 52, region: 'GLOBAL', typicalContents: 'water', isCommon: true, sortOrder: 20, notes: 'Common single-serve size.' },
  { key: 'pet-softdrink-330ml', label: 'Soft-drink bottle (330 ml)', materialType: 'PET', volumeMl: 330, heightMm: 150, diameterMm: 58, region: 'GLOBAL', typicalContents: 'soft drink', isCommon: true, sortOrder: 30, notes: 'Matches the 330 ml can format.' },
  { key: 'pet-softdrink-350ml', label: 'Soft-drink bottle (350 ml)', materialType: 'PET', volumeMl: 350, heightMm: 155, diameterMm: 60, region: 'AMERICAS', typicalContents: 'soft drink', isCommon: false, sortOrder: 40, notes: 'US / Latin America format.' },
  { key: 'pet-water-500ml', label: 'Standard water bottle (500 ml)', materialType: 'PET', volumeMl: 500, heightMm: 210, diameterMm: 66, region: 'GLOBAL', typicalContents: 'water', isCommon: true, sortOrder: 50, notes: 'The most common bottle worldwide.' },
  { key: 'pet-water-600ml', label: 'Water bottle (600 ml)', materialType: 'PET', volumeMl: 600, heightMm: 230, diameterMm: 66, region: 'GLOBAL', typicalContents: 'water', isCommon: true, sortOrder: 60, notes: 'Common in the US and parts of Asia.' },
  { key: 'pet-sports-750ml', label: 'Sports water bottle (750 ml)', materialType: 'PET', volumeMl: 750, heightMm: 250, diameterMm: 70, region: 'GLOBAL', typicalContents: 'water', isCommon: true, sortOrder: 70, notes: 'Often with a sports cap.' },
  { key: 'pet-water-1000ml', label: 'Large water bottle (1 L)', materialType: 'PET', volumeMl: 1000, heightMm: 300, diameterMm: 85, region: 'GLOBAL', typicalContents: 'water', isCommon: true, sortOrder: 80, notes: 'One-litre size.' },
  { key: 'pet-oil-1000ml', label: 'Cooking-oil bottle (1 L)', materialType: 'PET', volumeMl: 1000, heightMm: 290, diameterMm: 84, region: 'GLOBAL', typicalContents: 'cooking oil', isCommon: true, sortOrder: 85, notes: 'Rinse well before reuse.' },
  { key: 'pet-water-1250ml', label: 'Water bottle (1.25 L)', materialType: 'PET', volumeMl: 1250, heightMm: 310, diameterMm: 90, region: 'EUROPE', typicalContents: 'soft drink', isCommon: false, sortOrder: 90, notes: 'Common for soft drinks in Europe.' },
  { key: 'pet-water-1500ml', label: 'Water bottle (1.5 L)', materialType: 'PET', volumeMl: 1500, heightMm: 320, diameterMm: 95, region: 'GLOBAL', typicalContents: 'water', isCommon: true, sortOrder: 100, notes: 'Family water size.' },
  { key: 'pet-soda-2000ml', label: 'Soda bottle (2 L)', materialType: 'PET', volumeMl: 2000, heightMm: 330, diameterMm: 110, region: 'GLOBAL', typicalContents: 'soft drink', isCommon: true, sortOrder: 110, notes: 'Classic 2-litre soda bottle.' },
  { key: 'pet-water-3000ml', label: 'Bulk water bottle (3 L)', materialType: 'PET', volumeMl: 3000, heightMm: 360, diameterMm: 130, region: 'GLOBAL', typicalContents: 'water', isCommon: false, sortOrder: 120, notes: 'Larger multi-serve bottle.' },
  { key: 'pet-water-5000ml', label: 'Bulk water bottle (5 L)', materialType: 'PET', volumeMl: 5000, heightMm: 300, diameterMm: 190, region: 'GLOBAL', typicalContents: 'water', isCommon: false, sortOrder: 130, notes: 'Jerry-can style with handle.' },
  { key: 'glass-soda-250ml', label: 'Glass soda bottle (250 ml)', materialType: 'GLASS', volumeMl: 250, heightMm: 200, diameterMm: 55, region: 'GLOBAL', typicalContents: 'soft drink', isCommon: false, sortOrder: 140, notes: 'Returnable-style glass bottle.' },
  { key: 'glass-beer-330ml', label: 'Glass beer bottle (330 ml)', materialType: 'GLASS', volumeMl: 330, heightMm: 230, diameterMm: 60, region: 'GLOBAL', typicalContents: 'beer', isCommon: true, sortOrder: 150, notes: 'Long-neck glass bottle.' },
  { key: 'glass-beer-500ml', label: 'Glass beer bottle (500 ml)', materialType: 'GLASS', volumeMl: 500, heightMm: 250, diameterMm: 68, region: 'EUROPE', typicalContents: 'beer', isCommon: true, sortOrder: 160, notes: 'European half-litre bottle.' },
  { key: 'glass-wine-750ml', label: 'Wine bottle (750 ml)', materialType: 'GLASS', volumeMl: 750, heightMm: 300, diameterMm: 75, region: 'GLOBAL', typicalContents: 'wine', isCommon: true, sortOrder: 170, notes: 'Standard wine bottle.' },
  { key: 'glass-spirits-700ml', label: 'Spirits bottle (700 ml)', materialType: 'GLASS', volumeMl: 700, heightMm: 285, diameterMm: 78, region: 'GLOBAL', typicalContents: 'spirits', isCommon: false, sortOrder: 180, notes: 'Common spirits size outside the US.' },
  { key: 'hdpe-milk-1000ml', label: 'Milk jug (1 L)', materialType: 'HDPE', volumeMl: 1000, heightMm: 240, diameterMm: 90, region: 'AMERICAS', typicalContents: 'milk', isCommon: true, sortOrder: 190, notes: 'Opaque HDPE jug with handle.' },
  { key: 'hdpe-milk-2000ml', label: 'Milk jug (2 L)', materialType: 'HDPE', volumeMl: 2000, heightMm: 270, diameterMm: 110, region: 'AMERICAS', typicalContents: 'milk', isCommon: false, sortOrder: 200, notes: 'Half-gallon style jug.' },
  { key: 'hdpe-milk-3785ml', label: 'Milk jug (1 US gallon)', materialType: 'HDPE', volumeMl: 3785, heightMm: 240, diameterMm: 150, region: 'AMERICAS', typicalContents: 'milk', isCommon: true, sortOrder: 210, notes: 'US gallon milk jug with handle.' },
  { key: 'pet-juice-250ml', label: 'Juice bottle (250 ml)', materialType: 'PET', volumeMl: 250, heightMm: 145, diameterMm: 54, region: 'GLOBAL', typicalContents: 'juice', isCommon: false, sortOrder: 220, notes: 'Single-serve juice bottle.' },
  { key: 'pet-juice-1000ml', label: 'Juice bottle (1 L)', materialType: 'PET', volumeMl: 1000, heightMm: 260, diameterMm: 85, region: 'GLOBAL', typicalContents: 'juice', isCommon: true, sortOrder: 230, notes: 'Family juice bottle.' },
];
