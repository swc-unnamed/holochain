type Scalar = string | number | boolean | Date | null;

type DotPaths<T, Prefix extends string = ''> = T extends Scalar
  ? never
  : {
    [K in keyof T & string]: T[K] extends Scalar
    ? `${Prefix}${K}`
    : T[K] extends object
    ? `${Prefix}${K}` | DotPaths<T[K], `${Prefix}${K}.`>
    : never;
  }[keyof T & string];

type WhereFields<T> = DotPaths<T> | Extract<keyof T, string>;
type OrderFields<T> = DotPaths<T> | Extract<keyof T, string>;

type CursorDirection = 'forward' | 'backward';

type PaginationConfig =
  | { mode: 'offset'; take: number; skip?: number; totalCount?: number }
  | { mode: 'cursor'; take: number; cursor?: string | null; direction?: CursorDirection }
  | { mode?: 'none' };

export type { PaginationConfig, CursorDirection, WhereFields, OrderFields, Scalar };