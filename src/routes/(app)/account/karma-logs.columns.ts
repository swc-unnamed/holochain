import type { ChainTrustRatingLog } from "$lib/generated/prisma/client";
import { standardDateFormat } from "$lib/utils/helpers/shared/date-formatter";
import type { ColumnDef } from "@tanstack/table-core";

export const karmaLogColumns: ColumnDef<ChainTrustRatingLog>[] = [
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
  },
  {
    accessorKey: 'reason',
    header: 'Reason'
  }
];