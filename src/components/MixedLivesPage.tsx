import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Project } from '../types';
import { projects } from '../data/portfolio';
import { mixedLivesAudioLicense, mixedLivesMusic, mixedLivesSoundEffects } from '../data/mixedLivesAudio';
import type { MixedLivesAudioCredit } from '../data/mixedLivesAudio';
import VideoPlayButton from './VideoPlayButton';
import MixedLivesStudy from './MixedLivesStudy';
import './mixed-lives.css';

const media = '/media/mixed-lives/';

function AudioCredit({ credit }: { credit: MixedLivesAudioCredit }) {
  return (
    <li className="ml-audio-credit">
      <h4>{credit.title}</h4>
      <p className="ml-audio-author">By {credit.author}</p>
      <p className="ml-audio-use">{credit.use}</p>
      <div className="ml-audio-links">
        <a href={credit.source} target="_blank" rel="noopener noreferrer" aria-label={`${credit.title} — source`}>Source ↗</a>
        <a href={mixedLivesAudioLicense} target="_blank" rel="noopener noreferrer" aria-label={`${credit.title} — CC0 1.0 Universal license`}>CC0 1.0 ↗</a>
      </div>
    </li>
  );
}

export default function MixedLivesPage({ project }: { project: Project }) {
  const film = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const seconds = duration === null ? null : Math.round(duration);
  const durationLabel = seconds === null ? undefined : `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

  const playFilm = () => {
    film.current?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      block: 'center',
    });
    void film.current?.play().catch(() => {});
  };

  return (
    <main className="ml-page" id="main" tabIndex={-1}>
      <div className="ml-container">
        <header className="ml-introduction">
          <div className="ml-hero-copy">
            <p className="ml-kicker">Narrative cocktail game / Unity</p>
            <h1>{project.title}</h1>
            <div className="ml-introduction-copy">
              <p>A hand-drawn narrative cocktail game set across seven nights at a bar. Read each guest’s request, combine spirits and ingredients, and follow visual feedback for taste, aroma, and texture as you mix and serve their drink.</p>
              <VideoPlayButton label="Watch gameplay demo" duration={durationLabel} onClick={playFilm} />
            </div>
          </div>
          <figure className="ml-cover">
            <img
              src={`${media}cover-one.webp`}
              srcSet={`${media}cover-one-800.webp 800w, ${media}cover-one.webp 1920w`}
              sizes="(max-width: 650px) calc(100vw - 40px), (max-width: 850px) calc(100vw - 112px), (max-width: 1500px) 56vw, 800px"
              alt="Hand-drawn artwork of Morgan and Riley seated at the warmly lit cocktail bar"
              width="1920"
              height="1080"
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          </figure>
        </header>

        <section className="ml-film" aria-labelledby="ml-film-heading">
          <div className="ml-section-heading">
            <h2 id="ml-film-heading">Gameplay demo</h2>
            <span>{durationLabel ? `${durationLabel} / ` : ''}Recorded gameplay</span>
          </div>
          <video
            ref={film}
            controls
            playsInline
            preload="metadata"
            width="1600"
            height="900"
            poster={`${media}demo-v2-poster.webp`}
            aria-label="Mixed Lives gameplay demo showing guest dialogue, cocktail mixing, and flavour feedback"
            onLoadedMetadata={event => setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : null)}
          >
            <source src={`${media}demo-v2.mp4`} type="video/mp4" />
            <track kind="subtitles" src={`${media}demo-guide.vtt?v=2`} srcLang="en" label="Feature guide (English)" />
            Your browser does not support this video. <a href={`${media}demo-v2.mp4`}>Open the gameplay demo</a>.
          </video>
          <details className="ml-audio-credits">
            <summary>Audio credits<span>Music & sound sources</span></summary>
            <div className="ml-audio-content">
              <p className="ml-audio-note">Music and sound effects are from the external creators credited below, released under CC0 1.0 Universal. Selected sound excerpts were trimmed, faded, and level-adjusted for the game. The demo mixes the background music separately as a continuous track, with fades and level adjustments alongside the gameplay sound effects.</p>
              <section aria-labelledby="ml-music-heading">
                <h3 id="ml-music-heading">Music</h3>
                <ul className="ml-audio-list ml-audio-list--music"><AudioCredit credit={mixedLivesMusic} /></ul>
              </section>
              <section aria-labelledby="ml-sounds-heading">
                <h3 id="ml-sounds-heading">Sound effects</h3>
                <ul className="ml-audio-list">{mixedLivesSoundEffects.map(credit => <AudioCredit credit={credit} key={credit.source} />)}</ul>
              </section>
            </div>
          </details>
        </section>

        <MixedLivesStudy />

        <nav className="project-navigation ml-navigation" aria-label="Other projects">
          {projects.filter(item => item.id !== project.id).map(item => (
            <Link to={`/work/${item.slug}`} key={item.id}>
              <span>{item.title}</span>
              <svg className="arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 19 19 5M6 5h13v13" stroke="currentColor" strokeWidth="1.35" /></svg>
            </Link>
          ))}
        </nav>
      </div>
    </main>
  );
}
