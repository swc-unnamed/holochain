export type Route = {
  title: string;
  href: string;
  icon: string;
  flag?: string;
  nested?: NestedRoute[];
  allowedRoles?: string[];
}

export type NestedRoute = Omit<Route, 'nested'>;