/**
 * @module @etchedjs/etched
 * @copyright Lcf.vs 2020
 * @licence MIT
 * @see {@link https://github.com/etchedjs/etched} Etched on GitHub
 */
type Etched = Readonly<null | ThisType<Etched>>;

type IntersectAll<I extends object[]> = I extends [infer T, ...infer R]
    ? R extends object[]
        ? T extends object
            ? T & IntersectAll<R>
            : T
        : {}
    : unknown;

export declare const etched: Etched;

export declare function model<I extends Etched, M extends object[]>(
    instance: I | null,
    ...mixins: M
): Readonly<Etched & I & Pick<I, keyof I> | IntersectAll<M>>;

export declare function etch<I extends Etched, M extends Partial<I>[]>(
    instance: I,
    ...mixins: M
): Readonly<
    I &
    Omit<I, keyof IntersectAll<M>> &
    Pick<IntersectAll<M>, Extract<keyof I, keyof IntersectAll<M>>>
    >;

export declare function etches(model: Etched, instance: unknown): boolean;
