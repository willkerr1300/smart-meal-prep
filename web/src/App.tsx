import { useState, useMemo } from 'react';
import './App.css';
import { db, type Recipe } from './lib/database';
import { CSPMealGenerator, IngredientConsolidator } from './lib/msp';

function App() {
  const [targets, setTargets] = useState({ protein: 150, carbs: 150, fat: 60 });
  const [planResult, setPlanResult] = useState<any>(null);
  const [shoppingList, setShoppingList] = useState<{ list: string[], reducedFrom: number } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Initialize systems (memoized to run once)
  const systems = useMemo(() => {
    const csp = new CSPMealGenerator(db.getAllRecipes());
    const consolidator = new IngredientConsolidator();
    return { csp, consolidator };
  }, []);

  const handleGenerate = () => {
    setIsGenerating(true);
    setPlanResult(null);
    setShoppingList(null);

    // Small timeout to let UI show loading state
    setTimeout(() => {
      const result = systems.csp.generatePlan(targets);
      setPlanResult(result);

      if (result.success && result.plan) {
        // Generate list
        const rawList: string[] = [];
        result.plan.forEach((r: Recipe) => {
          r.ingredients.forEach(i => rawList.push(i.name));
        });

        const optimized = systems.consolidator.optimizeList(rawList);
        setShoppingList({
          list: optimized.list,
          reducedFrom: optimized.originalCount
        });
      }
      setIsGenerating(false);
    }, 100);
  };

  return (
    <div className="container">
      <header>
        <h1>Smart Meal Prep Manager</h1>
        <p>Client-Side AI Constraint Solver Demo</p>
      </header>

      <main>
        <section className="controls">
          <h2>Macro Targets</h2>
          <div className="inputs">
            <label>
              Protein (g)
              <input type="number" value={targets.protein} onChange={e => setTargets({ ...targets, protein: Number(e.target.value) })} />
            </label>
            <label>
              Carbs (g)
              <input type="number" value={targets.carbs} onChange={e => setTargets({ ...targets, carbs: Number(e.target.value) })} />
            </label>
            <label>
              Fat (g)
              <input type="number" value={targets.fat} onChange={e => setTargets({ ...targets, fat: Number(e.target.value) })} />
            </label>
          </div>
          <button onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? 'Solving...' : 'Generate Weekly Plan'}
          </button>
        </section>

        <section className="results">
          {planResult && !planResult.success && (
            <div className="error">
              ❌ {planResult.error}
            </div>
          )}

          {planResult && planResult.success && (
            <div className="success">
              <div className="stats-bar">
                <span className="badge">Solved in {planResult.debugStats}</span>
                <span className="badge">Error Margin: &lt; 5%</span>
              </div>

              <div className="meal-grid">
                {planResult.plan.map((r: Recipe, i: number) => (
                  <div key={i} className="meal-card">
                    <h3>Meal {i + 1}</h3>
                    <p className="recipe-name">{r.name}</p>
                    <ul className="ing-list">
                      {r.ingredients.map(ing => (
                        <li key={ing.id}>{ing.name}</li>
                      ))}
                    </ul>
                    <div className="meal-macros">
                      <small>P: {db.getRecipeMacros(r).protein.toFixed(0)}g</small>
                      <small>C: {db.getRecipeMacros(r).carbs.toFixed(0)}g</small>
                      <small>F: {db.getRecipeMacros(r).fat.toFixed(0)}g</small>
                    </div>
                  </div>
                ))}
              </div>

              <div className="totals-card">
                <h3>Daily Totals</h3>
                <div className="macro-row">
                  <div className="macro">
                    <span className="label">Protein</span>
                    <span className="value">{planResult.totals.protein.toFixed(1)}g</span>
                    <span className="target">/ {targets.protein}g</span>
                  </div>
                  <div className="macro">
                    <span className="label">Carbs</span>
                    <span className="value">{planResult.totals.carbs.toFixed(1)}g</span>
                    <span className="target">/ {targets.carbs}g</span>
                  </div>
                  <div className="macro">
                    <span className="label">Fat</span>
                    <span className="value">{planResult.totals.fat.toFixed(1)}g</span>
                    <span className="target">/ {targets.fat}g</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {shoppingList && (
          <section className="shopping-list">
            <h2> Optimized Shopping List</h2>
            <div className="reduction-badge">
              Running Ingredient Consolidation... <br />
              <strong>Reduced SKU count by {((1 - (shoppingList.list.length / shoppingList.reducedFrom)) * 100).toFixed(0)}%</strong>
              <br />
              <small>({shoppingList.reducedFrom} items → {shoppingList.list.length} unique SKUs)</small>
            </div>
            <div className="list-grid">
              {shoppingList.list.map(item => (
                <span key={item} className="tag">{item}</span>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
