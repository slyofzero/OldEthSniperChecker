import { transactions } from "@/vars/transactions";
import { sendAlert } from "./sendAlert";
import { log } from "@/utils/handlers";
import { ALERT_INTERVAL, VOLUME_THRESHOLD } from "@/utils/constants";

export function cleanUpTransactions() {
  log("Cleanup initiated");
  const currentTime = Math.floor(Date.now() / 1000);

  for (const token in transactions) {
    const storedToken = transactions[token];
    const secondsElapsed = currentTime - storedToken.startTime;
    const totalBuys = storedToken.buys.reduce((prev, curr) => prev + curr);

    if (totalBuys > VOLUME_THRESHOLD) {
      sendAlert(token).then(() => {
        delete transactions[token];
      });
    }

    if (secondsElapsed > ALERT_INTERVAL) {
      delete transactions[token];
      log(`Removed token ${token}`);
    }
  }
}
