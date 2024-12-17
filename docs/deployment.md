# HopeCare Deployment Guide

## Prerequisites

- Node.js 18 or higher
- PostgreSQL 13 or higher
- Redis (optional, for caching)
- PM2 for process management
- SSL certificate
- Domain name configured

## Environment Setup

1. **Clone Repository**
   ```bash
   git clone https://github.com/your-org/hopecare.git
   cd hopecare
   ```

2. **Environment Variables**
   Copy `.env.example` to `.env` and configure:
   ```env
   NODE_ENV=production
   DATABASE_URL=postgresql://user:password@localhost:5432/hopecare
   REDIS_URL=redis://localhost:6379
   STRIPE_SECRET_KEY=sk_live_...
   ```

3. **SSL Configuration**
   ```bash
   # Install SSL certificate
   sudo certbot --nginx -d yourdomain.com
   ```

## Database Setup

1. **Create Database**
   ```sql
   CREATE DATABASE hopecare;
   ```

2. **Run Migrations**
   ```bash
   npx prisma migrate deploy
   ```

3. **Seed Initial Data**
   ```bash
   npx prisma db seed
   ```

## Application Deployment

1. **Install Dependencies**
   ```bash
   npm ci
   ```

2. **Build Application**
   ```bash
   npm run build
   ```

3. **Start Application**
   ```bash
   pm2 start npm --name "hopecare" -- start
   ```

## Monitoring Setup

1. **Configure PM2**
   ```bash
   pm2 install pm2-logrotate
   pm2 set pm2-logrotate:max_size 10M
   ```

2. **Setup Monitoring**
   ```bash
   pm2 install pm2-prometheus-exporter
   ```

## Backup Procedures

1. **Database Backup**
   ```bash
   # Add to crontab
   0 0 * * * pg_dump -U user hopecare > /backups/hopecare_$(date +\%Y\%m\%d).sql
   ```

2. **Media Backup**
   ```bash
   # Add to crontab
   0 0 * * * rsync -av /var/www/hopecare/uploads/ /backups/media/
   ```

## Security Measures

1. **Configure Security Headers**
   ```nginx
   add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
   add_header X-Frame-Options "SAMEORIGIN" always;
   add_header X-Content-Type-Options "nosniff" always;
   ```

2. **Rate Limiting**
   ```nginx
   limit_req_zone $binary_remote_addr zone=one:10m rate=1r/s;
   ```

## Troubleshooting

1. **Check Logs**
   ```bash
   pm2 logs hopecare
   ```

2. **Monitor Resources**
   ```bash
   pm2 monit
   ```

3. **Health Check**
   ```bash
   ./scripts/health-check.sh
   ```

## Performance Optimization

1. **Enable Compression**
   ```nginx
   gzip on;
   gzip_types text/plain text/css application/json application/javascript;
   ```

2. **Configure Caching**
   ```nginx
   location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
       expires 7d;
   }
   ```

## Maintenance Procedures

1. **Regular Updates**
   ```bash
   # Update dependencies
   npm audit fix
   npm update
   ```

2. **Database Maintenance**
   ```sql
   VACUUM ANALYZE;
   ```

## Rollback Procedures

1. **Application Rollback**
   ```bash
   git checkout v1.x.x
   npm ci
   npm run build
   pm2 restart hopecare
   ```

2. **Database Rollback**
   ```bash
   npx prisma migrate reset
   ```
