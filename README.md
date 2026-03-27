# ngrok-qr

Starts an [ngrok](https://ngrok.com) tunnel and instantly prints a scannable QR code in your terminal — no browser needed.

![Example output showing a QR code printed in the terminal alongside the ngrok URL](https://placehold.co/600x200?text=QR+code+appears+here+in+your+terminal)

## Prerequisites

- [Node.js](https://nodejs.org) v14+
- [ngrok](https://ngrok.com/download) installed and authenticated

If you haven't authenticated ngrok yet:

```bash
ngrok authtoken <your-token>
```

Get your token from the [ngrok dashboard](https://dashboard.ngrok.com/get-started/your-authtoken).

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
