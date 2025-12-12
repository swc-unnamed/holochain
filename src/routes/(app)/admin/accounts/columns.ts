import HyperlinkCell from "$lib/components/custom/data-table/hyperlink-cell.svelte";
import UserKarma from "$lib/components/custom/user-karma/user-karma.svelte";
import { renderComponent } from "$lib/components/ui/data-table";
import type { AppRole } from "$lib/generated/prisma/client";
import type { ColumnDef } from "@tanstack/table-core";

interface AccountColumn {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  karma: number;
  role: AppRole;
  anonid: string;
  banned: boolean;
}
export const accountColumns: ColumnDef<AccountColumn>[] = [
  {
    accessorKey: 'id',
    header: 'User',
    cell: ({ getValue, row }) => {
      const displayName = row.original.displayName;

      return renderComponent(HyperlinkCell, { text: displayName, href: `/admin/accounts/${getValue<string>()}` });
    },
  },
  {
    accessorKey: 'karma',
    header: 'Karma',
    cell: ({ getValue }) => {
      const karma = getValue<number>();
      return renderComponent(UserKarma, { karma: karma })
    }
  },
  {
    accessorKey: 'role',
    header: 'Role'
  },
  {
    accessorKey: 'banned',
    header: 'Banned',
    cell: ({ getValue }) => {
      const banned = getValue<boolean>();
      return banned ? 'Yes' : 'No';
    }
  }
];