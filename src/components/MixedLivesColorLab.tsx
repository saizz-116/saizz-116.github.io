import { useId, useMemo, useState } from 'react';
import { mlBases, mlIngredients, mlFlavorModel } from '../data/mixedLivesSystem';
import type { MLLiquid } from '../data/mixedLivesSystem';
import './mixed-lives-color-lab.css';

type RGB = [number, number, number];
type Portions = Record<string, number>;
type ModelKey = 'linear' | 'hsv' | 'weighted';

interface MixResult {
  linear: RGB | null;
  hsv: RGB | null;
  weighted: RGB | null;
  hueAmbiguous: boolean;
}

const liquidOrder = ['Vodka', 'SodaWater', 'Mint', 'LimeJuice', 'Whiskey', 'OrangeJuice', 'Campari', 'Cola'];
const liquidNotes: Record<string, string> = {
  Vodka: 'Nearly colorless.',
  SodaWater: 'Pale in the data, with very little tint.',
  Mint: 'Green itself; a lighter influence in the mix.',
  LimeJuice: 'A moderate yellow-green tint.',
  Whiskey: 'Amber, with a stronger influence.',
  OrangeJuice: 'A stronger orange tint.',
  Campari: 'A concentrated red tint.',
  Cola: 'A concentrated dark tint.',
};
const allLiquids = [...mlBases, ...mlIngredients];
const liquids = liquidOrder.map(id => allLiquids.find(liquid => liquid.id === id))
  .filter((liquid): liquid is MLLiquid => liquid !== undefined);

const presets = [
  { label: 'Campari + vodka', portions: { Campari: 1, Vodka: 1 } as Portions, note: 'One pale liquid and one strong red tint.' },
  { label: 'Whiskey + 2 sodas', portions: { Whiskey: 1, SodaWater: 2 } as Portions, note: 'Two low-tint portions alongside amber whiskey.' },
  { label: 'Orange + lime', portions: { OrangeJuice: 1, LimeJuice: 1 } as Portions, note: 'Two juices that both contribute appreciable color.' },
];

const models: { key: ModelKey; index: string; title: string; description: string; formula: string }[] = [
  {
    key: 'linear', index: '01', title: 'Equal-portion linear RGB',
    description: 'Every test portion has equal influence. Pale liquids pull the triangle toward a lighter average.',
    formula: 'Σ(linear RGB × portions) / Σportions',
  },
  {
    key: 'hsv', index: '02', title: 'Equal-portion HSV',
    description: 'Hue, saturation and brightness are averaged separately. The resulting hue can differ noticeably from the linear RGB models.',
    formula: 'Circular mean(H); portion-weighted mean(S, V)',
  },
  {
    key: 'weighted', index: '03', title: 'Tint-weighted linear RGB',
    description: 'The game’s colour rule weights each source by tint strength. Low-tint vodka and soda have less influence than concentrated colours.',
    formula: 'Σ(linear RGB × portions × tint) / Σ(portions × tint)',
  },
];

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}

