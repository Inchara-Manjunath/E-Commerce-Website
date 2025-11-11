Ubuntu deployment (single server, Nginx + PM2)
================================================

This project is set up for a simple, reliable deployment on an Ubuntu server using:
- Nginx to serve the React build and reverse-proxy API requests
- PM2 to run the Node backend as a service

Repo structure assumed:
- ecommerce-frontend (Vite app)
- ecommerce-backend (Node/Express API)
- deploy (deployment scripts and configs)

Quick start
-----------
1) Copy project to server (recommended path):
   - /var/www/ECommerce-Project
   Example:
   - git clone or scp your local project to /var/www/ECommerce-Project

2) Run the setup script (as root):
   ```bash
   sudo bash deploy/setup-ubuntu.sh \
     --project-root /var/www/ECommerce-Project \
     --domain your-domain.com \
     --backend-port 3000
   ```
   - If no domain, you can pass the server IP as --domain.

3) Visit http://your-domain.com
   - Frontend is served from ecommerce-frontend/dist
   - API is available at /api (proxied to backend on 127.0.0.1:3000)

HTTPS (optional, recommended)
-----------------------------
If you have a domain pointed to your server:
```bash
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
sudo certbot --nginx -d your-domain.com
```
Certificates auto-renew via certbot.

Manual steps (if you prefer)
----------------------------
Frontend:
```bash
cd /var/www/ECommerce-Project/ecommerce-frontend
npm ci
npm run build   # outputs dist/
```

Backend:
```bash
cd /var/www/ECommerce-Project/ecommerce-backend
npm ci
PORT=3000 pm2 start server.js --name ecommerce-backend
pm2 save
pm2 startup  # follow instructions to persist on reboot
```

Nginx:
```bash
sudo cp deploy/nginx-ecommerce.conf /etc/nginx/sites-available/ecommerce
sudo ln -sf /etc/nginx/sites-available/ecommerce /etc/nginx/sites-enabled/ecommerce
sudo nginx -t
sudo systemctl reload nginx
```

Environment variables
---------------------
- Backend uses PORT (default used in scripts: 3000).
- If using a SQL database (e.g., Postgres), set DATABASE_URL in the PM2 config or environment before starting.
- Example PM2 ecosystem config included: deploy/pm2-backend.config.cjs
  ```bash
  pm2 start deploy/pm2-backend.config.cjs
  pm2 save
  ```

Logs and troubleshooting
------------------------
- PM2 logs:
  ```bash
  pm2 logs ecommerce-backend
  ```
- Nginx:
  - Test config: `sudo nginx -t`
  - Service status: `systemctl status nginx`
  - Access/error logs: `/var/log/nginx/`
- Common issues:
  - 400 (Bad Request) when placing orders: ensure the cart has at least one item (backend validates and rejects empty cart order creation).
  - 502 from Nginx: backend not running or wrong proxy port; verify PM2 and PORT.

Split hosting (optional)
------------------------
If hosting frontend (Vercel/Netlify) and backend separately (Render/Fly):
- You must configure the frontend to call the backend’s absolute URL (not /api). If you want, update axios baseURL using an env var (e.g., VITE_API_BASE) and rebuild.


