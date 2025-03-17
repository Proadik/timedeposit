import {USDC_DECIMALS} from "@/static/constants.ts";
import BigNumber from "bignumber.js";

export const usdcToBaseUnits = (usdcAmount: string): bigint => {
  const parsed = parseFloat(usdcAmount);
  if (isNaN(parsed) || parsed < 0) {
    throw new Error('Amount must be a valid non-negative number');
  }
  return BigInt(Math.floor(parsed * USDC_DECIMALS));
};

export const amountToUsdc = (amount: string, withSymbol: boolean = false) => {
  const bigAmount = new BigNumber(amount)
  const bigUsdc = new BigNumber(USDC_DECIMALS)

  if(withSymbol) return `${bigAmount.dividedBy(bigUsdc).toString()} USDC`
  return bigAmount.dividedBy(bigUsdc).toString()
}
