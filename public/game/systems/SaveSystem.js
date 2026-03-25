// localStorage save/load system

export class SaveSystem {
  constructor() {
    this.SAVE_KEY = 'the_outbreak_save';
  }

  save(data) {
    try {
      localStorage.setItem(this.SAVE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Save failed:', e);
      return false;
    }
  }

  load() {
    try {
      const raw = localStorage.getItem(this.SAVE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.error('Load failed:', e);
      return null;
    }
  }

  hasSave() {
    return !!localStorage.getItem(this.SAVE_KEY);
  }

  deleteSave() {
    localStorage.removeItem(this.SAVE_KEY);
  }
}

export default SaveSystem;
