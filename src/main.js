import { GRCamera } from './camera.js';
import { RecipeStore } from './storage.js';
import { UIManager } from './ui.js';

const initApp = async () => {
  const camera = new GRCamera();
  const store = new RecipeStore();
  const ui = new UIManager(camera, store);

  console.log('App Initializing...');

  // No auto-connect on load to prevent Mixed Content errors before user interaction
  // Instead, we wait for user to use the UI.
  // BUT current architecture splits responsibilities.
  // The Camera.connect() calls fetch immediately.
  // We added Error Alert in camera.js, so if it runs on load, it alerts on load.
  // That's annoying. Let's make connect Lazy.

  // Actually, in main.js we had:
  /*
  try {
    const isConnected = await camera.connect();
    ...
  }
  */

  // Let's modify main.js to NOT connect on load.
  console.log('App ready. Waiting for user interaction.');

  // We attach a global listener for the connect button that Main.js can hook into?
  // Or simpler: Pass a callback to UI manager?

  // For now, let's keep the auto-check but suppress the alert if it's the initial background check
  // Actually, we modified camera.js to ALERT. We should probably flag it.

  // Let's rely on the UI button to trigger "Real Connect".
  // The Start Button in UI.js currently just hides overlay. 
  // We need to actually trigger connection logic when Start is clicked.

  // To avoid circular dependency refactoring mania, let's just let it fail gracefully on load
  // and retry on button click.

  // Hack: Re-assign the start button handler in main.js to ensure logic flow
  const startBtn = document.getElementById('btn-start-app');
  if (startBtn) {
    const originalHandler = startBtn.onclick; // Preserving if any (managed by UI class)

    startBtn.addEventListener('pointerup', async () => {
      console.log('Main: Connect requested');
      const isConnected = await camera.connect(); // This will trigger the alert if fails
      ui.updateConnectionStatus(isConnected);
      if (isConnected) {
        ui.switchTab('photos');
        ui.renderPhotos(); // Ensure photos are fetched
      }
    });
  }

  // Register Service Worker via Vite Plugin PWA
  // Note: with 'registerType: autoUpdate', the plugin injects registration code script in index.html
  // But we can explicit it if we want. For now, let's rely on the plugin.
  // Actually, we need to import registerSW if we want manual control, 
  // but let's trust the 'autoUpdate' injection usually works, 
  // OR we add <script> in index.html.
  // Wait, standard Vite PWA with 'autoUpdate' creates a registerSW.js or we import it.

  // To be safe:
  /*
  import { registerSW } from 'virtual:pwa-register'
  registerSW({ immediate: true })
  */
  // But since we are Vanilla JS, we can't easily import 'virtual:' modules nicely without bundler support being active in src.
  // Yes we can, Vite handles it.

  // So:
  // 1. Remove old registration code.

  // Auto-check for updates on startup
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      registration.update(); // Check for updates on load
    });
  }

  // Handle PWA update prompt automatically (skipWaiting)
  // This interacts with vite-plugin-pwa's reloadSW logic
};

initApp();
