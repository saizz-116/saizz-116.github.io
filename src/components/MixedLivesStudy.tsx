import { useEffect, useRef, useState } from 'react';
import { mixedLivesChapters } from '../data/projectChapters';
import { mlCharacters, mlDays, mlFlavorModel, mlIngredients, mlStages } from '../data/mixedLivesSystem';
import MixedLivesRecipeGraph from './MixedLivesRecipeGraph';
import MixedLivesColorLab from './MixedLivesColorLab';
import './mixed-lives-study.css';

const root = '/media/mixed-lives/case-study/';
type ImageDetail = { file: string; alt: string; caption?: string };
const dimensions: Record<string, [number, number]> = {
  'bar-card': [960, 1282], 'bar-card-detail': [559, 438], 'bar-visit-01': [1706, 1279], 'bar-visit-02': [1279, 1706],
  'paper-playtest': [1706, 1279], 'sketch-01': [1281, 1134], 'sketch-02': [1079, 1546], 'sketch-03': [1447, 972],
  'sketch-04': [1279, 1832], 'sketch-05': [1546, 1079], 'sketch-06': [1546, 1079], 'flavor-disc': [602, 645],
  'flavor-before-detail': [575, 520], 'flavor-after-detail': [575, 520], 'texture-creamy-detail': [575, 520],
  'ingredient-gin': [601, 1144], 'ingredient-whiskey': [738, 1066], 'ingredient-campari': [890, 1083],
  'ingredient-mint': [690, 943], 'ingredient-lime': [882, 824], 'ingredient-honey': [695, 1004], 'ingredient-orange': [818, 858],
};

function Source({ href, children }: { href: string; children: React.ReactNode }) {
  return <a className="ml-source" href={href} target="_blank" rel="noopener noreferrer">{children} ↗</a>;
}

function Photo({ file, alt, caption, className = '', onOpen }: ImageDetail & { className?: string; onOpen: (image: ImageDetail) => void }) {
  const [width, height] = dimensions[file] ?? [1600, 900];
  return <figure className={`ml-study-photo ${className}`}>
    <button type="button" className="ml-study-image" onClick={() => onOpen({ file, alt, caption })} aria-label={`Enlarge: ${alt}`}>
      <img src={`${root}${file}.webp`} width={width} height={height} alt={alt} loading="lazy" decoding="async" />
      <span className="ml-enlarge" aria-hidden="true">View image ↗</span>
    </button>
    {caption && <figcaption>{caption}</figcaption>}
  </figure>;
}

