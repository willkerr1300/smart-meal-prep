import os
import random
import sqlite3
from dataclasses import dataclass
from typing import List, Optional, Dict

@dataclass
class Ingredient:
    id: int
    name: str
    protein: float
    carbs: float
    fat: float
    calories: float

@dataclass
class Recipe:
    id: int
    name: str
    ingredients: List[Ingredient]
    
    @property
    def protein(self):
        return sum(i.protein for i in self.ingredients)

    @property
    def carbs(self):
        return sum(i.carbs for i in self.ingredients)

    @property
    def fat(self):
        return sum(i.fat for i in self.ingredients)

def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

class Database:
    def __init__(self, db_path=None):
        self.db_path = db_path or os.path.join(os.path.dirname(__file__), 'mealprep.db')

    def connect(self):
        # sqlite3 connects to a file, so it always "succeeds" to create/open it
        try:
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = dict_factory # Return dicts for easier mapping
            # Enable foreign keys
            conn.execute("PRAGMA foreign_keys = ON")
            return conn
        except sqlite3.Error as e:
            print(f"Error connecting to SQLite: {e}")
            return None

    def init_db(self):
        conn = self.connect()
        if not conn: return
        
        schema_path = os.path.join(os.path.dirname(__file__), 'schema.sql')
        with open(schema_path, 'r') as f:
            schema_sql = f.read()
            
        with conn:
            conn.executescript(schema_sql)
            print("Database schema initialized (SQLite).")
        conn.close()

    def seed_data(self, num_ingredients=1000):
        # Helper to check if populated
        self.init_db() # Ensure tables exist
        
        conn = self.connect()
        if not conn: return

        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) as count FROM ingredients")
        if cursor.fetchone()['count'] > 0:
            print("Database already seeded.")
            conn.close()
            return

        print("Seeding database (SQLite)...")
        
        # Generate Ingredients
        modifiers = ["Organic", "Fresh", "Raw", "Cooked", "Diced"]
        bases = ["Chicken", "Rice", "Broccoli", "Beef", "Potato", "Carrot", "Egg", "Salmon", "Oats", "Spinach"]
        
        ingredients_data = []
        for i in range(num_ingredients):
            name = f"{random.choice(modifiers)} {random.choice(bases)} {i}"
            p = round(random.uniform(0, 30), 1)
            c = round(random.uniform(0, 50), 1)
            f = round(random.uniform(0, 20), 1)
            cal = p * 4 + c * 4 + f * 9
            ingredients_data.append((name, p, c, f, cal))

        cursor.executemany("""
            INSERT INTO ingredients (name, protein, carbs, fat, calories)
            VALUES (?, ?, ?, ?, ?)
        """, ingredients_data)
        
        # Get IDs (SQLite autoincrements, so they should be 1..N)
        cursor.execute("SELECT id FROM ingredients")
        all_ids = [row['id'] for row in cursor.fetchall()]

        # Generate Recipes
        recipes_data = []
        for i in range(50):
            r_name = f"Recipe_{i}"
            recipes_data.append((r_name, "Mix everything."))
            
        cursor.executemany("""
            INSERT INTO recipes (name, instructions)
            VALUES (?, ?)
        """, recipes_data)
        
        cursor.execute("SELECT id FROM recipes")
        recipe_ids = [row['id'] for row in cursor.fetchall()]
        
        junction_data = []
        for rid in recipe_ids:
            # 3-5 random ingredients
            num_ings = random.randint(3, 5)
            chosen_ings = random.sample(all_ids, num_ings)
            for iid in chosen_ings:
                junction_data.append((rid, iid, 100)) # 100g default
        
        cursor.executemany("""
            INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount_grams)
            VALUES (?, ?, ?)
        """, junction_data)
        
        conn.commit()
        conn.close()
        print(f"Seeded {num_ingredients} ingredients and {len(recipes_data)} recipes.")

    def get_all_recipes(self) -> List[Recipe]:
        conn = self.connect()
        if not conn: return []
            
        recipes = []
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM recipes")
            recipe_rows = cursor.fetchall()
            
            for r_row in recipe_rows:
                rid = r_row['id']
                
                cursor.execute("""
                    SELECT i.* 
                    FROM ingredients i
                    JOIN recipe_ingredients ri ON i.id = ri.ingredient_id
                    WHERE ri.recipe_id = ?
                """, (rid,))
                
                ing_rows = cursor.fetchall()
                # Row factory gives dicts, so we can unpack
                ingredients = [Ingredient(**row) for row in ing_rows]
                
                recipes.append(Recipe(
                    id=rid,
                    name=r_row['name'],
                    ingredients=ingredients
                ))
        finally:
            conn.close()
            
        return recipes

    def query_nutrients(self, ingredient_ids: List[int]):
        conn = self.connect()
        if not conn: return {"protein": 0, "carbs": 0, "fat": 0}
        
        if not ingredient_ids:
            return {"protein": 0, "carbs": 0, "fat": 0}
            
        try:
            cursor = conn.cursor()
            # SQLite doesn't strictly support `ANY(?)` with a list nicely without extensions
            # So we build a dynamic IN clause: "IN (?, ?, ?)"
            placeholders = ','.join('?' for _ in ingredient_ids)
            query = f"""
                SELECT SUM(protein) as p, SUM(carbs) as c, SUM(fat) as f
                FROM ingredients
                WHERE id IN ({placeholders})
            """
            cursor.execute(query, ingredient_ids)
            result = cursor.fetchone()
            
            return {
                "protein": result['p'] or 0,
                "carbs": result['c'] or 0,
                "fat": result['f'] or 0
            }
        finally:
            conn.close()

