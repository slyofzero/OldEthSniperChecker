import { cleanUpBotMessage, hardCleanUpBotMessage } from "@/utils/bot";
import { CHANNEL_ID } from "@/utils/env";
import { teleBot } from "..";
import { hypeNewPairs } from "@/vars/pairs";
import { errorHandler, log } from "@/utils/handlers";
import { formatToInternational } from "@/utils/general";
import { apiFetcher } from "@/utils/api";
import { PairData } from "@/types";

export async function trackMC() {
  log("MC tracking initiated");

  if (!CHANNEL_ID) {
    log("CHANNEL_ID is undefined");
    process.exit(1);
  }

  for (const token in hypeNewPairs) {
    try {
      const pairData = (
        await apiFetcher<PairData>(
          `https://api.dexscreener.com/latest/dex/tokens/${token}`
        )
      ).data;

      const firstPair = pairData.pairs?.at(0);

      if (!firstPair) return delete hypeNewPairs[token];

      const {
        fdv: marketCap,
        pairAddress: address,
        baseToken,
        liquidity,
      } = firstPair;
      const { address: tokenAddress, symbol } = baseToken;

      const {
        initialMC,
        pastBenchmark,
        launchMessageMain,
        launchMessageTest,
        ...rest
      } = hypeNewPairs[token];
      const currentMC = Number(marketCap);

      if (initialMC === 0 && currentMC > 0) {
        log(`Token ${tokenAddress} got a non-zero price`);
        hypeNewPairs[token] = {
          initialMC: currentMC,
          pastBenchmark: 1,
          launchMessageMain,
          launchMessageTest,
          ...rest,
        };
      } else {
        const exactIncrease = Number((currentMC / initialMC).toFixed(2));
        const increase = Math.floor(exactIncrease);

        if (increase > 1 && increase > pastBenchmark && liquidity.usd >= 1000) {
          log(`Token ${tokenAddress} increased by ${increase}x`);
          hypeNewPairs[token] = {
            initialMC,
            pastBenchmark: increase,
            launchMessageMain,
            launchMessageTest,
            ...rest,
          };

          // Links
          const tokenLink = `https://solscan.io/token/${tokenAddress}`;
          const dexScreenerLink = `https://dexscreener.com/solana/${address}`;
          const birdEyeLink = `https://birdeye.so/token/${tokenAddress}?chain=ethereum`;

          const text = `Powered By [Volumizer](https://t.me/Volumizer)

[${hardCleanUpBotMessage(symbol)}](${tokenLink}) jumped by ${cleanUpBotMessage(
            exactIncrease
          )}x\\!\\!\\!

💲 MC when found: $${cleanUpBotMessage(formatToInternational(initialMC))}
💲 MC now: $${cleanUpBotMessage(formatToInternational(currentMC))}

[DexScreener](${dexScreenerLink}) \\| [BirdEye](${birdEyeLink})`;

          teleBot.api
            .sendMessage(-1002084945881, text, {
              parse_mode: "MarkdownV2",
              // @ts-expect-error Param not found
              disable_web_page_preview: true,
              reply_parameters: { message_id: launchMessageTest },
            })
            .then(() => log(`Sent message for ${address}`))
            .catch((e) => {
              log(text);
              errorHandler(e);
            });

          teleBot.api
            .sendMessage(CHANNEL_ID, text, {
              parse_mode: "MarkdownV2",
              // @ts-expect-error Param not found
              disable_web_page_preview: true,
              reply_parameters: { message_id: launchMessageMain },
            })
            .then(() => log(`Sent message for ${address}`))
            .catch((e) => {
              log(text);
              errorHandler(e);
            });
        }
      }
    } catch (error) {
      errorHandler(error);
    }
  }
}
