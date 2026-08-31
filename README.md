SG HDB lifts dimension collector

Tech stack:
- Frontend: Next.js
- Backend: NestJS
- Database: MySQL (TypeORM)

Quickstart:
1. Backend:
   - cd backend
   - cp .env.example .env (set DB credentials and ONEMAP_API_KEY if available)
   - npm install
   - npm run start:dev
2. Frontend:
   - cd frontend
   - npm install
   - npm run dev

Features implemented in scaffold:
- Basic NestJS app with Lift entity, CRUD endpoints
- Endpoint to lookup full address for a given HDB block using OneMap Search API
- CSV generation endpoint that returns CSV from posted data
- Next.js SPA with a form to add records, preview table, and CSV download button

This is a scaffold — run npm installs and adapt DB credentials before use.


### how to start this app

run `docker compose up -d` then visit http://localhost:4000/

or

run `npm run dev` then visit http://localhost:4000/liftdoor


### nginx config

```
/etc/nginx/sites-available/refs.ddns.net

server {
    listen 80;
    listen [::]:80;

    server_name refs.ddns.net;

    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;

    server_name refs.ddns.net;

    ssl_certificate /etc/letsencrypt/live/refs.ddns.net/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/refs.ddns.net/privkey.pem;

    location = /liftdoor {
        proxy_pass http://127.0.0.1:4000;

        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    location /liftdoor/ {
        proxy_pass http://127.0.0.1:4000;

        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # NestJS backend
    location /api/ {
        proxy_pass http://127.0.0.1:4001/;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        root /var/www/html;
        index index.html index.htm;
    }
}
```

