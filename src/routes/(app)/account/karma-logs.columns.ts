import UserKarma from "$lib/components/custom/user-karma/user-karma.svelte";
import { renderComponent } from "$lib/components/ui/data-table";
import type { UserKarmaLog } from "$lib/generated/prisma/client";
import { standardDateFormat } from "$lib/utils/helpers/shared/date-formatter";
import type { ColumnDef } from "@tanstack/table-core";

export const karmaLogColumns: ColumnDef<UserKarmaLog>[] = [
  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: ({ getValue }) => {
      const date = getValue<Date>();
      return standardDateFormat(date);
    }
  },
  {
    accessorKey: 'delta',
    header: 'Change',
    cell: ({ getValue }) => {
      const delta = getValue<number>();
      return renderComponent(UserKarma, { karma: delta });
    }
  },
  {
    accessorKey: 'reason',
    header: 'Reason'
  }
];