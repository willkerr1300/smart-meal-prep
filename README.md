# Smart Meal Prep Manager

**Live Demo:** [https://willkerr1300.github.io/smart-meal-prep/](https://willkerr1300.github.io/smart-meal-prep/)

## Overview
A high-performance, client-side React application that generates weekly meal plans based on precise macronutrient targets. Engineered with a custom Constraint Satisfaction Problem (CSP) solver and an intelligent shopping list optimizer.

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

## Project Structure (For Recruiters)
This repository is configured for **direct deployment** to GitHub Pages.

*   `src_code/`: **The actual Source Code** (React/TypeScript) is here!
*   `backend/`: The original Python/SQLite prototype and verification scripts.
*   `root`: Contains the minified production build for GitHub Pages hosting.

## Tech Stack
*   **Frontend**: React 19, TypeScript, Vite
*   **Algorithms**: Custom backtracking CSP solver, Hash-map based aggregation
*   **Database**: Client-side simulated SQL engine

## Local Development
To run the project locally from the source:

1.  Navigate to source:
    ```bash
    cd src_code
    ```
2.  Install & Run:
    ```bash
    npm install
    npm run dev
    ```
