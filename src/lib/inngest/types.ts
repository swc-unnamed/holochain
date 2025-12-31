import { EventSchemas } from 'inngest';
import type { AuctionBroadcastEvent } from './auction/broadcast-auction.event';
import type { AuctionLotBroadcastEvent } from './auction/broadcast-lot.event';
import type { AuctionBroadcastRecordLotSaleEvent } from './auction/broadcast-record-lot-sale.event';

type Events = {
  'auction-house/broadcast.auction': {
    data: AuctionBroadcastEvent
  },
  'auction-house/broadcast.lot': {
    data: AuctionLotBroadcastEvent
  },
  'auction-house/broadcast.record-lot-sale': {
    data: AuctionBroadcastRecordLotSaleEvent
  }
}

export const schemas = new EventSchemas().fromRecord<Events>();