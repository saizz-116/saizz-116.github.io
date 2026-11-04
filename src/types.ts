export type MediaKind = 'placeholder' | 'image' | 'video' | 'embed';

/** Local media lives in public/media. Use root-relative URLs such as /media/mixed-lives/hero.webp. */
export interface Media {
  kind: MediaKind;
  src?: string;
  alt: string;
  label: string;
  caption?: string;
  poster?: string;
  srcSet?: string;
  sizes?: string;
  captionsSrc?: string;
  captionsLanguage?: string;
  /** Plain text shown in an accessible disclosure below local videos. */
  transcript?: string;
  span?: 'wide' | 'half';
}

export interface ProjectSection {
  id: string;
  eyebrow?: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
  layout?: 'text' | 'split' | 'process';
  /** Editorial guidance for the site owner; do not render as a project claim. */
  editorNote?: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  homeTitle?: string;
  summary: string;
  medium: string;
  year?: string;
  cover: {
    src?: string;
    srcSet?: string;
    width?: number;
    height?: number;
    alt: string;
    color: string;
  };
}

export interface Profile {
  name: string;
  email: string;
  headline: string;
  intro: string;
  education: {
    institution: string;
    degree: string;
    period?: string;
    details?: string;
  }[];
  experience: {
    title: string;
    organization: string;
    period?: string;
    description: string;
  }[];
  skills: { label: string; items: string[] }[];
  projectEntries: {
    slug: string;
    role?: string;
    description: string;
    period?: string;
  }[];
}
