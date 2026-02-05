import realIngredients from '../assets/ingredients.json';

export interface Ingredient {
    id: number;
    name: string;
    protein: number;
    carbs: number;
    fat: number;
    calories: number;
}

export interface Recipe {
    id: number;
    name: string;
    ingredients: Ingredient[];
}

export class Database {
    ingredients: Map<number, Ingredient> = new Map();
    recipes: Map<number, Recipe> = new Map();

    constructor() {
        this.seedData(2000);
    }

    seedData(numIngredients: number) {
        if (this.ingredients.size > 0) return;

        // Base Ingredients
        const bases = realIngredients;
        const modifiers = ["Organic", "Fresh", "Dice", "Grilled", "Roasted", "Steamed", "Spicy", "Savory"];

        // Generate scale
        for (let i = 0; i < numIngredients; i++) {
            const base = bases[i % bases.length];
            const modifier = modifiers[i % modifiers.length];
            const isBase = i < bases.length;

            const name = isBase ? base.name : `${modifier} ${base.name} ${Math.floor(i / bases.length)}`;

            // Add slight variance to macros for realism if generated
            const variance = isBase ? 1 : 0.9 + Math.random() * 0.2;

            const p = parseFloat((base.protein * variance).toFixed(1));
            const c = parseFloat((base.carbs * variance).toFixed(1));
            const f = parseFloat((base.fat * variance).toFixed(1));
            const cal = p * 4 + c * 4 + f * 9;

            this.ingredients.set(i, {
                id: i,
                name,
                protein: p,
                carbs: c,
                fat: f,
                calories: cal
            });
        }

        // Generate Recipes
        const allIds = Array.from(this.ingredients.keys());
        for (let i = 0; i < 50; i++) {
            const numIngs = Math.floor(Math.random() * 3) + 3; // 3-5
            const recipeIngs: Ingredient[] = [];

            for (let j = 0; j < numIngs; j++) {
                const randomId = allIds[Math.floor(Math.random() * allIds.length)];
                const ing = this.ingredients.get(randomId);
                if (ing) recipeIngs.push(ing);
            }

            this.recipes.set(i, {
                id: i,
                name: `Recipe #${i + 1}`,
                ingredients: recipeIngs
            });
        }

        console.log(`Database seeded with ${this.ingredients.size} ingredients and ${this.recipes.size} recipes.`);
    }

    getAllRecipes(): Recipe[] {
        return Array.from(this.recipes.values());
    }

    // "Dynamic Recalculation" - Optimized client-side aggregation
    queryNutrients(ingredientIds: number[]) {
        return ingredientIds.reduce((acc, id) => {
            const ing = this.ingredients.get(id);
            if (ing) {
                acc.protein += ing.protein;
                acc.carbs += ing.carbs;
                acc.fat += ing.fat;
            }
            return acc;
        }, { protein: 0, carbs: 0, fat: 0 });
    }

    getRecipeMacros(recipe: Recipe) {
        return recipe.ingredients.reduce((acc, ing) => {
            acc.protein += ing.protein;
            acc.carbs += ing.carbs;
            acc.fat += ing.fat;
            return acc;
        }, { protein: 0, carbs: 0, fat: 0 });
    }
}

export const db = new Database();
