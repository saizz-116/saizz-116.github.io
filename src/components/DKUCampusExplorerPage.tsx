import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import VideoPlayButton from './VideoPlayButton';
import './dku-campus-explorer.css';

const media = '/media/dku-campus-tour/';

type PhotographDetail = { file: string; alt: string; caption: string };
const imageSizes: Record<string, [number, number]> = {
  'overview.webp': [1600, 983], 'map.webp': [1600, 983], 'location.webp': [1600, 565],
  'dialogue.webp': [529, 970], 'tower-day.webp': [960, 640], 'tower-night.webp': [960, 640],
};

function Photograph({ file, alt, caption, onOpen }: PhotographDetail & { onOpen: (image: PhotographDetail) => void }) {
  const [width, height] = imageSizes[file] ?? [1600, 983];
  return <figure className="dku-photo"><button className="dku-image-button" type="button" onClick={() => onOpen({ file, alt, caption })} aria-label={`Enlarge image: ${alt}`}><img src={`${media}${file}`} alt={alt} loading={file === 'overview.webp' ? 'eager' : 'lazy'} decoding="async" width={width} height={height} /><span aria-hidden="true">Enlarge ↗</span></button><figcaption>{caption}</figcaption></figure>;
}

const journey = [
  ['Explore', 'Walk, run, and choose a route through campus.'],
  ['Discover', 'Reveal places and record visited areas.'],
  ['Interact', 'Read a location or follow a conversation.'],
  ['Revisit', 'Use the map to return to discovered places.'],
];

