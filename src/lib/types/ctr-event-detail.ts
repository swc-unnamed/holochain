import type { ChainTrustRatingKey } from "$lib/generated/prisma/enums"

type CTREventDetail = {
  key: ChainTrustRatingKey;
  label: string;
  description: string;
}

export const CTREvent: Record<ChainTrustRatingKey, CTREventDetail> = {
  AH_LOT_CREATED: {
    key: "AH_LOT_CREATED",
    label: "Auction House Lot Created",
    description: "Issued when a new Lot has been created in the Auction House"
  },
  AH_LOT_PURCHASED: {
    key: "AH_LOT_PURCHASED",
    label: "Auction House Lot Purchased",
    description: "Issued when a Lot has been purchased in the Auction House"
  },
  AH_LOT_SOLD: {
    key: "AH_LOT_SOLD",
    label: "Auction House Lot Sold",
    description: "Issued when a Lot has been sold in the Auction House"
  },
  AH_LOT_BROKERED_SALE: {
    key: "AH_LOT_BROKERED_SALE",
    label: "Auction House Lot Brokered Sale",
    description: "Issued when a Lot has been sold via a Middle in the Auction House, issued to the Middle involved"
  },
  AH_LOT_WITHDRAWN_AFTER_SCHEDULED: {
    key: "AH_LOT_WITHDRAWN_AFTER_SCHEDULED",
    label: "Auction House Lot Withdrawn After Scheduled",
    description: "Issued when a Lot has been withdrawn after being scheduled in the Auction House"
  },
  AH_LOT_WITHDRAWN_BEFORE_SCHEDULED: {
    key: "AH_LOT_WITHDRAWN_BEFORE_SCHEDULED",
    label: "Auction House Lot Withdrawn Before Scheduled",
    description: "Issued when a Lot has been withdrawn before being scheduled in the Auction House"
  },
  ACCOUNT_CREATED: {
    key: "ACCOUNT_CREATED",
    label: "Account Created",
    description: "Issued when a new user account has been created"
  },
  ACCOUNT_DISCORD_LINKED: {
    key: "ACCOUNT_DISCORD_LINKED",
    label: "Discord Linked",
    description: "Issued when a user links their Discord account - It is recommended that this and ACCOUNT_DISCORD_UNLINKED are a net zero sum"
  },
  ACCOUNT_DISCORD_UNLINKED: {
    key: "ACCOUNT_DISCORD_UNLINKED",
    label: "Discord Unlinked",
    description: "Issued when a user unlinks their Discord account - It is recommended that this and ACCOUNT_DISCORD_LINKED are a net zero sum"
  },
  ACCOUNT_ROLE_PROMOTED: {
    key: "ACCOUNT_ROLE_PROMOTED",
    label: "Account Role Promoted",
    description: "Issued when a user's account role has been promoted"
  },
  ACCOUNT_ROLE_DEMOTED: {
    key: "ACCOUNT_ROLE_DEMOTED",
    label: "Account Role Demoted",
    description: "Issued when a user's account role has been demoted"
  },
  ACCOUNT_BANNED: {
    key: "ACCOUNT_BANNED",
    label: "Account Banned",
    description: "Issued when a user's account has been banned"
  },
  ACCOUNT_UNBANNED: {
    key: "ACCOUNT_UNBANNED",
    label: "Account Unbanned",
    description: "Issued when a user's account has been unbanned"
  }
}