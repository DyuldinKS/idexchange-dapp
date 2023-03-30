/// <reference types="react-scripts" />
interface Array<T> {
  filter(fn: typeof Boolean): Array<Exclude<T, null | undefined | 0 | ''>>;
}
