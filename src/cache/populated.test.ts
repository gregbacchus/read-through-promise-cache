import { given, When } from '@geeebe/jest-bdd';
import { Cache, Entry } from '../types';
import { CacheImpl } from './cache';

const RESULT = Math.random();

interface Given {
  cache: Cache<number>;
  factory: jest.Mock<Promise<Entry<number>>>;
}

const resolveTests = (when: When<Given>, then: jest.It) => {
  when('.get() is called', ({ cache, factory }) => {
    const item = cache.get();

    then('factory will NOT be invoked', async () => {
      await item;
      expect(factory).not.toHaveBeenCalled();
    });

    then('the returned value will be correct', async () => {
      const value = await item;
      expect(value).toBe(RESULT);
    });
  });

  when('.get() is called multiple times', ({ cache, factory }) => {
    void cache.get();
    void cache.get();
    void cache.get();
    void cache.get();
    const item = cache.get();

    then('factory will NOT be invoked', async () => {
      await item;
      expect(factory).not.toHaveBeenCalled();
    });
  });
};

given('a populated cache', () => {
  const factory = jest.fn(() => Promise.resolve({ expires: new Date(Date.now() + 1_000_000), value: RESULT }));
  const cache = new CacheImpl<number>(factory);
  void cache.get();
  factory.mockReset();
  return { cache, factory };
}, resolveTests);
