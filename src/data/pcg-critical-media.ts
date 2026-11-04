// Small critical visuals travel in the hashed JS response, avoiding five extra
// GitHub Pages image requests and nested external images inside SVG clip paths.
import render from '../assets/pcg/house-render-cutout.webp?inline';
import wire from '../assets/pcg/house-wire-cutout.webp?inline';
import mosaic from '../assets/pcg/mosaic-tile.webp?inline';
import blue from '../assets/pcg/blue-tile.webp?inline';
import wall from '../assets/pcg/wall-tile.webp?inline';

export const pcgCriticalMedia = { render, wire, mosaic, blue, wall };
