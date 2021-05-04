import { Cache, Entry, EntryFactory } from './types';

// TODO: load before expires
// TODO: retries

export class CacheImpl<T> implements Cache<T> {
  private loaded: Entry<T> | undefined;
  private loading: Promise<T> | undefined;

  constructor(private readonly factory: EntryFactory<T>) { }

  public get = (): Promise<T> => {
    // is there already a value cached
    // use it if it's not expired
    const entry = this.loaded;
    if (entry && entry.expires.getTime() > Date.now()) return Promise.resolve(entry.value);
    // if something is already loading, use that; if not refresh
    return this.loading ?? this.refresh();
  }

  private refresh = (): Promise<T> => {
    this.loading = new Promise<T>((resolve, reject) => {
      this.factory()
        .then((entry) => {
          if (!entry) return Promise.reject(new Error('Entry is empty'));
          if (entry.expires.getTime() <= Date.now()) return Promise.reject(new Error('Entry expired'));
          this.loaded = entry;
          resolve(entry.value);
        })
        .catch((err) => {
          this.loading = undefined;
          reject(err);
        });
    });

    return this.loading;
  }
}
