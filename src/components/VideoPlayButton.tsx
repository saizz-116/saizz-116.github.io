import './video-play-button.css';

type VideoPlayButtonProps = {
  label: string;
  duration?: string;
  onClick: () => void;
};

export default function VideoPlayButton({ label, duration, onClick }: VideoPlayButtonProps) {
  return (
    <button className="video-play-button" type="button" onClick={onClick}>
      <span className="video-play-button__circle" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false"><path d="M8 4.5 20 12 8 19.5Z" /></svg>
      </span>
      <span className="video-play-button__copy">
        <span>{label}</span>
        {duration && <span className="video-play-button__duration">{duration}</span>}
      </span>
    </button>
  );
}
