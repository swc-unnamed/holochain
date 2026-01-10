import { EventSchemas } from 'inngest';
import type { AuctionBroadcastEvent } from './auction/broadcast-auction.event';
import type { AuctionLotBroadcastEvent } from './auction/broadcast-lot.event';
import type { AuctionBroadcastRecordLotSaleEvent } from './auction/lot/broadcast-record-lot-sale.event';
import type { AuctionLotRecordSaleEvent } from './auction/lot/record-sale.event';
import type { UpdateCombineCreditLogEventParams } from './automation/combine/combine-creditlog.event';
import type { UpdateLotTxEventParams } from './automation/lot-tx.event';
import type { ParseCreditlogEventParams } from './automation/parse-creditlog.event';

type Events = {
  'auction-house/broadcast.auction': {
    data: AuctionBroadcastEvent
  },
  'auction-house/broadcast.lot': {
    data: AuctionLotBroadcastEvent
  },
  'auction-house/broadcast.record-lot-sale': {
    data: AuctionBroadcastRecordLotSaleEvent
  },
  'auction-house/lot.record-sale': {
    data: AuctionLotRecordSaleEvent
  },
  'automation/combine.credit-log.update': {
    data: UpdateCombineCreditLogEventParams
  },
  'automation/lot-tx.update': {
    data: UpdateLotTxEventParams
  },
  'automation/parse-creditlog': {
    data: ParseCreditlogEventParams
  },
}

export const schemas = new EventSchemas().fromRecord<Events>();