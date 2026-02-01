export class UIManager {
    constructor(camera, store) {
        this.camera = camera;
        this.store = store;

        // DOM Elements
        this.views = {
            home: document.getElementById('view-home'),
            photos: null, // Dynamic
            recipes: null, // Dynamic
            settings: null // Dynamic
        };
        this.mainContent = document.getElementById('main-content');
        this.navItems = document.querySelectorAll('.nav-item');
        this.statusIndicator = document.getElementById('connection-status');

        this.activeTab = 'home';

        this._initViews();
        this._bindEvents();
        this._initToast();
        this._handleStartup();
    }

    _initToast() {
        this.toastContainer = document.createElement('div');
        this.toastContainer.className = 'toast-container';
        document.body.appendChild(this.toastContainer);
    }

    showToast(message, duration = 2000) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        this.toastContainer.appendChild(toast);

        // Trigger reflow
        toast.offsetHeight;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    _handleStartup() {
        const startBtn = document.getElementById('btn-start-app');
        if (startBtn) {
            console.log('Startup button found, attaching listener');
            const startHandler = async (e) => {
                // Prevent multiple clicks
                if (startBtn.classList.contains('loading')) return;

                startBtn.classList.add('loading');
                startBtn.textContent = 'Connecting...';

                console.log('Connect interacting, starting app...');

                // Trigger camera connection
                const isConnected = await this.camera.connect();
                this.updateConnectionStatus(isConnected);

                // Animate shutter close
                document.body.classList.add('app-started');

                setTimeout(() => {
                    const overlay = document.getElementById('startup-overlay');
                    if (overlay) overlay.style.display = 'none';
                    startBtn.classList.remove('loading');
                    startBtn.textContent = 'Connect';

                    // Switch to photos view if connected
                    if (isConnected) {
                        this.switchTab('photos');
                    }
                }, 800);
            };

            // Use standard 'click' for maximum compatibility on iOS PWA
            // 'pointerup' can be cancelled if finger moves slightly (scroll)
            startBtn.addEventListener('click', startHandler);
        } else {
            console.error('Startup button not found!');
        }
    }

    _initViews() {
        // Create view containers if not present (home is already there)
        ['photos', 'recipes', 'settings'].forEach(viewId => {
            const el = document.createElement('div');
            el.id = `view-${viewId}`;
            el.className = 'view hidden';
            this.mainContent.appendChild(el);
            this.views[viewId] = el;
        });
    }

    _bindEvents() {
        // Navigation
        this.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const target = item.dataset.target; // photos, recipes, settings
                this.switchTab(target);
            });
        });
    }

    async switchTab(tabName) {
        // Update Nav UI
        this.navItems.forEach(item => {
            if (item.dataset.target === tabName) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Hide all views
        Object.values(this.views).forEach(el => el.classList.add('hidden'));

        // Show target view
        if (this.views[tabName]) {
            this.views[tabName].classList.remove('hidden');
        }

        this.activeTab = tabName;

        // Load content
        if (tabName === 'photos') {
            await this.renderPhotos();
        } else if (tabName === 'recipes') {
            this.renderRecipes();
        } else if (tabName === 'settings') {
            this.renderSettings();
        }
    }

    updateConnectionStatus(isConnected) {
        if (isConnected) {
            this.statusIndicator.textContent = 'Connected';
            this.statusIndicator.className = 'status-indicator connected';
            this.statusIndicator.style.color = 'var(--color-success)';
        } else {
            this.statusIndicator.textContent = 'Disconnected';
            this.statusIndicator.className = 'status-indicator disconnected';
            this.statusIndicator.style.color = 'var(--color-error)';
        }
    }

    // --- Photos View ---
    async renderPhotos() {
        const container = this.views.photos;
        container.innerHTML = '<div class="loading">Loading photos...</div>';

        const photos = await this.camera.getPhotos();

        container.innerHTML = '';

        if (photos.length === 0) {
            container.innerHTML = '<div class="empty-state">No photos found or not connected.</div>';
            return;
        }

        const grid = document.createElement('div');
        grid.className = 'photo-grid';
        // Grid styles now in CSS

        photos.forEach(photo => {
            const item = document.createElement('div');
            item.className = 'photo-item';
            // Background image still needs inline style as it is dynamic
            item.style.backgroundImage = `url('${photo.thumbnail}')`;

            item.onclick = () => this.openLightbox(photo);
            grid.appendChild(item);
        });

        container.appendChild(grid);
    }

    openLightbox(photo) {
        // Simple lightbox implementation
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        lightbox.style.position = 'fixed';
        lightbox.style.top = '0';
        lightbox.style.left = '0';
        lightbox.style.width = '100%';
        lightbox.style.height = '100%';
        lightbox.style.backgroundColor = 'rgba(0,0,0,0.95)';
        lightbox.style.zIndex = '1000';
        lightbox.style.display = 'flex';
        lightbox.style.flexDirection = 'column';
        lightbox.style.justifyContent = 'center';
        lightbox.style.alignItems = 'center';

        const img = document.createElement('img');
        img.src = photo.url;
        img.style.maxWidth = '100%';
        img.style.maxHeight = '80%';
        img.style.objectFit = 'contain';

        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '20px';
        closeBtn.style.right = '20px';
        closeBtn.style.color = '#fff';
        closeBtn.style.fontSize = '2rem';
        closeBtn.onclick = () => lightbox.remove();

        const downloadBtn = document.createElement('a');
        downloadBtn.href = photo.url;
        downloadBtn.download = photo.name;
        downloadBtn.textContent = 'Download Original';
        downloadBtn.className = 'btn btn-primary';
        downloadBtn.style.marginTop = '20px';

        lightbox.appendChild(closeBtn);
        lightbox.appendChild(img);
        lightbox.appendChild(downloadBtn);

        document.body.appendChild(lightbox);
    }

    // --- Recipes View ---
    renderRecipes() {
        const container = this.views.recipes;
        container.innerHTML = `
      <div class="recipes-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
        <h3>My Recipes</h3>
        <button id="btn-add-recipe" class="btn btn-primary">+ New</button>
      </div>
      <div id="recipe-list"></div>
    `;

        document.getElementById('btn-add-recipe').onclick = () => this.showRecipeForm();

        const list = document.getElementById('recipe-list');
        const recipes = this.store.getAll();

        if (recipes.length === 0) {
            list.innerHTML = '<p>No recipes yet.</p>';
            return;
        }

        recipes.forEach(recipe => {
            const card = document.createElement('div');
            card.className = 'card recipe-card';
            card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h4 style="color:var(--color-accent);">${recipe.name}</h4>
          <span style="font-size:0.75rem; color:var(--color-text-muted);">${recipe.baseEffect}</span>
        </div>
        <div style="font-family:var(--font-mono); font-size:0.8rem; margin:0.5rem 0; color:var(--color-text-secondary);">
           Sat: ${recipe.params.saturation || 0} / Hue: ${recipe.params.hue || 0} / High/Low: ${recipe.params.highKey || 0}
        </div>
        <button class="btn-delete" style="color:var(--color-error); font-size:0.8rem;">Delete</button>
      `;

            card.querySelector('.btn-delete').onclick = (e) => {
                e.stopPropagation();
                if (confirm('Delete this recipe?')) {
                    this.store.delete(recipe.id);
                    this.renderRecipes();
                }
            };

            card.onclick = () => this.showRecipeForm(recipe); // Edit
            list.appendChild(card);
        });
    }

    showRecipeForm(recipe = null) {
        const container = this.views.recipes;
        const isEdit = !!recipe;

        container.innerHTML = `
      <h3>${isEdit ? 'Edit Recipe' : 'New Recipe'}</h3>
      <form id="recipe-form" style="display:flex; flex-direction:column; gap:16px; margin-top:24px;">
        <div class="form-group">
            <label style="font-size:0.8rem; color:var(--color-text-muted); margin-bottom:4px; display:block;">Name</label>
            <input type="text" name="name" placeholder="E.g. Urban High Contrast" value="${recipe ? recipe.name : ''}" required>
        </div>
        
        <div class="form-group">
            <label style="font-size:0.8rem; color:var(--color-text-muted); margin-bottom:4px; display:block;">Base Effect</label>
            <select name="baseEffect">
              <option value="Positive Film" ${recipe?.baseEffect === 'Positive Film' ? 'selected' : ''}>Positive Film</option>
              <option value="Negative Film" ${recipe?.baseEffect === 'Negative Film' ? 'selected' : ''}>Negative Film</option>
              <option value="Hi-Contrast B&W" ${recipe?.baseEffect === 'Hi-Contrast B&W' ? 'selected' : ''}>Hi-Contrast B&W</option>
              <option value="Soft Monotone" ${recipe?.baseEffect === 'Soft Monotone' ? 'selected' : ''}>Soft Monotone</option>
              <option value="Retro" ${recipe?.baseEffect === 'Retro' ? 'selected' : ''}>Retro</option>
              <option value="Bleach Bypass" ${recipe?.baseEffect === 'Bleach Bypass' ? 'selected' : ''}>Bleach Bypass</option>
            </select>
        </div>
        
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
            <div class="form-group">
                <label style="font-size:0.8rem; color:var(--color-text-muted); margin-bottom:4px; display:block;">Saturation</label>
                <input type="number" name="saturation" value="${recipe?.params?.saturation || 0}" min="-4" max="4">
            </div>
            <div class="form-group">
                <label style="font-size:0.8rem; color:var(--color-text-muted); margin-bottom:4px; display:block;">Hue</label>
                <input type="number" name="hue" value="${recipe?.params?.hue || 0}" min="-4" max="4">
            </div>
            <div class="form-group">
                <label style="font-size:0.8rem; color:var(--color-text-muted); margin-bottom:4px; display:block;">High/Low Key</label>
                <input type="number" name="highKey" value="${recipe?.params?.highKey || 0}" min="-4" max="4">
            </div>
            <div class="form-group">
                <label style="font-size:0.8rem; color:var(--color-text-muted); margin-bottom:4px; display:block;">Contrast</label>
                <input type="number" name="contrast" value="${recipe?.params?.contrast || 0}" min="-4" max="4">
            </div>
        </div>
        
        <div style="display:flex; gap:10px; margin-top:20px;">
          <button type="button" class="btn" id="btn-cancel" style="flex:1;">Cancel</button>
          <button type="submit" class="btn btn-primary" style="flex:1;">Save Recipe</button>
        </div>
      </form>
    `;

        document.getElementById('btn-cancel').onclick = () => this.renderRecipes();
        document.getElementById('recipe-form').onsubmit = (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            const data = {
                name: fd.get('name'),
                baseEffect: fd.get('baseEffect'),
                params: {
                    saturation: parseInt(fd.get('saturation')),
                    hue: parseInt(fd.get('hue')),
                    highKey: parseInt(fd.get('highKey')),
                    contrast: parseInt(fd.get('contrast')),
                }
            };

            if (isEdit) {
                this.store.update(recipe.id, data);
                this.showToast('Recipe updated');
            } else {
                this.store.add(data);
                this.showToast('New recipe added');
            }
            this.renderRecipes();
        };
    }

    // --- Settings View ---
    renderSettings() {
        this.views.settings.innerHTML = `
      <h3>Settings</h3>
      <div class="card">
        <h4>Connection Info</h4>
        <p>GR3 IP: 192.168.0.1</p>
        <p>Status: ${this.camera.isConnected ? 'Connected' : 'Disconnected'}</p>
        ${this.camera.isMock ? '<p style="color:yellow">Mock Mode Enabled</p>' : ''}
        <button id="btn-reconnect" class="btn" style="margin-top:10px;">Reconnect</button>
      </div>
    `;

        document.getElementById('btn-reconnect').onclick = async () => {
            this.updateConnectionStatus(false);
            const success = await this.camera.connect();
            this.updateConnectionStatus(success);
            this.renderSettings();
        };

        // Add Reset / Force Update Button
        const resetBtn = document.createElement('button');
        resetBtn.className = 'btn';
        resetBtn.style.textAlign = 'center';
        resetBtn.style.width = '100%';
        resetBtn.style.marginTop = '20px';
        resetBtn.style.border = '1px solid var(--color-error)';
        resetBtn.style.color = 'var(--color-error)';
        resetBtn.textContent = 'Force Update & Reset App';

        resetBtn.onclick = async () => {
            if (confirm('This will clear all caches and force a reload. Continue?')) {
                resetBtn.textContent = 'Updating...';

                // 1. Unregister SW
                if ('serviceWorker' in navigator) {
                    const registrations = await navigator.serviceWorker.getRegistrations();
                    for (const registration of registrations) {
                        await registration.unregister();
                    }
                }

                // 2. Clear Caches
                if ('caches' in window) {
                    const names = await caches.keys();
                    await Promise.all(names.map(name => caches.delete(name)));
                }

                // 3. Force Reload with timestamp
                window.location.href = window.location.pathname + '?v=' + new Date().getTime();
            }
        };

        this.views.settings.querySelector('.card').appendChild(resetBtn);
    }
}
