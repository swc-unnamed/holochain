import { expandWherePath, expandOrderPath } from './query-state.helpers';
import type {
  WhereFields,
  OrderFields,
  CursorDirection,
  PaginationConfig
} from './query-state.types';

export class QueryState<TModel> {
  #whereState = $state<Partial<Record<WhereFields<TModel>, string | string[]>>>({});
  #orderState = $state<Array<{ field: OrderFields<TModel>; direction: 'asc' | 'desc' }>>([]);

  // pagination mode
  #paginationMode = $state<'none' | 'offset' | 'cursor'>('none');

  // offset
  #offsetSkip = $state(0);
  #offsetTake = $state(50);
  #offsetTotalCount = $state<number | null>(null);

  // cursor
  #cursorTake = $state(20);
  #cursorCursor = $state<string | null>(null);
  #cursorDirection = $state<CursorDirection>('forward');

  constructor(initial?: {
    where?: Partial<Record<WhereFields<TModel>, string | string[]>>;
    order?: Array<{ field: OrderFields<TModel>; direction: 'asc' | 'desc' }>;
    pagination?: PaginationConfig;
  }) {
    if (initial?.where) this.#whereState = initial.where;
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

        if (existing === undefined) {
          self.#whereState[field] = value;
        } else if (typeof existing === 'string') {
          self.#whereState[field] = [existing, value];
        } else {
          self.#whereState[field] = [...existing, value];
        }
      },

      remove(field) {
        delete self.#whereState[field];
      },

      clear() {
        self.#whereState = {};
      },

      removeOne(field, value) {
        const existing = self.#whereState[field];
        if (!existing) return;

        if (typeof existing === 'string') {
          if (existing === value) delete self.#whereState[field];
          return;
        }

        const next = existing.filter((v) => v !== value);
        if (next.length === 0) delete self.#whereState[field];
        else self.#whereState[field] = next;
      },

      values(field) {
        const v = self.#whereState[field];
        if (!v) return [];
        return Array.isArray(v) ? v : [v];
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
      }
    };
  }

  where!: {
    add: (field: WhereFields<TModel>, value: string) => void;
    remove: (field: WhereFields<TModel>) => void;
    clear: () => void;
    values: (field: WhereFields<TModel>) => string[];
    removeOne: (field: WhereFields<TModel>, value: string) => void;
    readonly value: Partial<Record<WhereFields<TModel>, string | string[]>>;
  };

  order!: {
    add: (field: OrderFields<TModel>, direction: 'asc' | 'desc') => void;
    remove: (field: OrderFields<TModel>) => void;
    clear: () => void;
    toggle: (field: OrderFields<TModel>) => void;
    readonly value: Array<{ field: OrderFields<TModel>; direction: 'asc' | 'desc' }>;
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

    for (const [field, rawUnknown] of Object.entries(this.#whereState)) {
      const raw = rawUnknown as string | string[];

      const value: string | { in: string[] } = Array.isArray(raw) ? { in: raw } : raw;

      Object.assign(where, expandWherePath(field, value));
    }

    const base = {
      where,
      orderBy: this.#orderState.map((o) => expandOrderPath(o.field, o.direction)) as Record<
        string,
        unknown
      >[]
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