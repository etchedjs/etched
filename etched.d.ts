/**
 * @copyright Lcf.vs 2020
 * @licence MIT
 * @see {@link https://github.com/etchedjs/etched|Etched on GitHub}
 */
type Etched = Readonly<(null | { prototype: Etched })>;
type Expand<T> = T extends object ? { [K in keyof T]: T[K] } : never;

export declare const etched: Etched;

export declare function model
  <I extends Etched, M>
  (instance: I | null, mixin: M):
    Readonly<
      I &
      Pick<I, keyof I['prototype'] & keyof I> |
      Pick<M, keyof M>
    >;

export declare function etch
  <I extends Etched, M>
  (instance: I, mixin: M):
    Readonly<
      I &
      Expand<
        Pick<M, keyof I & keyof M> &
        Omit<I, keyof M>
      >
    >;

export declare function etches(model: Etched | null, instance: any): boolean;
