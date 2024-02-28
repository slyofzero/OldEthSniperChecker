declare global {
  namespace NodeJS {
    interface ProcessEnv {
      BOT_TOKEN: string | undefined;
      BOT_USERNAME: string | undefined;
      ALCHEMY_API_KEY: string | undefined;
      CHANNEL_ID: string | undefined;
      ETHER_SCAN_API_KEY: string | undefined;
    }
  }
}

export {};
