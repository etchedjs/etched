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

export type Model<I extends Etched | null, M extends object[]> = Readonly<
    Etched &
    I &
    Pick<I, keyof I> | IntersectAll<M>>

export type Instance<I extends Model<Etched, []>, M extends object[]> = Readonly<
    I &
    Pick<IntersectAll<M>, Extract<keyof I, keyof IntersectAll<M>>> &
    Omit<I, keyof IntersectAll<M>>
    >

export declare const etched: Etched;

export declare function model<I extends Etched, M extends object[]>(
    instance: I | null,
    ...mixins: M
): Model<I, M>;

export declare function etch<I extends Etched, M extends Partial<I>[]>(
    instance: I,
    ...mixins: M
): Instance<I, M>;

export declare function etches(model: Etched, instance: unknown): boolean;
