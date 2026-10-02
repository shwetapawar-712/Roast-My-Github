// In-memory cache for ScanResults
class ScanStore {
  constructor() {
    this.store = new Map();
  }

  get(username) {
    if (!username) return null;
    const entry = this.store.get(username.toLowerCase().trim());
    return entry || null;
  }

  set(username, scanResult) {
    if (!username) return;
    const key = username.toLowerCase().trim();
    const existing = this.store.get(key);
    this.store.set(key, {
      result: scanResult,
      previousResult: existing ? existing.result : null,
      timestamp: Date.now()
    });
  }

  has(username) {
    if (!username) return false;
    return this.store.has(username.toLowerCase().trim());
  }

  clear() {
    this.store.clear();
  }
}

module.exports = new ScanStore();
