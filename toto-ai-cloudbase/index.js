import http from "node:http";
import { handleRequest } from "./handler.mjs";

const PORT = Number(process.env.PORT || 9000);
const MAX_BODY_BYTES = 60 * 1024;

function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin"
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    let tooLarge = false;
    req.on("data", chunk => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        tooLarge = true;
        return;
      }
      if (!tooLarge) chunks.push(chunk);
    });
    req.on("end", () => tooLarge
      ? reject(Object.assign(new Error("消息过长，请缩短后重试"), { statusCode: 413 }))
      : resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const body = ["GET", "HEAD", "OPTIONS"].includes(req.method) ? undefined : await readBody(req);
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value !== undefined) headers.set(key, Array.isArray(value) ? value.join(", ") : String(value));
    }
    const host = headers.get("host") || "127.0.0.1";
    const request = new Request(new URL(req.url || "/", `http://${host}`), {
      method: req.method,
      headers,
      ...(body === undefined ? {} : { body })
    });
    const response = await handleRequest(request, process.env);
    const responseHeaders = Object.fromEntries(response.headers.entries());
    const responseBody = Buffer.from(await response.arrayBuffer());
    res.writeHead(response.status, responseHeaders);
    res.end(responseBody);
  } catch (error) {
    if (res.headersSent) {
      res.destroy();
      return;
    }
    const status = Number(error.statusCode) || 500;
    sendJson(res, status, { error: error.message || "服务器内部错误" });
  }
});

server.requestTimeout = 65000;
server.headersTimeout = 66000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Toto AI CloudBase HTTP function listening on ${PORT}`);
});
