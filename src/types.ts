export interface Entry<T> {
  value: T;
  expires: Date;
}

export type EntryFactory<T> = () => Promise<Entry<T>>

export interface Cache<T> {
  get: () => Promise<T>
}

export type KeyedEntryFactory<K, T> = (key: K) => Promise<T>

export interface KeyedCache<K, T> {
  get: (key: K) => Promise<T>
}
