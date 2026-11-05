/**
 * Mixed Lives: a snapshot of the current Unity implementation, checked 2026-11-05.
 *
 * Mechanisms: Assets/Scripts/{CocktailEnums,IngredientUnlock,IngredientTable,
 * FlavorWheelView,FlavorWheelController,DrinkEvaluator,BarSessionController}.cs.
 * Liquid values: Assets/Data/IngredientTable.asset (not inferred from artwork).
 * Recipes: all 25 Assets/Data/ClassicCocktail/*.asset entries referenced by the book.
 * Story: _tools/mixed_lives_story.json, checked against all seven imported GuestData
 * assets, 35 OrderData assets, and the seven-night SampleScene schedule.
 *
 * Story events below describe authored dialogue, not separate performance/comic
 * gameplay systems. Character colors are editorial chart colors, not Unity values.
 */

export interface MLLiquid {
  id: string;
  label: string;
  stage: number;
  taste: string[];
  aroma: string[];
  texture: string[];
  /** Rounded CSS display color; use rgb for the actual mixing calculation. */
  color: string;
  /** Exact source sRGB values, each in 0..1. */
  rgb: [number, number, number];
  tintStrength: number;
}

export interface MLStage {
  stage: number;
  days: number[];
  focus: string;
  newIngredients: string[];
  /** Cumulative unlocked mix-ins; the four bases are available at every stage. */
  ingredientCount: number;
  /** Cumulative classic recipes that can be made with the unlocked stock. */
  classicCount: number;
  newClassicCount: number;
}

export interface MLClassic {
  id: string;
  name: string;
  base: string;
  ingredients: string[];
  /** Earliest possible stage, derived from ingredient availability. */
  stage: number;
}

export interface MLVisit {
  day: number;
  order: number;
  label: string;
  detail: string;
}

export interface MLCharacter {
  id: string;
  name: string;
  role: string;
  color: string;
  /** Days with dialogue spoken by this character, including other guests' orders. */
  speakingDays: number[];
  /** Assigned orders / serialized GuestStages, not every spoken appearance. */
  visits: MLVisit[];
}

export interface MLDay {
  day: number;
  title: string;
  stage: number;
  orders: number[];
  guests: string[];
  milestones: string[];
}

export const mlStages: MLStage[] = [
  { stage: 1, days: [1], focus: 'Taste', newIngredients: ['LimeJuice', 'TonicWater', 'SugarSyrup'], ingredientCount: 3, classicCount: 4, newClassicCount: 4 },
  { stage: 2, days: [2, 3], focus: 'Aroma', newIngredients: ['OrangeJuice', 'Honey', 'Mint', 'GingerBeer'], ingredientCount: 7, classicCount: 11, newClassicCount: 7 },
  { stage: 3, days: [4, 5], focus: 'Texture', newIngredients: ['SodaWater', 'Cola', 'CoconutCream', 'Cream', 'CoffeeLiqueur'], ingredientCount: 12, classicCount: 19, newClassicCount: 8 },
  { stage: 4, days: [6, 7], focus: 'Full bar', newIngredients: ['PineappleJuice', 'Campari', 'Vermouth'], ingredientCount: 15, classicCount: 25, newClassicCount: 6 },
];

export const mlBases: MLLiquid[] = [
  { id: 'Gin', label: 'Gin', stage: 1, taste: [], aroma: ['Herbal'], texture: [], color: '#e6edd9', rgb: [0.9, 0.93, 0.85], tintStrength: 0.08 },
  { id: 'Vodka', label: 'Vodka', stage: 1, taste: [], aroma: [], texture: [], color: '#f2f5f5', rgb: [0.95, 0.96, 0.96], tintStrength: 0.04 },
  { id: 'Whiskey', label: 'Whiskey', stage: 1, taste: [], aroma: ['Woody'], texture: [], color: '#c47a29', rgb: [0.77, 0.48, 0.16], tintStrength: 0.7 },
  { id: 'Rum', label: 'Rum', stage: 1, taste: ['Sweet'], aroma: ['Fruity'], texture: [], color: '#c78729', rgb: [0.78, 0.53, 0.16], tintStrength: 0.7 },
];

