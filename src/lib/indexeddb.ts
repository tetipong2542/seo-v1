interface AppSettings {
  id?: number;
  openrouter_api_key: string;
  openrouter_model: string;
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_password: string;
  from_email: string;
  from_name: string;
  google_client_email: string;
  google_private_key: string;
  google_project_id: string;
  updated_at: Date;
}

interface LogEntry {
  id?: number;
  website_name: string;
  website_url?: string;
  page_title: string;
  keywords_count: number;
  keywords_list: string[];
  content_length: string;
  model: string;
  recipient_email: string;
  status: 'success' | 'error';
  error_message?: string;
  created_at: Date;
}

class IndexedDBService {
  private dbName = 'SEOGeneratorDB';
  private version = 2;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create settings store
        if (!db.objectStoreNames.contains('settings')) {
          const settingsStore = db.createObjectStore('settings', {
            keyPath: 'id',
            autoIncrement: true,
          });
        }

        // Create logs store
        if (!db.objectStoreNames.contains('logs')) {
          const logsStore = db.createObjectStore('logs', {
            keyPath: 'id',
            autoIncrement: true,
          });
          logsStore.createIndex('created_at', 'created_at', { unique: false });
        }

        // Handle migration from version 1 to 2
        if (event.oldVersion < 2) {
          // Add migration logic if needed for existing data
          const transaction = (event.target as IDBOpenDBRequest).transaction;
          if (transaction && db.objectStoreNames.contains('logs')) {
            const logsStore = transaction.objectStore('logs');
            
            // ไม่ต้องเพิ่ม indices ใหม่ เพราะข้อมูลจะถูกเพิ่มผ่าน form ใหม่
            console.log('Migrating to version 2: New fields (model, keywords_list) will be available for new logs');
          }
        }
      };
    });
  }

  // Settings methods
  async saveSettings(settings: Omit<AppSettings, 'id'>): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['settings'], 'readwrite');
      const store = transaction.objectStore('settings');

      // Clear existing settings and save new one
      const clearRequest = store.clear();
      clearRequest.onsuccess = () => {
        const addRequest = store.add({
          ...settings,
          updated_at: new Date(),
        });

        addRequest.onsuccess = () => resolve();
        addRequest.onerror = () => reject(addRequest.error);
      };

      clearRequest.onerror = () => reject(clearRequest.error);
    });
  }

  async getSettings(): Promise<AppSettings | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['settings'], 'readonly');
      const store = transaction.objectStore('settings');
      const request = store.getAll();

      request.onsuccess = () => {
        const settings = request.result;
        resolve(settings.length > 0 ? settings[0] : null);
      };

      request.onerror = () => reject(request.error);
    });
  }

  async exportSettings(): Promise<string> {
    const settings = await this.getSettings();
    if (!settings) {
      throw new Error('No settings found to export');
    }

    const exportData = {
      ...settings,
      exported_at: new Date().toISOString(),
      version: this.version,
    };

    return JSON.stringify(exportData, null, 2);
  }

  async importSettings(jsonData: string): Promise<void> {
    try {
      const importData = JSON.parse(jsonData);
      
      // Validate required fields
      const requiredFields = [
        'openrouter_api_key',
        'openrouter_model',
        'smtp_host',
        'smtp_user',
        'smtp_password',
        'from_email'
      ];

      for (const field of requiredFields) {
        if (!importData[field]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      // Remove metadata fields
      delete importData.id;
      delete importData.exported_at;
      delete importData.version;

      await this.saveSettings(importData);
    } catch (error) {
      throw new Error(`Failed to import settings: ${error instanceof Error ? error.message : 'Invalid JSON'}`);
    }
  }

  // Logs methods
  async addLog(log: Omit<LogEntry, 'id' | 'created_at'>): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['logs'], 'readwrite');
      const store = transaction.objectStore('logs');

      const request = store.add({
        ...log,
        created_at: new Date(),
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getLogs(limit: number = 50): Promise<LogEntry[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['logs'], 'readonly');
      const store = transaction.objectStore('logs');
      const index = store.index('created_at');

      // Get logs in descending order (newest first)
      const request = index.openCursor(null, 'prev');
      const results: LogEntry[] = [];
      let count = 0;

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        
        if (cursor && count < limit) {
          results.push(cursor.value);
          count++;
          cursor.continue();
        } else {
          resolve(results);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  async clearLogs(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['logs'], 'readwrite');
      const store = transaction.objectStore('logs');
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const indexedDBService = new IndexedDBService();
export type { AppSettings, LogEntry }; 