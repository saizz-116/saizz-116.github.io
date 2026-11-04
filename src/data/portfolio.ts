import type { Profile, Project } from '../types';

/**
 * Personal website content, curated from Xueyao's supplied CV.
 * Keep the original CV private. This public version intentionally omits phone,
 * GPA, scholarships, awards, and private address information.
 * Project order here determines the homepage order. Add a real cover image
 * under public/media/<slug>/ and set cover.src when one is ready.
 */
export const profile: Profile = {
  name: 'Xueyao Jiang',
  email: 'xueyao.jiang@dukekunshan.edu.cn',
  headline: 'Game designer & creative developer',
  intro:
    'I’m Xueyao, a mathematics student working across games, procedural art, and physical interaction. I build playful systems that connect technical ideas with visual storytelling.',
  education: [
    {
      institution: 'Duke Kunshan University',
      degree: 'B.S. Applied Mathematics and Computational Science / Mathematics',
      period: '2023–2027 (expected)',
      details: 'Dual-degree program with Duke University',
    },
    {
      institution: 'Duke University',
      degree: 'B.S. Interdisciplinary Studies',
      period: '2023–2027 (expected)',
      details: 'Dual-degree program with Duke Kunshan University',
    },
  ],
  experience: [
    {
      title: 'Research Collaborator',
      organization: 'Klein Flow Matching · Duke Kunshan University',
      period: 'May 2025–Sep 2026',
      description:
        'Worked on hyperbolic geometry and graph generation, connecting theoretical derivations with experimental validation and collaborative research.',
    },
    {
      title: 'Club President & Varsity Athlete',
      organization: 'DKU Judo Club',
      period: 'Jan–Oct 2025',
      description:
        'Coordinated university sporting events and collaborated with coaches and student clubs across campuses.',
    },
  ],
  skills: [
    {
      label: 'Code',
      items: ['C#', 'Java', 'Python', 'C++', 'VEX'],
    },
    {
      label: 'Games & 3D',
      items: ['Unity', 'Unreal Engine', 'Houdini', '3ds Max', 'Substance 3D'],
    },
    {
      label: 'Art & collaboration',
      items: ['Procreate', 'Photoshop', 'Git / GitHub', 'Notion'],
    },
  ],
  projectEntries: [
    {
      slug: 'emotional-vacuum',
      role: 'Team lead & Unity developer',
      period: 'Sep–Oct 2026',
      description:
        'Led a four-person team building a motion-controlled game about emotional suppression and release, connecting Unity gameplay, motion-controlled input, and a wearable physical controller.',
    },
    {
      slug: 'pcg-project',
      role: 'Procedural modeling & technical art',
      period: 'Aug 2026–present',
      description:
        'Created a Gaudí-inspired architectural generator with VEX-driven forms, an undulating roof, and exposed Houdini Digital Asset controls for Unreal Engine.',
    },
    {
      slug: 'mixed-lives',
      role: 'Game design & Unity development',
      period: 'Jul 2026–present',
      description:
        'Designed a narrative cocktail simulation in Unity, combining flexible ingredient-based orders, a seven-night bar loop, guest dialogue, and a hand-drawn mixing interface.',
    },
    {
      slug: 'dku-campus-tour',
      role: 'Game design & NPC interactions',
      period: 'Oct 2026',
      description:
        'Co-developed a 2D campus guide in Java, focusing on NPC interactions, campus dialogue, visual details, music integration, and gameplay refinement.',
    },
  ],
};

export const projects: Project[] = [
  {
    id: 'emotional-vacuum',
    slug: 'emotional-vacuum',
    title: 'Emotional Vacuum',
    summary: 'A physical vacuum and a wearable container turn emotional suppression into a game of collection, burden, and release.',
    medium: 'Alternative controller / Unity',
    year: '2026',
    cover: {
      src: '/media/emotional-vacuum/cover.webp',
      alt: 'A player wearing the transparent emotional-creature backpack and aiming a physical vacuum at the game screen',
      color: '#d8d6e5',
    },
  },
  {
    id: 'pcg-project',
    slug: 'pcg-project',
    title: 'Gaudí-Inspired Procedural House',
    summary: 'A Houdini house generator inspired by Gaudí, with organic forms, an undulating roof, and adjustable parameters.',
    medium: 'Houdini / Unreal Engine',
    year: '2026',
    cover: {
      src: '/media/pcg-project/cover.png',
      alt: 'A three-story procedural house with a turquoise undulating roof, pale patterned walls, and planted windows in Unreal Engine',
      color: '#d4dfcd',
    },
  },
  {
    id: 'mixed-lives',
    slug: 'mixed-lives',
    title: 'Mixed Lives',
    summary: 'A hand-drawn cocktail bar simulation with ingredient-based orders, guest dialogue, and a seven-night narrative loop.',
    medium: 'Game design / Unity',
    year: '2026',
    cover: {
      alt: 'Mixed Lives',
      color: '#000000',
    },
  },
  {
    id: 'dku-campus-tour',
    slug: 'dku-campus-tour',
    title: 'DKU Campus Explorer',
    summary: 'A campus tour through places, conversations, and everyday details of life at Duke Kunshan University.',
    medium: 'Java / Java2D',
    year: '2026',
    cover: {
      src: '/media/dku-campus-tour/overview.webp',
      alt: 'The campus square and landmark tower in DKU Campus Explorer',
      color: '#dce2df',
    },
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}
