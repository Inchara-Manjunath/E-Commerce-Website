Render deployment (split: backend + static frontend)
====================================================

What's already set up
---------------------
- render.yaml in the repo root defines:
  - Web Service: ecommerce-backend (Node/Express)
  - Static Site: ecommerce-frontend (Vite build in dist)
- Frontend reads API base URL from VITE_API_BASE at build time (via src/utils/api.ts).

Steps
-----
1) Push your repo to GitHub/GitLab.

2) Backend (Web Service)
   - In Render, "New +" → "Web Service".
   - Select this repo, set Root Directory to ecommerce-backend.
   - Build Command: `npm ci`
   - Start Command: `node server.js`
   - Environment: Node
   - Add env var: `PORT=3000` (if not present).
   - Create the service and wait until it is live. Copy the public URL (e.g. https://ecommerce-backend.onrender.com).

3) Frontend (Static Site)
   - In Render, "New +" → "Static Site".
   - Select this repo, set Root Directory to ecommerce-frontend.
   - Build Command: `npm ci && npm run build`
   - Publish Directory: `dist`
   - Add environment variable:
     - Key: `VITE_API_BASE`
     - Value: The backend URL from step 2 (e.g., `https://ecommerce-backend.onrender.com`)
   - Under Redirects/Rewrites, add:
     - Source: `/*`, Destination: `/index.html`, Status: `200` (render.yaml already includes this).
   - Create the site and wait until deploy finishes.

4) Test
   - Open the Static Site URL. The app should load.
   - Adding to cart, checkout, orders, and tracking should work and call the backend via VITE_API_BASE.

Notes and gotchas
-----------------
- If you see CORS errors, make sure the backend allows cross-origin requests. This backend is configured with `Access-Control-Allow-Origin: *` in responses.
- If POST /api/orders returns 400, the cart is empty; add items first.
- When you redeploy the backend to a new URL, update `VITE_API_BASE` in the Static Site and redeploy the frontend.