export const mlIngredients: MLLiquid[] = [
  { id: 'LimeJuice', label: 'Lime juice', stage: 1, taste: ['Sour'], aroma: ['Fruity'], texture: [], color: '#c7d14a', rgb: [0.78, 0.82, 0.29], tintStrength: 0.55 },
  { id: 'TonicWater', label: 'Tonic water', stage: 1, taste: ['Bitter'], aroma: [], texture: ['Sparkling'], color: '#e8e6d4', rgb: [0.91, 0.9, 0.83], tintStrength: 0.08 },
  { id: 'SugarSyrup', label: 'Sugar syrup', stage: 1, taste: ['Sweet'], aroma: [], texture: [], color: '#f0e6c7', rgb: [0.94, 0.9, 0.78], tintStrength: 0.1 },
  { id: 'OrangeJuice', label: 'Orange juice', stage: 2, taste: ['Sweet', 'Sour'], aroma: ['Fruity', 'Citrus'], texture: [], color: '#e88721', rgb: [0.91, 0.53, 0.13], tintStrength: 0.75 },
  { id: 'Honey', label: 'Honey', stage: 2, taste: ['Sweet'], aroma: ['Floral'], texture: [], color: '#d49914', rgb: [0.83, 0.6, 0.08], tintStrength: 0.8 },
  { id: 'Mint', label: 'Mint', stage: 2, taste: [], aroma: ['Herbal'], texture: [], color: '#7a9e4a', rgb: [0.48, 0.62, 0.29], tintStrength: 0.25 },
  { id: 'GingerBeer', label: 'Ginger beer', stage: 2, taste: [], aroma: ['Spiced'], texture: ['Sparkling'], color: '#d4a33d', rgb: [0.83, 0.64, 0.24], tintStrength: 0.65 },
  { id: 'SodaWater', label: 'Soda water', stage: 3, taste: [], aroma: [], texture: ['Sparkling'], color: '#f2f5f5', rgb: [0.95, 0.96, 0.96], tintStrength: 0.04 },
  { id: 'Cola', label: 'Cola', stage: 3, taste: ['Sweet'], aroma: ['Spiced'], texture: ['Sparkling'], color: '#1c120d', rgb: [0.11, 0.07, 0.05], tintStrength: 1 },
  { id: 'CoconutCream', label: 'Coconut cream', stage: 3, taste: ['Sweet'], aroma: [], texture: ['Creamy'], color: '#f2e6d1', rgb: [0.95, 0.9, 0.82], tintStrength: 0.45 },
  { id: 'Cream', label: 'Cream', stage: 3, taste: [], aroma: [], texture: ['Creamy'], color: '#fff5e3', rgb: [1, 0.96, 0.89], tintStrength: 0.4 },
  { id: 'CoffeeLiqueur', label: 'Coffee liqueur', stage: 3, taste: ['Sweet', 'Bitter'], aroma: [], texture: [], color: '#29170d', rgb: [0.16, 0.09, 0.05], tintStrength: 1 },
  { id: 'PineappleJuice', label: 'Pineapple juice', stage: 4, taste: ['Sweet', 'Sour'], aroma: ['Fruity'], texture: [], color: '#e6bf3b', rgb: [0.9, 0.75, 0.23], tintStrength: 0.7 },
  { id: 'Campari', label: 'Campari', stage: 4, taste: ['Bitter'], aroma: ['Herbal', 'Citrus'], texture: [], color: '#c41429', rgb: [0.77, 0.08, 0.16], tintStrength: 1 },
  { id: 'Vermouth', label: 'Vermouth', stage: 4, taste: [], aroma: ['Herbal', 'Floral'], texture: [], color: '#c4a859', rgb: [0.77, 0.66, 0.35], tintStrength: 0.5 },
];

