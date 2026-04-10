# ShieldAI Deployment Guide

This guide covers deploying ShieldAI to a production environment.

---

## System Requirements

### Minimum (Small Scale)
- **CPU**: 2 vCPU
- **RAM**: 4 GB
- **Storage**: 20 GB SSD
- **OS**: Ubuntu 22.04 LTS / Debian 12

### Recommended (Production)
- **CPU**: 4+ vCPU
- **RAM**: 8+ GB (ML sidecar uses ~2 GB for model loading)
- **Storage**: 50+ GB SSD
- **OS**: Ubuntu 22.04 LTS

### Software
- Docker 24+ and Docker Compose v2+
- (Optional) Nginx for reverse proxy / SSL termination
- (Optional) Certbot for Let's Encrypt SSL

---

## Deployment Steps

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Install Docker Compose plugin
sudo apt install docker-compose-plugin -y

# Verify
docker --version
docker compose version
```

### 2. Clone Repository

```bash
git clone <your-repo-url> /opt/shieldai
cd /opt/shieldai
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with production values:

```env
NODE_ENV=production
PORT=3000

# Generate a strong database password
DATABASE_URL=postgresql://shieldai:STRONG_PASSWORD@db:5432/shieldai

REDIS_URL=redis://redis:6379

ML_SERVICE_URL=http://ml-service:8000

# Thresholds
BLOCK_THRESHOLD=0.80
FLAG_THRESHOLD=0.50

# Rate limits
RATE_LIMIT_FREE_PER_MINUTE=100
RATE_LIMIT_FREE_PER_DAY=1000
RATE_LIMIT_PAID_PER_MINUTE=1000

AUTH_CACHE_TTL=300
LOG_LEVEL=info
```

### 4. Start Services

```bash
docker compose up -d --build
```

Verify all services are running:

```bash
docker compose ps
docker compose logs --tail=50 api
docker compose logs --tail=50 ml-service
```

### 5. Initialize Database

```bash
docker compose exec api npx prisma migrate deploy
docker compose exec api npx ts-node /app/scripts/seed-db.ts
```

### 6. Generate Production API Key

```bash
docker compose exec api npx ts-node /app/scripts/generate-api-key.ts \
  --customer-email admin@yourcompany.com \
  --tier enterprise \
  --name "Production Key"
```

### 7. Verify

```bash
# Health check
curl http://localhost:3000/v1/health

# Test detection
curl -X POST http://localhost:3000/v1/detect \
  -H "Authorization: Bearer YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"input": "Test safe input"}'
```

---

## SSL / HTTPS Setup

### Using Nginx Reverse Proxy

Install Nginx:

```bash
sudo apt install nginx -y
```

Create config at `/etc/nginx/sites-available/shieldai`:

```nginx
server {
    listen 80;
    server_name api.yourcompany.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
    }
}
```

Enable and start:

```bash
sudo ln -s /etc/nginx/sites-available/shieldai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Add SSL with Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d api.yourcompany.com
```

Certbot will auto-configure SSL and set up renewal.

---

## Firewall Configuration

```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Block direct access to internal ports
sudo ufw deny 5432/tcp   # PostgreSQL
sudo ufw deny 6379/tcp   # Redis
sudo ufw deny 8000/tcp   # ML service

# Enable firewall
sudo ufw enable
```

---

## Monitoring

### Health Endpoint

Monitor `GET /v1/health` with your preferred uptime checker (e.g., UptimeRobot, Pingdom).

### Docker Logs

```bash
# Follow logs
docker compose logs -f api
docker compose logs -f ml-service

# Check specific service
docker compose logs --since 1h api
```

### Prometheus Metrics (ML Service)

The ML sidecar exposes Prometheus metrics at:

```
http://localhost:8000/metrics
```

Metrics include:
- `request_count` — Total requests by endpoint
- `request_duration_seconds` — Request latency histogram
- `model_loaded` — Whether models are loaded

### Resource Monitoring

```bash
# Docker resource usage
docker stats

# Disk usage
docker system df
```

---

## Backup & Recovery

### Database Backup

```bash
# Manual backup
docker compose exec db pg_dump -U shieldai shieldai > backup_$(date +%Y%m%d).sql

# Scheduled backup (add to crontab)
0 2 * * * docker compose -f /opt/shieldai/docker-compose.yml exec -T db pg_dump -U shieldai shieldai > /opt/backups/shieldai_$(date +\%Y\%m\%d).sql
```

### Database Restore

```bash
docker compose exec -T db psql -U shieldai shieldai < backup_20240115.sql
```

---

## Scaling

### Horizontal Scaling (API)

Scale the API service:

```bash
docker compose up -d --scale api=3
```

Add a load balancer (Nginx upstream) in front of multiple API instances.

### ML Service

The ML service is typically the bottleneck. Options:
- Increase CPU/RAM allocation
- Use GPU-accelerated inference (modify ML Dockerfile for CUDA)
- Scale to multiple instances behind a load balancer

### Database

- Add read replicas for query scaling
- Consider connection pooling with PgBouncer
- Monitor query performance with `pg_stat_statements`

---

## Updating

```bash
cd /opt/shieldai

# Pull latest code
git pull origin main

# Rebuild and restart
docker compose up -d --build

# Run any new migrations
docker compose exec api npx prisma migrate deploy
```

---

## Troubleshooting

### Service won't start

```bash
# Check logs
docker compose logs api
docker compose logs ml-service

# Check environment
docker compose config

# Verify network
docker network ls
```

### Database connection errors

```bash
# Test DB connectivity
docker compose exec api npx prisma db pull

# Check DB is running
docker compose exec db pg_isready
```

### ML service unhealthy

```bash
# Check ML service health
curl http://localhost:8000/health

# Check model loading
docker compose logs ml-service | grep -i model
```

### High memory usage

```bash
# Check per-container memory
docker stats --no-stream

# Restart specific service
docker compose restart ml-service
```
