# HopeCare Supabase Architecture

This document provides an overview of the HopeCare application architecture after migrating from Firebase to Supabase.

## Table of Contents

1. [Overview](#overview)
2. [Database Schema](#database-schema)
3. [Authentication](#authentication)
4. [Services](#services)
5. [Row Level Security](#row-level-security)
6. [Storage](#storage)
7. [Analytics](#analytics)
8. [Edge Functions](#edge-functions)
9. [Development Workflow](#development-workflow)

## Overview

The HopeCare application has been migrated from Firebase to Supabase, maintaining the same functionality while leveraging Supabase's PostgreSQL database, authentication system, storage, and other features.

### Architecture Diagram

```
+------------------+     +------------------+     +------------------+
|                  |     |                  |     |                  |
|  React Frontend  |<--->|  Supabase Client |<--->|  Supabase Backend|
|                  |     |                  |     |                  |
+------------------+     +------------------+     +------------------+
        |                        |                        |
        v                        v                        v
+------------------+     +------------------+     +------------------+
|                  |     |                  |     |                  |
|  Context Providers|     |  Service Layer   |     |  Database       |
|                  |     |                  |     |                  |
+------------------+     +------------------+     +------------------+
```

## Database Schema

The database schema has been migrated from Firestore's document-based model to PostgreSQL's relational model. Key tables include:

### Core Tables

- **auth.users**: Managed by Supabase Auth, contains user authentication data
- **public.users**: Contains user profile information linked to auth.users
- **public.donor_profiles**: Contains donor-specific information
- **public.volunteer_profiles**: Contains volunteer-specific information
- **public.admin_profiles**: Contains admin-specific information

### Content Management

- **public.blog_posts**: Blog posts content
- **public.pages**: Static page content
- **public.content_revisions**: Version history for content
- **public.media**: Media files metadata

### Donations and Projects

- **public.donations**: Donation records
- **public.projects**: Fundraising projects
- **public.project_categories**: Categories for projects
- **public.transactions**: Financial transactions

### Volunteer Management

- **public.volunteer_opportunities**: Volunteer opportunities
- **public.volunteer_applications**: Applications for opportunities
- **public.volunteer_hours**: Logged volunteer hours

### Analytics and System

- **public.analytics_events**: User events for analytics
- **public.system_settings**: Application settings
- **public.activity_logs**: System activity logs

## Authentication

Authentication is handled by Supabase Auth, which provides:

- Email/password authentication
- Social login (Google, Facebook)
- Password reset
- Email verification
- Session management

### Auth Context

The application uses a `SupabaseAuthContext` provider to manage authentication state:

```tsx
// src/context/SupabaseAuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase-client';

// Context implementation
export const SupabaseAuthContext = createContext(null);

export const SupabaseAuthProvider = ({ children }) => {
  // Authentication state and methods
  // ...
  
  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
};

export const useSupabaseAuth = () => useContext(SupabaseAuthContext);
```

## Services

The application uses service modules to interact with Supabase:

### Authentication Service

```typescript
// src/services/supabaseAuthService.ts
import { supabase } from '../lib/supabase-client';

export const signIn = async (email, password) => {
  return await supabase.auth.signInWithPassword({ email, password });
};

export const signUp = async (email, password, userData) => {
  // Implementation
};

// Other auth methods
```

### Content Service

```typescript
// src/services/supabaseContentService.ts
import { supabase } from '../lib/supabase-client';

export const getBlogPosts = async (options = {}) => {
  // Implementation
};

export const getPages = async (options = {}) => {
  // Implementation
};

// Other content methods
```

### Donation Service

```typescript
// src/services/supabseDonationService.ts
import { supabase } from '../lib/supabase-client';

export const createDonation = async (donationData) => {
  // Implementation
};

export const getDonations = async (options = {}) => {
  // Implementation
};

// Other donation methods
```

## Row Level Security

Supabase uses PostgreSQL's Row Level Security (RLS) to control access to data:

### Example RLS Policies

#### Users Table

```sql
-- Allow users to read their own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );
```

#### Donations Table

```sql
-- Donors can view their own donations
CREATE POLICY "Donors can view own donations" ON public.donations
  FOR SELECT USING (auth.uid() = donor_id);

-- Admins can view all donations
CREATE POLICY "Admins can view all donations" ON public.donations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );
```

## Storage

Supabase Storage is used for file storage, organized into buckets:

- **images**: Public images for blog posts, projects, etc.
- **documents**: Private documents like reports
- **avatars**: User profile images
- **media**: General media files

### Storage Service

```typescript
// src/services/supabaseStorageService.ts
import { supabase } from '../lib/supabase-client';

export const uploadFile = async (bucket, path, file) => {
  return await supabase.storage.from(bucket).upload(path, file);
};

export const getPublicUrl = (bucket, path) => {
  return supabase.storage.from(bucket).getPublicUrl(path);
};

// Other storage methods
```

## Analytics

Custom analytics implementation using Supabase:

```typescript
// src/lib/analytics-supabase.ts
import { supabase } from './supabase-client';

export const logEvent = async (eventName, eventData = {}, userId = null) => {
  try {
    const { error } = await supabase.from('analytics_events').insert({
      event_name: eventName,
      event_data: eventData,
      user_id: userId,
      session_id: getSessionId(),
      timestamp: new Date().toISOString()
    });
    
    if (error) throw error;
  } catch (error) {
    console.error('Analytics error:', error);
  }
};

// Other analytics methods
```

## Edge Functions

Supabase Edge Functions are used for server-side logic:

- **process-payment**: Handle payment processing
- **send-email**: Send email notifications
- **generate-report**: Generate PDF reports

### Invoking Edge Functions

```typescript
// src/services/supabaseEdgeFunctions.ts
import { supabase } from '../lib/supabase-client';

export const processPayment = async (paymentData) => {
  return await supabase.functions.invoke('process-payment', {
    body: paymentData
  });
};

// Other function invocations
```

## Development Workflow

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables in `.env`:
   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Database Migrations

Migrations are managed using the Supabase CLI:

1. Create a new migration:
   ```bash
   npx supabase migration new migration_name
   ```

2. Apply migrations:
   ```bash
   node scripts/apply-migrations.js
   ```

### Testing

Run tests to verify functionality:

```bash
# Test authentication
node scripts/test-supabase-services.js

# Test features
node scripts/test-features.js

# Run security audit
node scripts/security-audit.js
```

### Deployment

The application can be deployed to any hosting service that supports static sites:

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy the `dist` directory to your hosting provider.
