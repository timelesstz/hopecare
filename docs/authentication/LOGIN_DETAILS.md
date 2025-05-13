# HopeCare Login Details

This document provides login credentials for testing the HopeCare application after migration from Firebase to Supabase. These accounts are pre-configured with different roles and permissions to help you explore the platform's features.

## Admin Account

The admin account has full access to the HopeCare administration dashboard.

| Email | Password | Description |
|-------|----------|-------------|
| admin@hopecaretz.org | Hope@admin2 | Main administrator account |

## Donor Accounts

Donors can log in to make donations, view their donation history, and manage their profiles.

| Email | Password | Description |
|-------|----------|-------------|
| john.doe@example.com | Donor2024! | Regular donor with donation history |
| sarah.smith@example.com | Giving2024@ | Monthly recurring donor |
| david.wilson@example.com | Support2024# | Corporate donor representative |

## Volunteer Accounts

Volunteers can log in to view assignments, track hours, and participate in community activities.

| Email | Password | Role | Description |
|-------|----------|------|-------------|
| emma.parker@example.com | Volunteer2024! | Program Lead | Has permissions to manage events and teams |
| michael.chen@example.com | Community2024@ | Event Volunteer | Regular volunteer for community events |
| sofia.rodriguez@example.com | Helping2024# | Coordinator | Coordinates volunteer activities and schedules |

## How to Log In

1. Navigate to the login page for your role:
   - Admin: `/admin/login`
   - Donors: `/donor-login`
   - Volunteers: `/volunteer-login`

2. Enter the email and password from the tables above.

3. Click "Sign In" to access your dashboard.

## Account Features

### Donor Accounts
- View donation history
- Make new donations
- Set up recurring donations
- Update profile information
- Generate tax receipts

### Volunteer Accounts
- View upcoming events
- Track volunteer hours
- Access training materials
- Communicate with team members
- View impact metrics

## Notes

- These accounts are for testing purposes only.
- All passwords follow the security requirements: minimum 8 characters, including uppercase, lowercase, numbers, and special characters.
- If you encounter any login issues, please contact the development team.

## Supabase Migration Information

- **Project ID:** tkxppievtqiipcsdqbpf
- **API URL:** https://tkxppievtqiipcsdqbpf.supabase.co
- **Authentication:** Migrated from Firebase Auth to Supabase Auth
- **Database:** User data and profiles are stored in Supabase PostgreSQL database
- **Row Level Security (RLS):** Implemented to secure data access based on user roles

The migration from Firebase to Supabase has been completed for authentication components. Data migration scripts are available in the `scripts/migration` directory.