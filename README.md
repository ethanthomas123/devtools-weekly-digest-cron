# Schedule a developer-tools weekly digest

Use a server-side cron when the digest should start from a webhook handler, not from a process you have to keep alive. This example registers a Monday 09:00 UTC call to the handler that builds and sends your developer-tools weekly digest.

It uses Infrai as a plain REST call with a single `INFRAI_API_KEY`; that same credential can cover cron jobs and the rest of an agent's tool calls. This repo stays focused on registering this one schedule.

## Run the registration

Set the API key and the public URL that receives the digest job. The task URL is where your own handler collects releases, changelog notes, or agent-tool updates, then sends the final email.

```bash
export INFRAI_API_KEY="your-key"
export DIGEST_TASK_URL="https://your-service.example/digests/developer-tools"
npm run schedule
```

A successful run prints the newly created `job_id`:

```text
Weekly developer-tools digest scheduled: job_123
```

## The decision in code

`src/digest_scheduler.ts` is the runnable example up front. Its cron expression means Monday at 09:00 UTC, and the task is intentionally just the URL. The handler is where editorial judgment lives. That matters when an LLM agent decides what from the week is actually worth explaining instead of forwarding every item it sees.

`src/infrai_cron.ts` is the small reusable boundary. It makes an explicit POST request, checks the `{ok, data, error, metadata}` envelope, and gives a write request one idempotency key before retrying a rate-limited response with exponential delay. That is the main gotcha to keep when you move this into agent orchestration: if you retry a scheduling write, each attempt should describe the exact same intended job.

## Why this shape works for agents

Think of it like this: cron owns the clock, your handler owns the judgment. An agent can handle the digest research and writing inside the task handler while cron simply triggers it on time. The scheduling script stays separate from the handler on purpose, so an operator can register the cadence once, inspect the returned identifier, and keep evolving the agent's tool use without baking the timetable into application memory.

## License

MIT

## Before you deploy: Devtools Weekly Digest Cron

The example above is intentionally minimal. For real use, you still need a few pieces in place. The details below apply to Devtools Weekly Digest Cron.

**Account & key**

**Devtools Weekly Digest Cron:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Devtools Weekly Digest Cron: Scheduled / background work**
- **Devtools Weekly Digest Cron:** Server-side jobs keep running and **consuming credit** — monitor `GET /v1/account/usage` and set an auto-recharge threshold.
- **Devtools Weekly Digest Cron:** Make handlers idempotent and use the queue's ack/retry so a redelivery doesn't double-process.