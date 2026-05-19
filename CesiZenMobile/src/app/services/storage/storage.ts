import { Injectable, inject } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private storage = inject(Storage);
  private _storage: Storage | null = null;

  constructor() {
    this.init();
  }

  async init() {
    this._storage = await this.storage.create();
  }

  public async set(key: string, value: any) {
    if (!this._storage) await this.init();
    await this._storage?.set(key, value);
  }

  public async get(key: string) {
    if (!this._storage) await this.init();
    return await this._storage?.get(key);
  }

  public async remove(key: string) {
    if (!this._storage) await this.init();
    await this._storage?.remove(key);
  }
}
