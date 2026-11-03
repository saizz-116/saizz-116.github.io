import { useState } from 'react';
import type { ReactNode } from 'react';
import type { Media } from '../types';

interface MediaBlockProps {
  media: Media;
  className?: string;
  priority?: boolean;
  compact?: boolean;
}

function getSafeEmbed(source: string): URL | null {
  try {
    const url = new URL(source);
    if (url.protocol !== 'https:' || url.username || url.password || (url.port && url.port !== '443')) return null;
    const youtubeHosts = ['youtube.com', 'www.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com'];
    const youtube = youtubeHosts.includes(url.hostname) && /^\/embed\/[\w-]+\/?$/.test(url.pathname);
    const vimeo = url.hostname === 'player.vimeo.com' && /^\/video\/\d+\/?$/.test(url.pathname);
    return youtube || vimeo ? url : null;
  } catch {
    return null;
  }
}

function MediaContent({ media, className = '', priority = false, compact = false }: MediaBlockProps) {
  const [failed, setFailed] = useState(false);
  const [embedLoaded, setEmbedLoaded] = useState(false);

  // Missing materials and legacy placeholder entries intentionally take no space.
  if (failed || !media.src?.trim() || media.kind === 'placeholder') return null;

  const renderImage = (source: string) => (
    <img
      src={source}
      srcSet={media.kind === 'image' ? media.srcSet : undefined}
      sizes={media.kind === 'image' ? media.sizes : undefined}
      alt={media.alt}
      width={1200}
      height={850}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setFailed(true)}
    />
  );

  let content: ReactNode;
  if (media.kind === 'image') {
    content = renderImage(media.src);
  } else if (compact) {
    // Compact previews remain safe to place inside a card's single link.
    if (!media.poster) return null;
    content = renderImage(media.poster);
  } else if (media.kind === 'video') {
    content = (
      <video
        src={media.src}
        poster={media.poster}
        controls
        playsInline
        preload="metadata"
        aria-label={media.alt || media.label}
        onError={() => setFailed(true)}
      >
        {media.captionsSrc && (
          <track kind="captions" src={media.captionsSrc} srcLang={media.captionsLanguage || 'en'} label="Captions" default />
        )}
      </video>
    );
  } else {
    const embed = getSafeEmbed(media.src);
    if (!embed) return null;
    content = embedLoaded ? (
      <iframe
        src={embed.href}
        title={media.alt || media.label}
        loading="lazy"
        allow="fullscreen; picture-in-picture"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        onError={() => setFailed(true)}
      />
    ) : (
      <>
        {media.poster && renderImage(media.poster)}
        <button type="button" onClick={() => setEmbedLoaded(true)}>Play video</button>
      </>
    );
  }

  return (
    <figure className={`media-block ${className}`.trim()}>
      {content}
      {!compact && media.kind === 'video' && media.transcript && (
        <details className="media-transcript">
          <summary>Read video transcript</summary>
          <p>{media.transcript}</p>
        </details>
      )}
      {!compact && media.caption && <figcaption>{media.caption}</figcaption>}
    </figure>
  );
}

/** Actual project media only; a changed source resets failure and embed consent state. */
export default function MediaBlock(props: MediaBlockProps) {
  return <MediaContent key={`${props.media.kind}:${props.media.src ?? ''}:${props.media.poster ?? ''}`} {...props} />;
}
