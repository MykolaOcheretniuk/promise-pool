export type PromisePoolOptions<T, R> = {
  items: T[];
  concurrency: number;
  handler: (item: T) => Promise<R>;
};

export type PromisePoolResult<T> = {
  results: T[];
  errors: Error[];
};
