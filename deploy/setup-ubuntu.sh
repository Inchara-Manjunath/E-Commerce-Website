#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   sudo bash deploy/setup-ubuntu.sh \
#     --project-root /var/www/ECommerce-Project \
#     --domain your-domain.com \
#     --backend-port 3000
#
# Notes:
# - Installs Node 20, PM2, Nginx
# - Builds frontend (Vite) to dist
# - Starts backend with PM2
# - Configures Nginx to serve frontend and proxy /api to backend

PROJECT_ROOT=""
DOMAIN=""
BACKEND_PORT="3000"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --project-root)
      PROJECT_ROOT="$2"
      shift 2
      ;;
    --domain)
      DOMAIN="$2"
      shift 2
      ;;
    --backend-port)
      BACKEND_PORT="$2"
      shift 2
      ;;
    *)
      echo "Unknown arg: $1"
      exit 1
      ;;
  esac
done

if [[ -z "$PROJECT_ROOT" ]]; then
  echo "Missing --project-root"
  exit 1
fi

if [[ -z "$DOMAIN" ]]; then
  echo "Missing --domain (use server IP if no domain)"
  exit 1
fi

echo "[1/6] Updating APT and installing Node.js 20, PM2, and Nginx..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
npm i -g pm2
apt-get update
apt-get install -y nginx

echo "[2/6] Installing frontend dependencies and building Vite app..."
cd "$PROJECT_ROOT/ecommerce-frontend"
npm ci
npm run build

echo "[3/6] Installing backend dependencies..."
cd "$PROJECT_ROOT/ecommerce-backend"
npm ci

echo "[4/6] Starting backend with PM2 on port ${BACKEND_PORT}..."
export PORT="${BACKEND_PORT}"
pm2 start server.js --name ecommerce-backend --update-env
pm2 save
pm2 startup | tail -n +1

echo "[5/6] Configuring Nginx site..."
SITE_CONF="/etc/nginx/sites-available/ecommerce"
cat > "$SITE_CONF" <<EOF
server {
    listen 80;
    server_name ${DOMAIN};

    root ${PROJECT_ROOT}/ecommerce-frontend/dist;
    index index.html;

    location / {
        try_files \$uri /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:${BACKEND_PORT}/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF

ln -sf "$SITE_CONF" /etc/nginx/sites-enabled/ecommerce
nginx -t
systemctl reload nginx

echo "[6/6] Done."
echo "Visit: http://${DOMAIN}"
echo "Optional HTTPS (with domain): sudo snap install --classic certbot && sudo ln -s /snap/bin/certbot /usr/bin/certbot && sudo certbot --nginx -d ${DOMAIN}"


