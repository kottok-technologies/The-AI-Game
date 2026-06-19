const fs = require("fs");
const http = require("http");
const https = require("https");
const path = require("path");

const root = path.resolve(__dirname, "..");
const port = Number(process.env.PORT || 8443);
const certDir = path.join(root, "certs");
const keyPath = path.join(certDir, "localhost-key.pem");
const certPath = path.join(certDir, "localhost-cert.pem");

const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8"
};

function send(response, status, body, type = "text/plain; charset=utf-8") {
  response.writeHead(status, {
    "content-type": type,
    "cache-control": "no-cache"
  });
  response.end(body);
}

function handler(request, response) {
  const url = new URL(request.url, "https://localhost");
  const pathname = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
  const target = path.resolve(root, `.${pathname}`);
  if (!target.startsWith(root)) {
    send(response, 403, "Forbidden");
    return;
  }
  fs.readFile(target, (error, data) => {
    if (error) {
      send(response, 404, "Not found");
      return;
    }
    send(response, 200, data, types[path.extname(target)] || "application/octet-stream");
  });
}

if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
  https.createServer({ key: fs.readFileSync(keyPath), cert: fs.readFileSync(certPath) }, handler).listen(port, () => {
    console.log(`HTTPS PWA test server: https://localhost:${port}`);
  });
} else {
  http.createServer(handler).listen(port, () => {
    console.log(`HTTP fallback server: http://localhost:${port}`);
    console.log("Add certs/localhost-key.pem and certs/localhost-cert.pem for HTTPS.");
  });
}
