import { RecipeStore } from './storage.js';

export class UIManager {
  constructor(camera) {
    this.camera = camera;
    this.store = new RecipeStore();
    this.currentView = 'recipes';

    // View containers
    this.views = {
      recipes: document.getElementById('view-recipes'),
      settings: document.getElementById('view-settings')
    };

    // Nav buttons
    this.navButtons = {
      recipes: document.getElementById('nav-recipes'),
      settings: document.getElementById('nav-settings')
    };

    this.init();
  }

  init() {
    this._setupNavigation();
    this._handleStartup();
  }

  _setupNavigation() {
    Object.entries(this.navButtons).forEach(([view, btn]) => {
      btn.addEventListener('click', () => this.switchView(view));
    });
  }

  switchView(viewName) {
    // Hide all views
    Object.values(this.views).forEach(v => v.classList.add('hidden'));
    // Show target view
    this.views[viewName].classList.remove('hidden');

    // Update nav active state
    Object.values(this.navButtons).forEach(btn => btn.classList.remove('active'));
    this.navButtons[viewName].classList.add('active');

    this.currentView = viewName;

    // Render content
    if (viewName === 'recipes') this.renderRecipes();
    if (viewName === 'settings') this.renderSettings();
  }

  _handleStartup() {
    const overlay = document.getElementById('startup-overlay');
    const startBtn = document.getElementById('btn-start-app');

    const startHandler = async (e) => {
      e.preventDefault();

      // Trigger shutter animation
      overlay.classList.add('opening');

      // Wait for animation to complete
      setTimeout(() => {
        overlay.style.display = 'none';
        // Navigate to Recipes tab directly
        this.switchView('recipes');
      }, 800);
    };

    startBtn.addEventListener('click', startHandler);
  }

