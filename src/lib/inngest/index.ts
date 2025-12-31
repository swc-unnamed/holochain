import { broadcastAuctionEvent } from './auction/broadcast-auction.event';
import { broadcastAuctionLotEvent } from './auction/broadcast-lot.event';
import { broadcastRecordLotSaleEvent } from './auction/broadcast-record-lot-sale.event';

export const functions = [
  broadcastAuctionEvent,
  broadcastAuctionLotEvent,
  broadcastRecordLotSaleEvent,
];

export { inngest } from './client';