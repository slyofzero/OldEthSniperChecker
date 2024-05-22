import { web3 } from "./config";

export async function isContract(address: string) {
  const code = await web3?.eth.getCode(address);
  return code !== "0x" && code !== "0x0";
}
