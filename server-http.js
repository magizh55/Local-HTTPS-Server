/**
 * Plain HTTP Server (No Encryption)
 * -----------------------------------
 * For comparison with the HTTPS server.
 * All traffic is plaintext — visible in Wireshark!
 * Access at: http://localhost:8080
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

// ── MIME Types ───────────────────────────────────────────────────────────────
const mimeTypes = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
};

// ── Request Handler ───────────────────────────────────────────────────────────
function handleRequest(req, res) {
  const timestamp = new Date().toISOString();
  console.log(`[HTTP]  ${timestamp} ${req.method} ${req.url}`);

  // API endpoint — returns JSON in PLAINTEXT (visible in Wireshark!)
  if (req.url === "/api/secret") {
    const secret = {
      message: "⚠️ WARNING: This data is sent in PLAINTEXT over HTTP!",
      server: "HTTP (unencrypted)",
      protocol: "HTTP/1.1",
      sensitiveData: "password=SuperSecret123 | token=eyJhbGc...",
      warning: "Anyone on the network can read this in Wireshark!",
      timestamp: new Date().toISOString(),
    };
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(secret, null, 2));
  }

  // Serve static files from /public
  let filePath = path.join(
    __dirname,
    "public",
    req.url === "/" ? "index.html" : req.url
  );

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/html" });
      return res.end("<h1>404 — Not Found</h1>");
    }
    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || "text/plain";
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
}

// ── Start HTTP Server ─────────────────────────────────────────────────────────
const PORT = process.env.HTTP_PORT || 8080;
const server = http.createServer(handleRequest);

server.listen(PORT, () => {
  console.log("╔════════════════════════════════════════════╗");
  console.log("║      ⚠️  HTTP SERVER STARTED (UNSAFE)     ║");
  console.log("╠════════════════════════════════════════════╣");
  console.log(`║  URL   : http://localhost:${PORT}           ║`);
  console.log(`║  API   : http://localhost:${PORT}/api/secret ║`);
  console.log("╠════════════════════════════════════════════╣");
  console.log("║  🔍 Open Wireshark → filter: tcp.port==8080║");
  console.log("║     You will see plaintext HTTP data!      ║");
  console.log("╚════════════════════════════════════════════╝");
});