export const mlClassics: MLClassic[] = [
  { id: 'GinAndTonic', name: 'Gin & Tonic', base: 'Gin', ingredients: ['TonicWater'], stage: 1 },
  { id: 'Gimlet', name: 'Gimlet', base: 'Gin', ingredients: ['LimeJuice', 'SugarSyrup'], stage: 1 },
  { id: 'Daiquiri', name: 'Daiquiri', base: 'Rum', ingredients: ['LimeJuice', 'SugarSyrup'], stage: 1 },
  { id: 'WhiskeySour', name: 'Whiskey Sour', base: 'Whiskey', ingredients: ['LimeJuice', 'SugarSyrup'], stage: 1 },
  { id: 'BeesKnees', name: "Bee's Knees", base: 'Gin', ingredients: ['LimeJuice', 'Honey'], stage: 2 },
  { id: 'Southside', name: 'Southside', base: 'Gin', ingredients: ['LimeJuice', 'SugarSyrup', 'Mint'], stage: 2 },
  { id: 'DarkNStormy', name: "Dark 'n' Stormy", base: 'Rum', ingredients: ['LimeJuice', 'GingerBeer'], stage: 2 },
  { id: 'MoscowMule', name: 'Moscow Mule', base: 'Vodka', ingredients: ['LimeJuice', 'GingerBeer'], stage: 2 },
  { id: 'Screwdriver', name: 'Screwdriver', base: 'Vodka', ingredients: ['OrangeJuice'], stage: 2 },
  { id: 'GoldRush', name: 'Gold Rush', base: 'Whiskey', ingredients: ['LimeJuice', 'Honey'], stage: 2 },
  { id: 'MintJulep', name: 'Mint Julep', base: 'Whiskey', ingredients: ['SugarSyrup', 'Mint'], stage: 2 },
  { id: 'GinRickey', name: 'Gin Rickey', base: 'Gin', ingredients: ['LimeJuice', 'SodaWater'], stage: 3 },
  { id: 'TomCollins', name: 'Tom Collins', base: 'Gin', ingredients: ['LimeJuice', 'SugarSyrup', 'SodaWater'], stage: 3 },
  { id: 'CubaLibre', name: 'Cuba Libre', base: 'Rum', ingredients: ['LimeJuice', 'Cola'], stage: 3 },
  { id: 'Mojito', name: 'Mojito', base: 'Rum', ingredients: ['LimeJuice', 'SugarSyrup', 'Mint', 'SodaWater'], stage: 3 },
  { id: 'RumAndCoke', name: 'Rum & Coke', base: 'Rum', ingredients: ['Cola'], stage: 3 },
  { id: 'BlackRussian', name: 'Black Russian', base: 'Vodka', ingredients: ['CoffeeLiqueur'], stage: 3 },
  { id: 'WhiteRussian', name: 'White Russian', base: 'Vodka', ingredients: ['CoffeeLiqueur', 'Cream'], stage: 3 },
  { id: 'WhiskeyAndCoke', name: 'Whiskey & Coke', base: 'Whiskey', ingredients: ['Cola'], stage: 3 },
  { id: 'Martini', name: 'Martini', base: 'Gin', ingredients: ['Vermouth'], stage: 4 },
  { id: 'Negroni', name: 'Negroni', base: 'Gin', ingredients: ['Campari', 'Vermouth'], stage: 4 },
  { id: 'JungleBird', name: 'Jungle Bird', base: 'Rum', ingredients: ['LimeJuice', 'SugarSyrup', 'Campari', 'PineappleJuice'], stage: 4 },
  { id: 'PinaColada', name: 'Piña Colada', base: 'Rum', ingredients: ['CoconutCream', 'PineappleJuice'], stage: 4 },
  { id: 'VodkaMartini', name: 'Vodka Martini', base: 'Vodka', ingredients: ['Vermouth'], stage: 4 },
  { id: 'Boulevardier', name: 'Boulevardier', base: 'Whiskey', ingredients: ['Campari', 'Vermouth'], stage: 4 },
];

