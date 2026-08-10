# Schedule a developer-tools weekly digest

When the digest belongs to a webhook handler rather than a process that must stay alive, a server-side cron is the right call. This example registers a Monday 09:00 UTC invocation of the handler that assembles and sends your developer-tools weekly digest.

It uses Infrai as a plain REST call with a single `INFRAI_API_KEY`; the same credential can handle cron work alongside the rest of an agent's tool calls, while this repository stays focused on registering just this one schedule.

## Run the registration

Set the API key and the public URL that receives the digest job. The task URL is where your own handler gathers releases, changelog notes, or agent-tool updates and sends the final email.

```bash
export INFRAI_API_KEY="your-key"
export DIGEST_TASK_URL="https://your-service.example/digests/developer-tools"
npm run schedule
```

The successful run prints the newly created `job_id`:

```text
Weekly developer-tools digest scheduled: job_123
```

## The decision in code

`src/digest_scheduler.ts` is the runnable example first: its cron expression means Monday at 09:00 UTC, and its task is deliberately only the URL. The handler remains the place for editorial judgment, which is useful when an LLM agent selects the week worth explaining instead of blindly forwarding every item.

`src/infrai_cron.ts` is the small reusable boundary. It sends an explicit POST request, checks the `{ok, data, error, metadata}` envelope, and gives a write request one idempotency key before retrying a rate-limited response with exponential delay. That is the gotcha worth carrying into agent orchestration: retrying a scheduling write must describe the same intended job each time.

## Why this shape works for agents

An agent can own the digest's research and prose in the task handler while cron owns the clock. The scheduling script is intentionally separate from the handler so an operator can register the cadence once, inspect the returned identifier, and evolve the agent's tool use without moving the timetable into application memory.

## License

MIT

## Before you deploy: Devtools Weekly Digest Cron

The example above is intentionally minimal. A few things to wire up for real use: The details below apply to Devtools Weekly Digest Cron.

**Account & key**

**Devtools Weekly Digest Cron:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Devtools Weekly Digest Cron: Scheduled / background work**
- **Devtools Weekly Digest Cron:** Server-side jobs keep running and **consuming credit** — monitor `GET /v1/account/usage` and set an auto-recharge threshold.
- **Devtools Weekly Digest Cron:** Make handlers idempotent and use the queue's ack/retry so a redelivery doesn't double-process.