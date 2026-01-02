
export type CTRScoreRecord = Record<string, { value: number; reason: string }>

export const CTR_SCORES: CTRScoreRecord = {
  LOT_CREATED: {
    value: 1,
    reason: 'Created a new auction lot',
  },
  LOT_PURCHASED: {
    value: 5,
    reason: 'Purchased an auction lot',
  },
  LOT_SOLD: {
    value: 5,
    reason: 'Sold an auction lot',
  },
  LOT_WITHDRAWN: {
    value: -2,
    reason: 'Withdrew an auction lot after it was scheduled',
  }
}