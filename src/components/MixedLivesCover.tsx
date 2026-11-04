import { useState } from 'react';
import { coverImages, coverImageSizes } from '../data/cover-images';

export default function MixedLivesCover({ loading = 'eager' }: { loading?: 'eager' | 'lazy' }) {
  const [bottomFailed, setBottomFailed] = useState(false);
  const [topFailed, setTopFailed] = useState(false);
  const [titleFailed, setTitleFailed] = useState(false);

  return (
    <div className="mixed-cover" aria-hidden="true">
      <div className="mixed-cover__top">
        {!topFailed && (
          <img
            {...coverImages.mixedTop}
            sizes={coverImageSizes}
            alt=""
            loading={loading}
            decoding="async"
            draggable={false}
            onError={() => setTopFailed(true)}
          />
        )}
      </div>
      <div className="mixed-cover__bottom">
        {!bottomFailed && (
          <img
            {...coverImages.mixedBottom}
            sizes={coverImageSizes}
            alt=""
            loading={loading}
            decoding="async"
            draggable={false}
            onError={() => setBottomFailed(true)}
          />
        )}
      </div>
      {!titleFailed && (
        <img
          className="mixed-cover__title"
          {...coverImages.mixedTitle}
          sizes="(max-width: 650px) 24vw, 120px"
          alt=""
          loading={loading}
          decoding="async"
          draggable={false}
          onError={() => setTitleFailed(true)}
        />
      )}
    </div>
  );
}
