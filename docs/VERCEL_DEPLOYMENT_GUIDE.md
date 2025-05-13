# HopeCare Vercel Deployment Guide

This guide provides step-by-step instructions for deploying the HopeCare application to Vercel after migrating from Firebase to Supabase.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Vercel Setup](#vercel-setup)
3. [Environment Configuration](#environment-configuration)
4. [Deployment Process](#deployment-process)
5. [Custom Domain Setup](#custom-domain-setup)
6. [Post-Deployment Verification](#post-deployment-verification)
7. [Monitoring and Analytics](#monitoring-and-analytics)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying to Vercel, ensure you have:

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. Your HopeCare project code in a Git repository (GitHub, GitLab, or Bitbucket)
3. Completed the migration from Firebase to Supabase
4. Supabase project URL and anon key for the production environment
5. All tests passing locally

## Vercel Setup

### 1. Connect Your Repository

1. Log in to your Vercel account
2. Click "New Project" on the Vercel dashboard
3. Import your Git repository:
   - Select your Git provider (GitHub, GitLab, or Bitbucket)
   - Authorize Vercel to access your repositories if prompted
   - Select the HopeCare repository

### 2. Configure Project Settings

In the project configuration screen:

1. **Project Name**: Enter a name for your project (e.g., `hopecare-production`)
2. **Framework Preset**: Select "Vite" (Vercel should auto-detect this)
3. **Root Directory**: Leave empty if your project is at the root of the repository
4. **Build and Output Settings**:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
   - Development Command: `npm run dev`

## Environment Configuration

### 1. Set Environment Variables

Add the following environment variables in the Vercel project settings:

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_SUPABASE_URL` | `https://your-project.supabase.co` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | `your-anon-key` | Your Supabase anon key |
| `VITE_APP_URL` | `https://your-domain.com` | Your application URL |
| `VITE_APP_ENVIRONMENT` | `production` | Environment name |
| `VITE_APP_NAME` | `HopeCare` | Application name |
| `VITE_ENABLE_ANALYTICS` | `true` | Enable analytics |

To add these variables:

1. In your project settings, go to the "Environment Variables" tab
2. Add each variable with its corresponding value
3. Make sure to mark variables that should be exposed to the browser with the `VITE_` prefix

### 2. Verify Configuration Files

Ensure your project has the following configuration files:

1. **vercel.json** (already configured):
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/" }
     ],
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "framework": "vite",
     "regions": ["fra1"],
     "headers": [
       {
         "source": "/(.*)",
         "headers": [
           { "key": "Cache-Control", "value": "public, max-age=0, must-revalidate" },
           { "key": "X-Frame-Options", "value": "DENY" },
           { "key": "X-Content-Type-Options", "value": "nosniff" },
           { "key": "X-XSS-Protection", "value": "1; mode=block" },
           { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
           { "key": "Content-Security-Policy", "value": "default-src 'self'; connect-src 'self' https://*.supabase.co; img-src 'self' data: https://*.supabase.co; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" }
         ]
       },
       {
         "source": "/assets/(.*)",
         "headers": [
           { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
         ]
       }
     ],
     "env": {
       "VITE_APP_ENVIRONMENT": "production",
       "VITE_APP_NAME": "HopeCare"
     },
     "github": {
       "silent": true,
       "autoJobCancelation": true
     }
   }
   ```

2. **vite.config.js** (ensure it's compatible with Vercel):
   ```js
   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'

   export default defineConfig({
     plugins: [react()],
     build: {
       outDir: 'dist',
       sourcemap: false,
     },
     server: {
       port: 5173,
     },
   })
   ```

## Deployment Process

### 1. Deploy Your Project

After configuring your project settings:

1. Click "Deploy" to start the deployment process
2. Vercel will clone your repository, install dependencies, and build your project
3. You can monitor the deployment progress in real-time

### 2. Automatic Deployments

Vercel automatically deploys your project when you push changes to your repository:

- **Production Deployments**: When you push to the main branch
- **Preview Deployments**: When you create pull requests or push to other branches

### 3. Deployment Settings

Fine-tune your deployment settings in the Vercel dashboard:

1. Go to your project settings
2. Under "Git" tab, you can configure:
   - Production branch (default: main)
   - Ignored build step conditions
   - Build cache settings

## Custom Domain Setup

### 1. Add a Custom Domain

To add your domain to your Vercel project:

1. Go to your project in the Vercel dashboard
2. Navigate to the "Domains" tab
3. Click "Add" and enter your domain name
4. Follow the instructions to verify domain ownership

### 2. Configure DNS

Vercel offers two options for DNS configuration:

#### Option 1: Using Vercel as your nameserver

1. Update your domain's nameservers to Vercel's nameservers
2. Vercel will handle all DNS records for your domain

#### Option 2: Using external DNS

1. Add the required DNS records to your domain provider:
   - For apex domain (example.com): Add an A record pointing to Vercel's IP
   - For subdomains (www.example.com): Add a CNAME record pointing to Vercel

### 3. HTTPS Setup

Vercel automatically provisions SSL certificates for your domains. No additional configuration is required.

## Post-Deployment Verification

After deployment, verify that your application is working correctly:

### 1. Functionality Testing

Test all critical functionality:

- User authentication (login, registration, password reset)
- Donor management (creating donations, viewing history)
- Volunteer management (applications, opportunities)
- Content management (blog posts, pages)
- Admin features (dashboard, reports)

### 2. Supabase Connection

Verify that the application is correctly connecting to Supabase:

1. Check network requests in browser developer tools
2. Ensure requests to Supabase are successful
3. Verify that data is being displayed correctly

### 3. Mobile Responsiveness

Test the application on various devices and screen sizes to ensure it's responsive.

## Monitoring and Analytics

### 1. Vercel Analytics

Enable Vercel Analytics to monitor your application's performance:

1. Go to your project settings
2. Navigate to the "Analytics" tab
3. Enable Web Vitals and Real User Monitoring

### 2. Error Tracking

Set up error tracking to monitor application errors:

1. Consider integrating a service like Sentry
2. Add the error tracking code to your application
3. Configure alerts for critical errors

### 3. Supabase Dashboard

Monitor your Supabase project:

1. Database usage and performance
2. Authentication activity
3. Storage usage
4. Edge function invocations

## Troubleshooting

### Common Issues and Solutions

#### 1. Build Failures

If your build fails:

1. Check the build logs for errors
2. Verify that all dependencies are correctly installed
3. Ensure your build command is correct
4. Test the build locally with `npm run build`

#### 2. Environment Variable Issues

If your application can't access environment variables:

1. Verify that variables are correctly set in Vercel
2. Ensure variables that need to be exposed to the browser have the `VITE_` prefix
3. Check that your application is correctly accessing the variables

#### 3. API Connection Issues

If your application can't connect to Supabase:

1. Verify that the Supabase URL and anon key are correct
2. Check for CORS issues in the browser console
3. Ensure your Supabase project is active and running

#### 4. Deployment Stuck

If your deployment seems stuck:

1. Cancel the current deployment
2. Check for large files or dependencies that might be slowing down the process
3. Try deploying again

### Getting Help

If you encounter issues not covered in this guide:

1. Check the [Vercel documentation](https://vercel.com/docs)
2. Search the [Vercel community forums](https://github.com/vercel/vercel/discussions)
3. Contact Vercel support through your dashboard

## Deployment Checklist

Use this checklist before and after deployment:

### Pre-Deployment

- [ ] All tests pass locally
- [ ] Environment variables configured in Vercel
- [ ] vercel.json file updated with latest configuration
- [ ] Git repository contains latest code
- [ ] Supabase project ready for production use

### Post-Deployment

- [ ] Application loads correctly
- [ ] Authentication works
- [ ] All features function as expected
- [ ] Custom domain configured and HTTPS working
- [ ] Analytics and monitoring set up
- [ ] Performance acceptable on various devices
