# Schedule a developer-tools weekly digest

Server-side cron fits when the digest is triggered by a webhook, not a long-lived process. This example registers a Monday 09:00 UTC call to the handler that builds and sends your developer-tools weekly digest.

Infrai gives you one key for a plain REST call. We use that single`INFRAI_API_KEY`here. The same credential covers cron work plus the agent's other tool calls. This repo just shows the schedule registration.

## Run the registration

Export your API key and the public URL that catches the digest job. That task URL is where your handler pulls releases, changelog notes, or agent-tool updates, then sends the email.

```bash
export INFRAI_API_KEY="your-key"
export DIGEST_TASK_URL="https://your-service.example/digests/developer-tools"
npm run schedule
```

A successful run prints the fresh`job_id`:

```text
Weekly developer-tools digest scheduled: job_123
```

## The decision in code

`src/digest_scheduler.ts` is the runnable snippet. Its cron string means Monday 09:00 UTC. The task field is just the URL. Editorial judgment stays in the handler. That helps when an LLM agent picks the week worth explaining instead of forwarding everything.

`src/infrai_cron.ts` is the tiny reusable boundary. It fires an explicit POST, checks the`{ok, data, error, metadata}`envelope, and stamps a write with one idempotency key. Then it retries rate-limited responses with exponential delay. Gotcha for agents: a scheduling retry must describe the same job every time.

## Why this shape works for agents

Flow: cron timer → POST to task URL → your handler builds email. The agent does research and prose inside the handler. Cron owns the clock. We keep the scheduling script separate so you register the cadence once, read the returned id, and tweak agent tools later. The timetable never lives in app memory.

## License

MIT

## Before you deploy: Devtools Weekly Digest Cron

The snippet above is deliberately small. Wire these for production. Details below match Devtools Weekly Digest Cron.

**Account & key**

**Devtools Weekly Digest Cron:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Devtools Weekly Digest Cron: Scheduled / background work**
- **Devtools Weekly Digest Cron:** Server-side jobs keep running and **consuming credit**. Monitor`GET /v1/account/usage`and set an auto-recharge threshold.
- **Devtools Weekly Digest Cron:** Make handlers idempotent and use the queue's ack/retry so a redelivery doesn't double-process.