function Heading({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return <div className="ml-study-heading"><div><span className="ml-section-number">{number}</span><h2 id={`ml-${number}-heading`}>{title}</h2></div><div className="ml-prose">{children}</div></div>;
}

const referenceWorks = [
  {
    title: 'VA-11 HALL-A', kind: 'Mechanics / drinks and dialogue', image: 'reference-va11', width: 460, height: 215,
    text: 'Sukeban Games makes the prepared drink a way of responding to a person: its official description places branching decisions in bartending, rather than conventional dialogue choices. This gave me a reference for keeping the act of serving inside the conversation.',
    application: 'My focus: translate a guest’s words into taste requirements, so listening has a practical role at the mixing counter.',
    url: 'https://sukeban.moe/press/sheet.php?p=Cyberpunk_Bartender_Action+VA-11+HALL-A', credit: 'Sukeban Games',
  },
  {
    title: 'Potion Craft', kind: 'Mechanics / recipe exploration', image: 'reference-potion', width: 460, height: 215,
    text: 'In niceplay games’ alchemy simulator, ingredients move a potion along an alchemy map. Experimenting with their effects makes discovery spatial and readable. It is a useful reference for letting players learn a system through making, observing, and trying another combination.',
    application: 'My focus: a flavour display that reacts to ingredients, plus a collection of recognisable drinks discovered through combinations.',
    url: 'https://store.steampowered.com/app/1210320/Potion_Craft_Alchemist_Simulator/', credit: 'niceplay games / tinyBuild',
  },
  {
    title: 'Bartender: Glass of God', kind: 'Narrative / attentive service', image: 'reference-bartender', width: 779, height: 492,
    text: 'The adaptation of Araki Joh and Kenji Nagatomo’s manga centres on bartender Ryu Sasakura and the guests who bring their worries to his counter. The drink belongs to a particular encounter: service creates the occasion to notice someone’s circumstances.',
    application: 'My focus: give an order a human context, rather than treating the customer as a request generator.',
    url: 'https://bartender-anime.com/index.html', credit: 'Araki Joh / Kenji Nagatomo / Shueisha / BAR HOPPERS',
  },
  {
    title: 'ODDTAXI', kind: 'Narrative / interconnected lives', image: 'reference-oddtaxi', width: 960, height: 540,
    text: 'Taxi driver Odokawa’s apparently ordinary passenger conversations become connected to a missing-person mystery. Its ensemble structure makes a service job a point where separate lives intersect. I am interested in that accumulation of connections, alongside its carefully controlled reveal of information.',
    application: 'My focus: recurring visits that gradually reveal relationships between people first encountered separately.',
    url: 'https://www.tv-tokyo.co.jp/anime/oddtaxi/story/', credit: 'P.I.C.S. / ODDTAXI partners',
  },
];

const stageIntentions = [
  { title: 'Taste associations', text: 'Three mixers establish sour, bitter, and sweet. A small shelf lets the player connect a selection to a visible change before remembering a larger vocabulary.' },
  { title: 'Aroma vocabulary', text: 'Four new ingredients introduce aroma. Familiar taste rules stay available while guests begin asking for herbal, floral, fruity, citrus, woody, or spiced notes.' },
  { title: 'Combined requirements', text: 'Creamy and sparkling feedback becomes visible. The player now combines taste, aroma, and mouthfeel, including requests that exclude an unwanted property.' },
  { title: 'Independent mixing', text: 'Pineapple, Campari, and vermouth expand the recipe network. The final night ends with an unrestricted drink, giving the player room to use what they have learned.' },
];

function StoryTimeline() {
  const [day, setDay] = useState(1);
  const current = mlDays[day - 1];
  return <div className="ml-story-timeline">
    <div className="ml-subheading"><h3>Seven-night structure</h3><p>Follow a day to read its narrative beats.</p></div>
    <div className="ml-story-workbench">
    <div className="ml-day-buttons" role="group" aria-label="Choose a story day">
      {mlDays.map(item => <button key={item.day} type="button" onClick={() => setDay(item.day)} aria-pressed={day === item.day}>Day {item.day}</button>)}
    </div>
    <div className="ml-story-layout">
    <div className="ml-story-overview">
    <div className="ml-timeline-scroll" tabIndex={0} role="region" aria-label="Character visits across seven days; scroll horizontally on a small screen">
      <svg viewBox="0 0 1060 482" className="ml-timeline-svg" role="img" aria-labelledby="ml-timeline-title ml-timeline-desc">
        <title id="ml-timeline-title">Character visits across seven nights</title>
        <desc id="ml-timeline-desc">Seven horizontal character lines. Filled points mark assigned orders and hollow points mark appearances in other conversations. The day buttons above provide the story in text.</desc>
        <rect x={180 + (day - 1) * 132} y="15" width="92" height="452" className="ml-timeline-selection" rx="2" />
        {mlDays.map(item => <g key={item.day}><text x={226 + (item.day - 1) * 132} y="38" textAnchor="middle" className="ml-chart-day">DAY {item.day}</text><line x1={226 + (item.day - 1) * 132} x2={226 + (item.day - 1) * 132} y1="57" y2="455" className="ml-chart-grid" /></g>)}
        {mlCharacters.map((character, index) => {
          const y = 83 + index * 58;
          return <g key={character.id}>
            <text x="0" y={y + 5} className="ml-chart-name" fill={character.color}>{character.name}</text>
            <line x1={226 + (character.speakingDays[0] - 1) * 132} y1={y} x2={226 + (character.speakingDays[character.speakingDays.length - 1] - 1) * 132} y2={y} stroke={character.color} strokeWidth="2" opacity=".55" />
            {character.speakingDays.map(d => {
              const visits = character.visits.filter(visit => visit.day === d);
              return <g key={d}><circle cx={226 + (d - 1) * 132} cy={y} r={visits.length ? 7 : 5} fill={visits.length ? character.color : '#191a18'} stroke={character.color} strokeWidth="2" />{visits.length > 1 && <text x={226 + (d - 1) * 132} y={y - 14} textAnchor="middle" className="ml-chart-count">{visits.length} orders</text>}</g>;
            })}
          </g>;
        })}
      </svg>
    </div>
    <p className="ml-chart-legend"><span>● Assigned order</span><span>○ Appears in another conversation</span><span>Lines show continuity between appearances.</span></p>
    <div className="ml-day-summary" aria-live="polite"><span className="ml-eyebrow">Day {day} / {current.orders.length} orders</span><h4>{current.title}</h4><ul>{current.milestones.map(milestone => <li key={milestone}>{milestone}</li>)}</ul></div>
    </div>
      <ol className="ml-day-orders" aria-label={`Day ${day} orders`} aria-live="polite">{current.orders.map((order, index) => {
        const character = mlCharacters.find(person => person.visits.some(visit => visit.order === order));
        const visit = character?.visits.find(item => item.order === order);
        return <li key={order}><span>{index + 1}</span><div><h5>{character?.name} <span>{visit?.label}</span></h5><p>{visit?.detail}</p></div></li>;
      })}</ol>
    </div>
    </div>
  </div>;
}

export default function MixedLivesStudy() {
  const [selectedImage, setSelectedImage] = useState<ImageDetail | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (selectedImage && !dialog.open) dialog.showModal();
    if (!selectedImage && dialog.open) dialog.close();
    if (!selectedImage) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = original; };
  }, [selectedImage]);

  return <div className="ml-study">
    <nav className="ml-chapter-nav" id="project-chapters" aria-label="Project chapters">{mixedLivesChapters.map(chapter => <a key={chapter.id} href={`#${chapter.id}`}>{chapter.label}</a>)}</nav>

    <section className="ml-study-section" id="ml-inspiration" aria-labelledby="ml-01-heading">
      <Heading number="01" title="Inspiration"><p>The starting point was a bar I visited with friends. Instead of a fixed menu, it asked us to tick flavours on a card or describe an impression. Ordering became an act of interpretation: what ingredients could turn a few words into a drink?</p><p>I wanted to make that translation playable, from choosing ingredients to discovering that an experimental combination has a name in the wider world of cocktails.</p></Heading>
      <div className="ml-origin-layout">
        <Photo file="bar-card" alt="A cocktail above the bar’s preference card, with taste, aroma, strength, and mouthfeel choices" caption="The menu experience that started the project: describe a preference, then let the bartender interpret it." onOpen={setSelectedImage} />
        <div className="ml-origin-detail"><p className="ml-eyebrow">Personal experience</p><h3>Ordering by flavour</h3><p className="ml-prose">The card makes a guest’s preferences visible without requiring them to know a recipe. I used the same starting point for the game: an order describes an experience, while the player decides how to produce it.</p><div className="ml-origin-gallery"><Photo file="bar-visit-01" alt="Three cocktails with contrasting colours, foam, and citrus or flower garnishes on a bar table" onOpen={setSelectedImage} /><Photo file="bar-visit-02" alt="Two tall cocktails topped with lime, pineapple, and a cherry at the bar" onOpen={setSelectedImage} /></div></div>
      </div>

      <div className="ml-inspiration-map">
        <svg viewBox="0 0 1000 520" preserveAspectRatio="none" aria-hidden="true"><path d="M220 85 340 190M780 85 660 190M220 435 340 330M780 435 660 330" /></svg>
        <article className="ml-map-note ml-map-note--one"><span>Experience</span><h3>Preference card</h3><p>A preference card becomes a guest’s request. The recipe is the player’s response.</p></article>
        <article className="ml-map-note ml-map-note--two"><span>Ingredients</span><h3>Recipe combinations</h3><p>A small set of ingredients produces many possible drinks, including recognisable classics.</p></article>
        <Photo className="ml-map-centre" file="mixing-overview" alt="The complete hand-drawn mixing counter with the flavour disc, ingredient shelf, and order board" caption="The mixing counter brings these starting points together." onOpen={setSelectedImage} />
        <article className="ml-map-note ml-map-note--three"><span>Perception</span><h3>Flavour visualisation</h3><p>A changing shape, colour, and texture make an invisible result available to the eye.</p></article>
        <article className="ml-map-note ml-map-note--four"><span>People</span><h3>Recurring guests</h3><p>A shared counter lets separate lives return, overlap, and become familiar.</p></article>
      </div>

      <div className="ml-inspiration-notes">
        <article><h3>Cocktails as combinations</h3><p>A cocktail is a mixed drink, but the interest lies in how its ingredients work together. A spirit provides a starting character; citrus, sweeteners, bitter ingredients, and aromatic modifiers change the balance. The IBA’s Daiquiri pairs rum with lime juice and sugar; its Negroni combines gin, Campari, and sweet red vermouth. A few ingredients can create very different sensory identities.</p><p>That variety offers both a system to explore and a playful vocabulary. Names such as Screwdriver, Bee’s Knees, and Jungle Bird can turn a mixture into a character or an image. I wanted discovery to carry some of that pleasure.</p><Source href="https://iba-world.com/iba-cocktail/daiquiri/">IBA / Daiquiri</Source><Source href="https://iba-world.com/iba-cocktail/negroni/">IBA / Negroni</Source></article>
        <article className="ml-synesthesia"><div><h3>Synesthesia</h3><p>Since childhood, I have associated numbers, letters, and tastes with particular colours. This personal experience made cocktails an appealing subject: a drink can be imagined through a colour or shape before it is tasted.</p><p>Research describes synesthesia as an additional, involuntary experience triggered by a stimulus. Here, my personal associations become an authored visual language: the flavour disc gives the player a consistent way to see the mixture. Its mappings are designed rules that can be learned.</p><Source href="https://pubmed.ncbi.nlm.nih.gov/16919755/">Research / synesthetic experience</Source></div><img src={`${root}flavor-disc.webp`} width="602" height="645" alt="The hand-drawn flavour disc, with sweet, sour, and bitter axes" loading="lazy" /></article>
      </div>
    </section>

    <section className="ml-study-section" id="ml-references" aria-labelledby="ml-02-heading">
      <Heading number="02" title="References"><p>Two mechanical references helped frame mixing and discovery. Two narrative references helped me think about a public-facing job as a place to encounter people, hear partial stories, and gradually recognise how those stories connect.</p></Heading>
      <div className="ml-references">{referenceWorks.map(work => <article key={work.title}>
        <a href={work.url} target="_blank" rel="noopener noreferrer" className={`ml-reference-image ml-reference-image--${work.image}`} aria-label={`${work.title} official reference`}><img src={`${root}${work.image}.webp`} alt={`Official reference image for ${work.title}`} width={work.width} height={work.height} loading="lazy" decoding="async" /></a>
        <span className="ml-eyebrow">{work.kind}</span><h3>{work.title}</h3><p>{work.text}</p><p className="ml-reference-application">{work.application}</p><Source href={work.url}>Official source</Source><small>© {work.credit}.</small>
      </article>)}</div>
    </section>

    <section className="ml-study-section" id="ml-mechanics" aria-labelledby="ml-03-heading">
      <Heading number="03" title="Mechanics"><p>A guest describes the drink they want. The player turns that description into ingredient choices, reads the feedback, then serves the result. The rules give each choice a predictable effect while leaving room for more than one solution.</p></Heading>
      <div className="ml-rule-equation"><div><strong>1</strong><span>base spirit</span><p>Gin · Vodka · Whiskey · Rum</p></div><span aria-hidden="true">+</span><div><strong>1–4</strong><span>different mixers</span><p>From the ingredients currently unlocked</p></div><span aria-hidden="true">→</span><div><strong>1</strong><span>drink to interpret</span><p>Judge its properties against the order</p></div></div>
      <div className="ml-property-grid">{[
        ['Taste', 'Sweet · Sour · Bitter', 'Each component contributes its taste properties. A rum base already contributes sweetness; lime adds sourness.'],
        ['Aroma', mlFlavorModel.aroma.join(' · '), 'A separate layer describes fragrant character. An ingredient can contribute to more than one aroma category.'],
        ['Texture', 'Sparkling · Creamy', 'Mouthfeel has its own feedback, so a drink can be sweet and fruity while also being sparkling or creamy.'],
      ].map(([title, vocabulary, text], index) => <article key={title}><span className="ml-small-number">0{index + 1}</span><h3>{title}</h3><p className="ml-property-vocabulary">{vocabulary}</p><p>{text}</p></article>)}</div>
      <div className="ml-mechanic-note"><h3>Orders & recipe discovery</h3><div className="ml-prose"><p>Orders check requested properties and exclusions. A sweet-and-sour request leaves room for several combinations. Classic-drink recognition uses a separate, exact set of ingredients: a Gimlet is gin, lime juice, and sugar syrup in the game; adding mint changes that set to a Southside.</p><p>This separates two reasons to experiment: making something appropriate for the guest, and finding a named drink. The game uses simplified ingredient sets, without real-world measures or preparation techniques.</p></div></div>

      <div className="ml-subheading"><h3>Mixing flow</h3><p>Action, visible feedback, and the next decision.</p></div>
      <ol className="ml-mixing-flow">{[
        ['Read the order', 'Dialogue establishes the request; the order board keeps the relevant conditions in view.'],
        ['Choose ingredients', 'Pick one base and add different mixers. The first base stays fixed until the shaker is emptied.'],
        ['Inspect the result', 'The disc changes with the mixture; the order checklist shows which conditions are met.'],
        ['Pour and decide', 'Serve the drink, or use Drink Myself to discard it and remake the same order.'],
        ['See the response', 'The guest reacts to the served drink. A matching classic can also be recognised.'],
      ].map(([title, text], index) => <li key={title}><span>0{index + 1}</span><h4>{title}</h4><p>{text}</p>{index < 4 && <b aria-hidden="true">→</b>}</li>)}</ol>
      <Photo className="ml-mixing-overview" file="mixing-overview" alt="The order board, selected ingredients, shaker, and flavour disc in the final mixing interface" caption="The order board sits below the disc on the left; ingredients occupy the shelf on the right. Feedback and the request remain visible while mixing." onOpen={setSelectedImage} />

      <div className="ml-wheel-intro"><div><p className="ml-eyebrow">Visual feedback</p><h3>Flavour disc</h3><div className="ml-prose"><p>Real flavour wheels organise sensory vocabulary. The Scotch Whisky Research Institute developed its wheel with industry blenders in 1979; it helps people name and compare what they perceive.</p><p>I borrowed that organising idea and made it into an imagined object on the counter. The disc responds to the player’s mixture, giving it a slightly surreal role: an instrument that makes taste visible.</p></div><Source href="https://www.swri.co.uk/timeline/1979-2/">SWRI / flavour wheel</Source></div><figure className="ml-external-wheel"><img src={`${root}reference-flavor-wheel.webp`} width="400" height="399" alt="The Scotch Whisky Research Institute flavour wheel, grouping descriptive sensory terms" loading="lazy" /><figcaption>Reference: Scotch Whisky Research Institute flavour wheel. © SWRI. <Source href="https://www.swri.co.uk/timeline/1979-2/">Original</Source></figcaption></figure></div>
      <div className="ml-wheel-anatomy">
        <figure className="ml-wheel-motion">
          <video controls playsInline muted loop preload="metadata" poster={`${root}flavor-motion-poster.webp`} width="576" height="520" aria-label="Recorded gameplay showing ingredient selections changing the disc’s taste triangle and the moving sheen across its surface">
            <source src={`${root}flavor-motion.mp4`} type="video/mp4" />
            <a href={`${root}flavor-motion.mp4`}>Watch the flavour disc in motion</a>.
          </video>
          <figcaption>Recorded gameplay / the triangle updates with the selection; surface highlights continue moving between selections.</figcaption>
        </figure>
        <ol>
          <li><h4>Triangle shape / taste</h4><p>Sweet, sour, and bitter occupy three axes. Each component carrying a taste adds one count, displayed up to three levels. Choosing another ingredient redraws the triangle, making its contribution visible immediately. A single-taste drink keeps a small triangle; with no taste contributions, only the origin dot is shown.</p></li>
          <li><h4>Triangle colour / the mixture</h4><p>The same triangle carries the mixture’s colour. Its translucent fill combines the ingredients’ colours and tint strengths, while a darker outline keeps the shape legible against the disc. Shape describes the taste contributions; colour gives those ingredients a shared visual identity.</p></li>
          <li><h4>Surface motion / liquid sheen</h4><p>Slow highlights drift across the coloured triangle, giving it a liquid-like surface. Ingredient choices change the base colour and geometry; between choices, the outline stays fixed while the highlights move. This keeps the feedback readable and connects the diagram to the act of mixing a drink.</p></li>
          <li><h4>Outer indicators / aroma</h4><p>Six separate indicators show which aromas are present. They become visible from the second stage, adding vocabulary around the taste triangle.</p></li>
          <li><h4>Texture / mouthfeel</h4><p>From the third stage, separate hand-drawn bubbles and cream layers express sparkling and creamy textures. These cues add mouthfeel to the disc’s shape, colour, and motion.</p></li>
        </ol>
      </div>
      <div className="ml-feedback-pair"><Photo file="flavor-before-detail" alt="An earlier selection in the recorded order, with fewer active flavour properties" caption="Earlier selection / a narrower set of taste contributions." onOpen={setSelectedImage} /><Photo file="flavor-after-detail" alt="Later in the same recorded order, after further ingredients are selected" caption="Later selection / taste, aroma, and colour feedback change." onOpen={setSelectedImage} /><Photo file="texture-creamy-detail" alt="The live disc with a creamy layer over its taste shape" caption="Texture / the creamy treatment adds a visible mouthfeel cue." onOpen={setSelectedImage} /></div>
      <MixedLivesColorLab />
    </section>

    <section className="ml-study-section" id="ml-learning" aria-labelledby="ml-04-heading">
      <Heading number="04" title="Learning Curve"><p>The paper playtest revealed two problems: players found too many ingredients difficult to distinguish, and they wanted a reason to keep playing. I responded with staged ingredient unlocks and a display that introduces one sensory layer at a time.</p></Heading>
      <div className="ml-playtest-layout"><Photo file="paper-playtest" alt="Hand-drawn paper prototype with ingredient cards and a taste diagram being tested on a table" caption="Paper playtest: trying the ingredient system before relying on the finished digital interface." onOpen={setSelectedImage} /><div><article><span className="ml-eyebrow">Observation 01</span><h3>Too many ingredients at once</h3><p>Start with three mixers and a direct taste relationship. Add stock in groups so the player can connect each new ingredient to what they already know.</p></article><article><span className="ml-eyebrow">Observation 02</span><h3>Little reason to continue</h3><p>Keep locked ingredients visible in shadow. Their presence suggests that the bar has more to reveal, while new stock opens further named recipes to discover.</p></article></div></div>
      <div className="ml-stage-list">{mlStages.map((stage, index) => <article className="ml-stage" key={stage.stage}><div className="ml-stage-top"><span className="ml-eyebrow">Stage 0{stage.stage}</span><span>Day {stage.days.join('–')}</span></div><Photo file={`stage-0${stage.stage}`} alt={`Recorded stage ${stage.stage} interface with ${stage.ingredientCount} mixers available and ${stage.focus.toLowerCase()} feedback`} onOpen={setSelectedImage} /><div className="ml-stage-body"><div><h3>{stage.focus}</h3><p className="ml-stage-count"><strong>{stage.ingredientCount}</strong> mixers <span>+ 4 base spirits</span></p><p className="ml-stage-new">New: {stage.newIngredients.map(id => mlIngredients.find(item => item.id === id)?.label).join(' · ')}</p></div><div><h4>{stageIntentions[index].title}</h4><p>{stageIntentions[index].text}</p><p className="ml-classic-count">{stage.classicCount} classics now possible <span>+{stage.newClassicCount} this stage</span></p></div></div></article>)}</div>
      <MixedLivesRecipeGraph />
    </section>

    <section className="ml-study-section" id="ml-narrative" aria-labelledby="ml-05-heading">
      <Heading number="05" title="Narrative"><p>The bar is a shared point in seven people’s routines. Returning guests bring changes from outside the room; the player gradually learns who is working together, what is unresolved, and why a familiar order feels different tonight.</p><p>The seven-night structure gives those changes a rhythm: introduction, complication, revision, and small forms of resolution.</p></Heading>
      <div className="ml-character-scene" aria-label="The cast gathered along the illustrated bar counter">
        <div className="ml-character-stage">
          <img className="ml-character-art" src={`${root}cast-lineup.webp`} width="2240" height="432" alt="Morgan, Riley, Dylan, Hazel, Elliot, Nora, and June behind the bar" loading="lazy" decoding="async" />
          <ul className="ml-character-lineup">{mlCharacters.map(character => <li key={character.id}><h3>{character.name}</h3><p>{character.role}</p></li>)}</ul>
        </div>
      </div>
      <div className="ml-narrative-arcs"><article><h3>Riley & Dylan</h3><p>A band wants to play at the bar. Their first ticketed-show proposal does not fit the room; they revise the plan into a short set with clear limits. The trial on night six leads to a recurring Friday slot. Their arc is about adjusting an ambition to the people and place around it.</p></article><article><h3>Hazel & Elliot</h3><p>An artist struggling with a comic ending and an editor waiting for pages first appear separately. Their stories connect through the same deadline. Progress comes when the discussion moves from pressure to specific unfinished panels; the accepted chapter makes room for an evening together.</p></article><article><h3>Nora, June & Morgan</h3><p>A newcomer learns the route home, a regular values having somewhere to talk, and the owner negotiates what the bar can become. Their quieter continuity gives the larger events a social setting: a place becomes familiar through returning to it.</p></article></div>
      <StoryTimeline />
    </section>

    <section className="ml-study-section" id="ml-art" aria-labelledby="ml-06-heading">
      <Heading number="06" title="Art"><p>The hand-drawn bar has two jobs: establish an intimate place to meet people, and make the mixing system easy to read. The layout studies explore where the guest, ingredient stock, order, and flavour feedback should sit in that shared space.</p></Heading>
      <div className="ml-subheading"><h3>Layout studies</h3><p>From flow diagrams and paper arrangements to the painted counter.</p></div>
      <div className="ml-sketch-grid">{[
        ['sketch-01', 'Interface flow', 'Diagram of interface views and the transitions between them.'],
        ['sketch-02', 'View arrangement', 'Rough layout study for the guest and mixing views.'],
        ['sketch-03', 'Starting ingredients', 'Hand-drawn layout study of the initial stock and taste axes.'],
        ['sketch-04', 'Later-stage stock', 'Ingredient and interface planning for later stages.'],
        ['sketch-05', 'Colour and hierarchy', 'Colour-block study of the counter and information areas.'],
        ['sketch-06', 'Painted layout', 'Drawn layout study bringing the elements into the bar setting.'],
      ].map(([file, label, alt]) => <Photo key={file} file={file} alt={alt} caption={label} onOpen={setSelectedImage} />)}</div>
      <div className="ml-art-final"><Photo file="stage-04" alt="Current fully unlocked mixing interface with the feedback disc on the left and ingredient stock on the right" caption="Current layout / a stable order board and flavour display on the left, with the stock on the right." onOpen={setSelectedImage} /><div><h3>Information hierarchy</h3><ol><li><strong>The request stays visible.</strong> The board holds the conditions while the player works.</li><li><strong>The result sits near the action.</strong> The disc connects ingredient selection to immediate feedback.</li><li><strong>The shelf reveals progress.</strong> Fixed positions let the stock become familiar; shadowed items show what remains to unlock.</li></ol></div></div>
      <div className="ml-subheading"><h3>Ingredient illustrations</h3><p>Distinct silhouettes, labels, and small material details.</p></div>
      <div className="ml-ingredient-gallery">{[
        ['ingredient-gin', 'Gin', 'A botanical bottle silhouette and its hand-drawn label.'],
        ['ingredient-whiskey', 'Whiskey', 'Amber liquid and a broad-shouldered bottle.'],
        ['ingredient-campari', 'Campari', 'Deep red liquid and an individual bottle shape.'],
        ['ingredient-mint', 'Mint', 'Overlapping leaves and irregular stems.'],
        ['ingredient-lime', 'Lime', 'Fruit flesh and rind in a recognisable cut shape.'],
        ['ingredient-honey', 'Honey', 'Warm honey colour, a squeeze bottle, and its pointed nozzle.'],
      ].map(([file, label, alt]) => <Photo key={file} file={file} alt={alt} caption={label} onOpen={setSelectedImage} />)}</div>
    </section>

    <section className="ml-study-section ml-reflection" id="ml-reflection" aria-labelledby="ml-07-heading">
      <Heading number="07" title="Reflection"><p>The paper test made the relationship between freedom and guidance concrete. More combinations create room for discovery, but the player first needs a readable vocabulary. The staged shelf and layered disc are my response to that problem.</p><p>The next evaluation should test those decisions in play: whether the disc is understood, whether each unlock invites experimentation, and how failure consequences can give serving a drink more narrative weight.</p></Heading>
      <div className="ml-reflection-questions"><article><span>01</span><h3>Reading the feedback</h3><p>Can players explain why the shape or texture changed, and predict what one more ingredient will do?</p></article><article><span>02</span><h3>Continuing to experiment</h3><p>Do shadowed ingredients and named recipes create curiosity after the immediate order has been solved?</p></article><article><span>03</span><h3>Consequences of service</h3><p>How should an unsuccessful drink affect the next encounter while preserving room to learn the system?</p></article></div>
    </section>

    <footer className="ml-study-footer"><a className="ml-back-top" href="#main">Back to top ↑</a></footer>

    <dialog ref={dialogRef} className="ml-study-dialog" aria-label="Enlarged project image" onCancel={() => setSelectedImage(null)} onClose={() => setSelectedImage(null)} onClick={event => { if (event.target === event.currentTarget) setSelectedImage(null); }}>
      <button className="ml-dialog-close" type="button" onClick={() => setSelectedImage(null)}>Close ×</button>
      {selectedImage && <figure><img src={`${root}${selectedImage.file}.webp`} alt={selectedImage.alt} /><figcaption>{selectedImage.caption || selectedImage.alt}</figcaption></figure>}
    </dialog>
  </div>;
}
