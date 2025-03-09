# HopeCare Authentication Guide

This guide provides instructions for using the authentication system in the HopeCare application.

## Authentication Overview

HopeCare uses Supabase for secure email-based authentication. The system supports:

- Email/password authentication
- Password reset functionality
- Role-based access control (donor, volunteer, admin)
- Protected routes based on user roles

## User Registration

### Donor Registration

1. Navigate to `/donor-login` in your browser
2. Click the "Register" tab
3. Fill out the registration form with your details:
   - First Name and Last Name
   - Email Address (will be your login username)
   - Password (must be at least 8 characters with uppercase, lowercase, number, and special character)
   - Phone Number
   - Birth Date
   - Address
   - Preferred Communication Method
   - Areas of Interest
4. Click "Create Account"
5. Check your email for a verification link
6. Click the verification link to confirm your account
7. Log in with your email and password

### Volunteer Registration

1. Navigate to `/volunteer-login` in your browser
2. Click the "Register" tab
3. Complete the multi-step registration form:
   
   **Step 1: Personal Information**
   - First Name, Last Name, Email, Password, Phone, Birth Date
   
   **Step 2: Skills & Languages**
   - Select your skills and languages
   
   **Step 3: Availability**
   - Indicate your availability for weekdays, weekends, and evenings
   
   **Step 4: Interests**
   - Select your areas of interest
   
   **Step 5: Emergency Contact**
   - Provide emergency contact details
   
4. Click "Register" on the final step
5. Check your email for a verification link
6. Click the verification link to confirm your account
7. Log in with your email and password

## User Login

1. Navigate to the appropriate login page:
   - Donors: `/donor-login`
   - Volunteers: `/volunteer-login`
   - Admins: `/admin/login`

2. Enter your email and password
3. Click "Sign In"
4. You will be redirected to your role-specific dashboard

## Password Reset

If you forget your password, you can reset it:

1. Navigate to the login page
2. Click "Forgot your password?"
3. Enter your email address
4. Click "Send Reset Instructions"
5. Check your email for a password reset link
6. Click the link and enter a new password
7. Log in with your new password

## Session Management

- Your session will remain active for 24 hours or until you log out
- You can log out by clicking the "Logout" button in the navigation bar
- For security reasons, always log out when using a shared computer

## Test Accounts

For testing purposes, you can use the following accounts:

### Donor Accounts

| Email | Password | Description |
|-------|----------|-------------|
| john.doe@example.com | Donor2024! | Regular donor with donation history |
| sarah.smith@example.com | Giving2024@ | Monthly recurring donor |
| david.wilson@example.com | Support2024# | Corporate donor representative |

### Volunteer Accounts

| Email | Password | Role | Description |
|-------|----------|------|-------------|
| emma.parker@example.com | Volunteer2024! | Program Lead | Has permissions to manage events and teams |
| michael.chen@example.com | Community2024@ | Event Volunteer | Regular volunteer for community events |
| sofia.rodriguez@example.com | Helping2024# | Coordinator | Coordinates volunteer activities and schedules |

## Security Best Practices

1. Use a strong, unique password
2. Don't share your login credentials
3. Log out when using shared computers
4. Keep your email account secure (as it's used for password resets)
5. Report any suspicious activity to the HopeCare team

## Troubleshooting

If you encounter issues with authentication:

1. **Can't log in**: Ensure you're using the correct email and password. Try resetting your password.
2. **Didn't receive verification email**: Check your spam folder. If not found, try registering again.
3. **Password reset link not working**: The link may have expired. Request a new password reset.
4. **Account locked**: Contact the HopeCare support team for assistance.

For additional help, please contact support at support@hopecare.org. 