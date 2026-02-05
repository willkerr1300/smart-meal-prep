import random
from typing import List, Dict, Any
from constraint import Problem, FunctionConstraint

class CSPMealGenerator:
    def __init__(self, recipes):
        self.recipes = recipes
        self.recipe_map = {r.id: r for r in recipes}

    def generate_plan(self, target_protein, target_carbs, target_fat, error_margin=0.05):
        # We want to pick 3 meals (breakfast, lunch, dinner)
        # That sum up to targets within margin.
        
        problem = Problem()
        
        # Variables: 3 meal slots
        # Domain: All recipe IDs
        recipe_ids = list(self.recipe_map.keys())
        
        # Optimizations: 
        # In a real app, we would filter domain based on approx range to avoid O(N^3) checks
        # But for N=50, 50^3 = 125,000 checks is trivial for constraint solver.
        
        problem.addVariable("Meal_1", recipe_ids)
        problem.addVariable("Meal_2", recipe_ids)
        problem.addVariable("Meal_3", recipe_ids)
        
        # Constraints
        # Helper to get recipe from ID
        def get_r(rid): return self.recipe_map[rid]
        
        def macro_constraint(m1, m2, m3):
            # Calculate totals
            r1, r2, r3 = get_r(m1), get_r(m2), get_r(m3)
            p = r1.protein + r2.protein + r3.protein
            c = r1.carbs + r2.carbs + r3.carbs
            f = r1.fat + r2.fat + r3.fat
            
            # Check margins
            p_ok = abs(p - target_protein) <= (target_protein * error_margin)
            c_ok = abs(c - target_carbs) <= (target_carbs * error_margin)
            f_ok = abs(f - target_fat) <= (target_fat * error_margin)
            
            return p_ok and c_ok and f_ok

        # Add single constraint involving all variables
        problem.addConstraint(FunctionConstraint(macro_constraint), ["Meal_1", "Meal_2", "Meal_3"])
        
        # Get one solution
        solution = problem.getSolution()
        
        if solution:
            m1 = self.recipe_map[solution["Meal_1"]]
            m2 = self.recipe_map[solution["Meal_2"]]
            m3 = self.recipe_map[solution["Meal_3"]]
            
            total_p = m1.protein + m2.protein + m3.protein
            total_c = m1.carbs + m2.carbs + m3.carbs
            total_f = m1.fat + m2.fat + m3.fat
            
            return {
                "success": True,
                "plan": [m1, m2, m3],
                "totals": {"p": total_p, "c": total_c, "f": total_f},
                "diffs": {
                    "p": total_p - target_protein,
                    "c": total_c - target_carbs,
                    "f": total_f - target_fat
                }
            }
        else:
            return {"success": False, "message": "No solution found within constraints"}

class IngredientConsolidator:
    def optimize_list(self, shopping_list: List[str]) -> List[str]:
        # Logic: 
        # 1. Normalize strings
        # 2. Map overlapping terms
        # 3. Return unique set
        
        consolidated = {}
        
        for item in shopping_list:
            # Simplified consolidation logic: take last word (e.g., "Organic Onion" -> "Onion")
            parts = item.split(" ")
            base = parts[-1] 
            
            if base not in consolidated:
                consolidated[base] = 1
            else:
                consolidated[base] += 1
                
        return list(consolidated.keys())
