import { PromisePoolOptions, PromisePoolResult } from "./types";

class PromisePool<T, R> {
  private items: T[];
  private concurrency: number;
  private handler: (item: T) => Promise<R>;
  private results: R[] = [];
  private errors: Error[] = [];

  constructor(options: PromisePoolOptions<T, R>) {
    this.items = options.items;
    this.concurrency = options.concurrency;
    this.handler = options.handler;
  }

  process = async (): Promise<PromisePoolResult<R>> => {
    const promises = new Set<Promise<R>>();

    for (const item of this.items) {
      const promise = this.handler(item)
        .then((result) => {
          this.results.push(result);
          return result;
        })
        .catch((error) => {
          this.errors.push(error);
          throw error;
        })
        .finally(() => promises.delete(promise));

      promises.add(promise);

      if (promises.size >= this.concurrency) {
        await Promise.race(promises);
      }
    }

    await Promise.all(promises);

    return { results: this.results, errors: this.errors };
  };
}
export function promisePool<T, R>(
  options: PromisePoolOptions<T, R>
): Promise<PromisePoolResult<R>> {
  const pool = new PromisePool(options);
  return pool.process();
}
