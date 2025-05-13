# HopeCare Deployment Guide

This guide provides instructions for deploying the HopeCare application after migrating from Firebase to Supabase.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Build Process](#build-process)
4. [Deployment Options](#deployment-options)
   - [Netlify](#netlify)
   - [Vercel](#vercel)
   - [GitHub Pages](#github-pages)
5. [Post-Deployment Steps](#post-deployment-steps)
6. [Monitoring and Maintenance](#monitoring-and-maintenance)
7. [Rollback Procedures](#rollback-procedures)

## Prerequisites

Before deploying the HopeCare application, ensure you have:

1. Completed the migration from Firebase to Supabase
2. Run all tests to verify functionality
3. Performed a security audit
4. Removed all Firebase dependencies
5. Updated all documentation

## Environment Configuration

### Production Environment Variables

Create a `.env.production` file with the following variables:

```
# Supabase Configuration
VITE_SUPABASE_URL=https://your-production-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key

# Application Settings
VITE_APP_URL=https://hopecaretz.org
VITE_APP_NAME=HopeCare
VITE_APP_ENVIRONMENT=production

# Analytics (optional)
VITE_ENABLE_ANALYTICS=true
```

### Environment Variable Handling

The application uses Vite's environment variable system:

- Variables prefixed with `VITE_` are exposed to the client-side code
- For sensitive information, use Supabase Edge Functions or server-side processing

## Build Process

To build the application for production:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the application:
   ```bash
   npm run build
   ```

3. Preview the build locally:
   ```bash
   npm run preview
   ```

The build output will be in the `dist` directory, which contains static files ready for deployment.

## Deployment Options

### Netlify

Netlify is recommended for its simplicity and integration with GitHub.

#### Setup Steps

1. Create a `netlify.toml` file in the project root:
   ```toml
   [build]
     publish = "dist"
     command = "npm run build"

   [build.environment]
     NODE_VERSION = "18"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. Deploy to Netlify:
   - Connect your GitHub repository to Netlify
   - Configure build settings using the Netlify dashboard
   - Add environment variables in the Netlify dashboard

3. Set up a custom domain:
   - Add your domain in the Netlify dashboard
   - Configure DNS settings as instructed by Netlify
   - Enable HTTPS

### Vercel

Vercel is another excellent option for deploying React applications.

#### Setup Steps

1. Create a `vercel.json` file in the project root:
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "framework": "vite",
     "routes": [
       { "handle": "filesystem" },
       { "src": "/(.*)", "dest": "/index.html" }
     ]
   }
   ```

2. Deploy to Vercel:
   - Connect your GitHub repository to Vercel
   - Configure build settings using the Vercel dashboard
   - Add environment variables in the Vercel dashboard

3. Set up a custom domain:
   - Add your domain in the Vercel dashboard
   - Configure DNS settings as instructed by Vercel
   - HTTPS is enabled by default

### GitHub Pages

GitHub Pages is a free option for hosting static sites.

#### Setup Steps

1. Create a `.github/workflows/deploy.yml` file:
   ```yaml
   name: Deploy to GitHub Pages

   on:
     push:
       branches: [main]

   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       steps:
         - name: Checkout
           uses: actions/checkout@v3

         - name: Setup Node.js
           uses: actions/setup-node@v3
           with:
             node-version: 18

         - name: Install dependencies
           run: npm ci

         - name: Build
           run: npm run build
           env:
             VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
             VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}

         - name: Deploy
           uses: JamesIves/github-pages-deploy-action@v4
           with:
             folder: dist
   ```

2. Configure GitHub repository:
   - Go to Settings > Pages
   - Select GitHub Actions as the source
   - Add repository secrets for environment variables

3. Set up a custom domain:
   - Add a CNAME file to the `public` directory with your domain
   - Configure DNS settings as instructed by GitHub
   - Enable HTTPS in the repository settings

## Post-Deployment Steps

After deploying the application:

1. Verify that the application is working correctly:
   - Test authentication
   - Test all major features
   - Check that Supabase connections are working

2. Set up monitoring:
   - Configure error tracking (e.g., Sentry)
   - Set up performance monitoring
   - Configure alerts for critical issues

3. Update DNS records:
   - Point your domain to the new deployment
   - Update any subdomains as needed

4. Notify users:
   - Inform users about the migration
   - Provide instructions for any required actions (e.g., password reset)

## Monitoring and Maintenance

### Regular Maintenance

1. Monitor Supabase usage:
   - Check database performance
   - Monitor storage usage
   - Review authentication activity

2. Update dependencies:
   - Regularly update npm packages
   - Apply security patches promptly
   - Test thoroughly after updates

3. Backup data:
   - Configure regular database backups
   - Test restoration procedures
   - Store backups securely

### Performance Optimization

1. Enable Supabase caching:
   - Use Supabase's built-in caching features
   - Implement client-side caching for frequently accessed data

2. Optimize assets:
   - Compress images and other media
   - Use lazy loading for images and components
   - Implement code splitting

3. Monitor and improve load times:
   - Use tools like Lighthouse to measure performance
   - Optimize critical rendering path
   - Implement performance budgets

## Rollback Procedures

If issues arise after deployment:

1. Immediate response:
   - Assess the severity of the issue
   - Communicate with users if there's a service disruption
   - Determine if a rollback is necessary

2. Rollback options:
   - Redeploy the previous version
   - Revert to a known good configuration
   - Use Supabase's point-in-time recovery if data issues occur

3. Post-rollback steps:
   - Investigate the root cause
   - Fix the issue in a development environment
   - Test thoroughly before redeploying

## Deployment Checklist

Use this checklist before each production deployment:

- [ ] All tests pass
- [ ] Security audit completed
- [ ] Environment variables configured
- [ ] Build process successful
- [ ] Performance tested
- [ ] Accessibility tested
- [ ] Cross-browser compatibility verified
- [ ] Mobile responsiveness checked
- [ ] Backup of current production data created
- [ ] Rollback plan prepared
