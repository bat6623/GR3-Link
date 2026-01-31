export class GRCamera {
  constructor() {
    this.baseUrl = '/v1'; // Use relative path for Proxy
    this.isConnected = false;
    this.isMock = location.hostname === 'localhost' && !location.search.includes('real'); // Auto mock on localhost unless ?real
  }

  async connect() {
    if (this.isMock) {
      console.log('Using Mock Camera');
      this.isConnected = true;
      return true;
    }
    
    try {
      const response = await fetch(`${this.baseUrl}/ping`, { method: 'GET', signal: AbortSignal.timeout(3000) });
      if (response.ok) {
        this.isConnected = true;
        return true;
      }
    } catch (e) {
      console.error('Connection failed', e);
    }
    return false;
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

  _getMockPhotos() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([
          { name: 'R0012345.JPG', url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', thumbnail: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', date: '2023-10-27' },
          { name: 'R0012346.JPG', url: 'https://images.unsplash.com/photo-1495572099496-6e27a7c56a31?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', thumbnail: 'https://images.unsplash.com/photo-1495572099496-6e27a7c56a31?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', date: '2023-10-28' },
          { name: 'R0012347.DNG', url: 'https://images.unsplash.com/photo-1549520442-e14f6b0f24e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', thumbnail: 'https://images.unsplash.com/photo-1549520442-e14f6b0f24e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', date: '2023-10-29' },
          { name: 'R0012348.JPG', url: 'https://images.unsplash.com/photo-1623861278144-84d43675c94d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', thumbnail: 'https://images.unsplash.com/photo-1623861278144-84d43675c94d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', date: '2023-10-30' },
          { name: 'R0012349.JPG', url: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', thumbnail: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', date: '2023-10-31' },
          { name: 'R0012350.JPG', url: 'https://images.unsplash.com/photo-1517524959063-e838706c6418?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', thumbnail: 'https://images.unsplash.com/photo-1517524959063-e838706c6418?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80', date: '2023-11-01' },
        ]);
      }, 500);
    });
  }
}
