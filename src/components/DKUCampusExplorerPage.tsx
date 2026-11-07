import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { dkuCampusChapters } from '../data/projectChapters';
import './dku-campus-explorer.css';

const media = '/media/dku-campus-tour/';
type PhotographDetail = { file: string; alt: string; caption: string };
const imageSizes: Record<string, [number, number]> = {
  'map.webp': [1600, 983], 'location.webp': [1600, 565],
  'dialogue.webp': [529, 970], 'tower-day.webp': [960, 640],
};

function Photograph({ file, alt, caption, onOpen }: PhotographDetail & { onOpen: (image: PhotographDetail) => void }) {
  const [width, height] = imageSizes[file];
  return <figure className="dku-photo">
    <button className="dku-image-button" type="button" onClick={() => onOpen({ file, alt, caption })} aria-label={`Enlarge image: ${alt}`}>
      <img src={`${media}${file}`} alt={alt} loading="lazy" decoding="async" width={width} height={height} />
      <span aria-hidden="true">Enlarge ↗</span>
    </button>
    <figcaption>{caption}</figcaption>
  </figure>;
}

function DetailFilm({ name, label, caption }: { name: string; label: string; caption: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const [width, height] = name === 'tower-detail' ? [1000, 800] : [1120, 688];
  useEffect(() => {
    const element = video.current;
    if (!element) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    let userPaused = false;
    let automaticPause = false;
    const pauseAutomatically = () => {
      if (!element.paused) { automaticPause = true; element.pause(); }
    };
    const onPause = () => {
      if (automaticPause) automaticPause = false;
      else userPaused = true;
    };
    const onPlay = () => { userPaused = false; };
    const update = () => {
      if (!visible) pauseAutomatically();
      else if (!reducedMotion.matches && !userPaused) void element.play().catch(() => {});
    };
    const onMotionChange = () => { if (reducedMotion.matches) pauseAutomatically(); else update(); };
    element.addEventListener('pause', onPause);
    element.addEventListener('play', onPlay);
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); }, { threshold: .35 });
    observer.observe(element);
    reducedMotion.addEventListener('change', onMotionChange);
    return () => {
      observer.disconnect(); reducedMotion.removeEventListener('change', onMotionChange);
      element.removeEventListener('pause', onPause); element.removeEventListener('play', onPlay); element.pause();
    };
  }, []);
  return <figure className="dku-detail-film">
    <video ref={video} width={width} height={height} controls muted loop playsInline preload="none" poster={`${media}${name}-poster.webp`} aria-label={label}>
      <source src={`${media}${name}.mp4`} type="video/mp4" />
      <a href={`${media}${name}.mp4`}>Open this gameplay detail</a>.
    </video>
    <figcaption>{caption}</figcaption>
  </figure>;
}

function SectionHeading({ number, title, id }: { number: string; title: string; id: string }) {
  return <header className="dku-section-heading"><span className="dku-section-number" aria-hidden="true">{number}</span><h2 id={id}>{title}</h2></header>;
}

