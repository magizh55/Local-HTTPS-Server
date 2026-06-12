#!/bin/bash
# ============================================================
#  generate-cert.sh
#  Generates a self-signed SSL certificate for localhost
# ============================================================

set -e

CERT_DIR="$(dirname "$0")"
KEY_FILE="$CERT_DIR/server.key"
CERT_FILE="$CERT_DIR/server.crt"
CONFIG_FILE="$CERT_DIR/openssl.cnf"

echo "🔐 Generating self-signed SSL certificate for localhost..."
echo ""

# ── Write OpenSSL config with SANs ──────────────────────────
cat > "$CONFIG_FILE" <<EOF
[req]
default_bits       = 2048
prompt             = no
default_md         = sha256
distinguished_name = dn
x509_extensions    = v3_req

[dn]
C  = US
ST = Development
L  = Localhost
O  = LocalDevCert
OU = Engineering
CN = localhost

[v3_req]
subjectAltName = @alt_names
keyUsage       = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth

[alt_names]
DNS.1 = localhost
DNS.2 = 127.0.0.1
IP.1  = 127.0.0.1
EOF

# ── Generate private key + self-signed certificate ──────────
openssl req -x509 \
  -newkey rsa:2048 \
  -keyout "$KEY_FILE" \
  -out "$CERT_FILE" \
  -days 365 \
  -nodes \
  -config "$CONFIG_FILE"

echo ""
echo "✅ Certificate generated successfully!"
echo "   🔑 Private Key : $KEY_FILE"
echo "   📜 Certificate : $CERT_FILE"
echo ""

# ── Display certificate info ─────────────────────────────────
echo "📋 Certificate Details:"
echo "─────────────────────────────────────────────"
openssl x509 -in "$CERT_FILE" -noout -subject -issuer -dates
echo "─────────────────────────────────────────────"

# Clean up temp config
rm -f "$CONFIG_FILE"

echo ""
echo "🚀 Now run: node server-https.js"
echo "   Access  : https://localhost:8443"
echo ""
echo "⚠️  Browser Security Warning:"
echo "   Since this is a self-signed cert, your browser will"
echo "   show a warning. Click 'Advanced' → 'Proceed to localhost'"
