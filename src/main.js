import { GRCamera } from './camera.js';
import { RecipeStore } from './storage.js';
import { UIManager } from './ui.js';

const initApp = async () => {
  const camera = new GRCamera();
  const store = new RecipeStore();
  const ui = new UIManager(camera, store);

  console.log('App Initializing...');

  // Initial connection attempt with short timeout to not block UI interaction
  try {
    const isConnected = await camera.connect();
    ui.updateConnectionStatus(isConnected);

    if (isConnected) {
      ui.switchTab('photos');
    }
  } catch (e) {
    console.warn('Initial connection check failed:', e);
  }

  // Register Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(() => console.log('SW Registered'))
      .catch(e => console.error('SW Fail', e));
  }
};

initApp();
