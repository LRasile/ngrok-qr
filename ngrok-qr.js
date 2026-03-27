#!/usr/bin/env node

const { spawn } = require("child_process");
const axios = require("axios");
const qrcode = require("qrcode-terminal");

// Poll ngrok's local API until it's ready
async function getPublicUrl(retries = 20, delay = 500) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await axios.get("http://127.0.0.1:4040/api/tunnels");
      const tunnels = res.data.tunnels;
      const https = tunnels.find((t) => t.proto === "https");
      const url = (https || tunnels[0])?.public_url;
      if (url) return url;
    } catch {
      // not ready yet
    }
    await new Promise((r) => setTimeout(r, delay));
  }
  throw new Error("Timed out waiting for ngrok to start.");
}

function printQr(url) {
  return new Promise((resolve) => {
    qrcode.generate(url, { small: true }, (qr) => {
      console.log(`\nngrok tunnel: ${url}\n`);
      console.log(qr);
      console.log(`Scan the QR code or visit: ${url}`);
      console.log("\nPress Ctrl+C to stop.\n");
      resolve(qr);
    });
  });
}

function parsePort(argv) {
  return argv[2] || "3000";
}

// Only run when executed directly, not when required in tests
if (require.main === module) {
  const port = parsePort(process.argv);
  console.log(`Starting ngrok on port ${port}...`);

  const ngrok = spawn("ngrok", ["http", port], {
    stdio: ["ignore", "ignore", "pipe"],
  });

  ngrok.stderr.on("data", (data) => {
    process.stderr.write(data);
  });

  ngrok.on("error", (err) => {
    console.error("Failed to start ngrok:", err.message);
    console.error("Make sure ngrok is installed and in your PATH.");
    process.exit(1);
  });

  ngrok.on("close", (code) => {
    if (code !== 0 && code !== null) {
      console.error(`ngrok exited with code ${code}`);
    }
  });

  getPublicUrl()
    .then((url) => printQr(url))
    .catch((err) => {
      console.error(err.message);
      ngrok.kill();
      process.exit(1);
    });

  process.on("SIGINT", () => {
    console.log("\nShutting down ngrok...");
    ngrok.kill();
    process.exit(0);
  });
}

module.exports = { getPublicUrl, printQr, parsePort };
