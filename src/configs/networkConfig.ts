import { getFullnodeUrl } from "@mysten/sui/client";
import { TESTNET_DEPOSIT_PACKAGE_ID, DEVNET_DEPOSIT_PACKAGE_ID, MAINNET_DEPOSIT_PACKAGE_ID } from "../static/constants.ts";
import { createNetworkConfig } from "@mysten/dapp-kit";

const { networkConfig, useNetworkVariable, useNetworkVariables } =
  createNetworkConfig({
    devnet: {
      url: getFullnodeUrl("devnet"),
      variables: {
        depositPackageId: DEVNET_DEPOSIT_PACKAGE_ID,
      },
    },
    testnet: {
      url: getFullnodeUrl("testnet"),
      variables: {
        depositPackageId: TESTNET_DEPOSIT_PACKAGE_ID,
      },
    },
    mainnet: {
      url: getFullnodeUrl("mainnet"),
      variables: {
        depositPackageId: MAINNET_DEPOSIT_PACKAGE_ID,
      },
    },
  });

export { useNetworkVariable, useNetworkVariables, networkConfig };
