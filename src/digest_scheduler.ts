import { randomUUID } from "node:crypto";
import { infrai } from "./infrai_cron.ts";

const digestTaskUrl = process.env.DIGEST_TASK_URL;

if (!digestTaskUrl) {
  throw new Error("Set DIGEST_TASK_URL to the weekly digest handler URL.");
}

const job = await infrai.cron.create(
  {
    cron_expr: "0 9 * * 1",
    task: digestTaskUrl
  },
  randomUUID()
);

console.log(`Weekly developer-tools digest scheduled: ${job.job_id}`);
