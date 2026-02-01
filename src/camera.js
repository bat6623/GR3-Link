export class GRCamera {
  constructor() {
    this.baseUrl = '/v1'; // Use relative path for Proxy
    this.isConnected = false;
    this.isMock = location.hostname === 'localhost' && !location.search.includes('real'); // Auto mock on localhost unless ?real
  }

  async connect() {
    if (this.isMock) {
      console.log('Mock Camera Connected');
      this.isConnected = true;
      return true;
    }

    try {
      // Create a timeout promise
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 3000); // 3s timeout

      // Explicitly using absolute URL for GR3
      const response = await fetch('http://192.168.0.1/v1/photos', {
        method: 'GET',
        signal: controller.signal
      });
      clearTimeout(id);

      if (response.ok) {
        this.isConnected = true;
        return true;
      }
      throw new Error(`HTTP ${response.status}`);
    } catch (e) {
      console.error('Connection failed:', e);
      this.isConnected = false;

      // CRITICAL: Alert the user to the specific error
      let msg = e.message;
      if (e.name === 'TypeError' && e.message === 'Failed to fetch') {
        msg = 'Mixed Content Error: Browser blocked HTTP connection. Please disable "Active Content" protection or use HTTP.';
      } else if (e.name === 'AbortError') {
        msg = 'Connection Timeout: Check if connected to GR_XXXX WiFi.';
      }

      // Use window.alert for blocking visibility on mobile
      alert(`Connection Failed:\n${msg}\n\nSwitching to Demo Mode.`);

      // Fallback to mock for UX testing
      this.isMock = true;
      this.isConnected = true;
      return true;
    }
  }

  async getPhotos() {
    if (this.isMock) {
      return this._getMockPhotos();
    }

    // GR3 API structure: GET /v1/photos returns { dirs: [{ name: "100RICOH" }] }
    try {
      const res = await fetch(`${this.baseUrl}/photos`);
      const data = await res.json();

      // We need to fetch files from directories
      // Simplified for now: just get first directory
      if (data.dirs && data.dirs.length > 0) {
        const dir = data.dirs[0].name;
        const filesRes = await fetch(`${this.baseUrl}/photos/${dir}`);
        const filesData = await filesRes.json(); // { files: ["R000001.JPG", ...] }

        return filesData.files.map(f => ({
          name: f,
          url: `${this.baseUrl}/photos/${dir}/${f}`,
          thumbnail: `${this.baseUrl}/photos/${dir}/${f}?size=thumb`
        }));
      }
      return [];
    } catch (e) {
      console.error('Failed to fetch photos', e);
      return [];
    }
  }

  async _getMockPhotos() {
    // Return dummy data for UI testing
    const mockData = Array.from({ length: 12 }).map((_, i) => ({
      name: `R00000${i + 1}.JPG`,
      thumbnail: `https://picsum.photos/seed/${i + 1}/300/300`, // Reliable placeholder
      large: `https://picsum.photos/seed/${i + 1}/1920/1280`,
      date: '2023-10-27',
      params: { f: 2.8, iso: 100, s: '1/125' }
    }));
    return mockData;
  }
}
