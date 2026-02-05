import type { Recipe } from './database';

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
    private recipes: Recipe[];

    constructor(recipes: Recipe[]) {
        this.recipes = recipes;
    }

    generatePlan(targets: MacroTargets, mealCount: number = 3, errorMargin: number = 0.05): PlanResult {

        const startTime = performance.now();

        // Recursively find a combination of 'mealCount' recipes
        // For performance in JS (brute force), we limit this depth or use random sampling if N is large.
        // For N=3 to 6 and 50 recipes, full brute force might be heavy for N=6 (50^6).
        // optimization: Random Shuffle + greedy backtrack.

        const shuffled = [...this.recipes].sort(() => 0.5 - Math.random());

        const result = this.findCombination([], shuffled, mealCount, targets, errorMargin);

        const endTime = performance.now();
        if (result) {
            const { plan, totals } = result;
            return {
                success: true,
                plan,
                totals,
                debugStats: `Solved in ${(endTime - startTime).toFixed(2)}ms (N=${mealCount})`
            };
        }

        return { success: false, error: "No combination found within margin. Try looser constraints." };
    }

    private findCombination(currentPath: Recipe[], pool: Recipe[], depthTarget: number, targets: MacroTargets, margin: number): { plan: Recipe[], totals: MacroTargets } | null {
        if (currentPath.length === depthTarget) {
            const p = this.sum(currentPath, 'protein');
            const c = this.sum(currentPath, 'carbs');
            const f = this.sum(currentPath, 'fat');

            if (this.checkMargin(p, targets.protein, margin) &&
                this.checkMargin(c, targets.carbs, margin) &&
                this.checkMargin(f, targets.fat, margin)) {
                return { plan: currentPath, totals: { protein: p, carbs: c, fat: f } };
            }
            return null;
        }

        // Optimization: Check if we are already way over targets
        // (Basic pruning)
        const currentP = this.sum(currentPath, 'protein');
        if (currentP > targets.protein * (1 + margin)) return null;

        // Try next
        for (let i = 0; i < pool.length; i++) {
            // Heuristic: Don't repeat same recipe twice in a week? Allowed for now.
            const next = this.findCombination([...currentPath, pool[i]], pool, depthTarget, targets, margin);
            if (next) return next;

            // Timeout protection for UI? 
            // In a real app we'd use a web worker or async yielder.
            // For this demo, we rely on the small pool size (50).
            if (currentPath.length === 0 && i > 15) break; // Limit first level branching to keep UI responsive
        }

        return null;
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
            // "Fresh Chicken Breast" -> "Chicken Breast"
            // Simple heuristic updates: Remove first word if it looks like a modifier
            const parts = item.split(" ");
            let base = item;

            // hardcoded known modifiers for the demo
            const modifiers = new Set(["Organic", "Fresh", "Dice", "Grilled", "Roasted", "Steamed", "Spicy", "Savory"]);
            if (parts.length > 1 && modifiers.has(parts[0])) {
                base = parts.slice(1).join(" ");
            }

            map.set(base, (map.get(base) || 0) + 1);
        });

        return {
            originalCount: shoppingList.length,
            optimizedCount: map.size,
            list: Array.from(map.keys())
        };
    }
}
