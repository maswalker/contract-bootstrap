import { randomBytes as nodeRandomBytes } from "crypto";
import { BigNumber, constants, utils } from "ethers";
import { getAddress, keccak256, toUtf8Bytes } from "ethers/lib/utils";

import type {
  ConsiderationItem,
  CriteriaResolver,
  Fulfillment,
  FulfillmentComponent,
  OfferItem,
  Order,
  OrderComponents,
} from "./types";
import type { BigNumberish, ContractTransaction } from "ethers";

const SeededRNG = require("./seeded-rng");

const GAS_REPORT_MODE = process.env.REPORT_GAS;

let randomBytes: (n: number) => string;
if (GAS_REPORT_MODE) {
  const srng = SeededRNG.create("gas-report");
  randomBytes = srng.randomBytes;
} else {
  randomBytes = (n: number) => nodeRandomBytes(n).toString("hex");
}

export const randomHex = (bytes = 32) => `0x${randomBytes(bytes)}`;

export const random128 = () => toBN(randomHex(16));

const hexRegex = /[A-Fa-fx]/g;

export const toHex = (n: BigNumberish, numBytes: number = 0) => {
  const asHexString = BigNumber.isBigNumber(n)
    ? n.toHexString().slice(2)
    : typeof n === "string"
    ? hexRegex.test(n)
      ? n.replace(/0x/, "")
      : Number(n).toString(16)
    : Number(n).toString(16);
  return `0x${asHexString.padStart(numBytes * 2, "0")}`;
};

export const baseFee = async (tx: ContractTransaction) => {
  const data = tx.data;
  const { gasUsed } = await tx.wait();
  const bytes = toHex(data)
    .slice(2)
    .match(/.{1,2}/g) as string[];
  const numZero = bytes.filter((b) => b === "00").length;
  return (
    gasUsed.toNumber() - (21000 + (numZero * 4 + (bytes.length - numZero) * 16))
  );
};

export const randomBN = (bytes: number = 16) => toBN(randomHex(bytes));

export const toBN = (n: BigNumberish) => BigNumber.from(toHex(n));

export const toAddress = (n: BigNumberish) => getAddress(toHex(n, 20));

export const toKey = (n: BigNumberish) => toHex(n, 32);

export const convertSignatureToEIP2098 = (signature: string) => {
  if (signature.length === 130) {
    return signature;
  }

  if (signature.length !== 132) {
    throw Error("invalid signature length (must be 64 or 65 bytes)");
  }

  return utils.splitSignature(signature).compact;
};

export const buildOrderStatus = (
  ...arr: Array<BigNumber | number | boolean>
) => {
  const values = arr.map((v) => (typeof v === "number" ? toBN(v) : v));
  return ["isValidated", "isCancelled", "totalFilled", "totalSize"].reduce(
    (obj, key, i) => ({
      ...obj,
      [key]: values[i],
      [i]: values[i],
    }),
    {}
  );
};

export const toFulfillmentComponents = (
  arr: number[][]
): FulfillmentComponent[] =>
  arr.map(([orderIndex, itemIndex]) => ({ orderIndex, itemIndex }));

export const toFulfillment = (
  offerArr: number[][],
  considerationsArr: number[][]
): Fulfillment => ({
  offerComponents: toFulfillmentComponents(offerArr),
  considerationComponents: toFulfillmentComponents(considerationsArr),
});

export const buildResolver = (
  orderIndex: number,
  side: 0 | 1,
  index: number,
  identifier: BigNumber,
  criteriaProof: string[]
): CriteriaResolver => ({
  orderIndex,
  side,
  index,
  identifier,
  criteriaProof,
});

