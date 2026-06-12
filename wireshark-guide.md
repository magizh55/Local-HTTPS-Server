# 📡 Wireshark Analysis Guide

Step-by-step instructions to prove HTTPS encrypts data vs HTTP plaintext.

---

## Setup

1. Start both servers: `npm start`
2. Open **Wireshark** (run as Administrator/root if needed)
3. Select interface: **Loopback** (`lo` on Linux/Mac, `Loopback Adapter` on Windows)

---

## Capturing HTTP (Plaintext)

1. In Wireshark filter bar, enter: `tcp.port == 8080`
2. Click **Start Capture** (blue shark fin)
3. Visit `http://localhost:8080` in your browser
4. Also visit `http://localhost:8080/api/secret`
5. Stop capture after a few seconds
6. Right-click any HTTP packet → **Follow → TCP Stream**

**What you'll see (readable plaintext):**
```
GET / HTTP/1.1
Host: localhost:8080
User-Agent: Mozilla/5.0 (...)
Accept: text/html,...

HTTP/1.1 200 OK
Content-Type: text/html
...
<html>... entire page source visible ...
```

For the `/api/secret` endpoint, the full JSON response is visible including the `sensitiveData` field.

---

## Capturing HTTPS (Encrypted)

1. In Wireshark filter bar, enter: `tcp.port == 8443`
2. Start a new capture
3. Visit `https://localhost:8443` in your browser (accept the certificate warning)
4. Also visit `https://localhost:8443/api/secret`
5. Stop capture
6. Right-click any packet → **Follow → TCP Stream**

**What you'll see (encrypted gibberish):**
```
..........localhost.....................................
...e.g..........}U..b...I....TF-.4R..h..s..'.b.n..@
[unreadable binary / TLS application data]
```

No HTML, no JSON, no readable content — just encrypted bytes.

---

## TLS Handshake Analysis

Filter: `tls.handshake`

You'll see the full TLS negotiation:

| Step | Message | Description |
|------|---------|-------------|
| 1 | `Client Hello` | Browser proposes TLS version + cipher suites |
| 2 | `Server Hello` | Server selects cipher, sends certificate |
| 3 | `Certificate` | Server sends self-signed cert (CN=localhost) |
| 4 | `Server Hello Done` | Server done with handshake parameters |
| 5 | `Client Key Exchange` | Client sends encrypted key material |
| 6 | `Change Cipher Spec` | Both sides switch to encrypted mode |
| 7+ | `Application Data` | All subsequent data is encrypted |

Click on the `Certificate` packet and expand:
`TLS → Handshake Protocol → Certificate → Certificates → RDNSequence`

You'll see the certificate details: CN=localhost, self-signed (Issuer = Subject).

---

## Key Takeaways

| Feature | HTTP | HTTPS |
|---------|------|-------|
| Data in transit | ✅ Readable plaintext | ✅ Encrypted |
| Password/token visible | ❌ YES — exposed | ✅ NO — hidden |
| Certificate | None | Self-signed (dev) / CA-signed (prod) |
| Wireshark stream | Full HTML/JSON visible | Encrypted binary data |
| Port used | 8080 | 8443 |

---

## Alternative: curl for Quick Testing

```bash
# HTTP — response is plaintext on the wire
curl http://localhost:8080/api/secret

# HTTPS — -k flag skips cert verification for self-signed certs
curl -k https://localhost:8443/api/secret

# View TLS certificate details
curl -kv https://localhost:8443 2>&1 | grep -A5 "subject\|issuer\|SSL"
```
