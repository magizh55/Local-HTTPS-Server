/**
 * HTTPS Server with Self-Signed SSL Certificate
 * -----------------------------------------------
 * Demonstrates encrypted communication using TLS/SSL.
 * Access at: https://localhost:8443
 */

const https = require("https");
const fs = require("fs");
const path = require("path");

// ── Load SSL Certificate & Key ──────────────────────────────────────────────
const certPath = path.join(__dirname, "certs", "server.crt");
const keyPath = path.join(__dirname, "certs", "server.key");

if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
  console.error("❌ SSL certificate not found!");
  console.error("   Run: ./certs/generate-cert.sh");
  process.exit(1);
}

const sslOptions = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath),
};

// ── MIME Types ───────────────────────────────────────────────────────────────
const mimeTypes = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

// ── Request Handler ───────────────────────────────────────────────────────────
function handleRequest(req, res) {
  const timestamp = new Date().toISOString();
  console.log(`[HTTPS] ${timestamp} ${req.method} ${req.url}`);

  // API endpoint — returns JSON to demonstrate encrypted data
  if (req.url === "/api/secret") {
    const secret = {
      message: "This JSON payload is fully encrypted in transit via TLS!",
      server: "HTTPS",
      protocol: req.socket.getProtocol ? req.socket.getProtocol() : "TLSv1.x",
      cipher: req.socket.getCipher ? req.socket.getCipher() : {},
      timestamp: new Date().toISOString(),
      sensitiveData: "password=SuperSecret123 | token=eyJhbGc...",
    };
    res.writeHead(200, {
      "Content-Type": "application/json",
      "Strict-Transport-Security": "max-age=31536000",
    });
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

// ── Start HTTPS Server ────────────────────────────────────────────────────────
const PORT = process.env.HTTPS_PORT || 8443;
const server = https.createServer(sslOptions, handleRequest);

server.listen(PORT, () => {
  console.log("╔════════════════════════════════════════════╗");
  console.log("║         🔒  HTTPS SERVER STARTED          ║");
  console.log("╠════════════════════════════════════════════╣");
  console.log(`║  URL   : https://localhost:${PORT}          ║`);
  console.log(`║  Cert  : certs/server.crt                  ║`);
  console.log(`║  API   : https://localhost:${PORT}/api/secret ║`);
  console.log("╠════════════════════════════════════════════╣");
  console.log("║  ⚠️  Browser will warn: self-signed cert   ║");
  console.log("║     Click Advanced → Proceed to localhost  ║");
  console.log("╚════════════════════════════════════════════╝");
});

server.on("error", (err) => {
  if (err.code === "EACCES") {
    console.error(`❌ Permission denied on port ${PORT}. Try a port > 1024.`);
  } else {
    console.error("❌ Server error:", err.message);
  }
  process.exit(1);
});
