import { apiFetcher } from "@/utils/api";

export let ethPrice = 0;

export async function getEthPrice() {
  const data = (
    await apiFetcher(
      "https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT"
    )
  ).data as any;
  ethPrice = Number(data.price);
}
