import { GRCamera } from './camera.js';
import { RecipeStore } from './storage.js';
import { UIManager } from './ui.js';

document.addEventListener('DOMContentLoaded', async () => {
  const camera = new GRCamera();
  const store = new RecipeStore();
  const ui = new UIManager(camera, store);

  // Initial connection attempt
  const isConnected = await camera.connect();
  ui.updateConnectionStatus(isConnected);

  // Default to Recipes tab first if not connected, or Photos if connected?
  // Let's default to Photos but if empty maybe Recipes. The UI class defaults to 'home' actually.
  // Let's switch to photos if connected, or recipes if not.
  // Actually, let's just stay on Home or switch to Photos.
  if (isConnected) {
    ui.switchTab('photos');
  }

  // Register Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(() => console.log('SW Registered'))
      .catch(e => console.error('SW Fail', e));
  }
});
