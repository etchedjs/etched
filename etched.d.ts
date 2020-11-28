/**
 * @module @etchedjs/etched
 * @copyright Lcf.vs 2020
 * @licence MIT
 * @see {@link https://github.com/etchedjs/etched} Etched on GitHub
 */

declare class Empty extends null {}

type Etched = Readonly<Empty & {}>;

type IntersectAll<I extends object[]> = I extends (infer T)[]
    ? (T extends T ? (x: T) => unknown : never) extends (x: infer U) => unknown
        ? U
        : never
    : never;

export type Model<M extends object[]> = Readonly<
    Etched &
    M extends [infer T, ...infer R]
    ? R extends object[]
    ? T extends object
        ? T & Model<R>
        : T
    : {}
    : unknown>

export type Instance<I extends Model<[]>, M extends object[]> = Readonly<
    I &
    Pick<IntersectAll<M>, Extract<keyof I, keyof IntersectAll<M>>> &
    Omit<I, keyof IntersectAll<M>>
    >

export declare const etched: Model<[Etched]>;

export declare function model<M extends object[]>(
    ...models: M
): Model<M>;

export declare function etch<I extends Model<[]>, M extends Partial<I>[]>(
    instance: I,
    ...mixins: M
): Instance<I, M>;

export declare function etches(model: Model<[]>, instance: unknown): boolean;
