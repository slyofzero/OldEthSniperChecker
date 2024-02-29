import { apiFetcher } from "@/utils/api";
import { ETHER_SCAN_API_KEY } from "@/utils/env";
import { errorHandler } from "@/utils/handlers";

export async function extractSocialLinks(contractAddress: string) {
  try {
    const etherscanUrl = `https://api.etherscan.io/api?module=contract&action=getsourcecode&address=${contractAddress}&apikey=${ETHER_SCAN_API_KEY}`;
    const etherscanResponse = await apiFetcher<any>(etherscanUrl);
    const sourceCode = etherscanResponse?.data?.result?.[0]?.SourceCode || "";
    const links = [];

    if (sourceCode) {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const matchedLinks = sourceCode.match(urlRegex);

      if (matchedLinks) {
        for (const link of matchedLinks) {
          let cleanLink = link.split(" ")[0];
          cleanLink = cleanLink.replace(/[\r\n]+/g, "");
          cleanLink = cleanLink.split("\\n")[0];
          cleanLink = cleanLink.split("%5Cr")[0];

          if (
            cleanLink.startsWith("https://github.com") ||
            cleanLink.startsWith("https://hardhat.org") ||
            cleanLink.startsWith("https://forum.openzeppelin.com") ||
            cleanLink.startsWith("https://web3js.readthedocs.io") ||
            cleanLink.startsWith("https://eips.ethereum.org") ||
            cleanLink.startsWith("https://docs.metamask.io") ||
            cleanLink.startsWith("https://eth.wiki") ||
            cleanLink.startsWith("https://docs.ethers.io") ||
            cleanLink.startsWith("https://forum.zeppelin.solutions") ||
            cleanLink.startsWith("https://raw.githubusercontent.com") ||
            cleanLink.startsWith("https://diligence.consensys.net") ||
            cleanLink.startsWith("https://solidity.readthedocs.io") ||
            cleanLink.startsWith("https://etherscan.io") ||
            cleanLink.startsWith("https://en.wikipedia.org")
          ) {
            continue;
          }
          if (cleanLink.startsWith("https://t.me")) {
            links.push(`[Telegram](${cleanLink})`);
          } else if (cleanLink.startsWith("https://twitter.com")) {
            links.push(`[X](${cleanLink})`);
          } else if (cleanLink.startsWith("https://docs")) {
            links.push(`[Docs](${cleanLink})`);
          } else if (cleanLink.startsWith("https://discord.gg")) {
            links.push(`[Discord](${cleanLink})`);
          } else if (
            cleanLink.startsWith("https://") ||
            cleanLink.startsWith("http://")
          ) {
            links.push(`[Website](${cleanLink.replace(/[()]/g, "")})`);
          }
        }
      } else {
        return "No link available";
      }
    } else {
      return "No link available";
    }

    return links.length > 0 ? links.join(" \\| ") : "No link available";
  } catch (error) {
    errorHandler(error);
    return "No link available";
  }
}