export default function DKUCampusExplorerPage() {
  const film = useRef<HTMLVideoElement>(null);
  const [filmDuration, setFilmDuration] = useState<number | null>(null);
  const filmSeconds = filmDuration === null ? null : Math.round(filmDuration);
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
  const playFilm = () => {
    film.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'center' });
    void film.current?.play().catch(() => {});
  };

  return (
    <main className="dku-page" id="main" tabIndex={-1}>
      <header className="dku-masthead dku-container">
        <div><h1><Link to="/work/dku-campus-tour">DKU Campus Explorer</Link></h1></div>
      </header>

      <section className="dku-hero dku-container" aria-labelledby="dku-introduction">
        <div className="dku-hero-copy">
          <p className="dku-kicker">A playable campus guide</p>
          <h2 id="dku-introduction">A familiar place.<br />A new way<br />to explore.</h2>
          <p>DKU Campus Explorer turns Duke Kunshan University into a small, walkable world of places, conversations, and everyday encounters. Built as a two-person CS201 class project in October 2026, it invites incoming students to find their way and alumni to revisit familiar surroundings.</p>
          <VideoPlayButton label="Watch the campus walkthrough" onClick={playFilm} />
        </div>
        <Photograph onOpen={setSelectedImage} file="overview.webp" alt="Top-down view of the playable DKU campus, with buildings, paths, and the player character" caption="A stylized campus, explored at the player’s own pace." />
      </section>

      <dl className="dku-facts dku-container">
        <div><dt>World</dt><dd>25 places · 17 NPCs · 4 cats</dd></div>
        <div><dt>Built with</dt><dd>Java · Swing · Java2D</dd></div>
        <div><dt>My focus</dt><dd>NPC interaction, dialogue & campus detail</dd></div>
      </dl>

      <section className="dku-film dku-container" aria-labelledby="dku-film-heading">
        <div className="dku-section-top"><h2 id="dku-film-heading">Walk the campus.</h2><span>{filmSeconds !== null && `${Math.floor(filmSeconds / 60)}:${String(filmSeconds % 60).padStart(2, '0')} · `}Gameplay highlights</span></div>
        <video ref={film} controls playsInline preload="metadata" width="1600" height="982" poster={`${media}campus-demo-poster.webp`} onLoadedMetadata={event => setFilmDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : null)} aria-label="DKU Campus Explorer gameplay walkthrough">
          <source src={`${media}campus-demo.mp4`} type="video/mp4" />
          <track kind="captions" src={`${media}campus-demo.vtt`} srcLang="en" label="English" default />
          <track kind="chapters" src={`${media}campus-demo-chapters.vtt`} srcLang="en" label="Scenes" />
          Your browser does not support this video. <a href={`${media}campus-demo.mp4`}>Open the gameplay video</a>.
        </video>
      </section>

      <section className="dku-guide dku-container dku-section" aria-labelledby="dku-guide-heading">
        <div className="dku-section-heading"><p className="dku-kicker">01 / Exploration & information</p><h2 id="dku-guide-heading">Let the route<br />lead to the information.</h2><p>Players move with WASD or arrow keys, run with Shift, and press Q for a nearby interaction. Location panels connect illustrated places to photographs and campus information. Tab opens a map that records exploration; discovered places gain readable labels and fast travel. Information arrives where it belongs, with freedom to choose the next stop.</p></div>
        <ol className="dku-journey">{journey.map(([title, text], index) => <li key={title}><span className="dku-step">0{index + 1}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}</ol>
        <div className="dku-guide-images">
          <Photograph onOpen={setSelectedImage} file="map.webp" alt="Campus map showing location markers and exploration progress" caption="The map becomes a record of discovery and a way back." />
          <Photograph onOpen={setSelectedImage} file="location.webp" alt="A campus location introduction with a photograph and descriptive information" caption="Location panels connect the game world to the real campus." />
        </div>
      </section>

      <section className="dku-night" aria-labelledby="dku-night-heading"><div className="dku-container dku-section">
        <div className="dku-night-heading"><div><p className="dku-kicker">02 / Details worth noticing</p><h2 id="dku-night-heading">The campus changes<br />when you look again.</h2></div><p>I worked on building and character details and integrated the background music. At night, a vertical light strip on the landmark tower cycles through six colors. Residential courtyards reveal their muted colors as players enter their open centers. Roaming cats offer a small invitation to stop and interact. These details give exploration moments beyond reading the next information panel.</p></div>
        <div className="dku-tower-pair"><Photograph onOpen={setSelectedImage} file="tower-day.webp" alt="The campus landmark tower during daytime" caption="Day / the landmark in its campus setting" /><Photograph onOpen={setSelectedImage} file="tower-night.webp" alt="The same tower at night with its illuminated vertical light strip" caption="Night / one light strip cycles through six colors" /></div>
      </div></section>

      <section className="dku-dialogue dku-container dku-section" aria-labelledby="dku-dialogue-heading">
        <div className="dku-dialogue-copy"><p className="dku-kicker">03 / People give places context</p><h2 id="dku-dialogue-heading">Start with a person.<br />Follow your curiosity.</h2><p>My work on NPC interactions, campus descriptions, and dialogue connects practical information to individual encounters. A resident assistant introduces dorm life; a student collecting food talks about delivery lockers. Players choose topics and follow-up questions, with Back and Restart supporting another route through the conversation.</p><div className="dku-iteration"><h3>A small change to question order</h3><p>During our playthroughs, some follow-up questions appeared before the answer that explained them. We corrected the dialogue links so the opening question and answer came first, then replayed each branch and checked Back and Restart. The refinement made the conversation easier to follow.</p></div></div>
        <Photograph onOpen={setSelectedImage} file="dialogue.webp" alt="A campus character conversation with selectable questions and follow-up dialogue" caption="Questions reveal information in context, one exchange at a time." />
      </section>

      <section className="dku-contribution dku-container dku-section" aria-labelledby="dku-contribution-heading">
        <div><p className="dku-kicker">04 / Contribution & reflection</p><h2 id="dku-contribution-heading">A shared world.<br />My part in making it.</h2></div>
        <div className="dku-contribution-copy"><p>I focused on NPC interactions, campus descriptions and dialogue, building and character details, music integration, and gameplay refinements. My teammate focused on the campus map, movement, collision, and keyboard controls. We reviewed the game together, using playthroughs and screenshots to connect content, reachable interaction points, and working conversations.</p><p>This project showed me how closely a guide’s usefulness depends on the experience around its information. Our checks were internal; a next step would be to invite incoming students to play, then observe where they hesitate, what they remember, and which places they choose to revisit.</p></div>
      </section>

      <aside className="dku-sources dku-container" aria-label="Project sources and music credits"><p>Two-person collaboration. My collaborator’s name is omitted for privacy.</p><p>Campus information & photographs: <a href="https://www.dukekunshan.edu.cn/" target="_blank" rel="noreferrer">Duke Kunshan University</a>.</p><p>Music: <a href="https://www.incompetech.com/music/royalty-free/index.html?isrc=USUAN1400037" target="_blank" rel="noreferrer">“Carefree”</a> and <a href="https://www.incompetech.com/music/royalty-free/index.html?isrc=USUAN1300046" target="_blank" rel="noreferrer">“Dream Culture”</a> by Kevin MacLeod (incompetech.com), licensed under <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>. Changes: audio format conversion, volume fades, and gameplay-video editing.</p></aside>
      <footer className="dku-footer dku-container"><Link to="/">← All projects</Link><nav aria-label="Other projects"><Link to="/work/emotional-vacuum">Emotional Vacuum ↗</Link><Link to="/work/pcg-project">Procedural House ↗</Link><Link to="/work/mixed-lives">Mixed Lives ↗</Link></nav><a href="#main">Back to top ↑</a></footer>
      <dialog ref={imageDialog} className="dku-image-dialog" aria-label="Enlarged game screenshot" onCancel={() => setSelectedImage(null)} onClose={() => setSelectedImage(null)} onClick={event => { if (event.target === event.currentTarget) setSelectedImage(null); }}>
        {selectedImage && <div><button type="button" className="dku-dialog-close" onClick={() => setSelectedImage(null)} autoFocus>Close ×</button><img src={`${media}${selectedImage.file}`} alt={selectedImage.alt} /><p>{selectedImage.caption}</p></div>}
      </dialog>
    </main>
  );
}