export default function DKUCampusExplorerPage() {
  const [filmDuration, setFilmDuration] = useState<number | null>(null);
  const seconds = filmDuration === null ? null : Math.round(filmDuration);
  const imageDialog = useRef<HTMLDialogElement>(null);
  const [selectedImage, setSelectedImage] = useState<PhotographDetail | null>(null);
  useEffect(() => {
    const dialog = imageDialog.current;
    if (!dialog) return;
    if (selectedImage && !dialog.open) dialog.showModal();
    if (!selectedImage && dialog.open) dialog.close();
    if (!selectedImage) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [selectedImage]);

  return <main className="dku-page dku-page--guide" id="main" tabIndex={-1}>
    <section id="dku-overview" className="dku-overview dku-container" aria-labelledby="dku-project-title">
      <header className="dku-overview-heading">
        <div><p className="dku-eyebrow">01 / Overview</p><h1 id="dku-project-title">DKU Campus Explorer</h1></div>
        <p className="dku-project-meta"><span>Campus exploration game</span><span>CS201 · October 2026</span></p>
      </header>
      <div className="dku-overview-layout">
        <div className="dku-overview-copy">
          <p className="dku-introduction">A walkable, two-dimensional version of Duke Kunshan University, where players discover places, talk to campus characters and encounter everyday student life.</p>
          <p>The project offers incoming students a way to get to know DKU, and graduating students a playful return to familiar surroundings. Campus information unfolds through places and conversations along a route the player chooses.</p>
        </div>
        <figure className="dku-walkthrough">
          <video controls playsInline preload="metadata" width="1600" height="982" poster={`${media}campus-demo-poster.webp`} onLoadedMetadata={event => setFilmDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : null)} aria-label="DKU Campus Explorer gameplay walkthrough">
            <source src={`${media}campus-demo.mp4`} type="video/mp4" />
            <track kind="captions" src={`${media}campus-demo.vtt`} srcLang="en" label="English" default />
            <track kind="chapters" src={`${media}campus-demo-chapters.vtt`} srcLang="en" label="Scenes" />
            Your browser does not support this video. <a href={`${media}campus-demo.mp4`}>Open the gameplay video</a>.
          </video>
          <figcaption><span>Gameplay walkthrough{seconds !== null && ` · ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`}</span><span>Sound on · English captions</span></figcaption>
        </figure>
        <dl className="dku-project-facts">
          <div><dt>My role</dt><dd>NPC interactions, campus writing and dialogue, building and character details, music integration, and gameplay refinements.</dd></div>
          <div><dt>Team</dt><dd>A two-person project. My teammate focused on the map, movement, collision and keyboard controls.</dd></div>
          <div><dt>Platform</dt><dd>Java desktop game</dd></div>
        </dl>
      </div>
      <nav className="dku-chapter-nav" id="project-chapters" aria-label="Project contents">
        {dkuCampusChapters.map(chapter => <a key={chapter.id} href={`#${chapter.id}`}>{chapter.label}</a>)}
      </nav>
    </section>

    <section id="dku-gameplay" className="dku-section dku-container" aria-labelledby="dku-gameplay-heading">
      <div className="dku-heading-row"><SectionHeading number="02" title="Gameplay" id="dku-gameplay-heading" /><p className="dku-world-size">25 places · 17 NPCs · 4 campus cats</p></div>
      <div className="dku-gameplay-layout">
        <div className="dku-map-column">
          <Photograph onOpen={setSelectedImage} file="map.webp" alt="The campus map with explored areas and discovered destinations" caption="Explored areas remain visible; discovered places gain labels and become available for fast travel." />
          <p className="dku-controls"><span><kbd>WASD</kbd> / arrows to move</span><span><kbd>Shift</kbd> to run</span><span><kbd>Q</kbd> to interact</span><span><kbd>Tab</kbd> for the map</span></p>
        </div>
        <div className="dku-location-column">
          <div className="dku-prose"><h3>Exploration and discovery</h3><p>The player chooses where to go and whom to approach. Finding a place adds it to the map; returning through fast travel makes a discovered destination accessible again. Roaming cats offer another small interaction along the way.</p></div>
          <Photograph onOpen={setSelectedImage} file="location.webp" alt="The Innovation Building information panel with its real campus photograph and description" caption="A location panel connects the illustrated building to a photograph and information about the real place." />
          <p className="dku-location-note">My campus descriptions sit within these encounters, so the information relates to the place or person the player has just found.</p>
        </div>
      </div>
    </section>

    <section id="dku-interaction" className="dku-section dku-container" aria-labelledby="dku-interaction-heading">
      <SectionHeading number="03" title="Interaction design" id="dku-interaction-heading" />
      <div className="dku-interaction-layout">
        <div className="dku-prose">
          <p>My dialogue work connects campus resources to people encountered nearby: a resident assistant discusses dorm life, while a character collecting food explains the delivery cabinets. Players choose topics and follow-up questions, and can return with Back or begin again with Restart.</p>
          <div className="dku-question-order">
            <h3>Revising question order</h3>
            <p>During our playthroughs, some follow-up questions appeared before the answer that explained them. We revised the links so the opening answer came first, then replayed each branch and checked Back and Restart.</p>
            <ol className="dku-dialogue-sequence" aria-label="Revised food delivery conversation sequence">
              <li><span className="dku-sequence-label">Question</span><p>“What are you doing here?”</p></li>
              <li><span className="dku-sequence-label">Answer</span><p>“I'm picking up my food delivery.”</p></li>
              <li><span className="dku-sequence-label">Follow-up choices</span><ul><li>“Where else can I get food on campus?”</li><li>“So what did you order?”</li></ul></li>
            </ol>
          </div>
        </div>
        <Photograph onOpen={setSelectedImage} file="dialogue.webp" alt="A student discussing office hours in the conversation panel, with follow-up choices and navigation controls" caption="Conversation interface · an office-hours exchange, with follow-up choices and navigation below." />
      </div>
    </section>

    <section id="dku-art" className="dku-section dku-container" aria-labelledby="dku-art-heading">
      <SectionHeading number="04" title="Art & atmosphere" id="dku-art-heading" />
      <div className="dku-tower-detail dku-detail-row">
        <div className="dku-prose">
          <h3>Landmark lighting</h3>
          <p>At night, a single light strip runs along the center of the campus tower. It gradually cycles through six colors, while the tower, paths and surrounding campus take on their night appearance.</p>
          <div className="dku-day-reference"><Photograph onOpen={setSelectedImage} file="tower-day.webp" alt="The campus tower in daylight, showing its shape and central strip" caption="The same landmark in daylight." /></div>
        </div>
        <DetailFilm name="tower-detail" label="Nighttime tower lighting changing color in the game" caption="Night lighting · the central strip changes color during play." />
      </div>
      <div className="dku-courtyard-detail dku-detail-row">
        <DetailFilm name="courtyard-detail" label="A residential courtyard revealing its color as the player enters the central open area" caption="Courtyard discovery · entering the open center reveals its color." />
        <div className="dku-prose"><h3>Courtyard colour</h3><p>Each of the four residential courtyards has its own muted color. The color gradually appears after the player steps into the open center, making the visit visible in the space itself.</p></div>
      </div>
      <aside className="dku-sound-note" aria-labelledby="dku-sound-heading"><h3 id="dku-sound-heading">Day and night sound</h3><p>I integrated two background tracks: <em>Carefree</em> accompanies daytime exploration, and <em>Dream Culture</em> plays at night. The soundtrack changes alongside the campus lighting.</p></aside>
    </section>

    <section id="dku-reflection" className="dku-section dku-reflection dku-container" aria-labelledby="dku-reflection-heading">
      <SectionHeading number="05" title="Reflection" id="dku-reflection-heading" />
      <div className="dku-prose"><p>Adding a character meant considering its conversation, a suitable map position and an interaction point the player could reach. Sharing screenshots and replaying encounters helped us review these pieces together. I learned to consider the campus information alongside the experience of approaching a place, asking a question and finding a way back.</p></div>
    </section>

    <aside className="dku-sources dku-container" aria-label="Project sources and music credits">
      <h2>Credits</h2><div><p>Campus information and photographs: <a href="https://www.dukekunshan.edu.cn/" target="_blank" rel="noreferrer">Duke Kunshan University</a>.</p><p>Music: <a href="https://www.incompetech.com/music/royalty-free/index.html?isrc=USUAN1400037" target="_blank" rel="noreferrer">“Carefree”</a> and <a href="https://www.incompetech.com/music/royalty-free/index.html?isrc=USUAN1300046" target="_blank" rel="noreferrer">“Dream Culture”</a> by Kevin MacLeod (incompetech.com), licensed under <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>. Changes: audio format conversion, volume fades, and gameplay-video editing.</p></div>
    </aside>
    <footer className="dku-footer dku-container"><Link to="/">← All projects</Link><nav aria-label="Other projects"><Link to="/work/emotional-vacuum">Emotional Vacuum ↗</Link><Link to="/work/pcg-project">Procedural House ↗</Link><Link to="/work/mixed-lives">Mixed Lives ↗</Link></nav><a href="#main">Back to top ↑</a></footer>
    <dialog ref={imageDialog} className="dku-image-dialog" aria-label="Enlarged game screenshot" onCancel={() => setSelectedImage(null)} onClose={() => setSelectedImage(null)} onClick={event => { if (event.target === event.currentTarget) setSelectedImage(null); }}>
      {selectedImage && <div><button type="button" className="dku-dialog-close" onClick={() => setSelectedImage(null)} autoFocus>Close ×</button><img src={`${media}${selectedImage.file}`} alt={selectedImage.alt} /><p>{selectedImage.caption}</p></div>}
    </dialog>
  </main>;
}
