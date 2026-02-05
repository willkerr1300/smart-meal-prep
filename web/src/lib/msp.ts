import { Recipe, Database } from './database';

interface MacroTargets {
    protein: number;
    carbs: number;
    fat: number;
}

interface PlanResult {
    success: boolean;
    plan?: Recipe[];
    totals?: MacroTargets;
    error?: string;
    debugStats?: string;
}

export class CSPMealGenerator {
    constructor(private recipes: Recipe[]) { }

    generatePlan(targets: MacroTargets, errorMargin: number = 0.05): PlanResult {
        const { protein: tp, carbs: tc, fat: tf } = targets;
        const startTime = performance.now();

        // Simplification for Client-Side performance:
        // We want 3 meals. We can loop or backtrack.
        // For 50 recipes, 50^3 is 125,000 combinations. This is feasible in JS.

        // Sort logic or heuristic could go here, but brute force is fine for this demo scale.

        for (const r1 of this.recipes) {
            for (const r2 of this.recipes) {
                // Optimization: Prune early if P/C/F already exceeded max
                // (Not strictly implemented here to keep it simple, but good for "real" CSP)

                for (const r3 of this.recipes) {
                    const plan = [r1, r2, r3];

                    // Calculate totals
                    const p = this.sum(plan, 'protein');
                    const c = this.sum(plan, 'carbs');
                    const f = this.sum(plan, 'fat');

                    if (this.checkMargin(p, tp, errorMargin) &&
                        this.checkMargin(c, tc, errorMargin) &&
                        this.checkMargin(f, tf, errorMargin)) {

                        const endTime = performance.now();
                        return {
                            success: true,
                            plan,
                            totals: { protein: p, carbs: c, fat: f },
                            debugStats: `Solved in ${(endTime - startTime).toFixed(2)}ms`
                        };
                    }
                }
            }
        }

        return { success: false, error: "No combination found within margin." };
    }

    private sum(recipes: Recipe[], key: 'protein' | 'carbs' | 'fat'): number {
        return recipes.reduce((sum, r) => {
            return sum + r.ingredients.reduce((isum, i) => isum + i[key], 0);
        }, 0);
    }

    private checkMargin(val: number, target: number, margin: number): boolean {
        const diff = Math.abs(val - target);
        return diff <= (target * margin);
    }
}

export class IngredientConsolidator {
    optimizeList(shoppingList: string[]): { originalCount: number, optimizedCount: number, list: string[] } {
        const map = new Map<string, number>();

        shoppingList.forEach(item => {
            // Logic: "Organic Onion" -> "Onion"
            const parts = item.split(" ");
            const base = parts[parts.length - 1]; // Simply take last word for demo

            map.set(base, (map.get(base) || 0) + 1);
        });

        return {
            originalCount: shoppingList.length,
            optimizedCount: map.size,
            list: Array.from(map.keys())
        };
    }
}
