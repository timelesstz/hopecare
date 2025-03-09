# HopeCare

HopeCare is a platform designed to connect donors with charitable causes and facilitate volunteer management for community service initiatives in Tanzania.

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase account (for authentication, database, and storage)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/hopecare.git
   cd hopecare
   ```

2. Install dependencies:
   ```
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   - Create a `.env` file in the root directory based on `.env.example`
   - Add your Firebase configuration and other required variables

4. Firebase Setup:
   - Create a new Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Enable Authentication with Email/Password and Google providers
   - Create a Firestore database in production mode
   - Set up Storage for file uploads
   - Add a web app to your Firebase project and copy the configuration to your environment variables

5. Start the development server:
   ```
   npm run dev
   # or
   yarn dev
   ```

## Authentication

HopeCare supports different user roles with specific permissions:

- **Donors**: Can make donations, view donation history, and manage their profiles
- **Volunteers**: Can sign up for events, track hours, and participate in community activities
- **Administrators**: Can manage all aspects of the platform

### Login Details

For testing purposes, we've provided sample login credentials in the `LOGIN_DETAILS.md` file. These accounts are pre-configured with different roles and permissions to help you explore the platform's features.

To access the login pages:
- Donors: Navigate to `/donor-login`
- Volunteers: Navigate to `/volunteer-login`
- Admins: Navigate to `/admin/login`

For detailed instructions on testing the authentication functionality, please refer to the `AUTH_TESTING.md` file.

### Seeding Test Accounts

To populate your Firebase database with test accounts:

1. Make sure your `.env` file includes the Firebase Admin SDK configuration
2. Run the seed script:
   ```
   npm run seed:accounts
   # or
   yarn seed:accounts
   ```

## Firebase Migration

HopeCare has been migrated from Supabase to Firebase. The migration includes:

- Authentication: Moved from Supabase Auth to Firebase Authentication
- Database: Transitioned from Supabase PostgreSQL to Firebase Firestore
- Storage: Switched from Supabase Storage to Firebase Storage
- Analytics: Implemented Firebase Analytics to replace Supabase tracking

For detailed information about the migration process, refer to the `MIGRATION_COMPLETE.md` file.

## Deployment

### Firebase Deployment

To deploy the application to Firebase Hosting:

1. Install the Firebase CLI:
   ```
   npm install -g firebase-tools
   ```

2. Log in to Firebase:
   ```
   firebase login
   ```

3. Initialize Firebase (if not already done):
   ```
   firebase init
   ```

4. Deploy the application:
   ```
   npm run deploy:all
   # or
   firebase deploy
   ```

### Vercel Deployment

To deploy the application to Vercel:

1. Set up environment variables in the Vercel dashboard as described in `VERCEL_DEPLOYMENT.md`
2. Deploy using the Vercel CLI or GitHub integration

## Features

### For Donors
- Make one-time or recurring donations
- View donation history and impact
- Generate tax receipts
- Receive updates on funded projects

### For Volunteers
- Browse and sign up for volunteer opportunities
- Track volunteer hours
- Access training materials
- Communicate with team members
- View impact metrics

## Payment Processing

HopeCare uses Flutterwave for payment processing. For testing the payment flow, refer to the `PAYMENT_TESTING.md` file.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 