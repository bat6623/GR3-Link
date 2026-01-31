export class RecipeStore {
    constructor() {
        this.STORAGE_KEY = 'gr3_recipes';
        this.recipes = this._load();
        if (this.recipes.length === 0) {
            this._seed();
        }
    }

    _load() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    }

    _save() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.recipes));
    }

    _seed() {
        // Default GR3 Recipes
        const defaults = [
            {
                id: 'default-1',
                name: 'Positive Film',
                baseEffect: 'Positive Film',
                params: {
                    saturation: 0,
                    hue: 0,
                    highKey: 0,
                    contrast: 1,
                    contrastHighlight: 0,
                    contrastShadow: -1,
                    sharpness: 1,
                    shading: 0,
                    clarity: 0
                },
                note: 'Classic highly saturated look.'
            },
            {
                id: 'default-2',
                name: 'High Contrast B&W',
                baseEffect: 'Hi-Contrast B&W',
                params: {
                    contrast: 3,
                    sharpness: 2,
                    grain: 1
                },
                note: 'Gritty street photography style.'
            }
        ];
        this.recipes = defaults;
        this._save();
    }

    getAll() {
        return this.recipes;
    }

    get(id) {
        return this.recipes.find(r => r.id === id);
    }

    add(recipe) {
        recipe.id = crypto.randomUUID();
        recipe.createdAt = new Date().toISOString();
        this.recipes.push(recipe);
        this._save();
        return recipe;
    }

    update(id, updates) {
        const index = this.recipes.findIndex(r => r.id === id);
        if (index !== -1) {
            this.recipes[index] = { ...this.recipes[index], ...updates };
            this._save();
            return this.recipes[index];
        }
        return null;
    }

    delete(id) {
        this.recipes = this.recipes.filter(r => r.id !== id);
        this._save();
    }
}