function toLinear(value: number) {
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function toSrgb(value: number) {
  return clamp(value <= 0.0031308 ? 12.92 * value : 1.055 * value ** (1 / 2.4) - 0.055);
}

function rgbToHsv([red, green, blue]: RGB): RGB {
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  let hue = 0;
  if (delta > 0.000000001) {
    if (max === red) hue = ((green - blue) / delta) % 6;
    else if (max === green) hue = (blue - red) / delta + 2;
    else hue = (red - green) / delta + 4;
    hue = ((hue / 6) + 1) % 1;
  }
  return [hue, max <= 0 ? 0 : delta / max, max];
}

function hsvToRgb([hue, saturation, value]: RGB): RGB {
  const sector = hue * 6;
  const chroma = value * saturation;
  const second = chroma * (1 - Math.abs(sector % 2 - 1));
  const offset = value - chroma;
  const channels: RGB = sector < 1 ? [chroma, second, 0]
    : sector < 2 ? [second, chroma, 0]
      : sector < 3 ? [0, chroma, second]
        : sector < 4 ? [0, second, chroma]
          : sector < 5 ? [second, 0, chroma] : [chroma, 0, second];
  return channels.map(channel => clamp(channel + offset)) as RGB;
}

function compareMix(portions: Portions): MixResult {
  const equalSum: RGB = [0, 0, 0];
  const tintSum: RGB = [0, 0, 0];
  let total = 0;
  let tintWeight = 0;
  let hueX = 0;
  let hueY = 0;
  let saturationSum = 0;
  let valueSum = 0;

  for (const liquid of liquids) {
    const count = portions[liquid.id] ?? 0;
    if (count <= 0) continue;
    total += count;
    const weight = count * liquid.tintStrength;
    tintWeight += weight;
    for (let channel = 0; channel < 3; channel++) {
      const linear = toLinear(liquid.rgb[channel]);
      equalSum[channel] += linear * count;
      tintSum[channel] += linear * weight;
    }
    const [hue, saturation, value] = rgbToHsv(liquid.rgb);
    hueX += Math.cos(hue * Math.PI * 2) * count;
    hueY += Math.sin(hue * Math.PI * 2) * count;
    saturationSum += saturation * count;
    valueSum += value * count;
  }

  if (total === 0) return { linear: null, hsv: null, weighted: null, hueAmbiguous: false };
  const hueAmbiguous = Math.hypot(hueX, hueY) / total < 0.000001;
  // Opposed hue directions have no unique circular mean; choose a deterministic
  // preview hue and disclose that state instead of treating it as a physical mix.
  const hue = hueAmbiguous ? 0 : ((Math.atan2(hueY, hueX) / (Math.PI * 2)) + 1) % 1;
  return {
    linear: equalSum.map(channel => toSrgb(channel / total)) as RGB,
    hsv: hsvToRgb([hue, saturationSum / total, valueSum / total]),
    weighted: tintWeight <= 0.0001 ? null : tintSum.map(channel => toSrgb(channel / tintWeight)) as RGB,
    hueAmbiguous,
  };
}

function cssRgb(rgb: RGB) {
  return `rgb(${rgb.map(channel => channel * 255).join(' ')})`;
}

function hex(rgb: RGB) {
  return `#${rgb.map(channel => Math.round(clamp(channel) * 255).toString(16).padStart(2, '0')).join('').toUpperCase()}`;
}

// The source wheel is a 640px square, cropped at (25, 12) with 12px padding.
// Its Unity origin therefore falls at approximately (307, 320) in this export.
const discOrigin = [307, 320];
const fixedTriangle = mlFlavorModel.axisAngles.map(angle => {
  const radians = angle * Math.PI / 180;
  const radius = mlFlavorModel.nodeRadii[2] * 320;
  return `${discOrigin[0] + Math.sin(radians) * radius},${discOrigin[1] - Math.cos(radians) * radius}`;
}).join(' ');

function ColorDisc({ rgb }: { rgb: RGB | null }) {
  const outline = rgb?.map(channel => toSrgb(toLinear(channel) * mlFlavorModel.outlineLinearMultiplier)) as RGB | undefined;
  return (
    <svg className="mlcl-disc" viewBox="0 0 602 645" aria-hidden="true" focusable="false">
      <image href="/media/mixed-lives/case-study/flavor-disc.webp" width="602" height="645" />
      {rgb && outline
        ? <polygon points={fixedTriangle} fill={cssRgb(rgb)} fillOpacity="0.82" stroke={cssRgb(outline)} strokeOpacity="1" strokeWidth="3" strokeLinejoin="round" />
        : <circle cx={discOrigin[0]} cy={discOrigin[1]} r="7.04" fill="rgb(191.25 56.1 12.75)" />}
    </svg>
  );
}

export default function MixedLivesColorLab() {
  const uid = useId().replace(/:/g, '');
  const [portions, setPortions] = useState<Portions>({});
  const result = useMemo(() => compareMix(portions), [portions]);
  const totalPortions = liquids.reduce((sum, liquid) => sum + (portions[liquid.id] ?? 0), 0);
  const recipe = liquids.filter(liquid => (portions[liquid.id] ?? 0) > 0)
    .map(liquid => `${liquid.label} × ${portions[liquid.id]}`).join(' + ');
  const selectedPreset = presets.findIndex(preset => liquids.every(liquid =>
    (portions[liquid.id] ?? 0) === (preset.portions[liquid.id] ?? 0)));

  function adjust(id: string, change: number) {
    setPortions(current => ({ ...current, [id]: Math.max(0, Math.min(3, (current[id] ?? 0) + change)) }));
  }

  return (
    <section className="ml-color-lab" aria-labelledby={`${uid}-heading`}>
      <header className="mlcl-heading">
        <p className="mlcl-eyebrow">Disc design / colour comparison</p>
        <h4 id={`${uid}-heading`}>Triangle colour</h4>
        <p>I use the triangle’s fill as the visual result of mixing, alongside the taste information carried by its vertices. Each ingredient contributes a colour and a tint strength, so a nearly clear mixer leaves a lighter trace than Campari or coffee liqueur.</p>
        <p>Equal colour averages gave pale mixers too much influence over the triangle. I compared linear RGB and HSV, then weighted the linear blend by tint strength to retain the character of concentrated colours. The experiment below holds the taste shape still so these colour differences are easier to read.</p>
      </header>

      <p className="mlcl-comparison-note">Test portions: 0–3 per ingredient. In the game, each ingredient is selected once.</p>

      <div className="mlcl-presets" aria-label="Example color recipes">
        {presets.map((preset, index) => (
          <button type="button" key={preset.label} onClick={() => setPortions({ ...preset.portions })}
            aria-pressed={selectedPreset === index} title={preset.note}>
            <span className="mlcl-preset-index">0{index + 1}</span>{preset.label}
          </button>
        ))}
        <button type="button" className="mlcl-clear" onClick={() => setPortions({})} disabled={totalPortions === 0}>Reset mixture</button>
      </div>

      <div className="mlcl-ingredients" aria-label="Eight source liquids; zero to three portions each">
        {liquids.map(liquid => {
          const count = portions[liquid.id] ?? 0;
          return (
            <div className="mlcl-ingredient" key={liquid.id}>
              <span className="mlcl-swatch" style={{ backgroundColor: cssRgb(liquid.rgb) }} aria-hidden="true" />
              <div className="mlcl-liquid-copy">
                <h5>{liquid.label}</h5>
                <p>{liquidNotes[liquid.id]}</p>
                <div className="mlcl-liquid-values"><code>sRGB ({liquid.rgb.map(channel => channel.toFixed(2)).join(', ')})</code><span>Tint {liquid.tintStrength.toFixed(2)}</span></div>
              </div>
              <div className="mlcl-stepper" role="group" aria-label={`${liquid.label} portions`}>
                <button type="button" onClick={() => adjust(liquid.id, -1)} disabled={count === 0} aria-label={`Remove one portion of ${liquid.label.toLowerCase()}`}>
                  <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10" /></svg>
                </button>
                <output aria-label={`${liquid.label} portion count`}>{count}</output>
                <button type="button" onClick={() => adjust(liquid.id, 1)} disabled={count === 3} aria-label={`Add one portion of ${liquid.label.toLowerCase()}`}>
                  <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M8 3v10" /></svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mlcl-recipe" role="status" aria-live="polite" aria-atomic="true">
        <span>{totalPortions === 0 ? 'No mixture' : `${totalPortions} test portion${totalPortions === 1 ? '' : 's'}`}</span>
        <p>{recipe || 'Add a liquid above or choose an example.'}</p>
      </div>

      <div className="mlcl-results-heading"><h5>Three colour models</h5><span>Taste shape held fixed to compare colour models.</span></div>
      <div className="mlcl-results">
        {models.map(model => {
          const rgb = result[model.key];
          return (
            <article className={`mlcl-result${model.key === 'weighted' ? ' mlcl-result--adopted' : ''}`} key={model.key} aria-labelledby={`${uid}-${model.key}`}>
              <div className="mlcl-result-top"><span>{model.index}</span>{model.key === 'weighted' && <strong>Used in game</strong>}</div>
              <h5 id={`${uid}-${model.key}`}>{model.title}</h5>
              <ColorDisc rgb={rgb} />
              <output className="mlcl-hex" aria-label={`${model.title} sRGB fill before opacity`}>{rgb ? hex(rgb) : 'Origin dot'}</output>
              <p>{model.description}</p>
              {model.key === 'hsv' && result.hueAmbiguous && <p className="mlcl-hue-note">Opposed hues have no unique circular mean. This preview uses 0°.</p>}
            </article>
          );
        })}
      </div>

      <p className="mlcl-discarded"><strong>Discarded option:</strong> I set aside Kubelka–Munk pigment mixing in favour of a tint model suited to the disc’s translucent liquid appearance.</p>
      <details className="mlcl-method">
        <summary>Colour calculations and display settings</summary>
        <div className="mlcl-method-models">
          {models.map(model => <section key={model.key}><h5>{model.title}</h5><code className="mlcl-formula">{model.formula}</code></section>)}
        </div>
        <div>
          <p>Colors begin as the game’s sRGB values. For each channel c, linear light is c / 12.92 when c ≤ 0.04045; otherwise it is ((c + 0.055) / 1.055)<sup>2.4</sup>. After averaging, the inverse transfer returns the result to sRGB.</p>
          <p>In the adopted model, every portion’s weight is its tint strength. The denominator is the sum of those weights, not total liquid volume. A tint of zero contributes no color; a near-zero total tint is treated as no dye.</p>
          <p>The triangle uses 0.82 fill opacity and an opaque outline. The outline multiplies the mixed linear RGB by 0.55 before returning to sRGB. Taste geometry is held constant in this experiment.</p>
        </div>
      </details>
    </section>
  );
}
