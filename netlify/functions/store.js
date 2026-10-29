import { getStore } from "@netlify/blobs";

// Shared data for the whole site: store details and the medicine list.
// Anyone can read it; only a request with the admin password can change it.
const JSON_HEADERS = { "Content-Type": "application/json", "Cache-Control": "no-store" };

export default async (req) => {
  const store = getStore("ratna");

  if (req.method === "GET") {
    const data = (await store.get("data", { type: "json" })) || {};
    return new Response(JSON.stringify(data), { headers: JSON_HEADERS });
  }

  if (req.method === "POST") {
    const body = await req.json();
    if (!process.env.ADMIN_PASSWORD || body.password !== process.env.ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: JSON_HEADERS });
    }
    const current = (await store.get("data", { type: "json" })) || {};
    if (body.store) current.store = body.store;
    if (body.medicines) current.medicines = body.medicines;
    await store.setJSON("data", current);
    return new Response(JSON.stringify({ ok: true }), { headers: JSON_HEADERS });
  }

  return new Response("Method not allowed", { status: 405 });
};
