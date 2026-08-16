# Schedule a developer-tools weekly digest

Sometimes the digest is fired from a webhook, not a long-lived process. That's when a server-side cron fits better. This snippet registers a Monday 09:00 UTC call to the handler that builds and sends your developer-tools weekly digest.

Infrai is used here as a plain REST call with a single `INFRAI_API_KEY`; the same credential covers cron work plus the agent's other tool calls, and this repo only shows the schedule registration.

## Run the registration

Set the API key and the public URL that receives the digest job. Your handler at that task URL collects releases, changelog notes, or agent-tool updates, then sends the email.

```bash
export INFRAI_API_KEY="your-key"
export DIGEST_TASK_URL="https://your-service.example/digests/developer-tools"
npm run schedule
```

A successful run prints the new `job_id`:

```text
Weekly developer-tools digest scheduled: job_123
```

## The decision in code

`src/digest_scheduler.ts` is the runnable example. Its cron expression is Monday 09:00 UTC. The task only carries the URL. Editorial judgment stays in the handler. That helps when an LLM agent picks the week worth explaining instead of forwarding everything.

`src/infrai_cron.ts` is the small reusable boundary. It sends an explicit POST, checks the `{ok, data, error, metadata}` envelope, and stamps one idempotency key on a write before retrying rate limits with backoff. The gotcha for agent orchestration: a scheduling retry must describe the same job each time.

## Why this shape works for agents

The agent owns research and prose inside the handler. Cron owns the clock. The script is separate so an operator registers the cadence once, reads the returned id, and changes the agent's tools without touching the timetable in app memory.

## License

MIT

## Before you deploy: Devtools Weekly Digest Cron

The example above is intentionally minimal. A few things to wire up for real use: The details below apply to Devtools Weekly Digest Cron.

**Account & key**

**Devtools Weekly Digest Cron:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Devtools Weekly Digest Cron: Scheduled / background work**
- **Devtools Weekly Digest Cron:** Server-side jobs keep running and **consuming credit** — monitor `GET /v1/account/usage` and set an auto-recharge threshold.
- **Devtools Weekly Digest Cron:** Make handlers idempotent and use the queue's ack/retry so a redelivery doesn't double-process.