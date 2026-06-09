const { getStore } = require("@netlify/blobs");

exports.handler = async (event) => {
  const store = getStore("gouvernement");
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };

  if (event.httpMethod === "GET") {
    try {
      const state = await store.get("state", { type: "json" });
      const log = await store.get("log", { type: "json" });
      const history = await store.get("history", { type: "json" });
      return {
        statusCode: 200, headers,
        body: JSON.stringify({
          state: state || { benji:{hp:100,item:100}, sofiane:{hp:100,item:100}, yanis:{hp:100,item:100} },
          log: log || [],
          history: history || []
        })
      };
    } catch(e) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
    }
  }

  if (event.httpMethod === "POST") {
    try {
      const body = JSON.parse(event.body);
      await Promise.all([
        store.set("state", JSON.stringify(body.state)),
        store.set("log", JSON.stringify((body.log || []).slice(0, 10))),
        store.set("history", JSON.stringify((body.history || []).slice(0, 20)))
      ]);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    } catch(e) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
    }
  }

  return { statusCode: 405, headers, body: "Method not allowed" };
};
