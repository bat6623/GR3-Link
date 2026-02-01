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
                startBtn.textContent = 'Loading...';

                console.log('Entering app...');

                // Animate shutter close
                document.body.classList.add('app-started');

                setTimeout(() => {
                    const overlay = document.getElementById('startup-overlay');
                    if (overlay) overlay.style.display = 'none';
                    startBtn.classList.remove('loading');
                    startBtn.textContent = 'Enter';

                    // Directly switch to Recipes view
                    this.switchTab('recipes');
                }, 800);
            };

            // Use standard 'click' for maximum compatibility on iOS PWA
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
      
      <!-- Tab Navigation -->
      <div class="form-tabs" style="display: flex; gap: 8px; margin: 20px 0; border-bottom: 1px solid var(--color-border);">
        <button class="form-tab active" data-tab="basic">基礎</button>
        <button class="form-tab" data-tab="advanced">進階</button>
        <button class="form-tab" data-tab="correction">校正</button>
        <button class="form-tab" data-tab="exposure">曝光</button>
      </div>
      
      <form id="recipe-form" style="display:flex; flex-direction:column; gap:16px;">
        <!-- Basic Tab -->
        <div class="form-tab-content" data-tab="basic">
          <div class="form-group">
            <label>名稱</label>
            <input type="text" name="name" placeholder="例如：街拍高對比" value="${recipe ? recipe.name : ''}" required>
          </div>
          
          <div class="form-group">
            <label>Base Effect</label>
            <select name="baseEffect">
              <option value="Positive Film" ${recipe?.baseEffect === 'Positive Film' ? 'selected' : ''}>Positive Film</option>
              <option value="Negative Film" ${recipe?.baseEffect === 'Negative Film' ? 'selected' : ''}>Negative Film</option>
              <option value="Hi-Contrast B&W" ${recipe?.baseEffect === 'Hi-Contrast B&W' ? 'selected' : ''}>Hi-Contrast B&W</option>
              <option value="BW Monotone" ${recipe?.baseEffect === 'BW Monotone' ? 'selected' : ''}>BW Monotone</option>
              <option value="Soft Monotone" ${recipe?.baseEffect === 'Soft Monotone' ? 'selected' : ''}>Soft Monotone</option>
              <option value="Retro" ${recipe?.baseEffect === 'Retro' ? 'selected' : ''}>Retro</option>
              <option value="Bleach Bypass" ${recipe?.baseEffect === 'Bleach Bypass' ? 'selected' : ''}>Bleach Bypass</option>
            </select>
          </div>
          
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
            <div class="form-group">
              <label>Saturation (-4 ~ +4)</label>
              <input type="number" name="saturation" value="${recipe?.params?.saturation || 0}" min="-4" max="4">
            </div>
            <div class="form-group">
              <label>Hue (-4 ~ +4)</label>
              <input type="number" name="hue" value="${recipe?.params?.hue || 0}" min="-4" max="4">
            </div>
            <div class="form-group">
              <label>High/Low Key (-4 ~ +4)</label>
              <input type="number" name="highLowKey" value="${recipe?.params?.highLowKey || 0}" min="-4" max="4">
            </div>
            <div class="form-group">
              <label>Contrast (-4 ~ +4)</label>
              <input type="number" name="contrast" value="${recipe?.params?.contrast || 0}" min="-4" max="4">
            </div>
          </div>
        </div>
        
        <!-- Advanced Tab -->
        <div class="form-tab-content hidden" data-tab="advanced">
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
            <div class="form-group">
              <label>Contrast (Highlight) (-4 ~ +4)</label>
              <input type="number" name="contrastHighlight" value="${recipe?.params?.contrastHighlight || 0}" min="-4" max="4">
            </div>
            <div class="form-group">
              <label>Contrast (Shadow) (-4 ~ +4)</label>
              <input type="number" name="contrastShadow" value="${recipe?.params?.contrastShadow || 0}" min="-4" max="4">
            </div>
            <div class="form-group">
              <label>Sharpness (-4 ~ +4)</label>
              <input type="number" name="sharpness" value="${recipe?.params?.sharpness || 0}" min="-4" max="4">
            </div>
            <div class="form-group">
              <label>Clarity (-4 ~ +4)</label>
              <input type="number" name="clarity" value="${recipe?.params?.clarity || 0}" min="-4" max="4">
            </div>
            <div class="form-group">
              <label>Shading (-4 ~ +4)</label>
              <input type="number" name="shading" value="${recipe?.params?.shading || 0}" min="-4" max="4">
            </div>
            <div class="form-group">
              <label>Filter Effect (0 ~ 4)</label>
              <input type="number" name="filterEffect" value="${recipe?.params?.filterEffect || 0}" min="0" max="4">
            </div>
            <div class="form-group">
              <label>Grain Effect (0 ~ 3)</label>
              <input type="number" name="grainEffect" value="${recipe?.params?.grainEffect || 0}" min="0" max="3">
            </div>
            <div class="form-group">
              <label>Toning</label>
              <select name="toning">
                <option value="Off" ${recipe?.params?.toning === 'Off' ? 'selected' : ''}>Off</option>
                <option value="Sepia" ${recipe?.params?.toning === 'Sepia' ? 'selected' : ''}>Sepia</option>
                <option value="Red" ${recipe?.params?.toning === 'Red' ? 'selected' : ''}>Red</option>
                <option value="Green" ${recipe?.params?.toning === 'Green' ? 'selected' : ''}>Green</option>
                <option value="Blue" ${recipe?.params?.toning === 'Blue' ? 'selected' : ''}>Blue</option>
                <option value="Purple" ${recipe?.params?.toning === 'Purple' ? 'selected' : ''}>Purple</option>
              </select>
            </div>
          </div>
        </div>
        
        <!-- Correction Tab -->
        <div class="form-tab-content hidden" data-tab="correction">
          <div class="form-group">
            <label style="display: flex; align-items: center; gap: 8px;">
              <input type="checkbox" name="highlightCorrection" ${recipe?.params?.highlightCorrection ? 'checked' : ''}>
              Highlight Correction
            </label>
          </div>
          
          <div class="form-group">
            <label>Shadow Correction</label>
            <select name="shadowCorrection">
              <option value="Off" ${recipe?.params?.shadowCorrection === 'Off' ? 'selected' : ''}>Off</option>
              <option value="Low" ${recipe?.params?.shadowCorrection === 'Low' ? 'selected' : ''}>Low</option>
              <option value="Medium" ${recipe?.params?.shadowCorrection === 'Medium' ? 'selected' : ''}>Medium</option>
              <option value="High" ${recipe?.params?.shadowCorrection === 'High' ? 'selected' : ''}>High</option>
            </select>
          </div>
          
          <div class="form-group">
            <label style="display: flex; align-items: center; gap: 8px;">
              <input type="checkbox" name="peripheralIlluminationCorrection" ${recipe?.params?.peripheralIlluminationCorrection ? 'checked' : ''}>
              Peripheral Illumination Correction
            </label>
          </div>
          
          <div class="form-group">
            <label style="display: flex; align-items: center; gap: 8px;">
              <input type="checkbox" name="highISONoiseReduction" ${recipe?.params?.highISONoiseReduction ? 'checked' : ''}>
              High-ISO Noise Reduction
            </label>
          </div>
        </div>
        
        <!-- Exposure Tab -->
        <div class="form-tab-content hidden" data-tab="exposure">
          <div class="form-group">
            <label>White Balance</label>
            <select name="whiteBalance">
              <option value="Auto" ${recipe?.params?.whiteBalance === 'Auto' ? 'selected' : ''}>Auto</option>
              <option value="Daylight" ${recipe?.params?.whiteBalance === 'Daylight' ? 'selected' : ''}>Daylight</option>
              <option value="Shade" ${recipe?.params?.whiteBalance === 'Shade' ? 'selected' : ''}>Shade</option>
              <option value="Cloudy" ${recipe?.params?.whiteBalance === 'Cloudy' ? 'selected' : ''}>Cloudy</option>
              <option value="Tungsten" ${recipe?.params?.whiteBalance === 'Tungsten' ? 'selected' : ''}>Tungsten</option>
              <option value="Fluorescent" ${recipe?.params?.whiteBalance === 'Fluorescent' ? 'selected' : ''}>Fluorescent</option>
              <option value="Manual" ${recipe?.params?.whiteBalance === 'Manual' ? 'selected' : ''}>Manual</option>
            </select>
          </div>
          
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
            <div class="form-group">
              <label>WB Comp A (-7 ~ +7)</label>
              <input type="number" name="wbCompensationA" value="${recipe?.params?.wbCompensationA || 0}" min="-7" max="7">
            </div>
            <div class="form-group">
              <label>WB Comp M (-7 ~ +7)</label>
              <input type="number" name="wbCompensationM" value="${recipe?.params?.wbCompensationM || 0}" min="-7" max="7">
            </div>
          </div>
          
          <div class="form-group">
            <label>ISO Max</label>
            <select name="isoMax">
              <option value="100" ${recipe?.params?.isoMax === 100 ? 'selected' : ''}>100</option>
              <option value="200" ${recipe?.params?.isoMax === 200 ? 'selected' : ''}>200</option>
              <option value="400" ${recipe?.params?.isoMax === 400 ? 'selected' : ''}>400</option>
              <option value="800" ${recipe?.params?.isoMax === 800 ? 'selected' : ''}>800</option>
              <option value="1600" ${recipe?.params?.isoMax === 1600 ? 'selected' : ''}>1600</option>
              <option value="3200" ${recipe?.params?.isoMax === 3200 ? 'selected' : ''}>3200</option>
              <option value="6400" ${recipe?.params?.isoMax === 6400 ? 'selected' : ''}>6400</option>
              <option value="12800" ${recipe?.params?.isoMax === 12800 ? 'selected' : ''}>12800</option>
              <option value="25600" ${recipe?.params?.isoMax === 25600 ? 'selected' : ''}>25600</option>
              <option value="51200" ${recipe?.params?.isoMax === 51200 ? 'selected' : ''}>51200</option>
              <option value="102400" ${recipe?.params?.isoMax === 102400 ? 'selected' : ''}>102400</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Exposure Compensation</label>
            <select name="exposureCompensation">
              <option value="-2" ${recipe?.params?.exposureCompensation === '-2' ? 'selected' : ''}>-2 EV</option>
              <option value="-5/3" ${recipe?.params?.exposureCompensation === '-5/3' ? 'selected' : ''}>-1 2/3 EV</option>
              <option value="-4/3" ${recipe?.params?.exposureCompensation === '-4/3' ? 'selected' : ''}>-1 1/3 EV</option>
              <option value="-1" ${recipe?.params?.exposureCompensation === '-1' ? 'selected' : ''}>-1 EV</option>
              <option value="-2/3" ${recipe?.params?.exposureCompensation === '-2/3' ? 'selected' : ''}>-2/3 EV</option>
              <option value="-1/3" ${recipe?.params?.exposureCompensation === '-1/3' ? 'selected' : ''}>-1/3 EV</option>
              <option value="0" ${recipe?.params?.exposureCompensation === '0' ? 'selected' : ''}>0 EV</option>
              <option value="+1/3" ${recipe?.params?.exposureCompensation === '+1/3' ? 'selected' : ''}selected>+1/3 EV</option>
              <option value="+2/3" ${recipe?.params?.exposureCompensation === '+2/3' ? 'selected' : ''}>+2/3 EV</option>
              <option value="+1" ${recipe?.params?.exposureCompensation === '+1' ? 'selected' : ''}>+1 EV</option>
              <option value="+4/3" ${recipe?.params?.exposureCompensation === '+4/3' ? 'selected' : ''}>+1 1/3 EV</option>
              <option value="+5/3" ${recipe?.params?.exposureCompensation === '+5/3' ? 'selected' : ''}>+1 2/3 EV</option>
              <option value="+2" ${recipe?.params?.exposureCompensation === '+2' ? 'selected' : ''}>+2 EV</option>
            </select>
          </div>
        </div>
        
        <div style="display:flex; gap:10px; margin-top:20px;">
          <button type="button" class="btn" id="btn-cancel" style="flex:1;">Cancel</button>
          <button type="submit" class="btn btn-primary" style="flex:1;">Save Recipe</button>
        </div>
      </form>
    `;

        // Tab switching logic
        const tabs = container.querySelectorAll('.form-tab');
        const tabContents = container.querySelectorAll('.form-tab-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.dataset.tab;

                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Show corresponding content
                tabContents.forEach(content => {
                    if (content.dataset.tab === targetTab) {
                        content.classList.remove('hidden');
                    } else {
                        content.classList.add('hidden');
                    }
                });
            });
        });

        document.getElementById('btn-cancel').onclick = () => this.renderRecipes();
        document.getElementById('recipe-form').onsubmit = (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            const data = {
                name: fd.get('name'),
                baseEffect: fd.get('baseEffect'),
                params: {
                    // Basic
                    saturation: parseInt(fd.get('saturation')),
                    hue: parseInt(fd.get('hue')),
                    highLowKey: parseInt(fd.get('highLowKey')),
                    contrast: parseInt(fd.get('contrast')),
                    // Advanced
                    contrastHighlight: parseInt(fd.get('contrastHighlight')),
                    contrastShadow: parseInt(fd.get('contrastShadow')),
                    sharpness: parseInt(fd.get('sharpness')),
                    clarity: parseInt(fd.get('clarity')),
                    shading: parseInt(fd.get('shading')),
                    filterEffect: parseInt(fd.get('filterEffect')),
                    grainEffect: parseInt(fd.get('grainEffect')),
                    toning: fd.get('toning'),
                    // Correction
                    highlightCorrection: fd.get('highlightCorrection') === 'on',
                    shadowCorrection: fd.get('shadowCorrection'),
                    peripheralIlluminationCorrection: fd.get('peripheralIlluminationCorrection') === 'on',
                    highISONoiseReduction: fd.get('highISONoiseReduction') === 'on',
                    // Exposure
                    whiteBalance: fd.get('whiteBalance'),
                    wbCompensationA: parseInt(fd.get('wbCompensationA')),
                    wbCompensationM: parseInt(fd.get('wbCompensationM')),
                    isoMax: parseInt(fd.get('isoMax')),
                    exposureCompensation: fd.get('exposureCompensation')
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
