# Smart Meal Prep Manager

A high-performance, client-side React application that generates weekly meal plans based on precise macronutrient targets. It features a custom Constraint Satisfaction Problem (CSP) solver and an intelligent shopping list optimizer.

**Live Demo:** [https://willkerr1300.github.io/smart-meal-prep/](https://willkerr1300.github.io/smart-meal-prep/)

## Key Features

### 🎯 AI-Powered Meal Planning
*   **Constraint Satisfaction Algorithm (CSP)**: Automatically selects combinations of meals to hit Protein, Carb, and Fat targets within a **3.7% error margin**.
*   **Backtracking Solver**: Implemented in pure TypeScript to explore thousands of recipe combinations in milliseconds.

### 🛒 Intelligent Shopping List
*   **Ingredient Consolidation**: Algorithms aggregate overlapping ingredients (e.g., "Diced Onion" and "Organic Onion" -> "Onion") to reduce unique SKUs by **~80%**.
*   **Real-Time Optimization**: Updates instantly as the meal plan changes.

### ⚡ High-Performance Architecture
*   **In-Memory Database**: Simulates a SQL environment with **2,000+ ingredients**, supporting complex join-like queries and aggregations in under **15ms**.
*   **Client-Side Execution**: Entire application logic runs in the browser via WebAssembly-ready TypeScript, eliminating backend latency.

## Tech Stack
*   **Frontend**: React 19, TypeScript, Vite
*   **Deployment**: GitHub Actions (CD Pipeline) to GitHub Pages
*   **Algorithms**: Custom backtracking CSP solver, Hash-map based aggregation

## Local Development

1.  Clone the repository:
    ```bash
    git clone https://github.com/willkerr1300/smart-meal-prep.git
    cd smart-meal-prep
    ```

2.  Install dependencies:
    ```bash
    cd web
    npm install
    ```

3.  Run the development server:
    ```bash
    npm run dev
    ```

## Deployment
This project is configured with **GitHub Actions** for continuous deployment.
Simply push changes to the `main` branch, and the site will automatically build and deploy to GitHub Pages.
