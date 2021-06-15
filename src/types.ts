export interface Entry<T> {
  value: T;
  expires: Date;
}

export type EntryFactory<T> = () => Promise<Entry<T>>

export interface Cache<T> {
  get: () => Promise<T>;
  invalidate: () => void;
}

export type KeyedEntryFactory<K, T> = (key: K) => Promise<Entry<T>>

export interface KeyedCache<K, T> {
  get: (key: K) => Promise<T>;
  invalidate: (selector: (key: K) => boolean) => void;
  invalidateAll: () => void;
  invalidateOne: (key: K) => void;
}