export const calculateOrderHash = (orderComponents: OrderComponents) => {
  const orderTypeString =
    "OrderComponents(address offerer,address token,uint256 identifier,address currency,address artist,address platform,uint256 startTime,uint256 endTime,uint256 duration,uint256 periods,uint256 amount,uint256 ratio,uint256 royalty,uint256 fee,uint256 withdrawFee,uint256 salt,bytes32 conduitKey,uint256 counter)"

  const orderTypeHash = keccak256(toUtf8Bytes(orderTypeString))
  const derivedOrderHash = keccak256(
    "0x" +
      [
        orderTypeHash.slice(2),
        orderComponents.offerer.slice(2).padStart(64, "0"),
        orderComponents.token.slice(2).padStart(64, "0"),
        toBN(orderComponents.identifier)
          .toHexString()
          .slice(2)
          .padStart(64, "0"),
        orderComponents.currency.slice(2).padStart(64, "0"),
        orderComponents.artist.slice(2).padStart(64, "0"),
        orderComponents.platform.slice(2).padStart(64, "0"),
        toBN(orderComponents.startTime)
          .toHexString()
          .slice(2)
          .padStart(64, "0"),
        toBN(orderComponents.endTime)
          .toHexString()
          .slice(2)
          .padStart(64, "0"),
        toBN(orderComponents.duration)
          .toHexString()
          .slice(2)
          .padStart(64, "0"),
        toBN(orderComponents.periods)
          .toHexString()
          .slice(2)
          .padStart(64, "0"),
        toBN(orderComponents.amount)
          .toHexString()
          .slice(2)
          .padStart(64, "0"),
        toBN(orderComponents.ratio)
          .toHexString()
          .slice(2)
          .padStart(64, "0"),
        toBN(orderComponents.royalty)
          .toHexString()
          .slice(2)
          .padStart(64, "0"),
        toBN(orderComponents.fee)
          .toHexString()
          .slice(2)
          .padStart(64, "0"),
        toBN(orderComponents.withdrawFee)
          .toHexString()
          .slice(2)
          .padStart(64, "0"),
        orderComponents.salt.slice(2).padStart(64, "0"),
        orderComponents.conduitKey.slice(2).padStart(64, "0"),
        toBN(orderComponents.counter).toHexString().slice(2).padStart(64, "0"),
      ].join("")
  );

  return derivedOrderHash;
}
/*
export const calculateOrderHash2 = (orderComponents: OrderComponents) => {
  const offerItemTypeString =
    "OfferItem(address token,uint256 identifier)";
  const considerationItemTypeString =
    "ConsiderationItem(address token,uint256 amount,address recipient)";
  const orderComponentsPartialTypeString =
    "OrderComponents(address offerer,OfferItem[] offer,ConsiderationItem[] consideration,uint256 startTime,uint256 endTime,uint256 period,uint256 instalments,uint256 salt,bytes32 conduitKey,uint256 counter)";
  const orderTypeString = `${orderComponentsPartialTypeString}${considerationItemTypeString}${offerItemTypeString}`;

  const offerItemTypeHash = keccak256(toUtf8Bytes(offerItemTypeString));
  const considerationItemTypeHash = keccak256(
    toUtf8Bytes(considerationItemTypeString)
  );
  const orderTypeHash = keccak256(toUtf8Bytes(orderTypeString));

  const offerHash = keccak256(
    "0x" +
      orderComponents.offer
        .map((offerItem) => {
          return keccak256(
            "0x" +
              [
                offerItemTypeHash.slice(2),
                offerItem.token.slice(2).padStart(64, "0"),
                toBN(offerItem.identifier)
                  .toHexString()
                  .slice(2)
                  .padStart(64, "0"),
              ].join("")
          ).slice(2);
        })
        .join("")
  );

  const considerationHash = keccak256(
    "0x" +
      orderComponents.consideration
        .map((considerationItem) => {
          return keccak256(
            "0x" +
              [
                considerationItemTypeHash.slice(2),
                considerationItem.token.slice(2).padStart(64, "0"),
                toBN(considerationItem.amount)
                  .toHexString()
                  .slice(2)
                  .padStart(64, "0"),
                considerationItem.recipient.slice(2).padStart(64, "0"),
              ].join("")
          ).slice(2);
        })
        .join("")
  );

  const derivedOrderHash = keccak256(
    "0x" +
      [
        orderTypeHash.slice(2),
        orderComponents.offerer.slice(2).padStart(64, "0"),
        offerHash.slice(2),
        considerationHash.slice(2),
        toBN(orderComponents.startTime)
          .toHexString()
          .slice(2)
          .padStart(64, "0"),
        toBN(orderComponents.endTime)
          .toHexString()
          .slice(2)
          .padStart(64, "0"),
        toBN(orderComponents.period)
          .toHexString()
          .slice(2)
          .padStart(64, "0"),
        toBN(orderComponents.instalments)
          .toHexString()
          .slice(2)
          .padStart(64, "0"),
        orderComponents.salt.slice(2).padStart(64, "0"),
        orderComponents.conduitKey.slice(2).padStart(64, "0"),
        toBN(orderComponents.counter).toHexString().slice(2).padStart(64, "0"),
      ].join("")
  );

  return derivedOrderHash;
}
*/