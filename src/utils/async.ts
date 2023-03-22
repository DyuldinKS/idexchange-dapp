/**
 *
 * Calls given function with the promise error, then rejects the original error.
 * Similar to `tap` utility, but for promise rejection: (a -> b) -> a -> reject(a)
 */
export const tapRejected =
  <T = any>(f: (err: T) => any) =>
  (err: T) => {
    f(err);
    return Promise.reject(err);
  };

/**
 * Calls given function with the promise error, then rejects its result: (a -> b) -> a -> reject(b)
 * Similar to `map`, but for promise rejection.
 */
export const mapRejected =
  <T = any>(f: (err: T) => any) =>
  (err: T) =>
    Promise.reject(f(err));
