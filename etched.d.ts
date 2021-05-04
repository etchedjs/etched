/**
 * @module @etchedjs/etched
 * @copyright Lcf.vs 2020
 * @licence MIT
 * @see {@link https://github.com/etchedjs/etched} Etched on GitHub
 */

declare class Empty extends null {
}

declare const symbol: unique symbol

type Etched = Readonly<Empty & {}>;

type IntersectAll<I extends object[]> = I extends (infer T)[]
    ? (T extends T ? (x: T) => unknown : never) extends (x: infer U) => unknown
        ? U
        : never
    : never;

interface Meta {
    url: string
}

type Namespace<m extends Meta> = {
    [symbol]: m["url"]
}

export type Model<M extends object[]> = Readonly<M extends [infer T, ...infer R]
    ? R extends object[]
        ? T extends object
            ? T & Model<R>
            : T
        : Etched
    : unknown>

export type Instance<I extends Model<[]>, M extends object[]> = Readonly<I &
    Pick<IntersectAll<M>, Extract<keyof I, keyof IntersectAll<M>>> &
    Omit<I, keyof IntersectAll<M>>>

export declare const etched: Model<[Etched]>

export declare function etch<I extends Model<[]>, M extends Partial<I>[]>(
    instance: I,
    ...mixins: M
): Instance<I, M>;

export declare function etches(model: Model<[]>, value: unknown): boolean;

export declare function fulfill<I extends Model<[]>, M extends Partial<I>[]>(
    instance: I,
    ...mixins: M
): Instance<I, M>;

export declare function fulfills(model: Model<[]>, value: unknown): boolean;

export declare function model<M extends object[]>(
    ...models: M
): Model<M>;

export declare function namespace<Meta, M extends object[]>(
    meta: Meta,
    ...models: M
): Model<[{ sS}, ...M]>;

export declare const iterable : Iterable<Model<[Etched]>>
