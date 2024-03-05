import { Bot } from "grammy";
import { initiateBotCommands, initiateCallbackQueries } from "./bot";
import { log } from "./utils/handlers";
import { BOT_TOKEN, CHANNEL_ID } from "./utils/env";
import {
  configureWeb3,
  processTransaction,
  web3,
  wssProvider,
} from "./ethWeb3";
import { TransactionExtended } from "./types/web3";
import { getEthPrice } from "./vars/ethPrice";
import { cleanUpTransactions } from "./bot/cleanUpTransactions";
import { trackMC } from "./bot/trackMc";

export const teleBot = new Bot(BOT_TOKEN || "");
log("Bot instance ready");

(async function () {
  teleBot.api.sendMessage(CHANNEL_ID || "", "test").then((value) => {
    console.log(value);
  });

  // configureWeb3();
  // getEthPrice();
  // teleBot.start();
  // log("Telegram bot setup");
  // initiateBotCommands();
  // initiateCallbackQueries();
  // if (!wssProvider || !web3) {
  //   log("wssProvider or web3 is null");
  //   return false;
  // }
  // const subscription = await web3.eth.subscribe("newBlockHeaders");
  // subscription.on("data", async (blockHeader) => {
  //   const block = await web3?.eth.getBlock(blockHeader.hash, false);
  //   log(`Block ${block?.number} caught`);
  //   if (block && block.transactions) {
  //     for (const txHash of block.transactions) {
  //       try {
  //         const tx = (await web3?.eth.getTransaction(
  //           txHash.toString()
  //         )) as TransactionExtended;
  //         processTransaction(tx);
  //       } catch (err) {
  //         const error = err as Error;
  //         log(`Error processing transaction ${txHash} - ${error.message}`);
  //       }
  //     }
  //   }
  // });
  // subscription.on("error", (err) => {
  //   const error = err as Error;
  //   log(`WS connection error: ${error.message}`);
  //   process.exit(1);
  // });
  // wssProvider.on("end", () => {
  //   log("WS connection closed. Attempting to reconnect...");
  //   process.exit(1);
  // });
  // // @ts-expect-error no err type
  // wssProvider.on("error", (err) => {
  //   const error = err as Error;
  //   log(`WS connection error: ${error.message}`);
  //   process.exit(1);
  // });
  // setInterval(cleanUpTransactions, 30 * 1e3);
  // setInterval(() => {
  //   getEthPrice();
  //   trackMC();
  // }, 60 * 1e3);
})();
