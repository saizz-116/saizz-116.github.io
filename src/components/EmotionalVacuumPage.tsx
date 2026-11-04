import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { evContent } from '../data/emotionalVacuum';
import { evEnvironment } from '../data/emotionalVacuumEnvironment';
import VideoPlayButton from './VideoPlayButton';
import './emotional-vacuum.css';

const mediaRoot = '/media/emotional-vacuum/';
const youtubeVideoId = 'qHm_HIUTsws';
const youtubeWatchUrl = `https://youtu.be/${youtubeVideoId}`;
type ImageDetail = { file: string; alt: string; caption?: string };
type PhotoProps = ImageDetail & {
  className?: string;
  priority?: boolean;
  onOpen: (image: ImageDetail) => void;
};

function Photo({ file, alt, caption, className = '', priority = false, onOpen }: PhotoProps) {
  return (
    <figure className={`ev-photo ${className}`}>
      <button type="button" className="ev-image-button" onClick={() => onOpen({ file, alt, caption })} aria-label={`Enlarge image: ${alt}`}>
        <img src={`${mediaRoot}${file}`} alt={alt} loading={priority ? 'eager' : 'lazy'} decoding="async" width="1800" height="1012" />
        <span className="ev-enlarge" aria-hidden="true">View image ↗</span>
      </button>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

function SectionLabel({ number, children }: { number: string; children: ReactNode }) {
  return <p className="ev-section-label"><span>{number}</span>{children}</p>;
}

const journey = [
  { title: 'Establish control', action: 'Approach & collect', text: 'Single-emotion encounters introduce the tool. Clearing the room first feels manageable.', file: 'journey-01.webp', alt: 'A red emotion creature in the warm bedroom, facing the virtual vacuum' },
  { title: 'Encounter complexity', action: 'Keep clearing', text: 'Anger, anxiety, and sadness appear together. The familiar task becomes harder to contain.', file: 'journey-02.webp', alt: 'Red, green, and blue emotion creatures sharing the bedroom' },
  { title: 'Carry the consequences', action: 'Persist against friction', text: 'Capture becomes less effective and the room darkens. Collection now has an accumulating cost.', file: 'journey-03.webp', alt: 'The vacuum attempting to capture a creature as the room becomes dimmer' },
  { title: 'Break the routine', action: 'Pause', text: 'Overload and darkness interrupt the clearing task, creating a break in its logic.', file: 'journey-04.webp', alt: 'The bedroom in darkness after the vacuum overloads' },
  { title: 'Discover an opening', action: 'Follow the moonlight', text: 'Light at the window redirects attention toward a possibility beyond the room.', file: 'journey-05.webp', alt: 'Moonlight appearing at the bedroom window' },
  { title: 'Transform & release', action: 'Make a new gesture', text: 'A physical gesture sends light into the night sky. The creatures’ eyes return in later bursts.', file: 'fireworks-burst.webp', alt: 'A golden firework spreading into radiating trails outside the open window' },
];

const creatures = [
  { name: 'Anger', file: 'anger.webp', className: 'anger', text: 'A red, pulsing body: restless energy made visible.' },
  { name: 'Anxiety', file: 'anxiety.webp', className: 'anxiety', text: 'Tangled green lines: an unsettled, entangled presence.' },
  { name: 'Sadness', file: 'sadness.webp', className: 'sadness', text: 'A blue, drooping form with a slower movement rhythm.' },
];

export default function EmotionalVacuumPage() {
  const [selectedImage, setSelectedImage] = useState<ImageDetail | null>(null);
  const [loadMoment, setLoadMoment] = useState<'early' | 'late'>('early');
  const [filmRequest, setFilmRequest] = useState<{ start: number } | null>(null);
  const [filmError, setFilmError] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const filmRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const pendingSeekRef = useRef<number | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (selectedImage && !dialog.open) dialog.showModal();
    if (!selectedImage && dialog.open) dialog.close();
    if (!selectedImage) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [selectedImage]);

  const playFrom = (time: number) => {
    pendingSeekRef.current = time;
    setFilmRequest({ start: time });
    const video = videoRef.current;
    if (video) {
      if (video.readyState >= 1) {
        video.currentTime = time;
        pendingSeekRef.current = null;
      }
      // Keep the native controls available if the browser requires another play gesture.
      void video.play().catch(() => {});
    }
    filmRef.current?.scrollIntoView({ block: 'center', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };

  return (
    <main className="ev-page" id="main" tabIndex={-1}>
      <header className="ev-masthead ev-container">
        <div>
          <Link className="ev-project-name" to="/work/emotional-vacuum">Emotional Vacuum</Link>
        </div>
        <div className="ev-masthead-right"><span>Game design & development / 2026</span><Link to="/cv">CV ↗</Link></div>
      </header>

      <section className="ev-hero ev-container" aria-labelledby="ev-title">
        <div className="ev-hero-copy">
          <p className="ev-kicker">An alternative-controller game</p>
          <h1 id="ev-title">Emotional Vacuum</h1>
          <p className="ev-hero-description">An exploration of emotional suppression through collection, containment, and release.</p>
          <VideoPlayButton label="Watch the experience" duration="4:41" onClick={() => playFrom(0)} />
        </div>
        <Photo file="hero.webp" alt="A player wearing a transparent backpack of emotional creatures and aiming a physical vacuum toward the game screen" priority className="ev-hero-image" onOpen={setSelectedImage} />
        <div className="ev-hero-index"><span>Body ↔ Screen</span><span>A familiar tool. A different kind of burden.</span></div>
      </section>

      <dl className="ev-facts ev-container">
        <div><dt>My role</dt><dd>Team lead · Game design<br />Unity development · 3D art</dd></div>
        <div><dt>Context</dt><dd>Four-person collaboration<br />Makers on Site: Alt.Ctrl Workshop</dd></div>
        <div><dt>Development</dt><dd>Sep–Oct 2026<br />Unity · 3ds Max · Physical computing</dd></div>
      </dl>

      <section className="ev-workshop-context ev-container" aria-labelledby="ev-workshop-heading">
        <h2 id="ev-workshop-heading">Workshop & mentorship</h2>
        <p>{evContent.workshopContext}</p>
      </section>

      <nav className="ev-chapter-nav" aria-label="Project chapters">
        <div className="ev-container"><a href="#concept">01 Concept</a><a href="#journey">02 Experience</a><a href="#environment">03 Environment</a><a href="#embodiment">04 Physical form</a><a href="#decisions">05 Design decisions</a><a href="#development">06 Collaboration</a><a href="#reflection">07 Reflection</a></div>
      </nav>

      <section className="ev-introduction ev-container ev-section" id="concept" aria-labelledby="ev-concept-heading">
        <div><SectionLabel number="01">The design premise</SectionLabel><h2 id="ev-concept-heading">The promise<br />of control.</h2></div>
        <div className="ev-prose ev-concept-copy">{evContent.concept.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div>
        <p className="ev-question">What happens when removing emotions from our surroundings means continuing to carry them ourselves?</p>
      </section>

      <section className="ev-film-band" id="film" aria-labelledby="ev-film-heading">
        <div className="ev-container">
          <div className="ev-film-heading"><div><p className="ev-kicker">The complete experience</p><h2 id="ev-film-heading">See the experience.</h2></div><span>Full project film / 4 min 41 sec</span></div>
          <div ref={filmRef} className="ev-film">
            {filmRequest ? <video
              ref={videoRef}
              src={`${mediaRoot}demo.mp4`}
              poster={`${mediaRoot}hero.webp`}
              aria-label="Emotional Vacuum — complete project film"
              controls
              autoPlay
              playsInline
              preload="metadata"
              width="1600"
              height="840"
              onLoadedMetadata={event => {
                const video = event.currentTarget;
                if (pendingSeekRef.current !== null) {
                  video.currentTime = pendingSeekRef.current;
                  pendingSeekRef.current = null;
                }
                void video.play().catch(() => {});
              }}
              onError={() => setFilmError(true)}
            /> : <button type="button" className="ev-film-poster" onClick={() => playFrom(0)} aria-label="Play Emotional Vacuum project film"><img src={`${mediaRoot}hero.webp`} alt="" width="1800" height="1014" loading="lazy" /><span className="ev-film-play"><span aria-hidden="true">▶</span><span>Play film</span></span></button>}
          </div>
          {filmError && <p className="ev-film-error" role="status">This video could not be loaded. You can watch the full film on YouTube below.</p>}
          <div className="ev-video-bottom"><span>Jump to a moment</span><div className="ev-video-chapters">{[{ time: 10, label: 'Enter the room', stamp: '00:10' }, { time: 40, label: 'Body & screen', stamp: '00:40' }, { time: 175, label: 'Accumulation', stamp: '02:55' }, { time: 250, label: 'Release', stamp: '04:10' }].map(chapter => <button key={chapter.time} type="button" onClick={() => playFrom(chapter.time)} aria-label={`Play video from ${chapter.stamp}: ${chapter.label}`}><span>{chapter.stamp}</span>{chapter.label} ↗</button>)}</div></div>
          <a className="ev-youtube-link" href={`${youtubeWatchUrl}${filmRequest?.start ? `?t=${filmRequest.start}` : ''}`} target="_blank" rel="noopener noreferrer">Watch on YouTube ↗</a>
        </div>
      </section>

      <section className="ev-journey-band" id="journey" aria-labelledby="ev-journey-heading">
        <div className="ev-container ev-section">
          <div className="ev-section-header"><div><SectionLabel number="02">The player journey</SectionLabel><h2 id="ev-journey-heading">From control<br />to <em>release.</em></h2></div><p>The sequence changes the meaning of a familiar action. Collecting first offers control, then creates friction; the ending invites a different response.</p></div>
          <ol className="ev-journey-grid">{journey.map((stage, i) => <li key={stage.title}>
            <div className="ev-stage-top"><span>0{i + 1}</span><span>{stage.action}</span><span aria-hidden="true">{i < 5 ? '↗' : '✦'}</span></div>
            <Photo file={stage.file} alt={stage.alt} onOpen={setSelectedImage} />
            <h3>{stage.title}</h3><p>{stage.text}</p>
          </li>)}</ol>
          <div className="ev-journey-note"><span>Design intention</span><p>Familiarity → apparent mastery → friction → interruption → curiosity → release</p></div>
        </div>
      </section>

      <section className="ev-environment ev-container ev-section" id="environment" aria-labelledby="ev-environment-heading">
        <div className="ev-section-header"><div><SectionLabel number="03">Environment design / 3ds Max → Unity</SectionLabel><h2 id="ev-environment-heading">An ordinary room.<br /><em>A personal interior.</em></h2></div><p>I modeled the furniture and props in 3ds Max, then arranged the environment in Unity. Quiet materials, everyday objects, and hand-drawn references establish the world that the emotional creatures gradually transform.</p></div>
        <Photo className="ev-room-overview" file="room-overview.webp" alt="The bedroom environment with a modeled bed, round table, rug, bookshelves, books, plant, and hand-drawn film posters" caption="An inhabited bedroom: the bed, round table, rug, shelves, and small objects establish a familiar scale around the player." onOpen={setSelectedImage} />
        <div className="ev-room-process"><div className="ev-prose">{evEnvironment.intro.map(paragraph => <p key={paragraph}>{paragraph}</p>)}<ul className="ev-room-palette" aria-label="Environment palette and material direction"><li><span className="ev-swatch ev-swatch--cream" aria-hidden="true" />Cream walls</li><li><span className="ev-swatch ev-swatch--wood" aria-hidden="true" />Warm wood</li><li><span className="ev-swatch ev-swatch--sage" aria-hidden="true" />Muted textiles</li><li><span className="ev-swatch ev-swatch--grey" aria-hidden="true" />Matte surfaces</li></ul></div><Photo className="ev-gameplay-clip" file="room-gameplay-still.webp" alt="A closer gameplay view of the bedside wall, hand-drawn posters, and bedroom furnishings" caption="The room as encountered through play, captured from the Unity gameplay recording." onOpen={setSelectedImage} /></div>
        <div className="ev-room-details"><Photo file="room-detail.webp" alt="The modeled bookshelf, books, potted plant, and floor lamp under warm room lighting" caption="Furniture and material detail. Repeated books, a small plant, warm wood, and softened surfaces give the room a quiet, lived-in character." onOpen={setSelectedImage} /><Photo file="room-window.webp" alt="The same bedroom darkened, with moonlight illuminating the window and nearby surfaces" caption="Lighting becomes guidance. As the room darkens, moonlight redirects attention toward the window and the release sequence." onOpen={setSelectedImage} /></div>
        <div className="ev-posters-heading"><div><p className="ev-kicker">Illustration within the environment</p><h3>Personal references,<br /><em>redrawn by hand.</em></h3><p>Hand-drawn film references give the room a personal, cinematic layer. Their imagery offers connections with perception, inner experience, and the unease of a familiar domestic space.</p></div><Photo file="posters-in-room.webp" alt="Detail of all three hand-drawn film posters placed on the bedroom walls" caption="From drawing to environment: all three artworks appear on the bedroom walls." onOpen={setSelectedImage} /></div>
        <div className="ev-posters">{evEnvironment.posters.map(poster => <article key={poster.id}>
          <Photo file={`poster-${poster.id}.webp`} alt={`Xueyao Jiang’s hand-drawn reinterpretation of ${poster.title}`} className="ev-poster-art" onOpen={setSelectedImage} />
          <div className="ev-poster-title"><h4>{poster.title}</h4><span>{poster.filmYear}</span></div><p>{poster.interpretation}</p><a href={poster.referenceUrl} target="_blank" rel="noopener noreferrer">{poster.referenceLabel} ↗</a>
        </article>)}</div>
      </section>

      <section className="ev-embodiment ev-container ev-section" id="embodiment" aria-labelledby="ev-body-heading">
        <div className="ev-section-header"><div><SectionLabel number="04">Giving emotion a physical form</SectionLabel><h2 id="ev-body-heading">A metaphor<br />you can <em>wear.</em></h2></div><p>The tool and its container place the player inside the idea. Aiming, tilting, and carrying connect the room on screen with the body in front of it.</p></div>
        <div className="ev-body-layout">
          <Photo file="backpack.webp" alt="Rear view of the transparent wearable container holding the handmade emotional creatures" caption="Containment becomes something the player wears. Handmade creatures remain visible through the transparent shell." className="ev-photo--portrait" onOpen={setSelectedImage} />
          <div className="ev-body-details"><div className="ev-principles">{evContent.designPrinciples.map((principle, i) => <article key={principle.title}><span>0{i + 1}</span><div><h3>{principle.title}</h3><p>{principle.text}</p></div></article>)}</div>
            <Photo file="creatures.webp" alt="Handmade emotional creatures created for the physical backpack" caption="Handmade creatures extend the emotional world beyond the screen." onOpen={setSelectedImage} />
          </div>
        </div>
        <div className="ev-creature-heading"><h3>Three emotional presences.</h3><p>Shape, colour, and movement give each emotion a distinct character.</p></div>
        <div className="ev-creatures">{creatures.map(creature => <article className={`ev-creature ev-creature--${creature.className}`} key={creature.name}><Photo file={creature.file} alt={`${creature.name} creature in the game`} onOpen={setSelectedImage} /><h4><span aria-hidden="true" />{creature.name}</h4><p>{creature.text}</p></article>)}</div>
      </section>

      <section className="ev-decision-band" id="decisions" aria-labelledby="ev-decisions-heading">
        <div className="ev-container ev-section">
          <div className="ev-section-header"><div><SectionLabel number="05">Design through constraints</SectionLabel><h2 id="ev-decisions-heading">Making the<br />metaphor playable.</h2></div><p>The concept became specific through practical limits, playtest observations, and conversations across hardware, gameplay, art, and sound.</p></div>
          {evContent.decisions.map((decision, i) => <article className="ev-decision" key={decision.number}>
            <div className="ev-decision-copy"><span className="ev-decision-number">{decision.number}</span><h3>{decision.title}</h3><p>{decision.problem}</p><p>{decision.response}</p><div className="ev-personal-note"><span>My part in the process</span><p>{decision.contribution}</p></div></div>
            <div className="ev-decision-media">
              {i === 0 && <Photo file="prototype.webp" alt="Early controller fabrication with tubing, a backpack, tools, and construction materials" caption="Finding a feasible physical form meant developing the controller and the digital systems together." onOpen={setSelectedImage} />}
              {i === 1 && <div className="ev-comparison"><div className="ev-comparison-controls" role="group" aria-label="Compare two moments in the demo"><button type="button" aria-pressed={loadMoment === 'early'} onClick={() => setLoadMoment('early')}>Early collection</button><button type="button" aria-pressed={loadMoment === 'late'} onClick={() => setLoadMoment('late')}>Accumulated load</button></div><Photo file={loadMoment === 'early' ? 'journey-01.webp' : 'journey-03.webp'} alt={loadMoment === 'early' ? 'Early collection in the brighter room' : 'A later moment with mixed emotions and dimmer room lighting'} onOpen={setSelectedImage} /><p className="ev-comparison-caption" aria-live="polite">{loadMoment === 'early' ? 'A bright room and responsive collection establish the initial promise of control.' : 'As the load increases, reduced effectiveness and fading light express the accumulating burden.'}</p><span className="ev-small-note">Two moments from the demonstration film.</span></div>}
              {i === 2 && <div className="ev-ending-strip">{[{ file: 'journey-04.webp', label: 'Interrupt', alt: 'Darkness interrupts collection' }, { file: 'journey-05.webp', label: 'Redirect', alt: 'Moonlight redirects attention to the window' }, { file: 'fireworks-burst.webp', label: 'Transform', alt: 'A golden firework bursting outside the open window' }].map(moment => <div key={moment.label}><Photo file={moment.file} alt={moment.alt} onOpen={setSelectedImage} /><span>{moment.label}</span></div>)}<p>Light and space introduce a new possibility before a new gesture is required.</p></div>}
            </div>
          </article>)}
        </div>
      </section>

      <section className="ev-development ev-container ev-section" id="development" aria-labelledby="ev-team-heading">
        <div className="ev-section-header"><div><SectionLabel number="06">A shared development process</SectionLabel><h2 id="ev-team-heading">Built through<br /><em>conversation.</em></h2></div><p>Four people working across physical computing, game development, visual art, and music. Our shared task was to make those parts communicate.</p></div>
        <div className="ev-team-images"><Photo file="playtest.webp" alt="Classroom playtesting with a player wearing the backpack and a teammate discussing the interaction" caption="Classroom playtesting brought the controller and the digital game into the same conversation." onOpen={setSelectedImage} /><Photo file="hardware.webp" alt="The physical controller during development and assembly" caption="Development brought together material construction, electronics, and the Unity experience." onOpen={setSelectedImage} /></div>
        <div className="ev-collaboration-copy ev-prose">{evContent.collaboration.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div>
        <div className="ev-process-heading"><h3>From a shared premise to a playable sequence.</h3><span>Development stages</span></div>
        <ol className="ev-timeline">{evContent.timeline.map(stage => <li key={stage.phase}><span>{stage.phase}</span><h4>{stage.title}</h4><p>{stage.text}</p></li>)}</ol>
        <div className="ev-credits"><div><h3>The people<br />behind the work.</h3><p>A four-person collaboration<br />Game design, physical computing, art & music</p></div><dl>{evContent.credits.map(credit => <div key={credit.name}><dt>{credit.name}</dt><dd>{credit.role}</dd></div>)}</dl></div>
      </section>

      <section className="ev-reflection-band" id="reflection" aria-labelledby="ev-reflection-heading">
        <div className="ev-container ev-section"><div className="ev-reflection-grid"><div><SectionLabel number="07">Reflection & further questions</SectionLabel><h2 id="ev-reflection-heading">When a mechanic<br />becomes <em>meaning.</em></h2></div><div className="ev-prose">{evContent.reflection.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div></div><p className="ev-project-status">{evContent.status}</p></div>
        <figure className="ev-final-image"><img src={`${mediaRoot}fireworks-burst.webp`} alt="A golden firework spreading into falling trails outside the moonlit window" loading="lazy" width="1800" height="1013" /><figcaption>What we carry can take another form.</figcaption></figure>
      </section>

      <footer className="ev-footer ev-container"><Link to="/">← All projects</Link><a href="#main">Back to top ↑</a><span>Emotional Vacuum / 2026</span></footer>

      <dialog ref={dialogRef} className="ev-lightbox" onClose={() => setSelectedImage(null)} onClick={event => { if (event.target === event.currentTarget) setSelectedImage(null); }} aria-label="Enlarged project image">
        <button type="button" className="ev-lightbox-close" onClick={() => setSelectedImage(null)} aria-label="Close enlarged image">Close ×</button>
        {selectedImage && <figure><img src={`${mediaRoot}${selectedImage.file}`} alt={selectedImage.alt} /><figcaption>{selectedImage.caption || selectedImage.alt}</figcaption></figure>}
      </dialog>
    </main>
  );
}
