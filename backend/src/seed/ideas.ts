export interface SeedTool {
  kind: 'tool' | 'material';
  name: string;
  quantity?: string;
  optional?: boolean;
  note?: string;
}

export interface SeedStep {
  title: string;
  instruction: string;
  tip?: string;
  warning?: string;
  icon?: string;
}

export interface SeedIdea {
  slug: string;
  title: string;
  summary: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedMinutes: number;
  minAge: number;
  safetyNotes?: string;
  sortOrder: number;
  variantKeys: string[];
  tools: SeedTool[];
  steps: SeedStep[];
}

const WATER_BOTTLES = [
  'pet-water-250ml',
  'pet-softdrink-330ml',
  'pet-water-500ml',
  'pet-water-600ml',
  'pet-sports-750ml',
  'pet-water-1000ml',
  'pet-water-1500ml',
  'pet-soda-2000ml',
];

export const IDEAS: SeedIdea[] = [
  {
    slug: 'self-watering-planter',
    title: 'Self-watering planter',
    summary: 'Turn a bottle into a little planter that waters itself from a water store in the base.',
    difficulty: 'easy',
    estimatedMinutes: 20,
    minAge: 6,
    safetyNotes: 'An adult should do the cutting. Cut edges can be sharp — cover them with tape.',
    sortOrder: 10,
    variantKeys: ['pet-water-500ml', 'pet-water-600ml', 'pet-sports-750ml', 'pet-water-1000ml', 'pet-water-1500ml', 'pet-soda-2000ml'],
    tools: [
      { kind: 'tool', name: 'Scissors or craft knife', note: 'For cutting the bottle.' },
      { kind: 'tool', name: 'Marker pen' },
      { kind: 'material', name: 'The clean plastic bottle', quantity: '1' },
      { kind: 'material', name: 'A piece of cotton string or an old shoelace', quantity: '15 cm' },
      { kind: 'material', name: 'Potting soil', quantity: '2 handfuls' },
      { kind: 'material', name: 'A small plant or seeds', quantity: '1' },
      { kind: 'material', name: 'Sticky tape', optional: true, note: 'To cover sharp edges.' },
    ],
    steps: [
      { title: 'Clean the bottle', instruction: 'Take off the label and wash the bottle with water. Let it dry.', icon: '🧼' },
      { title: 'Mark the middle', instruction: 'Draw a line around the middle of the bottle with the marker.', tip: 'Rest the marker on a stack of books and spin the bottle to get a straight line.', icon: '✏️' },
      { title: 'Cut the bottle in two', instruction: 'An adult cuts along the line so you have a top part and a bottom part.', warning: 'Adults only for this step.', icon: '✂️' },
      { title: 'Cover the edges', instruction: 'Put sticky tape over the cut edges so they are not sharp.', icon: '🩹' },
      { title: 'Add the wick', instruction: 'Push the string through the bottle cap hole. Half hangs inside, half hangs out below.', tip: 'If there is no hole, an adult makes a small one in the cap.', icon: '🧵' },
      { title: 'Turn the top upside down', instruction: 'Put the top part upside down inside the bottom part, like a funnel.', icon: '🔽' },
      { title: 'Add soil and plant', instruction: 'Fill the top with soil and plant your seeds or small plant.', icon: '🌱' },
      { title: 'Fill the water store', instruction: 'Pour water into the bottom part until the string touches it. The plant now drinks by itself.', tip: 'Top up the water when the base looks empty.', icon: '💧' },
    ],
  },
  {
    slug: 'bird-feeder',
    title: 'Hanging bird feeder',
    summary: 'A simple feeder that hangs from a tree and lets birds reach seeds through two small openings.',
    difficulty: 'easy',
    estimatedMinutes: 25,
    minAge: 7,
    safetyNotes: 'An adult should make the holes. Hang it somewhere birds are safe from cats.',
    sortOrder: 20,
    variantKeys: ['pet-water-500ml', 'pet-water-600ml', 'pet-water-1000ml', 'pet-water-1500ml', 'pet-soda-2000ml'],
    tools: [
      { kind: 'tool', name: 'Scissors or craft knife' },
      { kind: 'tool', name: 'A pencil', note: 'To make the perch holes.' },
      { kind: 'material', name: 'The clean plastic bottle with its cap', quantity: '1' },
      { kind: 'material', name: 'Two wooden spoons or two sticks', quantity: '2' },
      { kind: 'material', name: 'String', quantity: '40 cm' },
      { kind: 'material', name: 'Bird seed', quantity: '1 cup' },
    ],
    steps: [
      { title: 'Clean and dry the bottle', instruction: 'Wash the bottle and lid. Take off the label. Let it dry fully.', icon: '🧼' },
      { title: 'Mark two holes near the bottom', instruction: 'Draw a small circle on each side of the bottle, near the bottom.', icon: '⭕' },
      { title: 'Make the holes', instruction: 'An adult cuts the two small holes where you marked.', warning: 'Adults only for cutting.', icon: '✂️' },
      { title: 'Push the perch through', instruction: 'Slide a wooden spoon through both holes so it sticks out on each side for birds to stand on.', icon: '🥄' },
      { title: 'Add a second perch higher up', instruction: 'Make two more holes higher up, turned a quarter around, and push the second spoon through.', icon: '➕' },
      { title: 'Make feeding openings', instruction: 'Just above each perch, cut a small opening the size of a coin so seeds can come out.', icon: '🪙' },
      { title: 'Fill with seed', instruction: 'Pour bird seed into the bottle through the top and screw the cap back on.', icon: '🌾' },
      { title: 'Hang it up', instruction: 'Tie the string around the bottle neck and hang it from a branch.', tip: 'Hang it where you can watch from a window.', icon: '🌳' },
    ],
  },
  {
    slug: 'pen-pot-organizer',
    title: 'Desk pen pot',
    summary: 'A quick pot for pens, pencils and scissors made from the bottom of a bottle.',
    difficulty: 'easy',
    estimatedMinutes: 15,
    minAge: 6,
    safetyNotes: 'An adult should do the cutting. Cover the rim with tape or fold it over.',
    sortOrder: 30,
    variantKeys: ['pet-water-500ml', 'pet-water-600ml', 'pet-sports-750ml', 'pet-water-1000ml'],
    tools: [
      { kind: 'tool', name: 'Scissors or craft knife' },
      { kind: 'tool', name: 'Marker pen' },
      { kind: 'material', name: 'The clean plastic bottle', quantity: '1' },
      { kind: 'material', name: 'Coloured tape or paint', quantity: '1', optional: true, note: 'To decorate.' },
    ],
    steps: [
      { title: 'Clean the bottle', instruction: 'Wash the bottle, remove the label, and dry it.', icon: '🧼' },
      { title: 'Choose the height', instruction: 'Decide how tall you want the pot. Around 10 cm works well for pens.', icon: '📏' },
      { title: 'Draw the cut line', instruction: 'Draw a line all around the bottle at that height.', tip: 'Spin the bottle against a marker held steady for a neat line.', icon: '✏️' },
      { title: 'Cut off the top', instruction: 'An adult cuts along the line. Keep the bottom part.', warning: 'Adults only for cutting.', icon: '✂️' },
      { title: 'Make the rim safe', instruction: 'Fold the cut edge outward or cover it with a strip of tape.', icon: '🩹' },
      { title: 'Decorate', instruction: 'Wrap the pot in coloured tape or paint it. Let it dry.', icon: '🎨' },
      { title: 'Fill it up', instruction: 'Stand your pens and pencils inside.', icon: '🖊️' },
    ],
  },
  {
    slug: 'coin-bank',
    title: 'Coin bank',
    summary: 'A see-through money box. Drop coins through a slot in the cap area and watch it fill.',
    difficulty: 'easy',
    estimatedMinutes: 20,
    minAge: 6,
    safetyNotes: 'An adult should cut the coin slot.',
    sortOrder: 40,
    variantKeys: ['pet-water-500ml', 'pet-water-600ml', 'pet-water-1000ml', 'pet-water-1500ml'],
    tools: [
      { kind: 'tool', name: 'Craft knife', note: 'For the coin slot.' },
      { kind: 'tool', name: 'Marker pen' },
      { kind: 'material', name: 'The clean plastic bottle with its cap', quantity: '1' },
      { kind: 'material', name: 'Paper and glue, or paint', quantity: '1', optional: true, note: 'To decorate.' },
    ],
    steps: [
      { title: 'Clean and dry the bottle', instruction: 'Wash the bottle and cap, take off the label, and dry it.', icon: '🧼' },
      { title: 'Keep the bottle whole', instruction: 'You will not cut it in half. Leave the cap on.', icon: '🍶' },
      { title: 'Mark a coin slot', instruction: 'On the shoulder of the bottle, draw a thin rectangle a bit longer than your biggest coin.', icon: '✏️' },
      { title: 'Cut the slot', instruction: 'An adult cuts along the rectangle to make a slot.', warning: 'Adults only for cutting.', icon: '✂️' },
      { title: 'Check a coin fits', instruction: 'Try pushing a coin through. Make the slot slightly bigger if it is tight.', icon: '🪙' },
      { title: 'Decorate', instruction: 'Wrap the bottle in paper or paint it. Leave the slot clear.', icon: '🎨' },
      { title: 'Start saving', instruction: 'Drop coins through the slot. To empty it, just open the cap.', icon: '💰' },
    ],
  },
  {
    slug: 'watering-can',
    title: 'Mini watering can',
    summary: 'Poke small holes in the cap and your bottle becomes a gentle watering can for plants.',
    difficulty: 'easy',
    estimatedMinutes: 10,
    minAge: 6,
    safetyNotes: 'An adult should make the holes in the cap with a hot pin or a nail.',
    sortOrder: 50,
    variantKeys: ['pet-water-1000ml', 'pet-water-1500ml', 'pet-soda-2000ml', 'pet-juice-1000ml'],
    tools: [
      { kind: 'tool', name: 'A nail or a thick pin', note: 'To make the holes.' },
      { kind: 'tool', name: 'A hammer', optional: true, note: 'To tap the nail through.' },
      { kind: 'material', name: 'The clean plastic bottle with its cap', quantity: '1' },
    ],
    steps: [
      { title: 'Clean the bottle', instruction: 'Wash the bottle and cap well, especially if it held juice or milk.', icon: '🧼' },
      { title: 'Take off the cap', instruction: 'Unscrew the cap and put it on a wooden board.', icon: '🔩' },
      { title: 'Make the holes', instruction: 'An adult pushes the nail through the cap about 8 to 12 times to make small holes.', warning: 'Adults only. The nail may be hot if heated.', icon: '🕳️' },
      { title: 'Fill with water', instruction: 'Fill the bottle with water from the tap.', icon: '💧' },
      { title: 'Put the cap back', instruction: 'Screw the cap with holes back onto the full bottle.', icon: '🔄' },
      { title: 'Water your plants', instruction: 'Tip the bottle over plants and gently squeeze. Water comes out like light rain.', tip: 'Loosen the cap a little for a faster flow.', icon: '🌧️' },
    ],
  },
  {
    slug: 'drip-irrigation-spike',
    title: 'Slow drip plant waterer',
    summary: 'An upside-down bottle in the soil that slowly waters one plant for days.',
    difficulty: 'easy',
    estimatedMinutes: 10,
    minAge: 7,
    safetyNotes: 'An adult should make the holes.',
    sortOrder: 60,
    variantKeys: ['pet-water-500ml', 'pet-water-600ml', 'pet-water-1000ml', 'pet-water-1500ml'],
    tools: [
      { kind: 'tool', name: 'A thin nail or pin' },
      { kind: 'material', name: 'The clean plastic bottle with its cap', quantity: '1' },
    ],
    steps: [
      { title: 'Clean the bottle', instruction: 'Wash the bottle and cap and take off the label.', icon: '🧼' },
      { title: 'Make tiny holes in the cap', instruction: 'An adult makes 2 to 4 very small holes in the cap.', warning: 'Adults only.', icon: '🕳️' },
      { title: 'Add a hole near the base', instruction: 'Make one small hole in the bottom of the bottle so air can get in.', icon: '💨' },
      { title: 'Fill with water', instruction: 'Fill the bottle with water and screw the cap on.', icon: '💧' },
      { title: 'Push it into the soil', instruction: 'Turn the bottle upside down and push the cap end into the soil next to your plant.', tip: 'Firm the soil around it so it stands up.', icon: '🌱' },
      { title: 'Let it work', instruction: 'The water drips out slowly over a few days. Refill when empty.', icon: '⏳' },
    ],
  },
  {
    slug: 'kids-bowling-set',
    title: 'Bottle bowling set',
    summary: 'Six bottles become skittles. Add a little water for weight and knock them down with a ball.',
    difficulty: 'easy',
    estimatedMinutes: 30,
    minAge: 5,
    safetyNotes: 'Keep caps tight so no water spills. Play away from stairs.',
    sortOrder: 70,
    variantKeys: ['pet-water-500ml', 'pet-water-600ml', 'pet-softdrink-330ml'],
    tools: [
      { kind: 'material', name: 'Clean plastic bottles with caps', quantity: '6' },
      { kind: 'material', name: 'A small soft ball', quantity: '1' },
      { kind: 'material', name: 'Coloured tape or paint', quantity: '1', optional: true },
      { kind: 'material', name: 'Water or sand', quantity: 'a little', note: 'For weight.' },
    ],
    steps: [
      { title: 'Clean six bottles', instruction: 'Wash six bottles and their caps and take off the labels.', icon: '🧼' },
      { title: 'Add a little weight', instruction: 'Put a few centimetres of water or dry sand in each bottle so they do not fall over in the wind.', icon: '⚖️' },
      { title: 'Close them tightly', instruction: 'Screw every cap on firmly. Check none leak.', icon: '🔩' },
      { title: 'Decorate the pins', instruction: 'Wrap each bottle with coloured tape or paint numbers on them.', icon: '🎨' },
      { title: 'Set up the triangle', instruction: 'Stand the bottles in a triangle: one at the front, then two, then three.', icon: '🔺' },
      { title: 'Roll the ball', instruction: 'Step back a few steps and roll the ball to knock the pins down.', tip: 'Count how many you knock down each turn.', icon: '🎳' },
    ],
  },
  {
    slug: 'wind-spinner',
    title: 'Garden wind spinner',
    summary: 'Cut fins into a bottle so it spins and shimmers when the wind blows.',
    difficulty: 'medium',
    estimatedMinutes: 35,
    minAge: 8,
    safetyNotes: 'An adult should do all the cutting. The fins have sharp corners — round them off.',
    sortOrder: 80,
    variantKeys: ['pet-water-500ml', 'pet-water-600ml', 'pet-sports-750ml'],
    tools: [
      { kind: 'tool', name: 'Craft knife' },
      { kind: 'tool', name: 'Scissors' },
      { kind: 'tool', name: 'Marker pen' },
      { kind: 'material', name: 'The clean plastic bottle with its cap', quantity: '1' },
      { kind: 'material', name: 'String', quantity: '30 cm' },
      { kind: 'material', name: 'Reflective stickers or paint', quantity: '1', optional: true },
    ],
    steps: [
      { title: 'Clean the bottle', instruction: 'Wash and dry the bottle. Keep the cap on.', icon: '🧼' },
      { title: 'Draw the fin lines', instruction: 'Draw 6 to 8 straight lines down the middle section of the bottle, evenly spaced.', icon: '✏️' },
      { title: 'Cut the fins', instruction: 'An adult cuts along each line, only through the middle section, not the ends.', warning: 'Adults only for cutting.', icon: '✂️' },
      { title: 'Twist the fins', instruction: 'Gently push the top and bottom of the bottle toward each other and twist a little so the fins bend outward.', icon: '🌀' },
      { title: 'Round the corners', instruction: 'Snip the sharp corners off each fin with scissors.', icon: '🔵' },
      { title: 'Decorate', instruction: 'Add reflective stickers or paint spots so it catches the light.', icon: '✨' },
      { title: 'Make a hanger', instruction: 'An adult makes a small hole in the base. Thread the string through and tie a loop.', icon: '🪢' },
      { title: 'Hang it outside', instruction: 'Hang the spinner from a branch or hook where the wind can reach it.', icon: '🍃' },
    ],
  },
  {
    slug: 'vertical-herb-garden',
    title: 'Hanging herb garden',
    summary: 'Bottles laid on their side and hung in a row make a small wall garden for herbs.',
    difficulty: 'medium',
    estimatedMinutes: 40,
    minAge: 9,
    safetyNotes: 'An adult should cut the openings and make the holes. Hang it on a strong hook.',
    sortOrder: 90,
    variantKeys: ['pet-water-1500ml', 'pet-soda-2000ml', 'pet-juice-1000ml'],
    tools: [
      { kind: 'tool', name: 'Craft knife' },
      { kind: 'tool', name: 'Marker pen' },
      { kind: 'tool', name: 'A nail', note: 'For drainage and rope holes.' },
      { kind: 'material', name: 'Clean plastic bottles with caps', quantity: '3' },
      { kind: 'material', name: 'Strong rope or cord', quantity: '2 m' },
      { kind: 'material', name: 'Potting soil', quantity: '3 handfuls' },
      { kind: 'material', name: 'Herb seedlings or seeds', quantity: '3' },
    ],
    steps: [
      { title: 'Clean the bottles', instruction: 'Wash three bottles and caps and take off the labels.', icon: '🧼' },
      { title: 'Lay a bottle on its side', instruction: 'Put the cap on and lay the bottle down. The cap side will point sideways when it hangs.', icon: '🔁' },
      { title: 'Draw a long opening', instruction: 'On the side facing up, draw a large rectangle, leaving the ends of the bottle uncut.', icon: '✏️' },
      { title: 'Cut the opening', instruction: 'An adult cuts out the rectangle. This is where the soil and plant go.', warning: 'Adults only for cutting.', icon: '✂️' },
      { title: 'Add drainage holes', instruction: 'Make 3 or 4 small holes on the opposite side so extra water can drain.', icon: '🕳️' },
      { title: 'Make rope holes', instruction: 'Near each end of the bottle, make two holes for the rope to pass through.', icon: '⭕' },
      { title: 'Thread the rope', instruction: 'Pass the rope through the end holes of all three bottles so they hang in a stack with gaps between them.', icon: '🧵' },
      { title: 'Fill and plant', instruction: 'Add soil through the opening and plant one herb per bottle.', icon: '🌿' },
      { title: 'Hang and water', instruction: 'Hang the rope on a strong hook in a sunny spot and water lightly.', icon: '☀️' },
    ],
  },
  {
    slug: 'phone-charging-holder',
    title: 'Phone charging holder',
    summary: 'A little shelf that hangs on the wall socket and holds your phone while it charges.',
    difficulty: 'medium',
    estimatedMinutes: 25,
    minAge: 9,
    safetyNotes: 'An adult should do the cutting. Keep the holder away from water and heat.',
    sortOrder: 100,
    variantKeys: ['pet-water-1000ml', 'pet-oil-1000ml', 'hdpe-milk-1000ml'],
    tools: [
      { kind: 'tool', name: 'Craft knife' },
      { kind: 'tool', name: 'Scissors' },
      { kind: 'tool', name: 'Marker pen' },
      { kind: 'material', name: 'The clean plastic bottle', quantity: '1' },
      { kind: 'material', name: 'Sandpaper or a nail file', quantity: '1', optional: true, note: 'To smooth edges.' },
      { kind: 'material', name: 'Coloured tape', quantity: '1', optional: true },
    ],
    steps: [
      { title: 'Clean and dry the bottle', instruction: 'Wash the bottle well and dry it. Remove the label.', icon: '🧼' },
      { title: 'Mark the shape', instruction: 'Draw a shape with a tall back and a low front pocket, like a letter tray, on the side of the bottle.', icon: '✏️' },
      { title: 'Cut out the holder', instruction: 'An adult cuts along the line so you have an open pocket with a tall back.', warning: 'Adults only for cutting.', icon: '✂️' },
      { title: 'Smooth the edges', instruction: 'Rub the cut edges with sandpaper or cover them with tape.', icon: '🩹' },
      { title: 'Make a plug hole', instruction: 'In the tall back, cut a hole big enough for a charger plug to pass through.', icon: '🔌' },
      { title: 'Decorate', instruction: 'Wrap the holder in coloured tape or draw on it.', icon: '🎨' },
      { title: 'Hang it on the charger', instruction: 'Put the charger plug through the hole and into the wall socket. Rest the phone in the pocket.', tip: 'Check the phone sits without pulling on the cable.', icon: '📱' },
    ],
  },
];

export const ALL_WATER_BOTTLE_KEYS = WATER_BOTTLES;
