# Deployment Checklist & Plan
## Stack: Ubuntu - Node.js - PM2 - Nginx - PostgreSQL

This guide outlines the steps to deploy the **MRP Authentic Auto Parts** monorepo to a production Ubuntu server.

---

### 1. Server Prerequisites
- [ ] **Update System**:
  ```bash
  sudo apt update && sudo apt upgrade -y
  sudo apt install curl git build-essential -y
  ```

### 2. Install Node.js & PNPM
- [ ] **Install Node.js 20+** (via NodeSource):
  ```bash
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt install -y nodejs
  ```
- [ ] **Install Global Tools**:
  ```bash
  sudo npm install -g pnpm pm2 @angular/cli @nestjs/cli
  ```

### 3. PostgreSQL Setup
- [ ] **Install PostgreSQL**:
  ```bash
  sudo apt install postgresql postgresql-contrib -y
  ```
- [ ] **Configure Database**:
  ```bash
  sudo -u postgres psql
  # Inside psql:
  CREATE DATABASE mrp_db;
  CREATE USER mrp_user WITH ENCRYPTED PASSWORD 'secure_password_here';
  GRANT ALL PRIVILEGES ON DATABASE mrp_db TO mrp_user;
  \q
  ```

### 4. Application Setup
- [ ] **Clone & Install**:
  ```bash
  # Navigate to target directory, e.g., /var/www
  cd /var/www
  git clone <repository_url> mrp-app
  cd mrp-app
  pnpm install --frozen-lockfile
  ```
- [ ] **Environment Variables**:
  Create `.env` file in root (copy from `.env.example` and update):
  ```bash
  cp .env.example .env
  nano .env
  # Update DATABASE_URL=postgresql://mrp_user:secure_password_here@localhost:5432/mrp_db
  # Update HOST=0.0.0.0 (important for PM2)
  # Update PORT=3010
  ```

### 5. Build Applications
- [ ] **Build All Apps**:
  ```bash
  pnpm build
  # Or individually:
  # pnpm build:api
  # pnpm build:admin
  # pnpm build:site
  ```

### 6. PM2 Configuration (Process Manager)
Create `ecosystem.config.js` in the project root:

```javascript
module.exports = {
  apps: [
    {
      name: "mrp-api",
      script: "dist/apps/api/main.js", // Verifying path below
      env: {
        NODE_ENV: "production",
        PORT: 3010
      }
    },
    {
      name: "mrp-site-ssr",
      script: "dist/apps/site/server/server.mjs",
      env: {
        NODE_ENV: "production",
        PORT: 3012
      }
    }
  ]
};
```
*Note: Verify exact dist paths after build. Standard NestJS build goes to `dist/apps/api/main.js` in monorepos, but check `tsconfig`.*

- [ ] **Start PM2**:
  ```bash
  pm2 start ecosystem.config.js
  pm2 save
  pm2 startup
  ```

### 7. Nginx Configuration
- [ ] **Install Nginx**:
  ```bash
  sudo apt install nginx -y
  ```
- [ ] **Configure Sites**:
  Create `/etc/nginx/sites-available/mrp-app`:

  ```nginx
  # 1. API (api.mrpauthenticautoparts.com)
  server {
      server_name api.mrpauthenticautoparts.com;

      location / {
          proxy_pass http://localhost:3010;
          proxy_http_version 1.1;
          proxy_set_header Upgrade $http_upgrade;
          proxy_set_header Connection 'upgrade';
          proxy_set_header Host $host;
          proxy_cache_bypass $http_upgrade;
      }
  }

  # 2. Admin Dashboard (admin.mrpauthenticautoparts.com)
  server {
      server_name admin.mrpauthenticautoparts.com;
      root /var/www/mrp-app/dist/apps/admin/browser; # Verify static path
      index index.html;

      location / {
          try_files $uri $uri/ /index.html;
      }
  }

  # 3. Customer Site SSR (mrpauthenticautoparts.com)
  server {
      server_name mrpauthenticautoparts.com www.mrpauthenticautoparts.com;

      location / {
          proxy_pass http://localhost:3012;
          proxy_http_version 1.1;
          proxy_set_header Upgrade $http_upgrade;
          proxy_set_header Connection 'upgrade';
          proxy_set_header Host $host;
          proxy_cache_bypass $http_upgrade;
      }
  }
  ```

- [ ] **Enable & Restart**:
  ```bash
  sudo ln -s /etc/nginx/sites-available/mrp-app /etc/nginx/sites-enabled/
  sudo nginx -t
  sudo systemctl restart nginx
  ```

### 8. SSL (Certbot)
- [ ] **Install Certbot**:
  ```bash
  sudo apt install certbot python3-certbot-nginx -y
  ```
- [ ] **Generate Certificates**:
  ```bash
  sudo certbot --nginx -d mrpauthenticautoparts.com -d www.mrpauthenticautoparts.com -d admin.mrpauthenticautoparts.com -d api.mrpauthenticautoparts.com
  ```

### 9. Final Steps
- [ ] **Seed Database**:
  ```bash
  pnpm seed:admin
  ```
- [ ] **Verify Endpoints**: Check all URLs in browser.
