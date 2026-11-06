import { useEffect, useRef, useState } from 'react';
import type { SyntheticEvent } from 'react';

const recordings = [
  { id: 'modeling-demo', title: 'Houdini & 3ds Max', duration: '1:24', height: 996 },
  { id: 'materials-engine-demo', title: 'Unreal Engine · Substance Designer · Houdini', duration: '2:44', height: 1038 },
];

function ProcessVideo({ recording, onPlay }: {
  recording: typeof recordings[number];
  onPlay: (event: SyntheticEvent<HTMLVideoElement>) => void;
}) {
  const [opened, setOpened] = useState(false);
  const [failed, setFailed] = useState(false);
  const player = useRef<HTMLVideoElement>(null);
  const base = `/media/pcg-project/${recording.id}`;

  useEffect(() => {
    if (opened) void player.current?.play().catch(() => {});
  }, [opened]);

  return <section className="pcg-process-film" aria-labelledby={`${recording.id}-heading`}>
    <header className="pcg-film-heading">
      <h3 id={`${recording.id}-heading`}>{recording.title}</h3>
      <span>{recording.duration}</span>
    </header>
    <figure className="pcg-film-frame" style={{ aspectRatio: `1920 / ${recording.height}` }}>
      {opened ? <video
        ref={player}
        src={`${base}.mp4`}
        poster={`${base}-poster.webp`}
        width="1920"
        height={recording.height}
        controls
        playsInline
        preload="none"
        aria-label={`${recording.title} process recording`}
        onPlay={onPlay}
        onError={() => setFailed(true)}
      >Your browser does not support this video. <a href={`${base}.mp4`}>Open video</a>.</video> : <button
        type="button"
        className="pcg-film-preview"
        aria-label={`Play ${recording.title} process recording, ${recording.duration}`}
        onClick={() => setOpened(true)}
      >
        <img src={`${base}-poster.webp`} alt="" width="1920" height={recording.height} loading="lazy" decoding="async" />
        <span className="pcg-film-play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 4.5 20 12 8 19.5Z" /></svg></span>
      </button>}
    </figure>
    {failed && <p className="pcg-film-error" role="status">Video could not load. <a href={`${base}.mp4`}>Open video ↗</a></p>}
  </section>;
}

export default function PCGProcessVideos() {
  const playing = useRef<HTMLVideoElement | null>(null);
  const handlePlay = (event: SyntheticEvent<HTMLVideoElement>) => {
    if (playing.current && playing.current !== event.currentTarget) playing.current.pause();
    playing.current = event.currentTarget;
  };

  return <section className="pcg-process" aria-labelledby="pcg-process-heading">
    <h2 id="pcg-process-heading">Process in motion</h2>
    <div className="pcg-process-films">
      {recordings.map(recording => <ProcessVideo key={recording.id} recording={recording} onPlay={handlePlay} />)}
    </div>
  </section>;
}
