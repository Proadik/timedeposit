export interface ReceiptObject {
  amount: string;
  available_wallet: string;
  deposit_id: string;
  owner: string;
  release_date: string;
  title: string;
  id: {
    id: string;
  }
}

export interface DepositCreateInputs {
  title: string;
  amount: string;
  releaseDate: string;
  walletToWithdraw: string;
}
