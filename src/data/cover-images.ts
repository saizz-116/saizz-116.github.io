import covers from './cover-images.json';
import pcgImages from './pcg-images.json';

export const coverImages = { ...covers, proceduralHouse: pcgImages.render };

export const coverImageSizes = '(max-width: 650px) calc(100vw - 40px), (max-width: 1100px) calc((100vw - 100px) / 2), 500px';
