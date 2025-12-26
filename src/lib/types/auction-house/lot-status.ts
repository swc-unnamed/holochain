import { LotStatus } from "$lib/generated/prisma/enums";

interface Details {
  key: LotStatus;
  label: string;
  description?: string;
}

export const LotStatusDetail: Record<LotStatus, Details> = {
  SCHEDULED: {
    key: LotStatus.SCHEDULED,
    label: "Scheduled",
  },
  SOLD: {
    key: LotStatus.SOLD,
    label: "Sold",
  },
  COMPLETED: {
    key: LotStatus.COMPLETED,
    label: "Completed",
  },
  WITHDRAWN: {
    key: LotStatus.WITHDRAWN,
    label: "Withdrawn",
  },
  SUBMITTED: {
    key: LotStatus.SUBMITTED,
    label: "Submitted",
  }
}

const lotStatusOrder = [
  LotStatus.SCHEDULED,
  LotStatus.SOLD,
  LotStatus.COMPLETED,
  LotStatus.WITHDRAWN,
  LotStatus.SUBMITTED
];

export const lotStatusSelect = lotStatusOrder.map(status => ({
  label: LotStatusDetail[status].label,
  value: status
}));