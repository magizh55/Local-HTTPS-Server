# 🔒 Local HTTPS Server with Self-Signed SSL Certificate

A complete demonstration of setting up a local HTTPS web server using **Node.js** with a **self-signed SSL certificate**, and using **Wireshark** to compare encrypted HTTPS traffic vs plain HTTP.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Running the Servers](#running-the-servers)
- [Wireshark Analysis](#wireshark-analysis)
- [How It Works](#how-it-works)
- [Screenshots](#screenshots)
- [Security Notes](#security-notes)

---

## Overview

This project demonstrates:
1. Generating a **self-signed SSL/TLS certificate** using OpenSSL
2. Running an **HTTPS server** (port 443/8443) with Node.js
3. Running a plain **HTTP server** (port 80/8080) side-by-side for comparison
4. Using **Wireshark** to capture and prove that HTTPS traffic is **encrypted** while HTTP is readable plaintext

---

## Prerequisites

Make sure the following are installed:

| Tool | Version | Install |
|------|---------|---------|
| Node.js | ≥ 14.x | https://nodejs.org |
| OpenSSL | Any | https://openssl.org (usually pre-installed) |
| Wireshark | Any | https://wireshark.org |

Check installations:
```bash
node --version
openssl version
```

---

## Project Structure

```
local-https-server/
├── certs/
│   ├── generate-cert.sh       # Script to generate self-signed cert
│   ├── server.key             # Private key (generated)
│   └── server.crt             # Self-signed certificate (generated)
├── public/
│   └── index.html             # Demo webpage served over HTTPS & HTTP
├── scripts/
│   └── wireshark-guide.md     # Step-by-step Wireshark capture guide
├── server-https.js            # HTTPS server (Node.js)
├── server-http.js             # HTTP server (Node.js) for comparison
├── package.json
└── README.md
```

---

## Setup Instructions

### Step 1: Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/local-https-server.git
cd local-https-server
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Generate Self-Signed SSL Certificate

```bash
chmod +x certs/generate-cert.sh
./certs/generate-cert.sh
```

This generates:
- `certs/server.key` — RSA private key (2048-bit)
- `certs/server.crt` — Self-signed X.509 certificate (valid 365 days)

Or run manually:
```bash
openssl req -x509 -newkey rsa:2048 -keyout certs/server.key \
  -out certs/server.crt -days 365 -nodes \
  -subj "/C=US/ST=State/L=City/O=LocalDev/CN=localhost"
```

---

## Running the Servers

### Start HTTPS Server (port 8443)

```bash
node server-https.js
```

Access at: **https://localhost:8443**

> ⚠️ Your browser will warn about the self-signed certificate. Click "Advanced" → "Proceed to localhost" — this is expected for self-signed certs.

### Start HTTP Server (port 8080)

```bash
node server-http.js
```

Access at: **http://localhost:8080**

### Run Both Simultaneously

```bash
npm start
```

---

## Wireshark Analysis

See the detailed guide in [`scripts/wireshark-guide.md`](scripts/wireshark-guide.md).

### Quick Steps:

1. Open **Wireshark** and start capture on **Loopback interface** (`lo` or `Loopback`)
2. Apply filter: `tcp.port == 8080` → visit http://localhost:8080
3. Follow the TCP stream → **plaintext HTML/HTTP visible**
4. Apply filter: `tcp.port == 8443` → visit https://localhost:8443
5. Follow the TCP stream → **encrypted TLS data (gibberish)**

### Expected Results:

| Protocol | Port | Wireshark Result |
|----------|------|-----------------|
| HTTP | 8080 | ✅ Readable plaintext — `GET / HTTP/1.1`, HTML body visible |
| HTTPS | 8443 | ✅ Encrypted TLS — `TLSv1.3 Application Data` (unreadable) |

---

## How It Works

### SSL/TLS Handshake (HTTPS)

```
Client                          Server
  |                               |
  |------ ClientHello ----------->|   (proposes cipher suites)
  |<----- ServerHello ------------|   (selects cipher, sends cert)
  |<----- Certificate ------------|   (self-signed cert)
  |------ ClientKeyExchange ------>|   (key material)
  |<===== Encrypted Session ======>|   (all data encrypted)
```

### Why HTTP is Insecure

With plain HTTP, every packet is readable:
```
GET / HTTP/1.1
Host: localhost:8080
Cookie: session=abc123secret     ← visible to any network observer!
```

### Why HTTPS is Secure

With HTTPS/TLS, payload is encrypted:
```
TLSv1.3 Record Layer: Application Data
  Encrypted Data: 8f3a2c1b9e...  ← unreadable without private key
```

---

## Screenshots

Refer to the `docs/` folder for annotated Wireshark screenshots showing:
- HTTP plaintext capture
- HTTPS encrypted capture
- TLS handshake details

---

## Security Notes

> ⚠️ **Self-signed certificates are for local development only.**
> - Browsers will show a security warning
> - Do NOT use self-signed certs in production
> - For production, use [Let's Encrypt](https://letsencrypt.org) (free, trusted CA)
> - The private key (`certs/server.key`) should never be committed to public repos — it's in `.gitignore`

---

## License

MIT — free to use for educational purposes.
