import { Injectable, inject } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

/**
 * Service providing a wrapper around Ionic Storage to persist data (tokens, cache) locally.
 */
@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private storage = inject(Storage);
  private _storage: Storage | null = null;

  constructor() {
    this.init();
  }

  /**
   * Initializes the storage instance.
   */
  async init(): Promise<void> {
    this._storage = await this.storage.create();
  }

  /**
   * Persists a key-value pair in storage.
   * @param key The key identifier.
   * @param value The value to store.
   */
  public async set(key: string, value: any): Promise<void> {
    if (!this._storage) await this.init();
    await this._storage?.set(key, value);
  }

  /**
   * Retrieves a value associated with a key from storage.
   * @param key The key identifier.
   * @returns A Promise containing the value, or undefined if not found.
   */
  public async get(key: string): Promise<any> {
    if (!this._storage) await this.init();
    return await this._storage?.get(key);
  }

  /**
   * Removes a key-value pair from storage.
   * @param key The key identifier.
   */
  public async remove(key: string): Promise<void> {
    if (!this._storage) await this.init();
    await this._storage?.remove(key);
  }
}
