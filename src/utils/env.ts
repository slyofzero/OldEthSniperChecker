import dotenv from "dotenv";
dotenv.config();

export const {
  BOT_TOKEN,
  BOT_USERNAME,
  ALCHEMY_API_KEY,
  CHANNEL_ID,
  ETHER_SCAN_API_KEY,
} = process.env;
