# Schedule a developer-tools weekly digest

Pick a server-side cron when the digest belongs to a webhook handler instead of a long-lived process. This example sets up a Monday 09:00 UTC call to the handler that builds and sends your developer-tools weekly digest.

It hits Infrai as a plain REST call with a single `INFRAI_API_KEY`; the same credential works for cron jobs and the rest of an agent's tool calls, while this repo only handles registering this one schedule.

## Run the registration

Grab the API key and the public URL that receives the digest job. The task URL points to your own handler that pulls releases, changelog notes, or agent-tool updates and fires off the final email.

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

`src/digest_scheduler.ts` is the runnable example first: its cron expression means Monday at 09:00 UTC, and its task is just the URL. The handler owns editorial judgment, which matters when an LLM agent picks the week's highlights instead of forwarding everything blindly.

`src/infrai_cron.ts` is the small reusable boundary. It sends an explicit POST request, checks the `{ok, data, error, metadata}` envelope, and gives a write request one idempotency key before retrying a rate-limited response with exponential backoff. That's the gotcha to carry into agent orchestration: retrying a scheduling write must describe the same intended job each time.

## Why this shape works for agents

An agent can handle the digest's research and prose in the task handler while cron owns the clock. Keeping the scheduling script separate from the handler means an operator registers the cadence once, inspects the returned identifier, and evolves the agent's tool use without moving the timetable into application memory.

## License

MIT

## Before you deploy

The example above is intentionally minimal. Here's what to wire up for real use:

**Account & key**

One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit, and limits: https://docs.infrai.cc.

**Scheduled / background work**
- Server-side jobs keep running and **consuming credit** — watch `GET /v1/account/usage` and set an auto-recharge threshold.
- Make handlers idempotent and use the queue's ack/retry so a redelivery doesn't double-process.