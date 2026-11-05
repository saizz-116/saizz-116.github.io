import { useEffect, useId, useRef, useState } from 'react';
import { mlBases, mlIngredients, mlStages, mlClassics } from '../data/mixedLivesSystem';
import './mixed-lives-recipe-graph.css';

const liquidNames = new Map([...mlBases, ...mlIngredients].map(item => [item.id, item.label]));
const baseIds = new Set(mlBases.map(item => item.id));

function recipeText(base: string, ingredients: string[]) {
  return [base, ...ingredients].map(id => liquidNames.get(id) ?? id).join(' + ');
}

export default function MixedLivesRecipeGraph() {
  const uid = useId();
  const [stage, setStage] = useState(1);
  const [selectedId, setSelectedId] = useState(mlClassics[0].id);
  const diagramRef = useRef<HTMLDivElement>(null);
  const currentStage = mlStages.find(item => item.stage === stage)!;
  const recipes = mlClassics.filter(item => item.stage <= stage);
  const liquids = [...mlBases, ...mlIngredients.filter(item => item.stage <= stage)];
  const selected = recipes.find(item => item.id === selectedId) ?? recipes[0];
  const selectedInputs = new Set([selected.base, ...selected.ingredients]);
  const rowHeight = 29;
  const top = 54;
  const height = Math.max(310, Math.max(liquids.length + 1, recipes.length) * rowHeight + top + 25);
  const liquidYs = new Map(liquids.map((item, i) => [item.id, top + i * rowHeight + (i >= mlBases.length ? 21 : 0)]));
  const recipeYs = new Map(recipes.map((item, i) => [item.id, top + i * rowHeight]));
  const relations = recipes.flatMap(recipe => [recipe.base, ...recipe.ingredients].map(liquid => ({
    id: `${recipe.id}-${liquid}`, recipe: recipe.id, liquid,
    path: `M 207 ${liquidYs.get(liquid)} C 352 ${liquidYs.get(liquid)}, 473 ${recipeYs.get(recipe.id)}, 616 ${recipeYs.get(recipe.id)}`,
  })));
  const days = currentStage.days.length === 1 ? `Day ${currentStage.days[0]}` : `Days ${currentStage.days[0]}–${currentStage.days.at(-1)}`;

  useEffect(() => {
    const viewport = diagramRef.current;
    const highlighted = viewport?.querySelector<SVGGElement>('.ml-recipe-cocktail.is-highlighted');
    if (!viewport || !highlighted) return;
    const bounds = viewport.getBoundingClientRect();
    const target = highlighted.getBoundingClientRect();
    const padding = 12;
    if (target.top < bounds.top + padding) viewport.scrollTop -= bounds.top + padding - target.top;
    else if (target.bottom > bounds.bottom - padding) viewport.scrollTop += target.bottom - bounds.bottom + padding;
  }, [selected.id, stage]);

  const chooseStage = (next: number) => {
    setStage(next);
    if (!mlClassics.some(item => item.id === selectedId && item.stage <= next)) {
      setSelectedId(mlClassics.find(item => item.stage <= next)!.id);
    }
  };

  return (
    <section className="ml-recipe-graph" aria-labelledby={`${uid}-heading`}>
      <div className="ml-recipe-heading">
        <h3 id={`${uid}-heading`}>Recipe connections</h3>
        <p>Unlocking ingredients opens more routes to a classic cocktail. Select a drink to trace its ingredients.</p>
        <a className="ml-recipe-workspace-link" href={`#${uid}-workspace`}>Explore recipes ↓</a>
      </div>
      <div className="ml-recipe-layout" id={`${uid}-workspace`}>
        <div className="ml-recipe-sidebar">
          <div className="ml-recipe-stages" role="group" aria-label="Filter recipes by unlock stage">
            {mlStages.map(item => (
              <button type="button" key={item.stage} aria-pressed={stage === item.stage} onClick={() => chooseStage(item.stage)}>
                <span>Stage {item.stage}{item.stage === 4 ? ' / All 25' : ''}</span>
                <span>{item.days.length === 1 ? `Day ${item.days[0]}` : `Days ${item.days[0]}–${item.days.at(-1)}`}</span>
              </button>
            ))}
          </div>
          <div className="ml-recipe-toolbar">
            <p className="ml-recipe-count" aria-live="polite">{days}: {mlBases.length} bases + {currentStage.ingredientCount} mixers → {recipes.length} classics</p>
            <label htmlFor={`${uid}-select`}>Highlight a cocktail
              <select id={`${uid}-select`} value={selected.id} onChange={event => setSelectedId(event.target.value)}>
                {recipes.map(recipe => <option key={recipe.id} value={recipe.id}>{recipe.name}</option>)}
              </select>
            </label>
          </div>
          <aside className="ml-recipe-selection" aria-live="polite" aria-atomic="true">
            <p>Selected recipe</p>
            <h4>{selected.name}</h4>
            <dl>
              <div><dt>Base</dt><dd>{liquidNames.get(selected.base)}</dd></div>
              <div><dt>Mixers</dt><dd>{selected.ingredients.map(id => liquidNames.get(id)).join(' + ')}</dd></div>
              <div><dt>Available from</dt><dd>Stage {selected.stage}</dd></div>
            </dl>
            <details className="ml-recipe-scope"><summary>Recipe notes</summary><p>Game recipes focus on ingredient combinations; quantities and preparation techniques are abstracted.</p></details>
          </aside>
        </div>
        <div className="ml-recipe-diagram">
          <div className="ml-recipe-legend" aria-label="Diagram legend">
            <span><i className="ml-recipe-key ml-recipe-key--base" aria-hidden="true" />Base spirit</span>
            <span><i className="ml-recipe-key ml-recipe-key--mixer" aria-hidden="true" />Mixer</span>
            <span><i className="ml-recipe-key ml-recipe-key--line" aria-hidden="true" />Selected recipe</span>
          </div>
          <div className="ml-recipe-scroll" ref={diagramRef} role="region" aria-label="Scrollable ingredient and cocktail connection diagram" tabIndex={0}>
            <svg className="ml-recipe-svg" viewBox={`0 0 900 ${height}`} role="group" aria-labelledby={`${uid}-svg-title`} aria-describedby={`${uid}-svg-desc`}>
              <title id={`${uid}-svg-title`}>{`Ingredient connections for stage ${stage}`}</title>
              <desc id={`${uid}-svg-desc`}>{`${recipes.length} classic cocktails are linked to the base and mixers in their simplified game recipes. Select a cocktail name or use the cocktail selector. An equivalent text recipe list follows the diagram.`}</desc>
              <text className="ml-recipe-column-label" x="193" y="22" textAnchor="end">BASES & MIXERS</text>
              <text className="ml-recipe-column-label" x="634" y="22">CLASSIC COCKTAILS</text>
              <g className="ml-recipe-background-lines" aria-hidden="true">
                {relations.filter(edge => edge.recipe !== selected.id).map(edge => <path key={edge.id} d={edge.path} />)}
              </g>
              <g className="ml-recipe-highlight-lines" aria-hidden="true">
                {relations.filter(edge => edge.recipe === selected.id).map(edge => <path key={edge.id} d={edge.path} />)}
              </g>
              {liquids.map(item => {
                const active = selectedInputs.has(item.id);
                return <g key={item.id} className={`ml-recipe-input${active ? ' is-highlighted' : ''}`} aria-hidden="true">
                  <text x="191" y={liquidYs.get(item.id)! + 4} textAnchor="end">{item.label}</text>
                  <circle cx="207" cy={liquidYs.get(item.id)} r={baseIds.has(item.id) ? 4.5 : 3.5} className={baseIds.has(item.id) ? 'is-base' : 'is-mixer'} />
                </g>;
              })}
              {recipes.map(recipe => <g
                key={recipe.id}
                className={`ml-recipe-cocktail${recipe.id === selected.id ? ' is-highlighted' : ''}`}
                role="button"
                tabIndex={0}
                aria-pressed={recipe.id === selected.id}
                aria-label={`${recipe.name}: ${recipeText(recipe.base, recipe.ingredients)}`}
                onClick={() => setSelectedId(recipe.id)}
                onKeyDown={event => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setSelectedId(recipe.id);
                  }
                }}
              >
                <rect x="601" y={recipeYs.get(recipe.id)! - 13} width="285" height="27" rx="3" />
                <circle cx="616" cy={recipeYs.get(recipe.id)} r="3.5" />
                <text x="634" y={recipeYs.get(recipe.id)! + 4}>{recipe.name}</text>
              </g>)}
            </svg>
          </div>
          <p className="ml-recipe-scroll-hint">On a small screen, scroll the diagram sideways. The selector and text list provide the same recipe information.</p>
        </div>
      </div>
      <details className="ml-recipe-text-list">
        <summary>View {recipes.length} recipes as text</summary>
        <ul>{recipes.map(recipe => <li key={recipe.id}>
          <button type="button" aria-pressed={recipe.id === selected.id} onClick={() => setSelectedId(recipe.id)}>{recipe.name}</button>
          <span>{recipeText(recipe.base, recipe.ingredients)}</span>
        </li>)}</ul>
      </details>
    </section>
  );
}
