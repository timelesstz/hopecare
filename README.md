# HopeCare

HopeCare is a platform designed to connect donors with charitable causes and facilitate volunteer management for community service initiatives.

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
   - Create a `.env` file in the root directory
   - Add the following variables:
     ```
     # Firebase Client SDK Configuration
     VITE_FIREBASE_API_KEY=your_firebase_api_key
     VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
     VITE_FIREBASE_PROJECT_ID=your-project-id
     VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
     VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
     VITE_FIREBASE_APP_ID=your_app_id
     VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
     
     # Payment Gateway Configuration
     VITE_FLUTTERWAVE_PUBLIC_KEY=your_flutterwave_public_key
     VITE_FLUTTERWAVE_SECRET_HASH=your_flutterwave_webhook_secret
     ```

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
- **Administrators**: Can manage all aspects of the platform (not included in the public login details)

### Login Details

For testing purposes, we've provided sample login credentials in the `LOGIN_DETAILS.md` file. These accounts are pre-configured with different roles and permissions to help you explore the platform's features.

To access the login pages:
- Donors: Navigate to `/donor-login`
- Volunteers: Navigate to `/volunteer-login`

For detailed instructions on testing the authentication functionality, please refer to the `AUTH_TESTING.md` file.

### Seeding Test Accounts

To populate your Firebase database with test accounts:

1. Make sure your `.env` file includes the Firebase Admin SDK configuration:
   ```
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_PRIVATE_KEY_ID=your_private_key_id
   FIREBASE_PRIVATE_KEY="your_private_key_with_newlines"
   FIREBASE_CLIENT_EMAIL=your_client_email
   FIREBASE_CLIENT_ID=your_client_id
   FIREBASE_CLIENT_CERT_URL=your_client_cert_url
   ```

2. Install the required dependencies:
   ```
   npm install dotenv firebase-admin
   # or
   yarn add dotenv firebase-admin
   ```

3. Run the seed script:
   ```
   npm run seed:accounts
   # or
   yarn seed:accounts
   ```

## Database Structure

HopeCare uses Firebase Firestore as its database. The main collections include:

- **users**: User profiles with basic information
- **donor_profiles**: Extended information for donor accounts
- **volunteer_profiles**: Extended information for volunteer accounts
- **donations**: Records of all donations made through the platform
- **projects**: Charitable projects and initiatives
- **events**: Volunteer events and opportunities
- **volunteer_hours**: Records of volunteer time contributions
- **analytics_events**: User interaction data for analytics

For a detailed database schema, refer to the `DATABASE_SCHEMA.md` file.

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