export const mlCharacters: MLCharacter[] = [
  {
    id: 'morgan', name: 'Morgan', role: 'Bar owner and mentor', color: '#d8b96c',
    speakingDays: [1, 2, 3, 4, 5, 6, 7],
    visits: [
      { day: 1, order: 1, label: 'Your First Shift', detail: 'Introduces the four bases, one-to-four mixers, and listening to an order.' },
      { day: 6, order: 26, label: 'The Full Shelf', detail: 'Introduces pineapple, Campari and vermouth before the busy music night.' },
      { day: 7, order: 35, label: 'Your Choice', detail: 'Leaves the final flavor choice to the apprentice and invites them back next week.' },
    ],
  },
  {
    id: 'riley', name: 'Riley', role: 'Echo Distortion · vocals and guitar', color: '#c18bd4',
    speakingDays: [1, 2, 3, 4, 5, 6, 7],
    visits: [
      { day: 1, order: 4, label: 'Room for an Idea', detail: 'Notices the space opposite the counter and plans to bring her bandmate.' },
      { day: 2, order: 7, label: 'Echo Distortion', detail: 'Introduces Dylan and their duo while considering the bar as a venue.' },
      { day: 3, order: 14, label: 'The First Proposal', detail: 'Their ticketed headline proposal is refused; Morgan asks for a plan that fits the room.' },
      { day: 4, order: 18, label: 'Getting Started', detail: 'Wants to start playing while Dylan wants to resolve the setup first.' },
      { day: 5, order: 24, label: 'A Plan That Fits', detail: 'A short two-person trial is approved for the next night under agreed limits.' },
      { day: 6, order: 29, label: 'Before the First Song', detail: 'Faces first-song nerves; narration describes the duo beginning their set.' },
      { day: 7, order: 33, label: 'Next Friday', detail: 'Agrees to a regular short Friday slot; a larger ticketed concert remains a future wish.' },
    ],
  },
  {
    id: 'dylan', name: 'Dylan', role: 'Echo Distortion · bass and backing vocals', color: '#df8c62',
    speakingDays: [2, 3, 4, 5, 6, 7],
    visits: [
      { day: 2, order: 8, label: 'A Possible Stage', detail: 'Examines equipment, cables and the available space before asking the owner.' },
      { day: 3, order: 15, label: 'Room to Reconsider', detail: 'Accepts that the first proposal needs revising and suggests taking time to reconsider.' },
      { day: 4, order: 19, label: 'A Shorter Set', detail: 'Proposes fewer songs, less equipment and arrangements suited to the bar.' },
      { day: 5, order: 25, label: 'Before Tomorrow', detail: 'Confirms setup, cable storage and finishing the set on time.' },
      { day: 6, order: 30, label: 'After the Set', detail: 'The set finishes on time; Morgan asks them to return and discuss another night.' },
    ],
  },
  {
    id: 'hazel', name: 'Hazel', role: 'Freelance comic artist · The Orbit Bar', color: '#87bf9d',
    speakingDays: [1, 3, 5, 6, 7],
    visits: [
      { day: 1, order: 3, label: 'A Table to Work At', detail: 'Brings her laptop and drawing tablet to keep working at a bar table.' },
      { day: 3, order: 12, label: 'Working Late', detail: 'Reveals that she draws a monthly comic and is stuck on the final pages.' },
      { day: 3, order: 13, label: 'The Last Episode', detail: 'Names The Orbit Bar and decides to let Elliot read her unfinished ending versions.' },
      { day: 5, order: 22, label: 'The Last Two Pages', detail: 'Clarifies the ending with Elliot and narrows the remaining work to two pages.' },
      { day: 6, order: 27, label: 'Sent', detail: 'Has sent the completed files and tries to rest instead of opening the tablet.' },
      { day: 7, order: 32, label: 'A Night Without Pages', detail: 'Accepts the finished ending and spends an evening with Elliot away from deadlines.' },
    ],
  },
  {
    id: 'elliot', name: 'Elliot', role: 'Magazine editor · Hazel’s serial', color: '#b9bf8c',
    speakingDays: [2, 4, 5, 6, 7],
    visits: [
      { day: 2, order: 9, label: 'An Unfinished Evening', detail: 'Waits for a file and repeatedly checks his phone as the deadline approaches.' },
      { day: 2, order: 10, label: 'Waiting for Pages', detail: 'Explains his monthly comics editing work and the people waiting for the final pages.' },
      { day: 4, order: 16, label: 'Everything After the Deadline', detail: 'Has received three rough endings and recognizes that he should ask what Hazel is stuck on.' },
      { day: 5, order: 21, label: 'A Different Question', detail: 'Discusses concrete panels with Hazel and makes a short revision list.' },
      { day: 6, order: 28, label: 'The Same Place', detail: 'Confirms that the chapter is accepted and celebrates its last page with Hazel.' },
    ],
  },
  {
    id: 'nora', name: 'Nora', role: 'New resident', color: '#7bbfc3',
    speakingDays: [1, 2, 4, 5, 7],
    visits: [
      { day: 1, order: 2, label: 'The New Neighbor', detail: 'Arrives with most of her possessions still packed in boxes.' },
      { day: 2, order: 6, label: 'More Than Taste', detail: 'Returns to the bar as she learns the local landmarks.' },
      { day: 4, order: 17, label: 'Getting to Know the Town', detail: 'Has unpacked and starts recognizing people on the walk to the bar.' },
      { day: 5, order: 23, label: 'The Wrong Door', detail: 'A misdelivered parcel leads to meeting a neighbor and putting up bookshelves together.' },
      { day: 7, order: 31, label: 'The Usual Way Home', detail: 'Comes to the bar without needing a plan and recognizes the route home.' },
    ],
  },
  {
    id: 'june', name: 'June', role: 'Neighborhood regular', color: '#b6c878',
    speakingDays: [1, 3, 4, 6, 7],
    visits: [
      { day: 1, order: 5, label: 'The Familiar Face', detail: 'Welcomes the new apprentice and closes the first night’s guest list.' },
      { day: 3, order: 11, label: 'A Familiar Seat', detail: 'Notices that the apprentice already remembers her usual seat.' },
      { day: 4, order: 20, label: 'Keeping a Place to Talk', detail: 'Welcomes a few songs while asking that the bar remain a place for conversation.' },
      { day: 7, order: 34, label: 'The Quiet Bit', detail: 'Welcomes the music without losing conversation, and helps Nora feel less alone.' },
    ],
  },
];

