export class RecipeStore {
    constructor() {
        this.storageKey = 'gr3-recipes';
        this.recipes = this._load(); // 正確載入初始資料
        if (this.recipes.length === 0) {
            this._seed();
        }
    }

    _load() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : [];
    }

    _save(recipes = this.recipes) {
        localStorage.setItem(this.storageKey, JSON.stringify(recipes));
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
                    highLowKey: 0, // Changed from highKey
                    contrast: 1,
                    contrastHighlight: 0,
                    contrastShadow: -1,
                    sharpness: 1,
                    shading: 0,
                    clarity: 0,
                    toning: 'Off',
                    filterEffect: 0,
                    grainEffect: 0,
                    highlightCorrection: false,
                    shadowCorrection: 'Off',
                    peripheralIlluminationCorrection: false,
                    highISONoiseReduction: false,
                    whiteBalance: 'Auto',
                    wbCompensationA: 0,
                    wbCompensationM: 0,
                    isoMax: 6400,
                    exposureCompensation: '+1/3'
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
