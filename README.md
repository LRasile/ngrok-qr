# ngrok-qr

Starts an [ngrok](https://ngrok.com) tunnel and instantly prints a scannable QR code in your terminal — no browser needed.

## Setting up ngrok

This tool requires ngrok to be installed and authenticated. See the [ngrok getting started guide](https://ngrok.com/docs/getting-started/) for full setup instructions.

## Prerequisites

- [Node.js](https://nodejs.org) v14+
- ngrok installed and authenticated

## Installation

```bash
npm install -g ngrok-qr
```

Or clone and link locally:

```bash
git clone https://github.com/LRasile/ngrok-qr.git
cd ngrok-qr
npm install
npm link
```

## Usage

```bash
# Default port 3000
ngrok-qr

# Custom port
ngrok-qr 8080

# Local app running on HTTPS
ngrok-qr 3000 --https
```

Your terminal will display the public URL and a QR code you can scan with your phone:

```
Starting ngrok on port 3000...

ngrok tunnel: https://abc123.ngrok.io

█████████████████████████████
█ ▄▄▄▄▄ █▀▀▀▄▀▀▄█ ▄▄▄▄▄ █
█ █   █ █▀ ▀▄▀▄▀█ █   █ █
...

Scan the QR code or visit: https://abc123.ngrok.io

Press Ctrl+C to stop.
```

## Running Tests

```bash
npm test
```

## License

MIT
