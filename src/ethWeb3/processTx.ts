import { TransactionExtended } from "@/types/web3";
import { TOKEN_ABI, UNISWAP_ROUTER_ADDRESS } from "@/utils/constants";
import { log } from "@/utils/handlers";
import { provider, web3 } from "./config";
import { ethers } from "ethers";
import { PairData } from "@/types";
import { apiFetcher } from "@/utils/api";
import { ethPrice } from "@/vars/ethPrice";
import { transactions } from "@/vars/transactions";

export async function processTransaction(tx: TransactionExtended) {
  try {
    const inputData = tx.input;
    const methodId = inputData?.slice(0, 10) as unknown as string;
    let tokenAddress;

    const METHOD_ID_MAP: { [key: string]: string } = {
      "0x7ff36ab5": "swapExactETHForTokens",
      "0xb6f9de95": "swapExactETHForTokensSupportingFeeOnTransferTokens",
      "0x38ed1739": "swapExactTokensForTokens",
    };

    // // Banana
    // if (tx.to === BANANA_ROUTER_ADDRESS && methodId === "0x0162e2d0") {
    //   log("Matching Banana Router Method ID, proceeding...");
    //   const params = inputData?.slice(10);
    //   const fullDataElement = params?.slice(13 * 64, 13 * 64 + 64);
    //   tokenAddress = "0x" + fullDataElement?.slice(24, 64);
    //   log(`Extracted Token Address for Banana Router: ${tokenAddress}`);
    // }

    // Uniswap
    if (tx.to === UNISWAP_ROUTER_ADDRESS && METHOD_ID_MAP[methodId]) {
      let buy = 0;
      tokenAddress = "0x" + inputData?.slice(-40);

      if (methodId === "0x38ed1739") {
        const amountOutHex = `0x${tx.data?.slice(74, 138)}`;
        const amountOut = Number(web3?.utils.hexToNumber(amountOutHex));
        const tokenData = (
          await apiFetcher<PairData>(
            `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`
          )
        ).data;
        const firstPair = tokenData.pairs.at(0);
        const price = parseFloat(firstPair?.priceUsd || "0");

        const contractInstance = new ethers.Contract(
          tokenAddress,
          TOKEN_ABI,
          provider
        );
        const decimals = Number(await contractInstance.decimals());

        const amountBought = amountOut / 10 ** decimals;
        buy = parseFloat((price * amountBought).toFixed(2));
      } else {
        const boughtFor = Number(ethers.utils.formatEther(tx?.value || 0));
        buy = parseFloat((boughtFor * ethPrice).toFixed(2));
      }

      const tokenTransaction = transactions[tokenAddress];

      if (tokenTransaction) {
        tokenTransaction.buys.push(buy);
      } else {
        transactions[tokenAddress] = {
          startTime: Math.floor(Date.now() / 1000),
          buys: [buy],
        };
      }

      log(`Caught token ${tokenAddress} buy of $${buy}`);
    }

    // // Maestro
    // else if (tx.to === MAESTRO_ROUTER_ADDRESS && methodId === "0xa0136443") {
    //   log("Matching MAESTRO Router Method ID, proceeding...");
    //   tokenAddress = "0x" + inputData?.slice(-40);
    //   log(`Extracted Token Address for MESTRO Router: ${tokenAddress}`);
    // }
  } catch (err) {
    const error = err as Error;
    log(`Error processing transaction data for ${tx?.hash} - ${error.message}`);
  }
}
