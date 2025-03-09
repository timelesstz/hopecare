# Authentication Testing Guide

This guide provides instructions for testing the authentication functionality in the HopeCare application.

## Prerequisites

Before testing, ensure you have:

1. Set up the application locally following the instructions in the README.md
2. Seeded the test accounts using the `npm run seed:accounts` command
3. Started the development server with `npm run dev`

## Testing Donor Authentication

### Login Flow

1. Navigate to `/donor-login` in your browser
2. Use one of the following test accounts:
   - Email: `john.doe@example.com`, Password: `Donor2024!`
   - Email: `sarah.smith@example.com`, Password: `Giving2024@`
   - Email: `david.wilson@example.com`, Password: `Support2024#`
3. Click the "Sign In" button
4. Verify that you are redirected to the donor dashboard
5. Check that the user's name appears in the navigation bar
6. Verify that donor-specific features are accessible

### Registration Flow

1. Navigate to `/donor-login` in your browser
2. Click the "Register" tab
3. Fill out the registration form with new user details:
   - First Name: [Your test first name]
   - Last Name: [Your test last name]
   - Email: [A unique email address]
   - Password: [A password meeting the requirements]
   - Phone Number: [A valid phone number]
   - Birth Date: [A valid date]
   - Address: [A test address]
   - Preferred Communication: [Select an option]
   - Areas of Interest: [Select at least one]
4. Click the "Create Account" button
5. Verify that you receive a success message
6. Attempt to log in with the newly created account

## Testing Volunteer Authentication

### Login Flow

1. Navigate to `/volunteer-login` in your browser
2. Use one of the following test accounts:
   - Email: `emma.parker@example.com`, Password: `Volunteer2024!` (Program Lead)
   - Email: `michael.chen@example.com`, Password: `Community2024@` (Event Volunteer)
   - Email: `sofia.rodriguez@example.com`, Password: `Helping2024#` (Coordinator)
3. Click the "Sign In" button
4. Verify that you are redirected to the volunteer dashboard
5. Check that the user's name appears in the navigation bar
6. Verify that volunteer-specific features are accessible based on the role

### Registration Flow

1. Navigate to `/volunteer-login` in your browser
2. Click the "Register" tab
3. Complete the multi-step registration form:
   
   **Step 1: Personal Information**
   - First Name, Last Name, Email, Password, Phone, Birth Date
   
   **Step 2: Skills & Languages**
   - Select relevant skills and languages
   
   **Step 3: Availability**
   - Indicate availability for weekdays, weekends, and evenings
   
   **Step 4: Interests**
   - Select areas of interest
   
   **Step 5: Emergency Contact**
   - Provide emergency contact details
   
4. Click the "Register" button on the final step
5. Verify that you receive a success message
6. Attempt to log in with the newly created account

## Testing Error Handling

### Invalid Login Credentials

1. Navigate to either the donor or volunteer login page
2. Enter an invalid email/password combination
3. Verify that an appropriate error message is displayed
4. Confirm that you remain on the login page

### Password Reset

1. Navigate to either the donor or volunteer login page
2. Click the "Forgot your password?" link
3. Enter the email address for one of the test accounts
4. Verify that a success message is displayed
5. Check the console logs for the password reset link (in a production environment, this would be sent via email)

## Testing Session Management

### Session Persistence

1. Log in with a test account
2. Close the browser tab
3. Open a new tab and navigate to the application
4. Verify that you are still logged in

### Logout

1. Log in with a test account
2. Click the logout button in the navigation bar
3. Verify that you are redirected to the home page
4. Attempt to access a protected route and confirm you are redirected to the login page

## Reporting Issues

If you encounter any issues during testing, please document:

1. The specific test case that failed
2. The expected behavior
3. The actual behavior
4. Any error messages displayed
5. Browser and environment details

Submit this information to the development team for investigation. 