  // --- Recipes View ---
  renderRecipes() {
    const recipes = this.store.getAll();
    const container = this.views.recipes;

    if (recipes.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:40px 20px; color:var(--color-text-secondary);">
          <p>No recipes yet. Tap + to create one.</p>
        </div>
      `;
    } else {
      container.innerHTML = recipes.map(r => this._createRecipeCard(r)).join('');
      // Attach event listeners
      container.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.id;
          const recipe = this.store.getById(id);
          this.showRecipeForm(recipe);
        });
      });
      container.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.id;
          if (confirm('Delete this recipe?')) {
            this.store.delete(id);
            this.showToast('Recipe deleted');
            this.renderRecipes();
          }
        });
      });
    }

    // Add "New Recipe" button
    const addBtn = document.createElement('button');
    addBtn.className = 'btn btn-primary';
    addBtn.textContent = '+ New';
    addBtn.style.cssText = 'position:fixed; bottom:80px; right:20px; width:60px; height:60px; border-radius:50%; font-size:1.5rem;';
    addBtn.onclick = () => this.showRecipeForm();
    container.appendChild(addBtn);
  }

  _createRecipeCard(recipe) {
    return `
      <div class="card recipe-card">
        <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:12px;">
          <div>
            <h4 style="margin:0 0 4px 0;">${recipe.name}</h4>
            <div style="font-size:0.75rem; color:var(--color-text-muted);">${recipe.baseEffect}</div>
          </div>
          <div style="display:flex; gap:8px;">
            <button class="btn-edit" data-id="${recipe.id}" style="padding:4px 12px; font-size:0.8rem;">Edit</button>
            <button class="btn-delete" data-id="${recipe.id}" style="padding:4px 12px; font-size:0.8rem; background:var(--color-error);">Delete</button>
          </div>
        </div>
        <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:8px; font-size:0.8rem;">
          <div>飽和度: ${recipe.params.saturation}</div>
          <div>色相: ${recipe.params.hue}</div>
          <div>對比度: ${recipe.params.contrast}</div>
          <div>銳利度: ${recipe.params.sharpness || 0}</div>
        </div>
      </div>
    `;
  }

  showRecipeForm(recipe = null) {
    const container = this.views.recipes;
    const isEdit = !!recipe;

    container.innerHTML = `
      <h3>${isEdit ? '編輯參數' : '新增參數'}</h3>
      
      <form id="recipe-form" style="display:flex; flex-direction:column; gap:20px; margin-top:24px;">
        <!-- 基本資訊 -->
        <div class="form-section">
          <h4 style="color: var(--color-accent); margin-bottom: 16px; font-size: 0.9rem;">基本資訊</h4>
          <div class="form-group">
            <label>名稱</label>
            <input type="text" name="name" placeholder="例如：街拍高對比" value="${recipe ? recipe.name : ''}" required>
          </div>
          
          <div class="form-group">
            <label>基礎效果 (Base Effect)</label>
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
        </div>
        
        <!-- 色調與對比 -->
        <div class="form-section">
          <h4 style="color: var(--color-accent); margin-bottom: 16px; font-size: 0.9rem;">色調與對比</h4>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
            <div class="form-group">
              <label>飽和度 (-4 ~ +4)</label>
              <input type="number" name="saturation" value="${recipe?.params?.saturation || 0}" min="-4" max="4">
            </div>
            <div class="form-group">
              <label>色相 (-4 ~ +4)</label>
              <input type="number" name="hue" value="${recipe?.params?.hue || 0}" min="-4" max="4">
            </div>
            <div class="form-group">
              <label>高/低調 (-4 ~ +4)</label>
              <input type="number" name="highLowKey" value="${recipe?.params?.highLowKey || 0}" min="-4" max="4">
            </div>
            <div class="form-group">
              <label>對比度 (-4 ~ +4)</label>
              <input type="number" name="contrast" value="${recipe?.params?.contrast || 0}" min="-4" max="4">
            </div>
            <div class="form-group">
              <label>對比度（高光） (-4 ~ +4)</label>
              <input type="number" name="contrastHighlight" value="${recipe?.params?.contrastHighlight || 0}" min="-4" max="4">
            </div>
            <div class="form-group">
              <label>對比度（陰影） (-4 ~ +4)</label>
              <input type="number" name="contrastShadow" value="${recipe?.params?.contrastShadow || 0}" min="-4" max="4">
            </div>
          </div>
        </div>
        
        <!-- 銳利度與細節 -->
        <div class="form-section">
          <h4 style="color: var(--color-accent); margin-bottom: 16px; font-size: 0.9rem;">銳利度與細節</h4>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
            <div class="form-group">
              <label>銳利度 (-4 ~ +4)</label>
              <input type="number" name="sharpness" value="${recipe?.params?.sharpness || 0}" min="-4" max="4">
            </div>
            <div class="form-group">
              <label>清晰度 (-4 ~ +4)</label>
              <input type="number" name="clarity" value="${recipe?.params?.clarity || 0}" min="-4" max="4">
            </div>
            <div class="form-group">
              <label>暗角 (-4 ~ +4)</label>
              <input type="number" name="shading" value="${recipe?.params?.shading || 0}" min="-4" max="4">
            </div>
            <div class="form-group">
              <label>濾鏡效果 (0 ~ 4)</label>
              <input type="number" name="filterEffect" value="${recipe?.params?.filterEffect || 0}" min="0" max="4">
            </div>
            <div class="form-group">
              <label>顆粒效果 (0 ~ 3)</label>
              <input type="number" name="grainEffect" value="${recipe?.params?.grainEffect || 0}" min="0" max="3">
            </div>
            <div class="form-group">
              <label>色調 (Toning)</label>
              <select name="toning">
                <option value="Off" ${recipe?.params?.toning === 'Off' ? 'selected' : ''}>關閉</option>
                <option value="Sepia" ${recipe?.params?.toning === 'Sepia' ? 'selected' : ''}>棕褐色</option>
                <option value="Red" ${recipe?.params?.toning === 'Red' ? 'selected' : ''}>紅色</option>
                <option value="Green" ${recipe?.params?.toning === 'Green' ? 'selected' : ''}>綠色</option>
                <option value="Blue" ${recipe?.params?.toning === 'Blue' ? 'selected' : ''}>藍色</option>
                <option value="Purple" ${recipe?.params?.toning === 'Purple' ? 'selected' : ''}>紫色</option>
              </select>
            </div>
          </div>
        </div>
        
        <!-- 校正選項 -->
        <div class="form-section">
          <h4 style="color: var(--color-accent); margin-bottom: 16px; font-size: 0.9rem;">校正選項</h4>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
            <div class="form-group">
              <label style="display: flex; align-items: center; gap: 8px;">
                <input type="checkbox" name="highlightCorrection" ${recipe?.params?.highlightCorrection ? 'checked' : ''}>
                高光校正
              </label>
            </div>
            
            <div class="form-group">
              <label>陰影校正</label>
              <select name="shadowCorrection">
                <option value="Off" ${recipe?.params?.shadowCorrection === 'Off' ? 'selected' : ''}>關閉</option>
                <option value="Low" ${recipe?.params?.shadowCorrection === 'Low' ? 'selected' : ''}>低</option>
                <option value="Medium" ${recipe?.params?.shadowCorrection === 'Medium' ? 'selected' : ''}>中</option>
                <option value="High" ${recipe?.params?.shadowCorrection === 'High' ? 'selected' : ''}>高</option>
              </select>
            </div>
            
            <div class="form-group">
              <label style="display: flex; align-items: center; gap: 8px;">
                <input type="checkbox" name="peripheralIlluminationCorrection" ${recipe?.params?.peripheralIlluminationCorrection ? 'checked' : ''}>
                周邊光量校正
              </label>
            </div>
            
            <div class="form-group">
              <label style="display: flex; align-items: center; gap: 8px;">
                <input type="checkbox" name="highISONoiseReduction" ${recipe?.params?.highISONoiseReduction ? 'checked' : ''}>
                高 ISO 降噪
              </label>
            </div>
          </div>
        </div>
        
        <!-- 曝光設定 -->
        <div class="form-section">
          <h4 style="color: var(--color-accent); margin-bottom: 16px; font-size: 0.9rem;">曝光設定</h4>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
            <div class="form-group">
              <label>白平衡</label>
              <select name="whiteBalance">
                <option value="Auto" ${recipe?.params?.whiteBalance === 'Auto' ? 'selected' : ''}>自動</option>
                <option value="Daylight" ${recipe?.params?.whiteBalance === 'Daylight' ? 'selected' : ''}>日光</option>
                <option value="Shade" ${recipe?.params?.whiteBalance === 'Shade' ? 'selected' : ''}>陰影</option>
                <option value="Cloudy" ${recipe?.params?.whiteBalance === 'Cloudy' ? 'selected' : ''}>陰天</option>
                <option value="Tungsten" ${recipe?.params?.whiteBalance === 'Tungsten' ? 'selected' : ''}>鎢絲燈</option>
                <option value="Fluorescent" ${recipe?.params?.whiteBalance === 'Fluorescent' ? 'selected' : ''}>螢光燈</option>
                <option value="Manual" ${recipe?.params?.whiteBalance === 'Manual' ? 'selected' : ''}>手動</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>ISO 上限</label>
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
              <label>白平衡補償 A (-7 ~ +7)</label>
              <input type="number" name="wbCompensationA" value="${recipe?.params?.wbCompensationA || 0}" min="-7" max="7">
            </div>
            
            <div class="form-group">
              <label>白平衡補償 M (-7 ~ +7)</label>
              <input type="number" name="wbCompensationM" value="${recipe?.params?.wbCompensationM || 0}" min="-7" max="7">
            </div>
            
            <div class="form-group" style="grid-column: 1 / -1;">
              <label>曝光補償</label>
              <select name="exposureCompensation">
                <option value="-2" ${recipe?.params?.exposureCompensation === '-2' ? 'selected' : ''}>-2 EV</option>
                <option value="-5/3" ${recipe?.params?.exposureCompensation === '-5/3' ? 'selected' : ''}>-1 2/3 EV</option>
                <option value="-4/3" ${recipe?.params?.exposureCompensation === '-4/3' ? 'selected' : ''}>-1 1/3 EV</option>
                <option value="-1" ${recipe?.params?.exposureCompensation === '-1' ? 'selected' : ''}>-1 EV</option>
                <option value="-2/3" ${recipe?.params?.exposureCompensation === '-2/3' ? 'selected' : ''}>-2/3 EV</option>
                <option value="-1/3" ${recipe?.params?.exposureCompensation === '-1/3' ? 'selected' : ''}>-1/3 EV</option>
                <option value="0" ${recipe?.params?.exposureCompensation === '0' ? 'selected' : ''}>0 EV</option>
                <option value="+1/3" ${recipe?.params?.exposureCompensation === '+1/3' ? 'selected' : ''}>+1/3 EV</option>
                <option value="+2/3" ${recipe?.params?.exposureCompensation === '+2/3' ? 'selected' : ''}>+2/3 EV</option>
                <option value="+1" ${recipe?.params?.exposureCompensation === '+1' ? 'selected' : ''}>+1 EV</option>
                <option value="+4/3" ${recipe?.params?.exposureCompensation === '+4/3' ? 'selected' : ''}>+1 1/3 EV</option>
                <option value="+5/3" ${recipe?.params?.exposureCompensation === '+5/3' ? 'selected' : ''}>+1 2/3 EV</option>
                <option value="+2" ${recipe?.params?.exposureCompensation === '+2' ? 'selected' : ''}>+2 EV</option>
              </select>
            </div>
          </div>
        </div>
        
        <div style="display:flex; gap:10px; margin-top:20px;">
          <button type="button" class="btn" id="btn-cancel" style="flex:1;">取消</button>
          <button type="submit" class="btn btn-primary" style="flex:1;">儲存參數</button>
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
          // 色調與對比
          saturation: parseInt(fd.get('saturation')),
          hue: parseInt(fd.get('hue')),
          highLowKey: parseInt(fd.get('highLowKey')),
          contrast: parseInt(fd.get('contrast')),
          contrastHighlight: parseInt(fd.get('contrastHighlight')),
          contrastShadow: parseInt(fd.get('contrastShadow')),
          // 銳利度與細節
          sharpness: parseInt(fd.get('sharpness')),
          clarity: parseInt(fd.get('clarity')),
          shading: parseInt(fd.get('shading')),
          filterEffect: parseInt(fd.get('filterEffect')),
          grainEffect: parseInt(fd.get('grainEffect')),
          toning: fd.get('toning'),
          // 校正
          highlightCorrection: fd.get('highlightCorrection') === 'on',
          shadowCorrection: fd.get('shadowCorrection'),
          peripheralIlluminationCorrection: fd.get('peripheralIlluminationCorrection') === 'on',
          highISONoiseReduction: fd.get('highISONoiseReduction') === 'on',
          // 曝光
          whiteBalance: fd.get('whiteBalance'),
          wbCompensationA: parseInt(fd.get('wbCompensationA')),
          wbCompensationM: parseInt(fd.get('wbCompensationM')),
          isoMax: parseInt(fd.get('isoMax')),
          exposureCompensation: fd.get('exposureCompensation')
        }
      };

      if (isEdit) {
        this.store.update(recipe.id, data);
        this.showToast('參數已更新');
      } else {
        this.store.add(data);
        this.showToast('新參數已新增');
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
        <p>Status: <span id="status-text">Disconnected</span></p>
      </div>
      <div class="card">
        <h4>About</h4>
        <p>GR3 Link v2.3.0</p>
        <p>Ricoh GR3 Camera Control PWA</p>
      </div>
    `;
  }

  // --- Toast Notification ---
  showToast(message, duration = 2000) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;

    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    container.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  updateConnectionStatus(isConnected) {
    const statusText = document.getElementById('status-text');
    if (statusText) {
      statusText.textContent = isConnected ? 'Connected' : 'Disconnected';
      statusText.style.color = isConnected ? 'var(--color-success)' : 'var(--color-error)';
    }
  }
}
