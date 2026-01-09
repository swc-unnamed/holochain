import { broadcastAuctionEvent } from './auction/broadcast-auction.event';
import { broadcastAuctionLotEvent } from './auction/broadcast-lot.event';
import { broadcastRecordLotSaleEvent } from './auction/lot/broadcast-record-lot-sale.event';
import { lotRecordSaleEvent } from './auction/lot/record-sale.event';
import { parseCreditlogEvent } from './automation/parse-creditlog.event';
import { updateLotTxEvent } from './automation/lot-tx.event';
import { combineCreditLogCron } from './automation/combine-creditlog.cron';
import { updateCombineCreditLogEvent } from './automation/combine-creditlog.event';

const cronFunctions = [
  combineCreditLogCron,
]

const platformFunctions = [
  updateCombineCreditLogEvent,
  updateLotTxEvent,
  parseCreditlogEvent,
]

const auctionHouseFunctions = [
  broadcastAuctionEvent,
  broadcastAuctionLotEvent,
  broadcastRecordLotSaleEvent,
  lotRecordSaleEvent,
]

export const functions = [
  ...cronFunctions,
  ...auctionHouseFunctions,
  ...platformFunctions,
];

export { inngest } from './client';