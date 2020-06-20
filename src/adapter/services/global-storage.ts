import { Constructable } from '../../core/modules/decorators';

@Constructable(GlobalStorage)
export default class GlobalStorage {
  private readonly storage = new Map<string, any>();

  public set<T>(key: string, value: T): void {
    this.storage.set(key, value);
  }

  public get<T>(key: string): T | undefined {
    return this.storage.get(key) as T;
  }

  public delete(key: string): void {
    this.storage.delete(key);
  }
}
