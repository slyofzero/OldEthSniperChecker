import { apiFetcher } from "@/utils/api";
import { PairData } from "@/types";
import { auditToken } from "../ethWeb3/auditToken";
import { cleanUpBotMessage, hardCleanUpBotMessage } from "@/utils/bot";
import moment from "moment";
import { NULL_ADDRESS } from "@/utils/constants";
import { extractSocialLinks } from "../ethWeb3/extractSocialLinks";
import { CHANNEL_ID } from "@/utils/env";
import { errorHandler, log } from "@/utils/handlers";
import { teleBot } from "..";

export async function sendAlert(token: string) {
  let message = "";

  try {
    if (!CHANNEL_ID) {
      log("CHANNEL_ID is undefined");
      return "";
    }

    const [tokenAudit, tokenData] = await Promise.all([
      auditToken(token),
      apiFetcher<PairData>(
        `https://api.dexscreener.com/latest/dex/tokens/${token}`
      ),
    ]);

    const firstPair = tokenData.data.pairs.at(0);
    if (!firstPair) return false;

    const { baseToken, pairCreatedAt } = firstPair;
    const { name, symbol } = baseToken;
    const age = cleanUpBotMessage(moment(pairCreatedAt).fromNow());
    const totalSupply = cleanUpBotMessage(parseFloat(Number(tokenAudit.total_supply).toFixed(2)).toLocaleString("en")) // prettier-ignore
    const nullAddress = tokenAudit.lp_holders?.find(({ address }) => address === NULL_ADDRESS); // prettier-ignore
    const burntLp = parseFloat((Number(nullAddress?.percent || 0) * 100).toFixed(2)); // prettier-ignore
    const isLpLocked =
      burntLp === 100 ? "🟩 LP locked: YES" : "🟥 LP locked: NO";
    const holders = tokenAudit.holders
      .map(({ is_contract, percent, address }) => {
        const holding = cleanUpBotMessage((Number(percent) * 100).toFixed(1)); // prettier-ignore
        const url = `https://etherscan.io/address/${address}`;
        const text = `[${is_contract ? "📜" : "🧑‍💼"} ${holding}%](${url})`;
        return text;
      })
      .slice(0, 5)
      .join(" \\| ");

    const { creator_address, owner_address, is_open_source } = tokenAudit;
    const buyTax = Number((Number(tokenAudit.buy_tax) * 100).toFixed(2));
    const sellTax = Number((Number(tokenAudit.sell_tax) * 100).toFixed(2));
    const isNullOwner = owner_address === NULL_ADDRESS ? "🟩" : "🟥";
    const isVerified = is_open_source
      ? "🟩 Contract Verified"
      : "🟥 Contract Unverified";
    const isBuyTaxSafe = buyTax <= 15 ? "🟩" : buyTax <= 30 ? "🟨" : "🟥";
    const isSellTaxSafe = sellTax <= 15 ? "🟩" : sellTax <= 30 ? "🟨" : "🟥";
    const socialLinks = await extractSocialLinks(token);
    const displayCreatorAddress = `${creator_address.slice(0,3)}\\.\\.\\.${creator_address.slice(-3)}`; // prettier-ignore
    const displayOwnerAddress = `${owner_address.slice(0,3)}\\.\\.\\.${owner_address.slice(-3)}`; // prettier-ignore

    message = `*Hype Alert*

${hardCleanUpBotMessage(name)} \\| ${hardCleanUpBotMessage(symbol)}

Hype Score: 93/100

Age: *${age}*
Supply: *${totalSupply}*
💰 Market Cap: *${cleanUpBotMessage(firstPair.fdv.toLocaleString("en"))}*
🏦 Lp ETH: *${cleanUpBotMessage(
      firstPair.liquidity.quote.toLocaleString("en")
    )}*
🔥 Burn Token Balance: ${cleanUpBotMessage(burntLp)}%
👥 Holders: ${tokenAudit.holder_count}
👥 Top Holders:
${holders}

Deployer: [${displayCreatorAddress}](https://etherscan.io/address/${creator_address})
${isNullOwner} Owner: [${displayOwnerAddress}](https://etherscan.io/address/${owner_address})
${isVerified}
${isBuyTaxSafe} Buy Tax: ${cleanUpBotMessage(buyTax)}%
${isSellTaxSafe} Sell Tax: ${cleanUpBotMessage(sellTax)}%
${isLpLocked}

Token Contract:
\`${token}\`

Security: [OttoSimBot](${`https://t.me/OttoSimBot?start=${token}`}) \\| [TokenSniffer](${`https://tokensniffer.com/token/eth/${token}`})

Social Links: ${socialLinks}

[📊 DexTools](${`https://www.dextools.io/app/en/ether/pair-explorer/${token}`}) [📊 DexSpy](${`https://dexspy.io/eth/token/${token}`})
[📊 DexTools](${`https://dexscreener.com/ethereum/${token}`}) [⚪ Etherscan](${`https://etherscan.io//token/${token}`})
  `;

    teleBot.api
      .sendMessage(CHANNEL_ID, message, {
        parse_mode: "MarkdownV2",
        // @ts-expect-error Param not found
        disable_web_page_preview: true,
      })
      .then(() => log(`Sent message for ${token}`))
      .catch((err) => {
        log(message);
        errorHandler(err);
      });
  } catch (error) {
    log(message);
    errorHandler(error);
  }
}
