import { Injectable } from '@angular/core';
import { LocalStorage } from '@ngx-pwa/local-storage';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  public constructor(private readonly storage: LocalStorage) {}

  public async set<T>(key: string, item: T): Promise<boolean> {
    return this.storage.setItem(key, item).toPromise();
  }

  public async get<T>(key: string): Promise<T> {
    return (await this.storage.getItem(key).toPromise()) as T;
  }

  public async remove(key: string): Promise<boolean> {
    return this.storage.removeItem(key).toPromise();
  }
}
