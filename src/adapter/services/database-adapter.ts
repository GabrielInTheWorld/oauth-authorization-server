import PouchDB from 'pouchdb';

import { BaseModel } from '../../core/base/base-model';
import { DatabasePort } from '../interfaces/database-port';
import { Constructable } from '../../core/modules/decorators';

@Constructable(DatabasePort)
export default class DatabaseAdapter implements DatabasePort {
  public name = 'DatabaseAdapter';

  private readonly database: PouchDB.Database;

  /**
   * Constructor.
   *
   * Initialize the database and redis commands declared above, if the database is not already initialized.
   */
  public constructor(public readonly modelConstructor: new <T>(...args: any) => T) {
    if (!this.database) {
      this.database = new PouchDB('db');
      this.clear();
    }
  }

  /**
   * Function to write a key/value-pair to the database. If the key is already existing, it will do nothing.
   *
   * @param key The key, where the object is found.
   * @param obj The object to store.
   *
   * @returns A boolean, if everything is okay - if `false`, the key is already existing in the database.
   */
  public async set<T>(prefix: string, key: string, obj: T): Promise<boolean> {
    if (!(await this.get(prefix, key))) {
      const result = await this.database.put({
        _id: this.getPrefixedKey(prefix, key),
        ...obj
      });
      return result.ok;
    } else {
      return false;
    }
  }

  /**
   * This returns an object stored by the given key.
   *
   * @param key The key, where the object will be found.
   *
   * @returns The object - if there is no object stored by this key, it will return an empty object.
   */
  public async get<T>(prefix: string, key: string): Promise<T | null> {
    const result = await this.database.get(this.getPrefixedKey(prefix, key)).catch(() => {
      return null;
    });
    return result ? new this.modelConstructor(result) : null;
  }

  /**
   * This function will update an existing object in the database by the given object.
   * to the database, no matter if there is already an object stored
   * by the given key.
   *
   * @param key The key, where the object is found.
   * @param update The object or partially properties, which are assigned to the original object
   * found by the given key.
   *
   * @returns The updated object.
   */
  public async update<T>(prefix: string, key: string, update: Partial<T>): Promise<T> {
    const object = await this.get<T>(prefix, key);
    if (object) {
      Object.assign(object, update);
      return object;
    } else {
      await this.set(prefix, key, update);
      return update as T;
    }
  }

  /**
   * This will delete an entry from the database.
   *
   * @param key The key of the related object to remove.
   *
   * @returns A boolean if the object was successfully deleted.
   */
  public async remove(prefix: string, key: string): Promise<boolean> {
    const result = await this.database.get(this.getPrefixedKey(prefix, key)).then(doc => this.database.remove(doc));
    return result.ok;
  }

  /**
   * Function to get all objects from the database stored by a specific prefix.
   *
   * @param prefix The known name for the storage of the requested objects.
   *
   * @returns An array with all found objects for the specific prefix.
   */
  public async getAll<T>(prefix?: string): Promise<T[]> {
    const objects: T[] = [];
    const docs = await this.database.allDocs({ include_docs: true, startkey: prefix });
    const results = docs.rows;
    for (const result of results) {
      objects.push(new this.modelConstructor(result));
    }
    return objects;
  }

  /**
   * Clears the whole database.
   *
   * Necessary for development to avoid inserting a new entry every refresh.
   */
  private async clear(): Promise<void> {
    await this.database.allDocs().then(async result => {
      for (const doc of result.rows) {
        await this.database.remove(doc.id, doc.value.rev);
      }
    });
  }

  private getPrefixedKey(prefix: string, key: string): string {
    return `${prefix}_${key}`;
  }
}
