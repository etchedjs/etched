export interface Etched {
}

export declare const etched: Readonly<null & Record<any, any> & Etched>;

export declare function etches(model: Etched | null, instance: any): boolean;

export declare function model<I extends { prototype: Etched }, M>(instance: null | I, mixin: M): Readonly<I['prototype'] & I & M>;

export declare function etch<I extends { prototype: Etched }, M>(instance: null | I, mixin: M): Readonly<I['prototype'] & I & M>;
