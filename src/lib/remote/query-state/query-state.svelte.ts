import { expandWherePath, expandOrderPath, isListField } from './query-state.helpers';
import type { DateOperatorValue, DateOperators, WhereValue } from './query-state.types';
import type {
  WhereFields,
  OrderFields,
  CursorDirection,
  PaginationConfig
} from './query-state.types';

export class QueryState<TModel> {
  #whereState = $state<Partial<Record<WhereFields<TModel>, WhereValue>>>({});
  #whereDateState = $state<Partial<Record<WhereFields<TModel>, DateOperators>>>({});

  #orderState = $state<Array<{ field: OrderFields<TModel>; direction: 'asc' | 'desc' }>>([]);

  // pagination mode
  #paginationMode = $state<'none' | 'offset' | 'cursor'>('none');

  // offset pagination
  #offsetSkip = $state(0);
  #offsetTake = $state(50);
  #offsetTotalCount = $state<number | null>(null);

  // cursor pagination
  #cursorTake = $state(20);
  #cursorCursor = $state<string | null>(null);
  #cursorDirection = $state<CursorDirection>('forward');

  constructor(initial?: {
    where?: Partial<Record<WhereFields<TModel>, WhereValue>>;
    whereDate?: Partial<Record<WhereFields<TModel>, DateOperators>>;
    order?: Array<{ field: OrderFields<TModel>; direction: 'asc' | 'desc' }>;
    pagination?: PaginationConfig;
  }) {
    if (initial?.where) this.#whereState = initial.where;
    if (initial?.whereDate) this.#whereDateState = initial.whereDate;
    if (initial?.order) this.#orderState = initial.order;

    const p = initial?.pagination;
    const mode = p?.mode ?? 'none';

    if (mode === 'offset' && p?.mode === 'offset') {
      this.#paginationMode = 'offset';
      this.#offsetTake = p.take;
      this.#offsetSkip = p.skip ?? 0;
      this.#offsetTotalCount = p.totalCount ?? null;
    } else if (mode === 'cursor' && p?.mode === 'cursor') {
      this.#paginationMode = 'cursor';
      this.#cursorTake = p.take;
      this.#cursorCursor = p.cursor ?? null;
      this.#cursorDirection = p.direction ?? 'forward';
    } else {
      this.#paginationMode = 'none';
    }

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;

    this.where = {
      add(field, value) {
        const existing = self.#whereState[field];

        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          self.#whereState[field] = value;
          return;
        }

        if (existing === undefined) {
          self.#whereState[field] = value;
          return;
        }

        if (Array.isArray(existing)) {
          self.#whereState[field] = [...existing, value];
          return;
        }

        if (typeof existing === 'string' || typeof existing === 'number') {
          self.#whereState[field] = [existing, value] as WhereValue;
          return;
        }

        if (typeof existing === 'object' && existing !== null) {
          self.#whereState[field] = value;
          return;
        }

        self.#whereState[field] = value;
      },

      remove(field) {
        delete self.#whereState[field];
        delete self.#whereDateState[field as WhereFields<TModel>];
      },

      clear() {
        self.#whereState = {};
        self.#whereDateState = {};
      },

      removeOne(field, value) {
        const existing = self.#whereState[field];
        if (!existing) return;

        if (typeof existing === 'string') {
          if (existing === value) delete self.#whereState[field];
          return;
        }

        if (!Array.isArray(existing)) return;

        const next = existing.filter((v) => v !== value);
        if (next.length === 0) delete self.#whereState[field];
        else self.#whereState[field] = next as WhereValue;
      },

      values(field) {
        const v = self.#whereState[field];
        if (!v) return [];
        return Array.isArray(v) ? v : [v];
      },
      setDate(field, ops) {
        const isValidDateValue = (value: unknown): value is DateOperatorValue => {
          if (value instanceof Date) return !Number.isNaN(value.getTime());
          if (typeof value === 'string') return !Number.isNaN(Date.parse(value));
          return false;
        };

        const validateOperators = (operators: DateOperators): boolean => {
          for (const value of Object.values(operators)) {
            if (value === undefined) continue;

            if (Array.isArray(value)) {
              if (!value.every(isValidDateValue)) return false;
              continue;
            }

            if (value instanceof Date || typeof value === 'string') {
              if (!isValidDateValue(value)) return false;
              continue;
            }

            if (typeof value === 'object') {
              if (!validateOperators(value as DateOperators)) return false;
              continue;
            }

            return false;
          }

          return true;
        };

        if (!validateOperators(ops)) return;

        self.#whereDateState[field] = ops;
      },
      clearDates() {
        self.#whereDateState = {};
      },
      dateValue(field) {
        return self.#whereDateState[field];
      },
      dateValues() {
        const results: Array<{
          field: WhereFields<TModel>;
          op: keyof DateOperators;
          value: Exclude<DateOperators[keyof DateOperators], undefined>;
        }> = [];

        for (const [field, ops] of Object.entries(self.#whereDateState)) {
          if (!ops) continue;

          for (const [op, value] of Object.entries(ops)) {
            if (value === undefined) continue;
            results.push({
              field: field as WhereFields<TModel>,
              op: op as keyof DateOperators,
              value: value as Exclude<DateOperators[keyof DateOperators], undefined>
            });
          }
        }

        return results;
      },
      get value() {
        return self.#whereState;
      }
    };

    this.order = {
      add(field, direction) {
        const filtered = self.#orderState.filter((o) => o.field !== field);
        self.#orderState = [...filtered, { field, direction }];
      },

      remove(field) {
        self.#orderState = self.#orderState.filter((o) => o.field !== field);
      },

      clear() {
        self.#orderState = [];
      },

      toggle(field) {
        const existing = self.#orderState.find((o) => o.field === field);
        if (!existing) {
          self.#orderState = [...self.#orderState, { field, direction: 'asc' }];
          return;
        }

        const nextDir = existing.direction === 'asc' ? 'desc' : 'asc';
        self.#orderState = self.#orderState.map((o) =>
          o.field === field ? { field, direction: nextDir } : o
        );
      },

      get value() {
        return self.#orderState;
      },

      get dates() {
        return self.#whereDateState;
      }
    };
  }

  where!: {
    add: (field: WhereFields<TModel>, value: WhereValue) => void;
    remove: (field: WhereFields<TModel>) => void;
    clear: () => void;
    clearDates: () => void;
    values: (field: WhereFields<TModel>) => WhereValue[];
    dateValue: (field: WhereFields<TModel>) => DateOperators | undefined;
    dateValues: () => Array<{
      field: WhereFields<TModel>;
      op: keyof DateOperators;
      value: Exclude<DateOperators[keyof DateOperators], undefined>;
    }>;
    removeOne: (field: WhereFields<TModel>, value: string) => void;
    setDate: (field: WhereFields<TModel>, ops: DateOperators) => void;
    readonly value: Partial<Record<WhereFields<TModel>, WhereValue>>;
  };

  order!: {
    add: (field: OrderFields<TModel>, direction: 'asc' | 'desc') => void;
    remove: (field: OrderFields<TModel>) => void;
    clear: () => void;
    toggle: (field: OrderFields<TModel>) => void;
    readonly value: Array<{ field: OrderFields<TModel>; direction: 'asc' | 'desc' }>;
    readonly dates: Partial<Record<WhereFields<TModel>, DateOperators>>;
  };

  next(cursorFromLastItem?: string) {
    if (this.#paginationMode === 'offset') {
      const totalPages = this.#offsetTotalCount
        ? Math.ceil(this.#offsetTotalCount / this.#offsetTake)
        : 1;

      const currentPage = Math.floor(this.#offsetSkip / this.#offsetTake) + 1;

      if (currentPage < totalPages) this.#offsetSkip += this.#offsetTake;
      return;
    }

    if (this.#paginationMode === 'cursor') {
      if (!cursorFromLastItem) return;
      this.#cursorCursor = cursorFromLastItem;
      this.#cursorDirection = 'forward';
    }
  }

  prev(cursorFromFirstItem?: string) {
    if (this.#paginationMode === 'offset') {
      this.#offsetSkip -= this.#offsetTake;
      if (this.#offsetSkip < 0) this.#offsetSkip = 0;
      return;
    }

    if (this.#paginationMode === 'cursor') {
      if (!cursorFromFirstItem) return;
      this.#cursorCursor = cursorFromFirstItem;
      this.#cursorDirection = 'backward';
    }
  }

  goto(page: number) {
    if (this.#paginationMode === 'offset') {
      this.#offsetSkip = (page - 1) * this.#offsetTake;
    }
  }

  setCount(count: number) {
    if (this.#paginationMode === 'offset') {
      this.#offsetTotalCount = count;
    }
  }

  get count() {
    return this.#offsetTotalCount;
  }
  current = $derived.by(() => {
    const where: Record<string, unknown> = {};

    const modelExample = {} as TModel;

    for (const [field, rawUnknown] of Object.entries(this.#whereState)) {
      const raw = rawUnknown as string | string[];

      const listField = isListField(modelExample, field);

      let value: WhereValue;
      if (listField) {
        if (Array.isArray(raw)) {
          value = { hasSome: raw };
        } else {
          value = { has: raw };
        }
      } else {
        // existing behavior (non-breaking)
        value = Array.isArray(raw) ? { in: raw } : raw;
      }

      Object.assign(where, expandWherePath(field, value));
    }

    for (const [field, ops] of Object.entries(this.#whereDateState)) {
      if (!ops) continue;
      Object.assign(where, expandWherePath(field, ops));
    }

    const base = {
      where,
      orderBy: this.#orderState.map((o) => expandOrderPath(o.field, o.direction))
    };

    if (this.#paginationMode === 'offset') {
      return {
        ...base,
        skip: this.#offsetSkip,
        take: this.#offsetTake
      };
    }

    if (this.#paginationMode === 'cursor') {
      return {
        ...base,
        take: this.#cursorTake,
        cursor: this.#cursorCursor ? { id: this.#cursorCursor } : undefined,
        skip: this.#cursorDirection === 'backward' ? -this.#cursorTake : undefined
      };
    }

    return base;
  });
}