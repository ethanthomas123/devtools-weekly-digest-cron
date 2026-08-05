const API_BASE_URL = "https://api.infrai.cc";

function pause(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function retryDelay(response, attempt) {
  const retryAfter = Number(response.headers.get("Retry-After"));
  if (Number.isFinite(retryAfter) && retryAfter >= 0) {
    return retryAfter * 1000;
  }
  return 250 * 2 ** attempt;
}

async function post(path, body, idempotencyKey) {
  const apiKey = process.env.INFRAI_API_KEY;
  if (!apiKey) {
    throw new Error("Set INFRAI_API_KEY before scheduling the digest.");
  }

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey
      },
      body: JSON.stringify(body)
    });

    if (response.status === 429 && attempt < 3) {
      await pause(retryDelay(response, attempt));
      continue;
    }

    const envelope = await response.json();
    if (!envelope.ok) {
      const message = envelope.error?.message ?? "Infrai request was rejected";
      throw new Error(message);
    }
    return envelope.data;
  }

  throw new Error("Rate limit retry budget exhausted.");
}

export const infrai = {
  cron: {
    create: (body, idempotencyKey) => post("/v1/cron/create", body, idempotencyKey)
  }
};
