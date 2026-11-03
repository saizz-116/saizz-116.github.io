import { useState } from 'react';

const mediaRoot = '/media/mixed-lives';

export default function MixedLivesCover() {
  const [bottomFailed, setBottomFailed] = useState(false);
  const [topFailed, setTopFailed] = useState(false);
  const [titleFailed, setTitleFailed] = useState(false);

  return (
    <div className="mixed-cover" aria-hidden="true">
      <div className="mixed-cover__top">
        {!topFailed && (
          <img
            src={`${mediaRoot}/cover-top.webp`}
            alt=""
            width={1200}
            height={675}
            loading="eager"
            decoding="async"
            draggable={false}
            onError={() => setTopFailed(true)}
          />
        )}
      </div>
      <div className="mixed-cover__bottom">
        {!bottomFailed && (
          <img
            src={`${mediaRoot}/cover-bottom-fallback.webp`}
            alt=""
            width={1200}
            height={675}
            loading="eager"
            decoding="async"
            draggable={false}
            onError={() => setBottomFailed(true)}
          />
        )}
      </div>
      {!titleFailed && (
        <img
          className="mixed-cover__title"
          src={`${mediaRoot}/title-handwritten.png`}
          alt=""
          loading="eager"
          decoding="async"
          draggable={false}
          onError={() => setTitleFailed(true)}
        />
      )}
    </div>
  );
}
