import { AuctionStatus } from "$lib/generated/prisma/enums";

interface Details {
  key: AuctionStatus;
  label: string;
  description?: string;
}

export const AuctionStatusDetail: Record<AuctionStatus, Details> = {
  PENDING: {
    key: AuctionStatus.PENDING,
    label: "Pending",
  },
  ACTIVE: {
    key: AuctionStatus.ACTIVE,
    label: "Active",
  },
  CANCELLED: {
    key: AuctionStatus.CANCELLED,
    label: "Cancelled",
  },
  COMPLETED: {
    key: AuctionStatus.COMPLETED,
    label: "Completed",
  }
}

const auctionStatusOrder = [
  AuctionStatus.PENDING,
  AuctionStatus.ACTIVE,
  AuctionStatus.CANCELLED,
  AuctionStatus.COMPLETED
];

export const auctionStatusSelect = auctionStatusOrder.map(status => ({
  label: AuctionStatusDetail[status].label,
  value: status
}));