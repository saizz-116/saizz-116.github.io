import render from '../assets/pcg/house-render-preview.webp?inline';
import wire from '../assets/pcg/house-wire-preview.webp?inline';
import mosaic from '../assets/pcg/mosaic-preview.webp?inline';
import blue from '../assets/pcg/blue-preview.webp?inline';
import wall from '../assets/pcg/wall-preview.webp?inline';

export interface PCGMedia { render: string; wire: string; mosaic: string; blue: string; wall: string }
export const pcgPreviewMedia: PCGMedia = { render, wire, mosaic, blue, wall };
