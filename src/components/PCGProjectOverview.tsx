import type { Project } from '../types';
import PCGHouseCutout from './PCGHouseCutout';
import PCGTextureBackground from './PCGTextureBackground';
import { usePCGMedia } from './usePCGMedia';
import './pcg-project.css';

export default function PCGProjectOverview({ project }: { project: Project }) {
  const media = usePCGMedia();
  return <><PCGTextureBackground media={media} /><section className="pcg-overview" aria-labelledby="pcg-title">
    <div className="pcg-introduction">
      <header className="pcg-intro-copy">
        <h1 id="pcg-title">{project.title}</h1>
        <div className="pcg-description">
        <p>A personal technical art project exploring the intersection of mathematics, procedural modeling, and architectural design. Inspired by Antoni Gaudí's organic architectural language, I developed a parameter-driven house generator in Houdini using VEX, featuring mathematically controlled wave-shaped roofs, rule-based facades, and procedural architectural details. The project also incorporates custom materials created in Substance Designer and integrates with Unreal Engine through Houdini Engine.</p>
        <p className="pcg-update-note">Work in progress — technical detail to be updated soon.</p>
        </div>
      </header>
      <div className="pcg-house-composition" aria-label="Rendered and wireframe views of the procedural house">
        <figure className="pcg-house pcg-house--wire"><PCGHouseCutout variant="wire" source={media.wire} /></figure>
        <figure className="pcg-house pcg-house--render"><PCGHouseCutout variant="render" source={media.render} /></figure>
      </div>
    </div>
  </section></>;
}
