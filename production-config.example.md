# Production Configuration Guide

This document outlines the required environment variables and configurations for deploying the application to production.

## Environment Variables

### Database Configuration
```bash
# PostgreSQL Database Connection String
DATABASE_URL="postgresql://username:password@host:port/database_name?sslmode=require"

# Direct connection URL for migrations (usually same as DATABASE_URL)
DIRECT_URL="postgresql://username:password@host:port/database_name?sslmode=require"

# Supabase Configuration (if using Supabase alongside direct PostgreSQL)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### Session and Security
```bash
# Session Secret - Use a strong random string for production
SESSION_SECRET="your-super-secret-string-here-use-at-least-32-characters-and-make-it-random"

# Node Environment
NODE_ENV="production"
```

### Other Required Variables
```bash
# Google Cloud Storage (if used)
GOOGLE_APPLICATION_CREDENTIALS="path-to-your-gcs-keyfile"
GCS_BUCKET_NAME="your-bucket-name"

# Telegram Bot API (if used)
TELEGRAM_BOT_TOKEN="your-telegram-bot-token"
```

## Vercel Deployment Configuration

When deploying to Vercel, set these environment variables in your project settings:

1. Go to your Vercel dashboard
2. Select your project
3. Navigate to Settings → Environment Variables
4. Add each variable with its appropriate value

## Database Migration Setup

For production deployments, ensure your database schema is up-to-date:

```bash
# Run migrations
npm run db:migrate
```

## Connection Pooling for Serverless

The application is configured to work with serverless environments like Vercel. The database connection in `server/db.ts` is optimized with:

- Minimal connection pooling
- Short timeouts
- SSL enforcement
- Single connection for serverless functions
```