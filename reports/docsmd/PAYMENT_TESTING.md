# Flutterwave Payment Testing Guide

This guide provides instructions for testing the Flutterwave payment integration in the HopeCare application.

## Test Cards

You can use the following test cards to simulate different payment scenarios:

### Successful Payment
- Card Number: 5531 8866 5214 2950
- CVV: 564
- Expiry: 09/32
- PIN: 3310
- OTP: 12345

### Failed Payment
- Card Number: 5258 5859 2266 6506
- CVV: 883
- Expiry: 09/31
- PIN: 3310
- OTP: 12345

## Testing the Payment Flow

1. **Make a Test Donation**:
   - Navigate to the Donate page
   - Select a donation tier or enter a custom amount
   - Click "Proceed to Donate"
   - You should be redirected to the Flutterwave payment modal

2. **Complete the Payment**:
   - Enter the test card details
   - Submit the payment
   - If using the successful test card, the payment should be processed successfully
   - If using the failed test card, the payment should fail

3. **Verify Payment Status**:
   - After a successful payment, you should see a success message
   - The donation should be recorded in the database
   - You can check the logs table for payment transaction logs

## Webhook Testing

To test the webhook functionality:

1. **Set Up Webhook URL in Flutterwave Dashboard**:
   - Log in to your Flutterwave dashboard
   - Navigate to Settings > Webhooks
   - Add your webhook URL: `https://your-domain.com/api/webhooks/flutterwave`
   - Set the secret hash to match the value in your .env file: `hopecare-flutterwave-webhook-secret`

2. **Test Webhook Using Flutterwave Dashboard**:
   - In the Flutterwave dashboard, you can send test webhook events
   - This will help verify that your webhook handler is working correctly

3. **Verify Webhook Processing**:
   - Check your server logs to confirm that webhook events are being received
   - Verify that the donations are being recorded in the database

## Troubleshooting

If you encounter issues during testing:

1. **Check Browser Console**:
   - Open your browser's developer tools
   - Look for any errors in the console

2. **Check Server Logs**:
   - Review the server logs for any errors
   - Look for logs related to payment processing and verification

3. **Verify API Keys**:
   - Ensure that the Flutterwave API keys in your .env file are correct
   - Make sure you're using test keys for testing

4. **Test API Endpoints Directly**:
   - Use a tool like Postman to test the payment verification endpoint directly
   - This can help isolate issues with the API

## Moving to Production

When you're ready to go live:

1. **Update API Keys**:
   - Replace the test API keys with production keys
   - Update the webhook URL in the Flutterwave dashboard

2. **Perform End-to-End Testing**:
   - Test the complete payment flow in a staging environment
   - Verify that all components are working correctly

3. **Monitor Transactions**:
   - Keep an eye on the logs and transaction records
   - Set up alerts for failed payments 