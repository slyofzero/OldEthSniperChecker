import { InlineKeyboard } from "grammy";

// eslint-disable-next-line
export function cleanUpBotMessage(text: any) {
  text = String(text);
  text = text
    .replace(/\./g, "\\.")
    .replace(/-/g, "\\-")
    .replace(/!/g, "\\!")
    .replace(/#/g, "\\#");

  return text;
}

// eslint-disable-next-line
export function hardCleanUpBotMessage(text: any) {
  text = String(text);
  text = text
    .replace(/\./g, "\\.")
    .replace(/-/g, "\\-")
    .replace(/_/g, "\\_")
    .replace(/\|/g, "\\|")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/`/g, "\\`")
    .replace(/\+/g, "\\+")
    .replace(/!/g, "\\!")
    .replace(/#/g, "\\#")
    .replace(/\*/g, "\\*");

  return text;
}

export function generateKeyboard(token: string) {
  const unibotLink = `https://t.me/unibotsniper_bot?start=whaleape-${token}`;
  const maestroLink = `https://t.me/MaestroSniperBot?start=${token}`;
  const bananaLink = `https://t.me/BananaGunSniper_bot?start=snp_whaleape_${token}`;
  const keyboard = new InlineKeyboard()
    .url("🦄 Unibot", unibotLink)
    .row()
    .url("🛒 Maestro", maestroLink)
    .row()
    .url("🍌 Banana", bananaLink);

  return keyboard;
}
