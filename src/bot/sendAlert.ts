import { apiFetcher } from "@/utils/api";
import { PairData } from "@/types";
import { auditToken, getTokenHolders } from "../ethWeb3/tokenInfo";
import {
  cleanUpBotMessage,
  generateKeyboard,
  hardCleanUpBotMessage,
} from "@/utils/bot";
import moment from "moment";
import { extractSocialLinks } from "../ethWeb3/extractSocialLinks";
import { CHANNEL_ID } from "@/utils/env";
import { errorHandler, log } from "@/utils/handlers";
import { teleBot } from "..";
import { getRandomInteger } from "@/utils/general";
import { hypeNewPairs } from "@/vars/pairs";
import { StoredTransaction } from "@/vars/transactions";
import { ethPrice } from "@/vars/ethPrice";
import { isContract } from "@/ethWeb3";

export async function sendAlert(token: string, storedTxn: StoredTransaction) {
  let message = "";

  const { buys: sniperBuys, totalBuy } = storedTxn;
  let maestroCount = 0;
  let maestroBuys: string | number = 0;
  let unibotCount = 0;
  let unibotBuys: string | number = 0;
  let bananaCount = 0;
  let bananaBuys: string | number = 0;
  const totalBuyEth = Number(totalBuy / ethPrice).toFixed(2);

  for (const { sniper, amount } of sniperBuys) {
    if (sniper === "maestro") {
      maestroCount += 1;
      maestroBuys += amount;
    } else if (sniper === "banana") {
      bananaCount += 1;
      bananaBuys += amount;
    } else {
      unibotCount += 1;
      unibotBuys += amount;
    }
  }

  maestroBuys = Number(maestroBuys / ethPrice).toFixed(2);
  bananaBuys = Number(bananaBuys / ethPrice).toFixed(2);
  unibotBuys = Number(unibotBuys / ethPrice).toFixed(2);

  try {
    if (!CHANNEL_ID) {
      log("CHANNEL_ID is undefined");
      return "";
    }

    const [tokenAudit, holdersData, tokenData] = await Promise.all([
      auditToken(token),
      getTokenHolders(token),
      apiFetcher<PairData>(
        `https://api.dexscreener.com/latest/dex/tokens/${token}`
      ),
    ]);

    const firstPair = tokenData.data.pairs.at(0);
    if (!firstPair) return false;

    const { baseToken, pairCreatedAt, fdv } = firstPair;
    const { name, symbol } = baseToken;
    const age = cleanUpBotMessage(moment(pairCreatedAt).fromNow());
    const { tokenSupply: totalSupply, tokenDecimals: decimals } =
      tokenAudit.tokenDetails;
    const burntLp = tokenAudit.tokenDynamicDetails.lp_Burned_Percent || 0;
    const isLpLocked = tokenAudit.tokenDynamicDetails.lp_Locks
      ? "🟩 LP locked: YES"
      : "🟥 LP locked: NO";

    let holders: string | string[] = [];
    for (const [index, holderData] of holdersData.topHolders
      .slice(0, 5)
      .entries()) {
      const { accountAddress, tokenBalance: hexValue } = holderData;
      const tokenBalance = Number(BigInt(hexValue) / 10n ** BigInt(decimals));
      const holding = cleanUpBotMessage(((tokenBalance / totalSupply) * 100).toFixed(1)); // prettier-ignore
      const url = `https://etherscan.io/address/${accountAddress}`;
      const is_contract = await isContract(accountAddress);
      const text = `${index + 1}\\. [${
        is_contract ? "📜" : "👨"
      } ${holding}%](${url})`;
      holders.push(text);
    }
    holders = holders.join("\n");

    const { contract_Creator, contract_Owner, contract_Renounced } =
      tokenAudit.quickiAudit;
    const { buy_Tax, sell_Tax } = tokenAudit.tokenDynamicDetails;
    const buyTax = Number((Number(buy_Tax || 0) * 100).toFixed(2));
    const sellTax = Number((Number(sell_Tax || 0) * 100).toFixed(2));
    const isVerified = contract_Renounced
      ? "🟩 Ownership Renounced"
      : "🟥 Ownership Not Renounced";
    const isBuyTaxSafe = buyTax <= 15 ? "🟩" : buyTax <= 30 ? "🟨" : "🟥";
    const isSellTaxSafe = sellTax <= 15 ? "🟩" : sellTax <= 30 ? "🟨" : "🟥";
    const socialLinks = await extractSocialLinks(token);
    const displayCreatorAddress = `${contract_Creator.slice(0,3)}\\.\\.\\.${contract_Creator.slice(-3)}`; // prettier-ignore
    const displayOwnerAddress = `${contract_Owner.slice(0,3)}\\.\\.\\.${contract_Owner.slice(-3)}`; // prettier-ignore
    const hypeScore = getRandomInteger();
    const snipers = bananaCount + maestroCount + unibotCount;
    const liquidity = firstPair.liquidity.quote;
    const liquidityUsd = firstPair.liquidity.usd;

    // Audit
    let contractFunctions = "";
    if (tokenAudit.quickiAudit.can_Blacklist) {
      contractFunctions += "\n\\-🟥 *Can Blacklist*";
    }

    if (tokenAudit.quickiAudit.can_Whitelist) {
      contractFunctions += "\n\\-🟥 *Can Whitelist*";
    }

    if (tokenAudit.tokenDynamicDetails.is_Honeypot) {
      contractFunctions += "\n\\-⚠️ *Is honeypot*";
    }

    if (tokenAudit.quickiAudit.is_Proxy) {
      contractFunctions += "\n\\-⚠️ *Is proxy*";
    }

    if (tokenAudit.quickiAudit.can_Mint) {
      contractFunctions += "\n\\-🟥 *Mint enabled*";
    }

    if (tokenAudit.quickiAudit.can_Pause_Trading) {
      contractFunctions += "\n\\-🟥 *Can pause trading*";
    }

    if (contractFunctions) {
      contractFunctions = `\n📄 Contract Information${contractFunctions}\n`;
    }

    // if (!(liquidityUsd >= 3000 && liquidityUsd <= 12000 && fdv <= 500000)) {
    //   log(`Liquidity not in range ${liquidityUsd} ${fdv}`);
    //   return false;
    // }

    message = `*TOOLS AI | FOMO ALERT (ETH)*

${hardCleanUpBotMessage(name)} \\| ${hardCleanUpBotMessage(symbol)}

📊 Token Overview

\\-Token Score: ${hypeScore}/100
\\-⏰ Age: ${age}
\\-📦 TotalSupply: ${parseFloat(totalSupply.toFixed(0)).toLocaleString("en")}
\\-💰 Market Cap: $*${cleanUpBotMessage(fdv.toLocaleString("en"))}*
\\-🏦 Lp ETH: *${cleanUpBotMessage(liquidity.toLocaleString("en"))}*
\\-🔥 Burn Token Balance: ${cleanUpBotMessage(burntLp)}%
\\-👥 Holders: ${holdersData.holdersCount}

👑 Top Holders Distribution:
${holders}

🎯 Sniper Activity
\\- Total snipers: *${snipers}* \\(${cleanUpBotMessage(totalBuyEth)} ETH\\)
 \\- BananaGun: ${bananaCount} \\(${cleanUpBotMessage(bananaBuys)} ETH\\)
 \\- Maestro: ${maestroCount} \\(${cleanUpBotMessage(maestroBuys)} ETH\\)
 \\- UniBot: ${unibotCount} \\(${cleanUpBotMessage(unibotBuys)} ETH\\)

🔒 Ownership and Security
\\- 🛠️ Deployer Address: [${displayCreatorAddress}](https://etherscan.io/address/${contract_Creator})
\\- 👤 Owner Address [${displayOwnerAddress}](https://etherscan.io/address/${contract_Owner})
\\- ${isVerified}
\\- ${isBuyTaxSafe} Buy Tax: ${cleanUpBotMessage(buyTax)}%
\\- ${isSellTaxSafe} Sell Tax: ${cleanUpBotMessage(sellTax)}%
\\- ${isLpLocked}
${contractFunctions}
Token Contract:
\`${token}\`

🔍 Security Checks
\\- [OttoSimBot](${`https://t.me/OttoSimBot?start=${token}`}) 
\\- [TokenSniffer](${`https://tokensniffer.com/token/eth/${token}`})

🔗 Social Media: ${socialLinks}

📈 Monitoring Tools
\\-[DexTools](${`https://www.dextools.io/app/en/ether/pair-explorer/${token}`}) 
\\-[DexSpy](${`https://dexspy.io/eth/token/${token}`})
\\-[DexScreener](${`https://dexscreener.com/ethereum/${token}`}) 
\\-[Etherscan](${`https://etherscan.io//token/${token}`})
  `;

    const keyboard = generateKeyboard(token);

    const mainChannelMsg = await teleBot.api.sendMessage(CHANNEL_ID, message, {
      parse_mode: "MarkdownV2",
      reply_markup: keyboard,
      // @ts-expect-error Param not found
      disable_web_page_preview: true,
    });

    if (!hypeNewPairs[token]) {
      log(`Sent message for ${token}`);

      hypeNewPairs[token] = {
        initialMC: firstPair.fdv,
        startTime: Math.floor(Date.now() / 1000),
        pastBenchmark: 1,
        launchMessageMain: mainChannelMsg.message_id,
      };
    }
  } catch (error) {
    log(message, `Error for token ${token}`);
    errorHandler(error, true);
  }
}
