import type { BigNumber } from "ethers";

export type AdditionalRecipient = {
  amount: BigNumber;
  recipient: string;
};

export type FulfillmentComponent = {
  orderIndex: number;
  itemIndex: number;
};

export type Fulfillment = {
  offerComponents: FulfillmentComponent[];
  considerationComponents: FulfillmentComponent[];
};

export type CriteriaResolver = {
  orderIndex: number;
  side: 0 | 1;
  index: number;
  identifier: BigNumber;
  criteriaProof: string[];
}

export type OfferItem = {
  token: string;
  identifier: BigNumber;
}

export type ConsiderationItem = {
  token: string;
  amount: BigNumber;
  recipient: string;
};

export type OrderParameters = {
  offerer: string;
  token: string;
  identifier: string | BigNumber | number;
  currency: string;
  artist: string;
  platform: string;
  startTime: string | BigNumber | number;
  endTime: string | BigNumber | number;
  duration: string | BigNumber | number;
  periods: string | BigNumber | number;
  amount: string | BigNumber | number;
  ratio: string | BigNumber | number;
  royalty: string | BigNumber | number;
  fee: string | BigNumber | number;
  withdrawFee: string | BigNumber | number;
  salt: string;
  conduitKey: string;
}

export type OrderComponents = OrderParameters & {
  counter: BigNumber;
}

export type Order = {
  parameters: OrderParameters;
  signature: string;
}