export const mlDays: MLDay[] = [
  { day: 1, title: 'Sweet Sour Bitter', stage: 1, orders: [1, 2, 3, 4, 5], guests: ['Morgan', 'Nora', 'Hazel', 'Riley', 'June'], milestones: ['First-shift taste tutorial.', 'Introduce the newcomer, working artist, musician and regular.'] },
  { day: 2, title: 'Mixing Aromas', stage: 2, orders: [6, 7, 8, 9, 10], guests: ['Nora', 'Riley', 'Dylan', 'Elliot', 'Elliot'], milestones: ['Introduce aroma and the option to remake a poured drink.', 'Meet Echo Distortion and an editor waiting for comic pages.'] },
  { day: 3, title: 'The Orbit Bar', stage: 2, orders: [11, 12, 13, 14, 15], guests: ['June', 'Hazel', 'Hazel', 'Riley', 'Dylan'], milestones: ['Connect Hazel’s unfinished comic to Elliot’s deadline.', 'Refuse the ticketed concert proposal and leave room for a revised plan.'] },
  { day: 4, title: 'Cream and Bubbles', stage: 3, orders: [16, 17, 18, 19, 20], guests: ['Elliot', 'Nora', 'Riley', 'Dylan', 'June'], milestones: ['Introduce creamy and sparkling textures.', 'The editor and artist begin working from rough pages; the duo reduces its set.'] },
  { day: 5, title: 'Old Friends', stage: 3, orders: [21, 22, 23, 24, 25], guests: ['Elliot', 'Hazel', 'Nora', 'Riley', 'Dylan'], milestones: ['Hazel and Elliot clarify the final two-page revision.', 'Morgan approves a short, limited trial for the following night.'] },
  { day: 6, title: 'Rock Night', stage: 4, orders: [26, 27, 28, 29, 30], guests: ['Morgan', 'Hazel', 'Elliot', 'Riley', 'Dylan'], milestones: ['Unlock the full stock.', 'Hazel’s chapter is accepted; narration describes the duo’s first bar set.'] },
  { day: 7, title: 'A Drink of Your Own', stage: 4, orders: [31, 32, 33, 34, 35], guests: ['Nora', 'Hazel', 'Riley', 'June', 'Morgan'], milestones: ['Establish a recurring Friday slot and a more settled circle of regulars.', 'End with Morgan’s unrestricted valid-drink order and an invitation to return next week.'] },
];

export const mlFlavorModel = {
  taste: ['Sweet', 'Sour', 'Bitter'],
  aroma: ['Herbal', 'Fruity', 'Citrus', 'Floral', 'Woody', 'Spiced'],
  texture: ['Sparkling', 'Creamy'],
  minMixers: 1,
  maxMixers: 4,
  tasteMaxDisplayLevel: 3,
  loneTasteCompanionLevel: 0.2,
  nodeRadii: [0.1969, 0.3969, 0.6],
  /** Actual setup angles measured against the hand-drawn axes. */
  axisAngles: [-1.1, 119.4, 240.3],
  aromaVisibleFromStage: 2,
  textureVisibleFromStage: 3,
  outlineLinearMultiplier: 0.55,
  componentIntensity: 'Each base/mixer carrying a taste contributes one count. Display counts saturate at level 3.',
  colorFormula: 'sRGB(sum(tintStrength × linearRGB) / sum(tintStrength))',
  colorScope: 'An authored tint-weighted linear RGB blend. Equal ingredient selections are not adjustable liquid volumes or a physical subtractive simulation.',
};

export const mlSourceAudit = {
  checkedOn: '2026-11-05',
  kind: 'Serialized data and code audit; not a fresh full Unity playthrough.',
  days: 7,
  orders: 35,
  characters: 7,
  dialogueLinesIncludingSuccessAndFailure: 421,
  classicRecipes: 25,
  sceneScheduleMatchesStorySource: true,
  importedDialogueMatchesStorySource: true,
  storySource: '_tools/mixed_lives_story.json',
  sceneSource: 'Assets/Scenes/SampleScene.unity',
  progression: 'Fixed scheduled visits. Serving success/failure changes the response; either outcome advances the authored visit progression.',
  finalOrder: 'Any valid one-base, one-to-four-mixer drink; no flavor restriction.',
  futureInStory: 'The larger ticketed concert remains a character ambition; the short bar set and recurring Friday slot are authored story events.',
};
