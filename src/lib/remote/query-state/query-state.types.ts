type CursorDirection = 'forward' | 'backward';

type PaginationConfig =
  | { mode: 'offset'; take: number; skip?: number; totalCount?: number }
  | { mode: 'cursor'; take: number; cursor?: string | null; direction?: CursorDirection }
  | { mode?: 'none' };

type Scalar = string | number | boolean | Date | null;

// new
type ListOperators<T extends Scalar = string> = {
  has?: T;
  hasSome?: T[];
  hasEvery?: T[];
  equals?: T[];
};

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

type DateOperatorValue = string | Date;

type DateOperators = {
  gte?: DateOperatorValue;
  gt?: DateOperatorValue;
  lte?: DateOperatorValue;
  lt?: DateOperatorValue;
  equals?: DateOperatorValue;
  in?: DateOperatorValue[];
  notIn?: DateOperatorValue[];
  not?: DateOperatorValue | DateOperators;
};

type WhereValue =
  | string
  | string[]
  | number
  | number[]
  | boolean
  | Date
  | Date[]
  | Record<string, unknown>
  | DateOperatorValue
  | DateOperators
  | ListOperators;

export type WhereAddValue =
  | string
  | string[]
  | number
  | number[]
  | boolean
  | Date
  | Date[]
  | Record<string, unknown>;

export type {
  PaginationConfig,
  CursorDirection,
  WhereFields,
  OrderFields,
  Scalar,
  DateOperatorValue,
  DateOperators,
  WhereValue
};