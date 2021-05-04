import { given, When } from '@geeebe/jest-bdd';
import { CacheImpl } from './cache';
import { Cache, Entry } from './types';

interface Given {
  cache: Cache<number>;
  factory: jest.Mock<Promise<Entry<number>>>;
}

jest.useFakeTimers();

const sleep = (duration: number): Promise<number> => {
  return new Promise((res) => { setTimeout(res, duration); });
};

const resolveTests = (when: When<Given>, then: jest.It) => {
  when('.get() is called', ({ cache, factory }) => {
    const item = cache.get();

    then('factory will be invoked', async () => {
      await item;
      expect(factory).toHaveBeenCalled();
    });

    then('the returned value will be 12', async () => {
      const value = await item;
      expect(value).toBe(12);
    });
  });

  when('.get() is called multiple times', ({ cache, factory }) => {
    void cache.get();
    void cache.get();
    void cache.get();
    void cache.get();
    const item = cache.get();

    then('factory will be invoked only once', async () => {
      await item;
      await item;
      await item;
      await item;
      expect(factory).toHaveBeenCalledTimes(1);
    });
  });
};

const rejectTests = (when: When<Given>, then: jest.It) => {
  when('.get() is called', ({ cache }) => {
    const item = cache.get();

    then('the promise will be rejected', async () => {
      expect.assertions(1);
      await expect(item).rejects.toBeDefined();
    });
  });
};

given('an empty cache', () => {
  const factory = jest.fn(() => Promise.resolve({ expires: new Date(Date.now() + 1_000_000), value: 12 }));
  const cache = new CacheImpl<number>(factory);
  return { cache, factory };
}, resolveTests);

given('an empty cache AND factory returns expired items', () => {
  const factory = jest.fn(() => Promise.resolve<Entry<number>>({ expires: new Date(Date.now() - 1_000_000), value: 12 }));
  const cache = new CacheImpl<number>(factory);
  return { cache, factory };
}, (when, then) => {
  when('.get() is called', ({ cache }) => {
    const item = cache.get();

    then('the promise will be rejected', async () => {
      expect.assertions(1);
      await expect(item).rejects.toBeDefined();
    });
  });
});

given('an empty cache AND factory delayed result', () => {
  const factory = jest.fn(async () => {
    await sleep(2000);
    return Promise.resolve<Entry<number>>({ expires: new Date(Date.now() + 1_000_000), value: 12 });
  });
  const cache = new CacheImpl<number>(factory);
  return { cache, factory };
}, resolveTests);

given('an empty cache AND factory rejects with error', () => {
  const factory = jest.fn(() => Promise.reject<Entry<number>>(new Error('failed')));
  const cache = new CacheImpl<number>(factory);
  return { cache, factory };
}, rejectTests);

given('an empty cache AND factory rejects with delayed error', () => {
  const factory = jest.fn(async () => {
    await sleep(2000);
    return Promise.reject<Entry<number>>(new Error('failed'));
  });
  const cache = new CacheImpl<number>(factory);
  return { cache, factory };
}, rejectTests);

jest.runAllTimers();
